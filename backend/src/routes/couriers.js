const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/couriers/me
router.get('/me', auth, async (req, res) => {
  try {
    const courier = await prisma.courier.findUnique({
      where: { userId: req.userId },
      include: { user: { select: { name: true, phone: true, avatar: true } } },
    });
    if (!courier) return res.status(404).json({ error: 'Kuryer topilmadi' });
    res.json(mapCourier(courier));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/couriers/me/toggle  — online/offline
router.patch('/me/toggle', auth, async (req, res) => {
  try {
    const courier = await prisma.courier.findUnique({ where: { userId: req.userId } });
    if (!courier) return res.status(404).json({ error: 'Kuryer topilmadi' });

    const updated = await prisma.courier.update({
      where: { userId: req.userId },
      data: { online: !courier.online },
    });
    res.json({ online: updated.online });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/couriers/me/deliveries
router.get('/me/deliveries', auth, async (req, res) => {
  try {
    const courier = await prisma.courier.findUnique({ where: { userId: req.userId } });
    if (!courier) return res.status(404).json({ error: 'Kuryer topilmadi' });

    const deliveries = await prisma.order.findMany({
      where: { courierId: courier.id },
      include: {
        restaurant: { select: { name: true, address: true } },
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/couriers/me/stats
router.get('/me/stats', auth, async (req, res) => {
  try {
    const courier = await prisma.courier.findUnique({ where: { userId: req.userId } });
    if (!courier) return res.status(404).json({ error: 'Kuryer topilmadi' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const [todayDeliveries, weekDeliveries, totalEarnings, weekEarnings] = await Promise.all([
      prisma.order.count({
        where: { courierId: courier.id, status: 'DELIVERED', createdAt: { gte: today } },
      }),
      prisma.order.count({
        where: { courierId: courier.id, status: 'DELIVERED', createdAt: { gte: weekStart } },
      }),
      prisma.order.aggregate({
        where: { courierId: courier.id, status: 'DELIVERED' },
        _sum: { courierEarning: true },
      }),
      prisma.order.aggregate({
        where: { courierId: courier.id, status: 'DELIVERED', createdAt: { gte: weekStart } },
        _sum: { courierEarning: true },
      }),
    ]);

    res.json({
      totalDeliveries: courier.totalDeliveries,
      rating: courier.rating,
      ratingCount: courier.ratingCount,
      online: courier.online,
      todayDeliveries,
      weekDeliveries,
      totalEarnings: totalEarnings._sum.courierEarning || 0,
      weekEarnings: weekEarnings._sum.courierEarning || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/couriers/me/accept/:orderId  — accept available order
router.post('/me/accept/:orderId', auth, async (req, res) => {
  try {
    const courier = await prisma.courier.findUnique({ where: { userId: req.userId } });
    if (!courier) return res.status(404).json({ error: 'Kuryer topilmadi' });
    if (!courier.online) return res.status(400).json({ error: 'Avval onlayn bo\'ling' });

    const order = await prisma.order.findUnique({ where: { id: req.params.orderId } });
    if (!order || order.status !== 'READY' || order.courierId) {
      return res.status(400).json({ error: 'Buyurtma mavjud emas' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { courierId: courier.id, status: 'ON_THE_WAY' },
    });

    res.json({ ok: true, order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/couriers/rate/:courierId  — rate courier after delivery
router.post('/rate/:courierId', auth, async (req, res) => {
  try {
    const { rating, orderId } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Reyting 1-5' });

    const courier = await prisma.courier.findUnique({ where: { id: req.params.courierId } });
    if (!courier) return res.status(404).json({ error: 'Topilmadi' });

    const newRatingCount = courier.ratingCount + 1;
    const newRating = (courier.rating * courier.ratingCount + rating) / newRatingCount;

    await prisma.courier.update({
      where: { id: req.params.courierId },
      data: {
        rating: Math.round(newRating * 10) / 10,
        ratingCount: newRatingCount,
      },
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mapCourier(c) {
  return {
    id: c.id, userId: c.userId,
    vehicle: c.vehicle, online: c.online,
    rating: c.rating, ratingCount: c.ratingCount,
    totalDeliveries: c.totalDeliveries,
    user: c.user,
  };
}

module.exports = router;
