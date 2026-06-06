/**
 * Bu skript Railway bazasidan test ma'lumotlarini o'chiradi.
 * Railway consolida bir marta ishlatiladi: node src/cleanup.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEST_PHONES = [
  '998901234567', '998901234568',
  '998901111111', '998902222222', '998903333333',
  '998904444444', '998905555555', '998906666666',
];

async function cleanup() {
  console.log('🧹 Test ma\'lumotlarini o\'chirish boshlandi...');

  // 1. Test foydalanuvchilarni topish
  const testUsers = await prisma.user.findMany({
    where: { phone: { in: TEST_PHONES } },
    select: { id: true, phone: true, role: true },
  });

  if (testUsers.length === 0) {
    console.log('ℹ️  Test foydalanuvchilar topilmadi');
    return;
  }

  console.log(`🔍 ${testUsers.length} ta test foydalanuvchi topildi:`);
  testUsers.forEach(u => console.log(`  - +${u.phone} (${u.role})`));

  const testUserIds = testUsers.map(u => u.id);

  // 2. Test buyurtmalarni o'chirish
  const deletedOrders = await prisma.order.deleteMany({
    where: { customerId: { in: testUserIds } },
  });
  console.log(`✅ ${deletedOrders.count} ta test buyurtma o'chirildi`);

  // 3. Restoranlarni o'chirish
  const restaurants = await prisma.restaurant.findMany({
    where: { ownerId: { in: testUserIds } },
    select: { id: true },
  });
  if (restaurants.length > 0) {
    const restIds = restaurants.map(r => r.id);
    await prisma.menuItem.deleteMany({ where: { restaurantId: { in: restIds } } });
    await prisma.order.deleteMany({ where: { restaurantId: { in: restIds } } });
    await prisma.restaurant.deleteMany({ where: { id: { in: restIds } } });
    console.log(`✅ ${restaurants.length} ta test restoran o'chirildi`);
  }

  // 4. Kuryerlarni o'chirish
  const deletedCouriers = await prisma.courier.deleteMany({
    where: { userId: { in: testUserIds } },
  });
  console.log(`✅ ${deletedCouriers.count} ta test kuryer o'chirildi`);

  // 5. Foydalanuvchilarni o'chirish
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: testUserIds } },
  });
  console.log(`✅ ${deletedUsers.count} ta test foydalanuvchi o'chirildi`);

  // 6. OTP larni tozalash
  await prisma.oTP.deleteMany({
    where: { phone: { in: TEST_PHONES } },
  });

  console.log('\n🎉 Baza tozalandi! Endi faqat haqiqiy foydalanuvchilar qoldi.');
}

cleanup()
  .catch(err => {
    console.error('Xato:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
