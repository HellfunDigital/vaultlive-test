import { Hono } from 'hono';
interface Env {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_KEY: string;
  MOCHA_USERS_SERVICE_API_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// Export report endpoint (admin only)
app.get('/export-report', async (c) => {
  try {
    const userHeader = c.req.header('X-Mocha-User');
    if (!userHeader) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const mochaUser = JSON.parse(userHeader);
    
    // Check if user is admin
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE mocha_user_id = ? AND is_admin = 1'
    ).bind(mochaUser.id).first();

    if (!user) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const type = c.req.query('type') || 'all';
    const format = c.req.query('format') || 'csv';
    const range = c.req.query('range') || 'all';

    let dateFilter = '';
    switch (range) {
      case 'today':
        dateFilter = 'WHERE created_at >= date("now")';
        break;
      case '7days':
        dateFilter = 'WHERE created_at >= date("now", "-7 days")';
        break;
      case '30days':
        dateFilter = 'WHERE created_at >= date("now", "-30 days")';
        break;
      default:
        dateFilter = '';
    }

    let data: any[] = [];
    let headers: string[] = [];

    switch (type) {
      case 'donations':
        const donations = await c.env.DB.prepare(`
          SELECT id, donor_name, donor_email, amount, message, is_anonymous, status, created_at
          FROM donations 
          ${dateFilter}
          ORDER BY created_at DESC
        `).all();
        data = donations.results;
        headers = ['ID', 'Donor Name', 'Email', 'Amount', 'Message', 'Anonymous', 'Status', 'Date'];
        break;

      case 'users':
        const users = await c.env.DB.prepare(`
          SELECT id, name, email, is_subscriber, is_admin, is_moderator, xp_total, user_level, 
                 points_balance, points_earned_total, watch_time_minutes, created_at
          FROM users 
          ${dateFilter}
          ORDER BY created_at DESC
        `).all();
        data = users.results;
        headers = ['ID', 'Name', 'Email', 'Subscriber', 'Admin', 'Moderator', 'XP Total', 'Level', 
                 'Points Balance', 'Points Earned', 'Watch Time', 'Join Date'];
        break;

      case 'subscriptions':
        const subscriptions = await c.env.DB.prepare(`
          SELECT s.id, u.name, u.email, s.plan_type, s.status, s.amount, s.billing_cycle, 
                 s.start_date, s.end_date, s.created_at
          FROM subscriptions s
          JOIN users u ON s.user_id = u.id
          ${dateFilter}
          ORDER BY s.created_at DESC
        `).all();
        data = subscriptions.results;
        headers = ['ID', 'User Name', 'Email', 'Plan', 'Status', 'Amount', 'Billing', 
                 'Start Date', 'End Date', 'Created'];
        break;

      case 'all':
        // Comprehensive report combining key metrics
        const allUsers = await c.env.DB.prepare(`
          SELECT u.id, u.name, u.email, u.is_subscriber, u.xp_total, u.user_level, 
                 u.points_balance, u.points_earned_total, u.created_at,
                 COALESCE(s.amount, 0) as subscription_amount,
                 COALESCE(d.donation_total, 0) as total_donated
          FROM users u
          LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
          LEFT JOIN (
            SELECT user_id, SUM(amount) as donation_total 
            FROM donations 
            WHERE status = 'completed' 
            GROUP BY user_id
          ) d ON u.id = d.user_id
          ${dateFilter}
          ORDER BY u.created_at DESC
        `).all();
        data = allUsers.results;
        headers = ['ID', 'Name', 'Email', 'Subscriber', 'XP', 'Level', 'Points Balance', 
                 'Points Earned', 'Total Donated', 'Subscription Amount', 'Join Date'];
        break;

      default:
        return c.json({ error: 'Invalid export type' }, 400);
    }

    if (format === 'csv') {
      // Generate CSV
      let csvContent = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = Object.values(row).map(value => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        });
        csvContent += values.join(',') + '\n';
      });

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="vaultkeeper-${type}-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // Return JSON
      return new Response(JSON.stringify({ headers, data }, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="vaultkeeper-${type}-report-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

  } catch (error) {
    console.error('Error generating export report:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

export default app;
