require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed boshlandi...');

  // Regions
  const regionNames = [
    'Toshkent', 'Samarqand', 'Buxoro', 'Namangan', 'Andijon',
    'Farg\'ona', 'Qo\'qon', 'Nukus', 'Qarshi', 'Termiz',
  ];
  const regions = await Promise.all(
    regionNames.map(name =>
      prisma.region.upsert({ where: { name }, create: { name }, update: {} })
    )
  );
  const tashkent = regions[0];
  console.log(`✅ ${regions.length} ta hudud yaratildi`);

  // Superadmin
  const superAdmin = await prisma.user.upsert({
    where: { phone: '998901234567' },
    create: {
      phone: '998901234567',
      name: 'Super Admin',
      role: 'SUPERADMIN',
      regionId: tashkent.id,
      regionName: tashkent.name,
      referralCode: 'SUPER001',
      coins: 100,
    },
    update: { role: 'SUPERADMIN' },
  });
  console.log('✅ Superadmin: +998 90 123 45 67');

  // Admin
  const admin = await prisma.user.upsert({
    where: { phone: '998901234568' },
    create: {
      phone: '998901234568',
      name: 'Admin Toshkent',
      role: 'ADMIN',
      regionId: tashkent.id,
      regionName: tashkent.name,
      referralCode: 'ADMIN001',
      coins: 50,
    },
    update: { role: 'ADMIN' },
  });
  console.log('✅ Admin: +998 90 123 45 68');

  // Restaurant owners + restaurants
  const restaurantData = [
    {
      phone: '998901111111',
      name: 'Osh Markaz',
      restaurantName: 'Osh Markaz',
      category: 'Milliy',
      address: 'Chilonzor tumani, 9-massiv',
      description: 'O\'zbek milliy taomlar markazi',
      logo: 'https://via.placeholder.com/100/FF6B1A/FFFFFF?text=OM',
      items: [
        { name: 'Osh palov', price: 25000, category: 'Asosiy', emoji: '🍚' },
        { name: 'Lag\'mon', price: 18000, category: 'Asosiy', emoji: '🍜' },
        { name: 'Mantu', price: 22000, category: 'Asosiy', emoji: '🥟' },
        { name: 'Shurva', price: 15000, category: 'Sho\'rva', emoji: '🍲' },
        { name: 'Somsa', price: 8000, category: 'Non-somsa', emoji: '🥐' },
      ],
    },
    {
      phone: '998902222222',
      name: 'Pizza House',
      restaurantName: 'Pizza House',
      category: 'Italyan',
      address: 'Yunusobod tumani, 19-massiv',
      description: 'Italyan va Yevropa taomlar',
      logo: 'https://via.placeholder.com/100/E8323C/FFFFFF?text=PH',
      items: [
        { name: 'Margarita pizza', price: 45000, category: 'Pizza', emoji: '🍕' },
        { name: 'Pepperoni pizza', price: 52000, category: 'Pizza', emoji: '🍕' },
        { name: 'Burger Classic', price: 35000, category: 'Burger', emoji: '🍔' },
        { name: 'Cesar salat', price: 28000, category: 'Salatlar', emoji: '🥗' },
        { name: 'Coca-Cola', price: 8000, category: 'Ichimliklar', emoji: '🥤' },
      ],
    },
    {
      phone: '998903333333',
      name: 'Sushi Go',
      restaurantName: 'Sushi Go',
      category: 'Yapon',
      address: 'Mirzo Ulug\'bek tumani, 2-massiv',
      description: 'Yapon taomlari va sushi',
      logo: 'https://via.placeholder.com/100/1E90FF/FFFFFF?text=SG',
      items: [
        { name: 'Philadelphia roll', price: 68000, category: 'Rolls', emoji: '🍱' },
        { name: 'California roll', price: 58000, category: 'Rolls', emoji: '🍱' },
        { name: 'Sashimi seti', price: 85000, category: 'Sashimi', emoji: '🍣' },
        { name: 'Miso sho\'rva', price: 22000, category: 'Sho\'rva', emoji: '🍜' },
        { name: 'Matcha choy', price: 12000, category: 'Ichimliklar', emoji: '🍵' },
      ],
    },
  ];

  for (const rd of restaurantData) {
    const owner = await prisma.user.upsert({
      where: { phone: rd.phone },
      create: {
        phone: rd.phone,
        name: rd.name,
        role: 'RESTAURANT_OWNER',
        regionId: tashkent.id,
        regionName: tashkent.name,
        referralCode: rd.phone.slice(-6),
        coins: 5,
      },
      update: { role: 'RESTAURANT_OWNER' },
    });

    const restaurant = await prisma.restaurant.upsert({
      where: { ownerId: owner.id },
      create: {
        ownerId: owner.id,
        name: rd.restaurantName,
        description: rd.description,
        category: rd.category,
        regionId: tashkent.id,
        address: rd.address,
        logo: rd.logo,
        isOpen: true,
        rating: 4.5 + Math.random() * 0.5,
        ratingCount: Math.floor(Math.random() * 500) + 100,
        deliveryTime: '25-40 daq',
        minOrder: 20000,
        commission: 0.1,
      },
      update: {},
    });

    // Menu items
    for (const item of rd.items) {
      const exists = await prisma.menuItem.findFirst({
        where: { restaurantId: restaurant.id, name: item.name },
      });
      if (!exists) {
        await prisma.menuItem.create({
          data: { restaurantId: restaurant.id, ...item },
        });
      }
    }

    console.log(`✅ Restoran: ${rd.restaurantName}`);
  }

  // Couriers
  const courierData = [
    { phone: '998904444444', name: 'Jasur Toshmatov' },
    { phone: '998905555555', name: 'Bobur Rahimov' },
    { phone: '998906666666', name: 'Sanjar Karimov' },
  ];

  for (const cd of courierData) {
    const user = await prisma.user.upsert({
      where: { phone: cd.phone },
      create: {
        phone: cd.phone,
        name: cd.name,
        role: 'COURIER',
        regionId: tashkent.id,
        regionName: tashkent.name,
        referralCode: cd.phone.slice(-6),
        coins: 3,
      },
      update: { role: 'COURIER' },
    });

    await prisma.courier.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        vehicle: 'Mototsikl',
        online: false,
        rating: 4.7,
        ratingCount: Math.floor(Math.random() * 200) + 50,
        totalDeliveries: Math.floor(Math.random() * 300) + 50,
      },
      update: {},
    });

    console.log(`✅ Kuryer: ${cd.name}`);
  }

  console.log('\n🎉 Seed muvaffaqiyatli yakunlandi!');
  console.log('\n📱 Test raqamlari:');
  console.log('Superadmin: +998 90 123 45 67');
  console.log('Admin:      +998 90 123 45 68');
  console.log('Restoran 1: +998 90 111 11 11');
  console.log('Restoran 2: +998 90 222 22 22');
  console.log('Restoran 3: +998 90 333 33 33');
  console.log('Kuryer 1:   +998 90 444 44 44');
  console.log('Kuryer 2:   +998 90 555 55 55');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
