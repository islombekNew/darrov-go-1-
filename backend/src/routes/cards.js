const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

router.use(auth);

// GET /api/cards — foydalanuvchi kartalarini olish
router.get('/', async (req, res) => {
  try {
    const cards = await prisma.paymentCard.findMany({
      where: { userId: req.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(cards);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/cards — karta qo'shish
router.post('/', async (req, res) => {
  try {
    const { pan, expiry, holder } = req.body;
    if (!pan || !expiry) return res.status(400).json({ error: 'Karta raqami va muddati kerak' });

    // Pan ni mask qilish (faqat oxirgi 4ta saqlash)
    const masked = '**** **** **** ' + pan.replace(/\s/g, '').slice(-4);

    const count = await prisma.paymentCard.count({ where: { userId: req.userId } });
    const card = await prisma.paymentCard.create({
      data: { userId: req.userId, pan: masked, expiry, holder: holder || '', isDefault: count === 0 },
    });
    res.json(card);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/cards/:id/default — asosiy karta qilish
router.patch('/:id/default', async (req, res) => {
  try {
    await prisma.paymentCard.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    });
    const card = await prisma.paymentCard.update({
      where: { id: req.params.id },
      data: { isDefault: true },
    });
    res.json(card);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/cards/:id — kartani o'chirish
router.delete('/:id', async (req, res) => {
  try {
    const card = await prisma.paymentCard.findUnique({ where: { id: req.params.id } });
    if (!card || card.userId !== req.userId) return res.status(403).json({ error: "Ruxsat yo'q" });

    await prisma.paymentCard.delete({ where: { id: req.params.id } });

    if (card.isDefault) {
      const next = await prisma.paymentCard.findFirst({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
      if (next) await prisma.paymentCard.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/cards/admin — admin: barcha kartalar (superadmin)
router.get('/admin/all', async (req, res) => {
  try {
    if (!['ADMIN', 'SUPERADMIN'].includes(req.userRole)) return res.status(403).json({ error: "Ruxsat yo'q" });
    const cards = await prisma.paymentCard.findMany({
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(cards);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
