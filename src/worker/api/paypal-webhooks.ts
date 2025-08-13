import { Hono } from 'hono';

interface Env {
  DB: D1Database;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  PAYPAL_WEBHOOK_ID: string;
}

const app = new Hono<{ Bindings: Env }>();

// PayPal webhook signature verification
async function verifyWebhookSignature(
  payload: string,
  headers: Record<string, string>,
  webhookId: string,
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  try {
    const authHeader = headers['paypal-auth-algo'] || '';
    const transmissionId = headers['paypal-transmission-id'] || '';
    const certId = headers['paypal-cert-id'] || '';
    const transmissionTime = headers['paypal-transmission-time'] || '';
    const webhookSignature = headers['paypal-transmission-sig'] || '';

    if (!authHeader || !transmissionId || !certId || !transmissionTime || !webhookSignature) {
      console.error('Missing required PayPal webhook headers');
      return false;
    }

    // Get PayPal access token for webhook verification
    const authResponse = await fetch('https://api.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      console.error('Failed to get PayPal access token for webhook verification');
      return false;
    }

    const authData = await authResponse.json() as any;
    const accessToken = authData.access_token;

    // Verify webhook signature with PayPal
    const verifyResponse = await fetch('https://api.paypal.com/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: authHeader,
        cert_id: certId,
        transmission_id: transmissionId,
        transmission_sig: webhookSignature,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(payload)
      }),
    });

    if (!verifyResponse.ok) {
      console.error('PayPal webhook verification failed:', await verifyResponse.text());
      return false;
    }

    const verifyData = await verifyResponse.json() as any;
    return verifyData.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Error verifying PayPal webhook signature:', error);
    return false;
  }
}

