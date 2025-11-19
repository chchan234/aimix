import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { users, transactions, adminLogs, announcements } from '../db/schema.js';
import { eq, desc, sql, and, gte, like, or, count } from 'drizzle-orm';
import { requireAdmin, getClientIP } from '../middleware/admin.js';

const router = Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// ================================
// Dashboard Stats
// ================================
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Total users
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // New users this month
    const newUsersResult = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startDate));
    const newUsers = newUsersResult[0]?.count || 0;

    // Total credits charged
    const totalCreditsResult = await db.select({
      total: sql<number>`COALESCE(SUM(${transactions.creditAmount}), 0)`
    })
      .from(transactions)
      .where(eq(transactions.type, 'charge'));
    const totalCreditsCharged = totalCreditsResult[0]?.total || 0;

    // Credits charged this month
    const monthlyCreditsResult = await db.select({
      total: sql<number>`COALESCE(SUM(${transactions.creditAmount}), 0)`
    })
      .from(transactions)
      .where(and(
        eq(transactions.type, 'charge'),
        gte(transactions.createdAt, startDate)
      ));
    const monthlyCreditsCharged = monthlyCreditsResult[0]?.total || 0;

    // Total revenue
    const totalRevenueResult = await db.select({
      total: sql<number>`COALESCE(SUM(${transactions.actualAmount}), 0)`
    })
      .from(transactions)
      .where(and(
        eq(transactions.type, 'charge'),
        sql`${transactions.actualAmount} > 0`
      ));
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Monthly revenue
    const monthlyRevenueResult = await db.select({
      total: sql<number>`COALESCE(SUM(${transactions.actualAmount}), 0)`
    })
      .from(transactions)
      .where(and(
        eq(transactions.type, 'charge'),
        sql`${transactions.actualAmount} > 0`,
        gte(transactions.createdAt, startDate)
      ));
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    // Service usage count (this month)
    const serviceUsageResult = await db.select({ count: count() })
      .from(transactions)
      .where(and(
        eq(transactions.type, 'use'),
        gte(transactions.createdAt, startDate)
      ));
    const serviceUsageCount = serviceUsageResult[0]?.count || 0;

    res.json({
      totalUsers,
      newUsers,
      totalCreditsCharged,
      monthlyCreditsCharged,
      totalRevenue,
      monthlyRevenue,
      serviceUsageCount
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ================================
// User Management
// ================================
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    let whereClause;
    if (search) {
      whereClause = or(
        like(users.email, `%${search}%`),
        like(users.username, `%${search}%`),
        like(users.providerId, `%${search}%`)
      );
    }

    const [usersList, totalResult] = await Promise.all([
      db.select({
        id: users.id,
        email: users.email,
        username: users.username,
        provider: users.provider,
        providerId: users.providerId,
        credits: users.credits,
        lifetimeCredits: users.lifetimeCredits,
        role: users.role,
        createdAt: users.createdAt
      })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ count: count() })
        .from(users)
        .where(whereClause)
    ]);

    res.json({
      users: usersList,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.count || 0,
        pages: Math.ceil((totalResult[0]?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user details
router.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(50);

    res.json({
      user: {
        ...user,
        password: undefined
      },
      transactions: userTransactions
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Update user role
router.put('/users/:userId/role', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminId = (req as any).admin.id;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await db.insert(adminLogs).values({
      adminId,
      action: 'user_role_change',
      targetType: 'user',
      targetId: userId,
      details: { oldRole: user.role, newRole: role, email: user.email },
      ipAddress: getClientIP(req)
    });

    res.json({ success: true, newRole: role });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = (req as any).admin.id;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Delete user's transactions first
    await db.delete(transactions).where(eq(transactions.userId, userId));

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    await db.insert(adminLogs).values({
      adminId,
      action: 'user_delete',
      targetType: 'user',
      targetId: userId,
      details: { email: user.email },
      ipAddress: getClientIP(req)
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ================================
// Credit Management
// ================================
router.post('/credits/charge', async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason } = req.body;
    const adminId = (req as any).admin.id;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid user ID or amount' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newCredits = user.credits + amount;
    const newLifetimeCredits = user.lifetimeCredits + amount;

    await db.update(users)
      .set({
        credits: newCredits,
        lifetimeCredits: newLifetimeCredits,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    await db.insert(transactions).values({
      userId,
      type: 'charge',
      creditAmount: amount,
      creditBalanceAfter: newCredits,
      paymentMethod: 'admin_gift'
    });

    await db.insert(adminLogs).values({
      adminId,
      action: 'credit_charge',
      targetType: 'user',
      targetId: userId,
      details: {
        amount,
        reason: reason || 'Admin credit charge',
        newBalance: newCredits
      },
      ipAddress: getClientIP(req)
    });

    res.json({
      success: true,
      newCredits,
      message: `Successfully charged ${amount} credits to user`
    });
  } catch (error) {
    console.error('Credit charge error:', error);
    res.status(500).json({ error: 'Failed to charge credits' });
  }
});

// Deduct credits from user
router.post('/credits/deduct', async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason } = req.body;
    const adminId = (req as any).admin.id;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid user ID or amount' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.credits < amount) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    const newCredits = user.credits - amount;

    await db.update(users)
      .set({
        credits: newCredits,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    await db.insert(transactions).values({
      userId,
      type: 'use',
      creditAmount: -amount,
      creditBalanceAfter: newCredits,
      paymentMethod: 'admin_deduct'
    });

    await db.insert(adminLogs).values({
      adminId,
      action: 'credit_deduct',
      targetType: 'user',
      targetId: userId,
      details: {
        amount,
        reason: reason || 'Admin credit deduction',
        newBalance: newCredits
      },
      ipAddress: getClientIP(req)
    });

    res.json({
      success: true,
      newCredits,
      message: `Successfully deducted ${amount} credits from user`
    });
  } catch (error) {
    console.error('Credit deduct error:', error);
    res.status(500).json({ error: 'Failed to deduct credits' });
  }
});

// Get credit history for a user
router.get('/credits/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const [history, totalResult] = await Promise.all([
      db.select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ count: count() })
        .from(transactions)
        .where(eq(transactions.userId, userId))
    ]);

    res.json({
      history,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.count || 0,
        pages: Math.ceil((totalResult[0]?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Credit history error:', error);
    res.status(500).json({ error: 'Failed to fetch credit history' });
  }
});

// ================================
// Service Analytics
// ================================
router.get('/analytics/services', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const serviceStats = await db.execute(sql`
      SELECT
        COALESCE(s.service_type, 'unknown') as service_type,
        COUNT(*)::int as usage_count,
        COALESCE(SUM(t.credit_amount), 0)::int as total_credits
      FROM transactions t
      LEFT JOIN services s ON t.service_id = s.id
      WHERE t.type = 'use'
        AND t.created_at >= ${startDate}
      GROUP BY s.service_type
      ORDER BY usage_count DESC
    `);

    const dailyTrend = await db.execute(sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*)::int as usage_count
      FROM transactions
      WHERE type = 'use'
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      serviceStats,
      dailyTrend
    });
  } catch (error) {
    console.error('Service analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch service analytics' });
  }
});

