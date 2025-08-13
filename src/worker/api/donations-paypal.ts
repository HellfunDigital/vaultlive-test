import { Hono } from 'hono';

interface Env {
  DB: D1Database;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// Get PayPal access token
async function getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string> {
  console.log('Requesting PayPal access token...', {
    clientIdLength: clientId?.length,
    clientSecretLength: clientSecret?.length,
    hasCredentials: !!(clientId && clientSecret)
  });
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal client ID or secret is missing');
  }
  
  const response = await fetch('https://api.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get PayPal access token:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Failed to get PayPal access token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;
  console.log('PayPal access token obtained successfully');
  return data.access_token;
}

// Create PayPal donation checkout
app.post('/create-paypal-checkout', async (c) => {
  const body = await c.req.json();
  
  console.log('PayPal donation checkout request:', {
    body,
    hasPayPalCreds: !!(c.env.PAYPAL_CLIENT_ID && c.env.PAYPAL_CLIENT_SECRET)
  });
  
  // Validate donation amount
  if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0 || body.amount > 10000) {
    console.error('PayPal donation validation failed - amount:', body.amount);
    return c.json({ error: "Invalid donation amount (must be between $0.01 and $10,000)" }, 400);
  }

  // Validate donor name
  if (!body.donor_name || typeof body.donor_name !== 'string' || body.donor_name.trim().length === 0) {
    console.error('PayPal donation validation failed - donor name:', body.donor_name);
    return c.json({ error: "Donor name is required" }, 400);
  }

  // Check PayPal configuration
  if (!c.env.PAYPAL_CLIENT_ID || !c.env.PAYPAL_CLIENT_SECRET) {
    console.error('PayPal credentials not configured for donations');
    return c.json({ error: "PayPal not configured" }, 500);
  }

  try {
    // Create donation record as pending
    const donationResult = await c.env.DB.prepare(`
      INSERT INTO donations (donor_name, donor_email, amount, message, is_anonymous, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `).bind(
      body.donor_name.trim(),
      body.donor_email?.trim() || null,
      body.amount,
      body.message?.trim() || null,
      body.is_anonymous ? 1 : 0
    ).run();

    const donationId = donationResult.meta.last_row_id;

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken(c.env.PAYPAL_CLIENT_ID, c.env.PAYPAL_CLIENT_SECRET);

    // Create PayPal order
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: body.amount.toFixed(2),
        },
        description: body.message ? `Donation: "${body.message}"` : 'Support VaultkeeperIRL',
        custom_id: donationId.toString(),
      }],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            brand_name: 'Vaultkeeper.live',
            locale: 'en-US',
            landing_page: 'LOGIN',
            user_action: 'PAY_NOW',
            return_url: `https://vaultkeeper.live/donation-success?donation_id=${donationId}&paypal=true`,
            cancel_url: `https://vaultkeeper.live/?donation_cancelled=true&paypal=true`,
          }
        }
      }
    };

    const response = await fetch('https://api.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `donation-${donationId}-${Date.now()}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PayPal donation order creation failed:', errorText);
      return c.json({ error: "Failed to create PayPal checkout" }, 500);
    }

    const orderResult = await response.json() as any;
    
    // Find the approval URL
    const approvalUrl = orderResult.links?.find((link: any) => link.rel === 'approve')?.href;
    
    if (!approvalUrl) {
      console.error('No approval URL found in PayPal response');
      return c.json({ error: "Failed to get PayPal approval URL" }, 500);
    }

    return c.json({ 
      success: true, 
      approval_url: approvalUrl,
      order_id: orderResult.id,
      donation_id: donationId
    });
  } catch (error) {
    console.error('PayPal donation error:', error);
    return c.json({ 
      error: "Failed to create PayPal checkout",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;