// PayPal webhook handler
app.post('/', async (c) => {
  try {
    const payload = await c.req.text();
    const headers: Record<string, string> = {};
    
    // Extract headers
    c.req.raw.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    console.log('PayPal webhook received:', {
      headers: Object.keys(headers),
      payloadLength: payload.length
    });

    // Verify webhook signature if webhook ID is configured
    if (c.env.PAYPAL_WEBHOOK_ID) {
      const isValid = await verifyWebhookSignature(
        payload,
        headers,
        c.env.PAYPAL_WEBHOOK_ID,
        c.env.PAYPAL_CLIENT_ID,
        c.env.PAYPAL_CLIENT_SECRET
      );

      if (!isValid) {
        console.error('PayPal webhook signature verification failed');
        return c.json({ error: 'Invalid webhook signature' }, 401);
      }
    }

    const webhookEvent = JSON.parse(payload);
    console.log('PayPal webhook event:', webhookEvent.event_type, webhookEvent.id);

    // Handle different webhook event types
    switch (webhookEvent.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(c.env.DB, webhookEvent);
        break;
      
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(c.env.DB, webhookEvent);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        await handlePaymentFailed(c.env.DB, webhookEvent);
        break;
      
      case 'CHECKOUT.ORDER.COMPLETED':
        await handleOrderCompleted(c.env.DB, webhookEvent);
        break;
      
      default:
        console.log('Unhandled PayPal webhook event type:', webhookEvent.event_type);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Handle order approved event
async function handleOrderApproved(_db: D1Database, webhookEvent: any) {
  console.log('Processing PayPal order approved:', webhookEvent.resource?.id);
  // This is when user approves payment at PayPal but hasn't completed yet
}

// Handle payment capture completed
async function handlePaymentCompleted(db: D1Database, webhookEvent: any) {
  const payment = webhookEvent.resource;
  const customId = payment?.supplementary_data?.related_ids?.order_id || payment?.custom_id;
  
  console.log('Processing PayPal payment completed:', {
    captureId: payment?.id,
    customId: customId,
    amount: payment?.amount?.value,
    status: payment?.status
  });

  if (payment?.status !== 'COMPLETED') {
    console.log('Payment not completed, status:', payment?.status);
    return;
  }

  // Check if this is a points purchase
  if (customId?.startsWith('points_')) {
    await handlePointsPurchaseCompleted(db, customId, payment);
  } 
  // Check if this is a gift subscription
  else if (customId?.startsWith('gift_')) {
    await handleGiftSubscriptionCompleted(db, customId, payment);
  }
  // Check if this is a regular subscription
  else if (customId?.startsWith('sub_')) {
    await handleSubscriptionCompleted(db, customId, payment);
  }
  // Check if this is a donation
  else if (payment?.custom_id || customId) {
    await handleDonationCompleted(db, payment?.custom_id || customId, payment);
  }
}

// Handle points purchase completion
async function handlePointsPurchaseCompleted(db: D1Database, customId: string, payment: any) {
  try {
    const parts = customId.split('_');
    if (parts.length < 4) {
      console.error('Invalid points purchase custom ID:', customId);
      return;
    }

    const userId = parts[1];
    const packageId = parts[2];
    const timestamp = parts[3];
    
    console.log('Processing points purchase:', { userId, packageId, timestamp });

    // Check if we've already processed this payment
    const existingTransaction = await db.prepare(`
      SELECT * FROM points_transactions 
      WHERE description LIKE ? AND created_at > datetime('now', '-1 hour')
      LIMIT 1
    `).bind(`%PayPal Order: ${payment.id}%`).first();

    if (existingTransaction) {
      console.log('Points purchase already processed:', payment.id);
      return;
    }

    // Get user
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    if (!user) {
      console.error('User not found for points purchase:', userId);
      return;
    }

    // Determine points amount based on package
    const pointsPackages: Record<string, number> = {
      'package_100': 100,
      'package_500': 550, // 500 + 50 bonus
      'package_1000': 1150, // 1000 + 150 bonus
      'package_2500': 3000, // 2500 + 500 bonus
      'package_5000': 6200, // 5000 + 1200 bonus
    };

    const points = pointsPackages[packageId];
    if (!points) {
      console.error('Unknown points package:', packageId);
      return;
    }

    // Credit points to user
    const newBalance = Number(user.points_balance || 0) + points;
    const newTotal = Number(user.points_earned_total || 0) + points;
    
    await db.prepare(`
      UPDATE users 
      SET points_balance = ?, points_earned_total = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newBalance, newTotal, userId).run();

    // Log the transaction
    await db.prepare(`
      INSERT INTO points_transactions (user_id, transaction_type, points_amount, description, created_at, updated_at)
      VALUES (?, 'purchase', ?, ?, datetime('now'), datetime('now'))
    `).bind(
      userId, 
      points, 
      `Points Purchase: ${packageId} via PayPal (Capture: ${payment.id})`
    ).run();

    console.log(`PayPal points purchase completed: ${points} points credited to user ${userId}`);
  } catch (error) {
    console.error('Error processing points purchase completion:', error);
  }
}

// Handle donation completion
async function handleDonationCompleted(db: D1Database, donationId: string, _payment: any) {
  try {
    console.log('Processing donation completion:', donationId);

    // Get the donation
    const donation = await db.prepare(
      "SELECT * FROM donations WHERE id = ?"
    ).bind(donationId).first();

    if (!donation) {
      console.error('Donation not found:', donationId);
      return;
    }

    if (donation.status === 'completed') {
      console.log('Donation already completed:', donationId);
      return;
    }

    // Mark donation as completed
    await db.prepare(`
      UPDATE donations 
      SET status = 'completed', updated_at = datetime('now')
      WHERE id = ?
    `).bind(donationId).run();

    // Create chat message for the completed donation
    const donorName = donation.is_anonymous ? "Anonymous" : donation.donor_name;
    const amount = Number(donation.amount);
    const donationMessage = donation.message 
      ? `💰 ${donorName} donated $${amount.toFixed(2)}: "${donation.message}"`
      : `💰 ${donorName} donated $${amount.toFixed(2)}! Thank you for the support! 🙏`;

    await db.prepare(`
      INSERT INTO chat_messages (user_id, username, message, platform, is_subscriber, created_at, updated_at)
      VALUES (NULL, 'System', ?, 'vaultkeeper', 1, datetime('now'), datetime('now'))
    `).bind(donationMessage).run();

    console.log(`PayPal donation completed: ${donationId}`);
  } catch (error) {
    console.error('Error processing donation completion:', error);
  }
}

// Handle subscription completion
async function handleSubscriptionCompleted(db: D1Database, customId: string, _payment: any) {
  try {
    const parts = customId.split('_');
    if (parts.length < 4) {
      console.error('Invalid subscription custom ID:', customId);
      return;
    }

    const userId = parts[1];
    const planType = parts[2];
    const billingCycle = parts[3];
    
    console.log('Processing subscription completion:', { userId, planType, billingCycle });

    // Check if subscription already exists
    const existingSubscription = await db.prepare(
      "SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'"
    ).bind(userId).first();

    if (existingSubscription) {
      console.log('User already has active subscription:', userId);
      return;
    }

    const amount = billingCycle === 'yearly' ? 39.99 : 4.99;
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = billingCycle === 'monthly' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Create subscription record
    await db.prepare(`
      INSERT INTO subscriptions (user_id, plan_type, amount, billing_cycle, start_date, end_date, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
    `).bind(userId, planType, amount, billingCycle, startDate, endDate).run();

    // Update user's subscriber status
    await db.prepare(`
      UPDATE users 
      SET is_subscriber = 1, updated_at = datetime('now')
      WHERE id = ?
    `).bind(userId).run();

    // Get user name for celebration message
    const user = await db.prepare('SELECT name FROM users WHERE id = ?').bind(userId).first();
    if (user) {
      const subscriptionMessage = `🎉 ${user.name} just subscribed! Welcome to the premium community! 👑`;
      
      await db.prepare(`
        INSERT INTO chat_messages (user_id, username, message, platform, is_subscriber, created_at, updated_at)
        VALUES (NULL, 'System', ?, 'vaultkeeper', 1, datetime('now'), datetime('now'))
      `).bind(subscriptionMessage).run();
    }

    console.log(`PayPal subscription completed: ${userId}`);
  } catch (error) {
    console.error('Error processing subscription completion:', error);
  }
}

// Handle gift subscription completion
async function handleGiftSubscriptionCompleted(db: D1Database, customId: string, _payment: any) {
  try {
    console.log('Processing gift subscription completion:', customId);

    // Get gift order data
    const giftOrder = await db.prepare(
      "SELECT * FROM temp_gift_orders WHERE custom_id = ? AND processed = 0"
    ).bind(customId).first();

    if (!giftOrder) {
      console.error('Gift order not found or already processed:', customId);
      return;
    }

    const recipients = JSON.parse(giftOrder.recipients as string);
    const quantity = Number(giftOrder.quantity);
    const planType = giftOrder.plan_type as string;
    const billingCycle = giftOrder.billing_cycle as string;
    const amount = Number(giftOrder.amount);
    const giftMessage = giftOrder.gift_message as string;
    const gifterId = Number(giftOrder.user_id);

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = billingCycle === 'monthly' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get gifter name for messages
    const gifter = await db.prepare('SELECT name FROM users WHERE id = ?').bind(gifterId).first();
    const gifterName = gifter?.name || 'Anonymous';
    
    let subscriptionsGifted = 0;
    
    // First, gift to specific recipients
    for (const recipient of recipients) {
      if (subscriptionsGifted >= quantity) break;
      
      // Check if recipient already has active subscription
      const existingSubscription = await db.prepare(
        "SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'"
      ).bind(recipient.id).first();
      
      if (!existingSubscription) {
        // Create subscription record for recipient
        await db.prepare(`
          INSERT INTO subscriptions (user_id, plan_type, amount, billing_cycle, start_date, end_date, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
        `).bind(recipient.id, planType, amount / quantity, billingCycle, startDate, endDate).run();

        // Update recipient's subscriber status
        await db.prepare(`
          UPDATE users 
          SET is_subscriber = 1, updated_at = datetime('now')
          WHERE id = ?
        `).bind(recipient.id).run();
        
        subscriptionsGifted++;
        
        // Create individual notification
        let celebrationMessage = `🎁 ${recipient.name} received a premium subscription gift from ${gifterName}! Welcome to the premium community! 👑`;
        if (giftMessage) {
          celebrationMessage += ` Gift message: "${giftMessage}"`;
        }
        
        await db.prepare(`
          INSERT INTO chat_messages (user_id, username, message, platform, is_subscriber, created_at, updated_at)
          VALUES (NULL, 'System', ?, 'vaultkeeper', 1, datetime('now'), datetime('now'))
        `).bind(celebrationMessage).run();
      } else {
        // Extend existing subscription
        const currentEndDate = new Date(String(existingSubscription.end_date));
        const extensionMonths = billingCycle === 'yearly' ? 12 : 1;
        const newEndDate = new Date(currentEndDate);
        newEndDate.setMonth(newEndDate.getMonth() + extensionMonths);
        
        await db.prepare(`
          UPDATE subscriptions 
          SET end_date = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(newEndDate.toISOString().split('T')[0], existingSubscription.id).run();
        
        subscriptionsGifted++;
        
        await db.prepare(`
          INSERT INTO chat_messages (user_id, username, message, platform, is_subscriber, created_at, updated_at)
          VALUES (NULL, 'System', ?, 'vaultkeeper', 1, datetime('now'), datetime('now'))
        `).bind(`🎁 ${recipient.name} received a subscription extension from ${gifterName}! ${extensionMonths} more months added! 👑`).run();
      }
    }
    
    // Distribute remaining subscriptions to community
    const remainingGifts = quantity - subscriptionsGifted;
    if (remainingGifts > 0) {
      // Get non-subscribers or subscribers with soonest expiration
      const potentialRecipients = await db.prepare(`
        SELECT u.id, u.name, s.end_date
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
        WHERE u.is_banned = 0 AND u.id != ?
        ORDER BY 
          CASE WHEN s.id IS NULL THEN 0 ELSE 1 END,
          s.end_date ASC
        LIMIT ?
      `).bind(gifterId, remainingGifts).all();
      
      for (const recipient of potentialRecipients.results) {
        if (recipient.end_date) {
          // Extend existing subscription
          const currentEndDate = new Date(recipient.end_date as string);
          const extensionMonths = billingCycle === 'yearly' ? 12 : 1;
          const newEndDate = new Date(currentEndDate);
          newEndDate.setMonth(newEndDate.getMonth() + extensionMonths);
          
          await db.prepare(`
            UPDATE subscriptions 
            SET end_date = ?, updated_at = datetime('now')
            WHERE user_id = ? AND status = 'active'
          `).bind(newEndDate.toISOString().split('T')[0], recipient.id).run();
        } else {
          // Create new subscription
          await db.prepare(`
            INSERT INTO subscriptions (user_id, plan_type, amount, billing_cycle, start_date, end_date, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
          `).bind(recipient.id, planType, amount / quantity, billingCycle, startDate, endDate).run();

          await db.prepare(`
            UPDATE users 
            SET is_subscriber = 1, updated_at = datetime('now')
            WHERE id = ?
          `).bind(recipient.id).run();
        }
      }
      
      // Create community gift announcement
      await db.prepare(`
        INSERT INTO chat_messages (user_id, username, message, platform, is_subscriber, created_at, updated_at)
        VALUES (NULL, 'System', ?, 'vaultkeeper', 1, datetime('now'), datetime('now'))
      `).bind(`🎉 ${gifterName} gifted ${remainingGifts} community subscription${remainingGifts > 1 ? 's' : ''}! Thank you for supporting the community! 🙏`).run();
    }

    // Mark gift order as processed
    await db.prepare(`
      UPDATE temp_gift_orders 
      SET processed = 1, updated_at = datetime('now')
      WHERE custom_id = ?
    `).bind(customId).run();

    console.log(`PayPal gift subscription completed: ${customId}`);
  } catch (error) {
    console.error('Error processing gift subscription completion:', error);
  }
}

// Handle payment failures
async function handlePaymentFailed(_db: D1Database, webhookEvent: any) {
  const payment = webhookEvent.resource;
  console.log('Payment failed:', {
    captureId: payment?.id,
    reason: payment?.status_details?.reason
  });
  
  // You could implement failure handling here, such as:
  // - Notifying users of failed payments
  // - Cleaning up pending records
  // - Logging for admin review
}

// Handle order completion
async function handleOrderCompleted(_db: D1Database, webhookEvent: any) {
  const order = webhookEvent.resource;
  console.log('Order completed:', order?.id);
  
  // This fires when the entire order (including all captures) is completed
  // Most of the logic should be handled in PAYMENT.CAPTURE.COMPLETED
}

export default app;
