const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/restaurants?regionId=&category=
router.get('/', async (req, res) => {
  try {
    const { regionId, category } = req.query;
    const where = {};
    if (regionId) where.regionId = regionId;
    if (category) where.category = category;

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: { region: { select: { name: true } } },
      orderBy: { rating: 'desc' },
    });
    res.json(restaurants.map(mapRestaurant));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/restaurants/:id
router.get('/:id', async (req, res) => {
  try {
    const r = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
      include: {
        menuItems: { where: { available: true }, orderBy: { category: 'asc' } },
        region: { select: { name: true } },
      },
    });
    if (!r) return res.status(404).json({ error: 'Topilmadi' });
    res.json({ ...mapRestaurant(r), menuItems: r.menuItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/restaurants/:id/orders  (for restaurant owner)
router.get('/:id/orders', auth, async (req, res) => {
  try {
    const r = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ error: 'Topilmadi' });
    if (r.ownerId !== req.userId && !['ADMIN', 'SUPERADMIN'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const orders = await prisma.order.findMany({
      where: { restaurantId: req.params.id },
      include: { customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/restaurants  (register restaurant)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, regionId, address, logo, deliveryTime, minOrder } = req.body;

    // Find or validate region
    let region = await prisma.region.findUnique({ where: { id: regionId } });
    if (!region) return res.status(400).json({ error: 'Region topilmadi' });

    const existing = await prisma.restaurant.findUnique({ where: { ownerId: req.userId } });
    if (existing) return res.status(400).json({ error: 'Sizda allaqachon restoran bor' });

    const r = await prisma.restaurant.create({
      data: {
        ownerId: req.userId,
        name, description, category: category || 'Milliy',
        regionId, address,
        logo, deliveryTime: deliveryTime || '30-45 daq',
        minOrder: minOrder || 20000,
      },
    });

    // Update user role
    await prisma.user.update({ where: { id: req.userId }, data: { role: 'RESTAURANT_OWNER' } });

    res.status(201).json(mapRestaurant(r));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/restaurants/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const r = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ error: 'Topilmadi' });
    if (r.ownerId !== req.userId && !['ADMIN', 'SUPERADMIN'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const { name, description, category, address, logo, isOpen, deliveryTime, minOrder } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (address !== undefined) updateData.address = address;
    if (logo !== undefined) updateData.logo = logo;
    if (isOpen !== undefined) updateData.isOpen = isOpen;
    if (deliveryTime !== undefined) updateData.deliveryTime = deliveryTime;
    if (minOrder !== undefined) updateData.minOrder = minOrder;

    const updated = await prisma.restaurant.update({ where: { id: req.params.id }, data: updateData });
    res.json(mapRestaurant(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/restaurants/:id/menu
router.post('/:id/menu', auth, async (req, res) => {
  try {
    const r = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!r || (r.ownerId !== req.userId && !['ADMIN', 'SUPERADMIN'].includes(req.userRole))) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }
    const { name, description, price, category, emoji } = req.body;
    const item = await prisma.menuItem.create({
      data: {
        restaurantId: req.params.id,
        name, description, price: Number(price),
        category: category || 'Asosiy',
        emoji: emoji || '🍽',
      },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/restaurants/:id/menu/:itemId
router.patch('/:id/menu/:itemId', auth, async (req, res) => {
  try {
    const r = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!r || (r.ownerId !== req.userId && !['ADMIN', 'SUPERADMIN'].includes(req.userRole))) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }
    const { name, description, price, category, emoji, available } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;
    if (emoji !== undefined) updateData.emoji = emoji;
    if (available !== undefined) updateData.available = available;

    const item = await prisma.menuItem.update({ where: { id: req.params.itemId }, data: updateData });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/restaurants/:id/menu/:itemId
router.delete('/:id/menu/:itemId', auth, async (req, res) => {
  try {
    const r = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!r || (r.ownerId !== req.userId && !['ADMIN', 'SUPERADMIN'].includes(req.userRole))) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }
    await prisma.menuItem.delete({ where: { id: req.params.itemId } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/restaurants/stats/my  (for restaurant owner dashboard)
router.get('/stats/my', auth, async (req, res) => {
  try {
    const r = await prisma.restaurant.findUnique({ where: { ownerId: req.userId } });
    if (!r) return res.status(404).json({ error: 'Restoran topilmadi' });

    const [totalOrders, todayOrders, totalRevenue] = await Promise.all([
      prisma.order.count({ where: { restaurantId: r.id, status: 'DELIVERED' } }),
      prisma.order.count({
        where: {
          restaurantId: r.id,
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.order.aggregate({
        where: { restaurantId: r.id, status: 'DELIVERED' },
        _sum: { restaurantShare: true },
      }),
    ]);

    res.json({
      restaurant: mapRestaurant(r),
      stats: {
        totalOrders,
        todayOrders,
        totalRevenue: totalRevenue._sum.restaurantShare || 0,
        rating: r.rating,
        ratingCount: r.ratingCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mapRestaurant(r) {
  return {
    id: r.id, ownerId: r.ownerId,
    name: r.name, description: r.description,
    category: r.category, regionId: r.regionId,
    address: r.address, logo: r.logo,
    isOpen: r.isOpen, rating: r.rating, ratingCount: r.ratingCount,
    deliveryTime: r.deliveryTime, minOrder: r.minOrder,
    commission: r.commission, createdAt: r.createdAt,
    regionName: r.region?.name,
  };
}

module.exports = router;
