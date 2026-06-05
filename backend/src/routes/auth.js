const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../telegram');
const prisma = new PrismaClient();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(phone) {
  const d = phone.replace(/\D/g, '');
  if (d.length === 9) return '998' + d;
  if (d.length === 12 && d.startsWith('998')) return d;
  throw new Error('Telefon raqami noto\'g\'ri');
}

function makeToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone || '');
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 daqiqa

    // Eski OTPlarni o'chirish
    await prisma.oTP.deleteMany({ where: { phone, used: false } });

    // Yangi OTP yaratish
    await prisma.oTP.create({ data: { phone, code, expiresAt } });

    // Telegram orqali yuborish
    await sendOTP(phone, code);

    res.json({ ok: true, message: 'OTP yuborildi', phone });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone: rawPhone, code } = req.body;
    const phone = normalizePhone(rawPhone || '');

    const otp = await prisma.oTP.findFirst({
      where: { phone, code, used: false, expiresAt: { gt: new Date() } },
    });

    if (!otp) return res.status(400).json({ error: 'OTP noto\'g\'ri yoki muddati o\'tgan' });

    await prisma.oTP.update({ where: { id: otp.id }, data: { used: true } });

    // Foydalanuvchi topish yoki yaratish
    let user = await prisma.user.findUnique({ where: { phone } });
    const isNew = !user;

    if (!user) {
      const referralCode = phone.slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase();
      user = await prisma.user.create({
        data: { phone, referralCode, coins: 3 },
      });
    }

    const token = makeToken(user.id, user.role);
    res.json({ ok: true, token, user: mapUser(user), isNew });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/complete-register
router.post('/complete-register', async (req, res) => {
  try {
    const { phone: rawPhone, name, role, regionId, regionName, referralCode } = req.body;
    const phone = normalizePhone(rawPhone || '');

    const updateData = {
      name: name?.trim(),
      role: role?.toUpperCase() || 'CUSTOMER',
      regionId, regionName,
    };

    // Referal kod tekshirish
    if (referralCode) {
      const referrer = await prisma.user.findFirst({ where: { referralCode } });
      if (referrer && referrer.phone !== phone) {
        updateData.referredBy = referrer.id;
        await prisma.user.update({ where: { id: referrer.id }, data: { coins: { increment: 3 } } });
        updateData.coins = 6; // welcome + referral bonus
      }
    }

    const user = await prisma.user.update({ where: { phone }, data: updateData });

    // Kuryer rolida bo'lsa Courier yozuv yaratish
    if (user.role === 'COURIER') {
      await prisma.courier.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
    }

    const token = makeToken(user.id, user.role);
    res.json({ ok: true, token, user: mapUser(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function mapUser(u) {
  return {
    id: u.id, phone: u.phone, name: u.name,
    role: u.role?.toLowerCase(),
    status: u.status?.toLowerCase(),
    regionId: u.regionId, regionName: u.regionName,
    address: u.address, coins: u.coins, streak: u.streak,
    referralCode: u.referralCode, avatar: u.avatar,
  };
}

module.exports = router;
