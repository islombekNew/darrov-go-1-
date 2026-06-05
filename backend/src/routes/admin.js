const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');
const prisma = new PrismaClient();

// All routes require admin
router.use(auth, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers, totalRestaurants, totalCouriers,
      totalOrders, todayOrders,
      totalRevenue, todayRevenue,
      pendingOrders, activeOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.restaurant.count(),
      prisma.courier.count(),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'DELIVERED', createdAt: { gte: today } } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { platformShare: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED', createdAt: { gte: today } }, _sum: { platformShare: true } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: { in: ['ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY'] } } }),
    ]);

    res.json({
      totalUsers, totalRestaurants, totalCouriers,
      totalOrders, todayOrders,
      totalRevenue: totalRevenue._sum.platformShare || 0,
      todayRevenue: todayRevenue._sum.platformShare || 0,
      pendingOrders, activeOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/orders?status=&limit=
router.get('/orders', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status.toUpperCase();

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { name: true, phone: true } },
        restaurant: { select: { name: true } },
        courier: { select: { user: { select: { name: true, phone: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/restaurants
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: { select: { name: true, phone: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const withRevenue = await Promise.all(restaurants.map(async (r) => {
      const rev = await prisma.order.aggregate({
        where: { restaurantId: r.id, status: 'DELIVERED' },
        _sum: { restaurantShare: true, platformShare: true },
      });
      return {
        ...r,
        totalRevenue: rev._sum.restaurantShare || 0,
        platformRevenue: rev._sum.platformShare || 0,
        orderCount: r._count.orders,
      };
    }));

    res.json(withRevenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users?role=&status=
router.get('/users', async (req, res) => {
  try {
    const { role, status, limit = 100 } = req.query;
    const where = {};
    if (role) where.role = role.toUpperCase();
    if (status) where.status = status.toUpperCase();

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      select: {
        id: true, phone: true, name: true,
        role: true, status: true, createdAt: true,
        coins: true, streak: true, regionName: true,
        _count: { select: { orders: true } },
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/block
router.patch('/users/:id/block', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Topilmadi' });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED' },
    });
    res.json({ ok: true, status: updated.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  try {
    if (req.userRole !== 'SUPERADMIN') return res.status(403).json({ error: 'Superadmin kerak' });
    const { role } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: role.toUpperCase() },
    });
    res.json({ ok: true, role: updated.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/finance
router.get('/finance', async (req, res) => {
  try {
    if (req.userRole !== 'SUPERADMIN') return res.status(403).json({ error: 'Superadmin kerak' });

    const [totalPlatform, totalCourier, totalRestaurant, monthlyData] = await Promise.all([
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { platformShare: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { courierEarning: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { restaurantShare: true } }),
      prisma.order.groupBy({
        by: ['restaurantId'],
        where: { status: 'DELIVERED' },
        _sum: { restaurantShare: true, platformShare: true, total: true },
        _count: { id: true },
      }),
    ]);

    const restaurantIds = monthlyData.map(d => d.restaurantId);
    const restaurants = await prisma.restaurant.findMany({
      where: { id: { in: restaurantIds } },
      select: { id: true, name: true },
    });
    const restaurantMap = Object.fromEntries(restaurants.map(r => [r.id, r.name]));

    res.json({
      platform: totalPlatform._sum.platformShare || 0,
      courier: totalCourier._sum.courierEarning || 0,
      restaurant: totalRestaurant._sum.restaurantShare || 0,
      byRestaurant: monthlyData.map(d => ({
        restaurantId: d.restaurantId,
        restaurantName: restaurantMap[d.restaurantId] || 'Noma\'lum',
        restaurantShare: d._sum.restaurantShare || 0,
        platformShare: d._sum.platformShare || 0,
        total: d._sum.total || 0,
        orderCount: d._count.id,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/restaurants/:id/commission
router.patch('/restaurants/:id/commission', async (req, res) => {
  try {
    if (req.userRole !== 'SUPERADMIN') return res.status(403).json({ error: 'Superadmin kerak' });
    const { commission } = req.body;
    const updated = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: { commission: Number(commission) },
    });
    res.json({ ok: true, commission: updated.commission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/couriers
router.get('/couriers', async (req, res) => {
  try {
    const couriers = await prisma.courier.findMany({
      include: {
        user: { select: { name: true, phone: true, status: true, regionName: true } },
      },
      orderBy: { totalDeliveries: 'desc' },
    });

    const withEarnings = await Promise.all(couriers.map(async (c) => {
      const earnings = await prisma.order.aggregate({
        where: { courierId: c.id, status: 'DELIVERED' },
        _sum: { courierEarning: true },
        _count: { id: true },
      });
      return {
        ...c,
        totalEarnings: earnings._sum.courierEarning || 0,
        deliveryCount: earnings._count.id,
      };
    }));

    res.json(withEarnings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
