import { Hono } from 'hono';
import { authMiddleware } from '@getmocha/users-service/backend';

interface Env {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_KEY: string;
  MOCHA_USERS_SERVICE_API_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// Process points-based donation
app.post('/points', authMiddleware, async (c) => {
  const mochaUser = c.get("user");
  const body = await c.req.json();
  
  if (!body.donor_name || !body.amount || !body.points_cost) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const amount = parseFloat(body.amount);
  const pointsCost = parseInt(body.points_cost);
  
  if (amount <= 0 || pointsCost <= 0) {
    return c.json({ error: "Invalid donation amount or points cost" }, 400);
  }

  // Get user data
  const localUser = await c.env.DB.prepare(
    "SELECT * FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser?.id).first();

  if (!localUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const currentBalance = Number(localUser.points_balance || 0);
  
  if (currentBalance < pointsCost) {
    return c.json({ error: "Insufficient points balance" }, 400);
  }

  try {
    // Begin transaction-like operation
    const newBalance = currentBalance - pointsCost;
    
    // Update user's points balance
    await c.env.DB.prepare(`
      UPDATE users 
      SET points_balance = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newBalance, localUser.id as number).run();

    // Log points transaction
    await c.env.DB.prepare(`
      INSERT INTO points_transactions (user_id, transaction_type, points_amount, description, created_at, updated_at)
      VALUES (?, 'donation', ?, ?, datetime('now'), datetime('now'))
    `).bind(
      localUser.id as number,
      -pointsCost,
      `Points donation: $${amount.toFixed(2)}`
    ).run();

    // Create donation record as completed
    const donationResult = await c.env.DB.prepare(`
      INSERT INTO donations (donor_name, donor_email, amount, message, is_anonymous, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'completed', datetime('now'), datetime('now'))
    `).bind(
      body.donor_name.trim(),
      body.donor_email?.trim() || null,
      amount,
      body.message?.trim() || null,
      body.is_anonymous ? 1 : 0
    ).run();

    // Create chat message for the points donation
    const donorName = body.is_anonymous ? "Anonymous" : body.donor_name;
    const donationMessage = body.message 
      ? `💰⚡ ${donorName} donated $${amount.toFixed(2)} using points: "${body.message}"`
      : `💰⚡ ${donorName} donated $${amount.toFixed(2)} using points! Thank you for the support! 🙏`;

    await c.env.DB.prepare(`
      INSERT INTO chat_messages (user_id, username, message, platform, is_subscriber, created_at, updated_at)
      VALUES (NULL, 'System', ?, 'vaultkeeper', 1, datetime('now'), datetime('now'))
    `).bind(donationMessage).run();

    return c.json({ 
      success: true, 
      donation_id: donationResult.meta.last_row_id,
      new_points_balance: newBalance,
      message: "Points donation processed successfully!"
    });

  } catch (error) {
    console.error('Points donation error:', error);
    return c.json({ error: "Failed to process points donation" }, 500);
  }
});

export default app;
