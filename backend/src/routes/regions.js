const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/regions
router.get('/', async (req, res) => {
  try {
    const regions = await prisma.region.findMany({ orderBy: { name: 'asc' } });
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