router.get('/analytics/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userTransactions = await db.select({
      id: transactions.id,
      type: transactions.type,
      creditAmount: transactions.creditAmount,
      creditBalanceAfter: transactions.creditBalanceAfter,
      paymentMethod: transactions.paymentMethod,
      actualAmount: transactions.actualAmount,
      createdAt: transactions.createdAt
    })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(100);

    const totals = userTransactions.reduce((acc, t) => {
      if (t.type === 'charge') {
        acc.totalCharged += t.creditAmount;
        acc.totalPaid += t.actualAmount || 0;
      } else if (t.type === 'use') {
        acc.totalUsed += Math.abs(t.creditAmount);
      }
      return acc;
    }, { totalCharged: 0, totalUsed: 0, totalPaid: 0 });

    res.json({
      transactions: userTransactions,
      totals
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// ================================
// Announcements Management
// ================================
router.get('/announcements', async (req: Request, res: Response) => {
  try {
    const announcementsList = await db.select()
      .from(announcements)
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
      .limit(50);

    res.json({ announcements: announcementsList });
  } catch (error) {
    console.error('List announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

router.post('/announcements', async (req: Request, res: Response) => {
  try {
    const { title, content, type, isPinned, startDate, endDate } = req.body;
    const adminId = (req as any).admin.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newAnnouncement = await db.insert(announcements).values({
      adminId,
      title,
      content,
      type: type || 'info',
      isPinned: isPinned || false,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    }).returning();

    await db.insert(adminLogs).values({
      adminId,
      action: 'announcement_create',
      targetType: 'announcement',
      targetId: newAnnouncement[0].id,
      details: { title },
      ipAddress: getClientIP(req)
    });

    res.json({ announcement: newAnnouncement[0] });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

router.put('/announcements/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, type, isActive, isPinned, startDate, endDate } = req.body;
    const adminId = (req as any).admin.id;

    const updated = await db.update(announcements)
      .set({
        title,
        content,
        type,
        isActive,
        isPinned,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        updatedAt: new Date()
      })
      .where(eq(announcements.id, id))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    await db.insert(adminLogs).values({
      adminId,
      action: 'announcement_update',
      targetType: 'announcement',
      targetId: id,
      details: { title },
      ipAddress: getClientIP(req)
    });

    res.json({ announcement: updated[0] });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

router.delete('/announcements/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).admin.id;

    const deleted = await db.delete(announcements)
      .where(eq(announcements.id, id))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    await db.insert(adminLogs).values({
      adminId,
      action: 'announcement_delete',
      targetType: 'announcement',
      targetId: id,
      details: { title: deleted[0].title },
      ipAddress: getClientIP(req)
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// ================================
// Activity Logs
// ================================
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const action = req.query.action as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let whereConditions = [];

    if (action) {
      whereConditions.push(eq(adminLogs.action, action));
    }

    if (startDate) {
      whereConditions.push(gte(adminLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereConditions.push(sql`${adminLogs.createdAt} <= ${end}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [logs, totalResult] = await Promise.all([
      db.select({
        id: adminLogs.id,
        adminId: adminLogs.adminId,
        action: adminLogs.action,
        targetType: adminLogs.targetType,
        targetId: adminLogs.targetId,
        details: adminLogs.details,
        ipAddress: adminLogs.ipAddress,
        createdAt: adminLogs.createdAt
      })
        .from(adminLogs)
        .where(whereClause)
        .orderBy(desc(adminLogs.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ count: count() })
        .from(adminLogs)
        .where(whereClause)
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.count || 0,
        pages: Math.ceil((totalResult[0]?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// ================================
// Export Data
// ================================
router.get('/export/users', async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      provider: users.provider,
      credits: users.credits,
      lifetimeCredits: users.lifetimeCredits,
      role: users.role,
      createdAt: users.createdAt
    })
      .from(users)
      .orderBy(desc(users.createdAt));

    // Generate CSV
    const headers = ['ID', 'Email', 'Username', 'Provider', 'Credits', 'Lifetime Credits', 'Role', 'Created At'];
    const csvRows = [headers.join(',')];

    for (const user of allUsers) {
      const row = [
        user.id,
        `"${user.email}"`,
        `"${user.username || ''}"`,
        user.provider,
        user.credits,
        user.lifetimeCredits,
        user.role,
        new Date(user.createdAt).toISOString()
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Failed to export users' });
  }
});

router.get('/export/logs', async (req: Request, res: Response) => {
  try {
    const allLogs = await db.select({
      id: adminLogs.id,
      adminId: adminLogs.adminId,
      action: adminLogs.action,
      targetType: adminLogs.targetType,
      targetId: adminLogs.targetId,
      details: adminLogs.details,
      ipAddress: adminLogs.ipAddress,
      createdAt: adminLogs.createdAt
    })
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(1000);

    // Generate CSV
    const headers = ['ID', 'Admin ID', 'Action', 'Target Type', 'Target ID', 'Details', 'IP Address', 'Created At'];
    const csvRows = [headers.join(',')];

    for (const log of allLogs) {
      const row = [
        log.id,
        log.adminId,
        log.action,
        log.targetType || '',
        log.targetId || '',
        `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`,
        log.ipAddress,
        new Date(log.createdAt).toISOString()
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=admin_logs_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).json({ error: 'Failed to export logs' });
  }
});

// ================================
// Admin Status Check
// ================================
router.get('/status', async (req: Request, res: Response) => {
  res.json({
    isAdmin: true,
    admin: {
      id: (req as any).admin.id,
      email: (req as any).admin.email
    }
  });
});

export default router;
