import { Hono } from 'hono';
interface Env {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_KEY: string;
  MOCHA_USERS_SERVICE_API_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enhanced community stats endpoint
app.get('/stats-enhanced', async (c) => {
  try {
    // Get overall community stats
    const totalUsers = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    const totalSubscribers = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE is_subscriber = 1').first();
    const totalMessages = await c.env.DB.prepare('SELECT COUNT(*) as count FROM chat_messages WHERE is_deleted = 0').first();
    const totalDonations = await c.env.DB.prepare('SELECT SUM(amount) as total FROM donations WHERE status = "completed"').first();
    
    // XP and Points totals
    const totalXp = await c.env.DB.prepare('SELECT SUM(xp_total) as total FROM users').first();
    const totalPoints = await c.env.DB.prepare('SELECT SUM(points_earned_total) as total FROM users').first();

    // Unified leaderboard combining XP and Points
    const topCombinedUsers = await c.env.DB.prepare(`
      SELECT name, xp_total, user_level, points_earned_total, 
             (xp_total + points_earned_total) as combined_score
      FROM users 
      WHERE name IS NOT NULL 
      ORDER BY combined_score DESC 
      LIMIT 10
    `).all();

    // Get current viewer of the month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const viewerOfMonth = await c.env.DB.prepare(`
      SELECT u.name, u.picture, u.badges, v.month_year
      FROM viewer_of_month v
      JOIN users u ON v.user_id = u.id
      WHERE v.month_year = ?
      ORDER BY v.created_at DESC
      LIMIT 1
    `).bind(currentMonth).first();

    return c.json({
      totalUsers: totalUsers?.count || 0,
      totalSubscribers: totalSubscribers?.count || 0,
      totalMessages: totalMessages?.count || 0,
      totalDonations: Math.round((Number(totalDonations?.total) || 0) * 100) / 100,
      totalXp: totalXp?.total || 0,
      totalPoints: totalPoints?.total || 0,
      topCombinedUsers: topCombinedUsers.results || [],
      viewerOfMonth: viewerOfMonth ? {
        name: viewerOfMonth.name,
        picture: viewerOfMonth.picture,
        badges: viewerOfMonth.badges,
        month_year: viewerOfMonth.month_year
      } : null
    });

  } catch (error) {
    console.error('Error fetching enhanced community stats:', error);
    return c.json({ error: 'Failed to fetch community stats' }, 500);
  }
});

// Recent community activity
app.get('/recent-activity', async (c) => {
  try {
    // Get recent donations
    const recentDonations = await c.env.DB.prepare(`
      SELECT 'donation' as type, donor_name as username, amount, message, created_at as timestamp
      FROM donations 
      WHERE status = 'completed'
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();

    // Get recent subscriptions (as followers for now)
    const recentSubscriptions = await c.env.DB.prepare(`
      SELECT 'follower' as type, u.name as username, s.created_at as timestamp
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'active'
      ORDER BY s.created_at DESC 
      LIMIT 3
    `).all();

    // Get recent admin requests (song/shoutout requests)
    const recentAdminRequests = await c.env.DB.prepare(`
      SELECT ar.request_type as type, u.name as username, ar.created_at as timestamp, ar.status
      FROM admin_requests ar
      JOIN users u ON ar.user_id = u.id
      WHERE ar.created_at > datetime('now', '-24 hours')
      ORDER BY ar.created_at DESC 
      LIMIT 5
    `).all();

    // Combine activities
    const activities = [
      ...recentDonations.results.map((d: any) => ({
        id: Date.now() + Math.random(),
        type: d.type,
        username: d.username,
        amount: d.amount,
        message: d.message,
        timestamp: d.timestamp
      })),
      ...recentSubscriptions.results.map((s: any) => ({
        id: Date.now() + Math.random(),
        type: s.type,
        username: s.username,
        timestamp: s.timestamp
      })),
      ...recentAdminRequests.results.map((r: any) => ({
        id: Date.now() + Math.random(),
        type: r.type, // 'song' or 'shoutout'
        username: r.username,
        timestamp: r.timestamp,
        status: r.status
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    // Get activity stats
    const totalDonationsSum = await c.env.DB.prepare('SELECT SUM(amount) as total FROM donations WHERE status = "completed"').first();
    const recentFollowers = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE created_at > datetime("now", "-7 days")').first();
    const messagesCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM chat_messages WHERE created_at > datetime("now", "-1 day")').first();
    const subscribersCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE is_subscriber = 1').first();

    return c.json({
      activities,
      stats: {
        totalDonations: Math.round(Number(totalDonationsSum?.total) || 0),
        recentFollowers: recentFollowers?.count || 0,
        messagesCount: messagesCount?.count || 0,
        subscribers: subscribersCount?.count || 0
      }
    });

  } catch (error) {
    console.error('Error fetching community activity:', error);
    return c.json({ error: 'Failed to fetch community activity' }, 500);
  }
});

export default app;
