import { Hono } from 'hono';

interface Env {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_KEY: string;
  MOCHA_USERS_SERVICE_API_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// Get TTS-eligible users for chat messages
app.get('/eligible-users', async (c) => {
  try {
    // Get users who are eligible for TTS:
    // 1. Subscribers
    // 2. Users who have donated
    // 3. Users with points balance > 0 (earned or purchased)
    const eligibleUsers = await c.env.DB.prepare(`
      SELECT 
        id,
        mocha_user_id,
        name,
        is_subscriber,
        has_donated,
        total_donated,
        points_balance,
        points_earned_total
      FROM users 
      WHERE 
        is_subscriber = 1 
        OR has_donated = 1 
        OR points_balance > 0 
        OR points_earned_total > 0
    `).all();

    // Create a lookup map for quick eligibility checks
    const eligibilityMap: { [key: string]: boolean } = {};
    
    eligibleUsers.results.forEach((user: any) => {
      eligibilityMap[user.mocha_user_id] = true;
    });

    return c.json({
      eligibleUserIds: Object.keys(eligibilityMap),
      eligibilityMap,
      totalEligible: eligibleUsers.results.length
    });

  } catch (error) {
    console.error('Error fetching TTS eligible users:', error);
    return c.json({ error: 'Failed to fetch eligible users' }, 500);
  }
});

// Check if specific user is eligible for TTS
app.get('/check/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const user = await c.env.DB.prepare(`
      SELECT 
        is_subscriber,
        has_donated,
        points_balance,
        points_earned_total
      FROM users 
      WHERE mocha_user_id = ?
    `).bind(userId).first();

    if (!user) {
      return c.json({ eligible: false, reason: 'User not found' });
    }

    const pointsBalance = Number(user.points_balance) || 0;
    const pointsEarnedTotal = Number(user.points_earned_total) || 0;
    
    const isEligible = !!(
      user.is_subscriber || 
      user.has_donated || 
      pointsBalance > 0 ||
      pointsEarnedTotal > 0
    );

    const reasons = [];
    if (user.is_subscriber) reasons.push('subscriber');
    if (user.has_donated) reasons.push('donor');
    if (pointsBalance > 0) reasons.push('has points');
    if (pointsEarnedTotal > 0) reasons.push('earned points');

    return c.json({
      eligible: isEligible,
      reasons,
      user: {
        is_subscriber: !!user.is_subscriber,
        has_donated: !!user.has_donated,
        points_balance: pointsBalance,
        points_earned_total: pointsEarnedTotal
      }
    });

  } catch (error) {
    console.error('Error checking TTS eligibility:', error);
    return c.json({ error: 'Failed to check eligibility' }, 500);
  }
});

export default app;
