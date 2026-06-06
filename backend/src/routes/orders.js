const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { notifyRestaurant } = require('../telegram');
const prisma = new PrismaClient();

const calcDeliveryFee = (km) => {
  if (km <= 1) return 5000;
  if (km <= 2) return 6500;
  if (km <= 3) return 7500;
  if (km <= 5) return 9000;
  return 9000 + Math.ceil(km - 5) * 2000;
};
const calcCourierEarning = (km) => Math.round(calcDeliveryFee(km) * 0.7);

// POST /api/orders  — create order
router.post('/', auth, async (req, res) => {
  try {
    const {
      restaurantId, items, address, floor, apartment, comment,
      latitude, longitude, distance,
    } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: 'Mahsulot tanlang' });

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) return res.status(404).json({ error: 'Restoran topilmadi' });

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const km = distance || 2;
    const deliveryFee = calcDeliveryFee(km);
    const total = subtotal + deliveryFee;
    const coinsEarned = Math.floor(total / 10000);

    const courierEarning = calcCourierEarning(km);
    const platformShare = Math.round((deliveryFee - courierEarning) + subtotal * restaurant.commission);
    const restaurantShare = subtotal - Math.round(subtotal * restaurant.commission);

    const order = await prisma.order.create({
      data: {
        customerId: req.userId,
        restaurantId, items,
        subtotal, deliveryFee, total,
        coinsEarned, address,
        floor, apartment, comment,
        distance: km,
        courierEarning, platformShare, restaurantShare,
      },
      include: { restaurant: { select: { name: true } } },
    });

    // Streak + coins update
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const today = new Date().toDateString();
    const lastOrder = user.lastOrderDate ? new Date(user.lastOrderDate).toDateString() : null;
    const isConsecutive = lastOrder === new Date(Date.now() - 86400000).toDateString();

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        coins: { increment: coinsEarned },
        streak: isConsecutive ? { increment: 1 } : 1,
        lastOrderDate: new Date(),
      },
    });

    // Notify restaurant
    if (restaurant.telegramChatId) {
      notifyRestaurant(restaurant.telegramChatId, {
        orderNumber: order.orderNumber,
        items: items.map(i => `${i.name} x${i.qty}`).join(', '),
        total,
        address,
      });
    }

    res.status(201).json(mapOrder(order));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders  — list orders (admin or courier sees all, customer sees own)
router.get('/', auth, async (req, res) => {
  try {
    const where = {};
    if (req.userRole === 'CUSTOMER') {
      where.customerId = req.userId;
    } else if (req.userRole === 'COURIER') {
      const courier = await prisma.courier.findUnique({ where: { userId: req.userId } });
      if (courier) where.courierId = courier.id;
    } else if (req.userRole === 'RESTAURANT_OWNER') {
      const r = await prisma.restaurant.findUnique({ where: { ownerId: req.userId } });
      if (r) where.restaurantId = r.id;
    }
    // ADMIN/SUPERADMIN sees all

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { name: true, phone: true } },
        restaurant: { select: { name: true } },
        courier: { select: { user: { select: { name: true, phone: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(orders.map(mapOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { name: true, phone: true, avatar: true } },
        restaurant: { select: { name: true, logo: true, address: true, phone: true } },
        courier: { select: { id: true, user: { select: { name: true, phone: true, avatar: true } } } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Topilmadi' });
    res.json(mapOrder(order));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, courierId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Topilmadi' });

    const updateData = { status: status.toUpperCase() };

    // Courier picking up order
    if (status === 'on_the_way' && courierId) {
      updateData.courierId = courierId;
    }

    // On delivery complete, update courier stats
    if (status === 'delivered') {
      const updated = await prisma.order.update({ where: { id: req.params.id }, data: updateData });
      if (order.courierId) {
        await prisma.courier.update({
          where: { id: order.courierId },
          data: { totalDeliveries: { increment: 1 } },
        });
      }
      return res.json(mapOrder(updated));
    }

    const updated = await prisma.order.update({ where: { id: req.params.id }, data: updateData });
    res.json(mapOrder(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/available/courier  — pending orders for couriers to pick up
router.get('/available/courier', auth, async (req, res) => {
  try {
    const courier = await prisma.courier.findUnique({ where: { userId: req.userId } });
    if (!courier) return res.status(404).json({ error: 'Kuryer topilmadi' });

    const where = { status: 'READY', courierId: null };
    if (courier.restaurantId) where.restaurantId = courier.restaurantId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        restaurant: { select: { name: true, address: true } },
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(orders.map(mapOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mapOrder(o) {
  return {
    id: o.id, orderNumber: o.orderNumber,
    status: o.status?.toLowerCase(),
    items: o.items, subtotal: o.subtotal,
    deliveryFee: o.deliveryFee, total: o.total,
    coinsEarned: o.coinsEarned,
    address: o.address, floor: o.floor, apartment: o.apartment, comment: o.comment,
    distance: o.distance, courierEarning: o.courierEarning,
    platformShare: o.platformShare, restaurantShare: o.restaurantShare,
    customer: o.customer, restaurant: o.restaurant, courier: o.courier,
    createdAt: o.createdAt, updatedAt: o.updatedAt,
  };
}

module.exports = router;
