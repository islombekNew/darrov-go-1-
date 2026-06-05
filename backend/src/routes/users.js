const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'Topilmadi' });
    res.json(mapUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/me
router.patch('/me', auth, async (req, res) => {
  try {
    const { name, address, floor, apartment, avatar, regionId, regionName } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (address !== undefined) updateData.address = address;
    if (floor !== undefined) updateData.floor = floor;
    if (apartment !== undefined) updateData.apartment = apartment;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (regionId !== undefined) updateData.regionId = regionId;
    if (regionName !== undefined) updateData.regionName = regionName;

    const user = await prisma.user.update({ where: { id: req.userId }, data: updateData });
    res.json(mapUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/me/orders
router.get('/me/orders', auth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.userId },
      include: { restaurant: { select: { name: true, logo: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(orders.map(mapOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/me/coins
router.get('/me/coins', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { coins: true, streak: true, lastOrderDate: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mapUser(u) {
  return {
    id: u.id, phone: u.phone, name: u.name,
    role: u.role?.toLowerCase(),
    status: u.status?.toLowerCase(),
    regionId: u.regionId, regionName: u.regionName,
    address: u.address, floor: u.floor, apartment: u.apartment,
    coins: u.coins, streak: u.streak,
    referralCode: u.referralCode, avatar: u.avatar,
    createdAt: u.createdAt,
  };
}

function mapOrder(o) {
  return {
    id: o.id, orderNumber: o.orderNumber,
    status: o.status?.toLowerCase(),
    items: o.items, subtotal: o.subtotal,
    deliveryFee: o.deliveryFee, total: o.total,
    coinsEarned: o.coinsEarned,
    address: o.address, floor: o.floor, apartment: o.apartment,
    restaurant: o.restaurant,
    createdAt: o.createdAt,
  };
}

module.exports = router;
