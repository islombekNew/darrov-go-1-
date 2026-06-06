require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 DarrovGo boshlang\'ich ma\'lumotlar...');

  // Faqat hududlar — bu real ma'lumot, test emas
  const regionNames = [
    'Toshkent', 'Samarqand', 'Buxoro', 'Namangan', 'Andijon',
    "Farg'ona", "Qo'qon", 'Nukus', 'Qarshi', 'Termiz',
  ];
  const regions = await Promise.all(
    regionNames.map(name =>
      prisma.region.upsert({ where: { name }, create: { name }, update: {} })
    )
  );
  console.log(`✅ ${regions.length} ta hudud qo'shildi`);

  // Superadmin — faqat SUPERADMIN_PHONE env variable bo'lsa
  const superPhone = process.env.SUPERADMIN_PHONE;
  if (superPhone) {
    const tashkent = regions[0];
    await prisma.user.upsert({
      where: { phone: superPhone },
      create: {
        phone: superPhone,
        name: 'DarrovGo Admin',
        role: 'SUPERADMIN',
        regionId: tashkent.id,
        regionName: tashkent.name,
        referralCode: 'DARROVADMIN',
        coins: 0,
      },
      update: { role: 'SUPERADMIN' },
    });
    console.log(`✅ Superadmin: +${superPhone}`);
  } else {
    console.log('ℹ️  SUPERADMIN_PHONE env o\'rnatilmagan — superadmin yaratilmadi');
  }

  console.log('\n✅ Boshlang\'ich ma\'lumotlar tayyor!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
