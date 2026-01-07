'use server';

import prisma from './prisma';

// TEST --------------------------------------------------------------------

export async function getTotalUsersAndTest() {
  try {
    const allUsers = await prisma.user.findMany({ take: 1 });
    console.log('--- 🕵️ TOTAL USERS FOUND:', allUsers.length);
    console.log('--- 🕵️ FIRST USER IN DB:', allUsers[0]?.email);
    return allUsers[0];
  } catch (error) {
    console.error('Database is empty or unreachable:', error);
    return null;
  }
}

// USER --------------------------------------------------------------------

export async function addUser(email: string, name: string, image: string) {
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        image
      },
      create: {
        email,
        name,
        image,
        createdAt: new Date()
      }
    });

    return user;
  } catch (error) {
    console.error('Error in addUser action:', error);
    throw new Error('Failed to sync user data');
  }
}

export async function getUser(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    return user;
  } catch (error: any) {
    console.error('--- ❌ DATABASE ERROR:', error.message || error);
    return null;
  }
}

// CARD TOTALS --------------------------------------------------------------------

export async function getCardTotals(uid: string, month: number, year: number) {
  const totals = await prisma.transaction.groupBy({
    by: ['source'],
    where: {
      uid: uid,
      date: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1)
      }
    },
    _sum: {
      amount: true
    }
  });

  return totals; // Returns: [{ source: "My Card", _sum: { amount: 1200 } }, ...]
}

// SEEDS --------------------------------------------------------------------

export async function seedSection(
  uid: string,
  categoryName: string,
  items: { name: string; amount: number }[]
) {
  // 1. Ensure the Category exists
  const category = await prisma.category.upsert({
    where: {
      // Instead of name_uid, we target the fields explicitly
      name_uid: {
        name: categoryName,
        uid: uid
      }
    },
    update: {},
    create: {
      name: categoryName,
      uid: uid
    }
  });

  // 2. Seed the items
  for (const item of items) {
    for (let month = 1; month <= 12; month++) {
      await prisma.budgetItem.upsert({
        where: { id: `${uid}-${item.name}-${month}-2026` },
        update: {
          amount: item.amount,
          categoryId: category.id // Direct assignment
        },
        create: {
          id: `${uid}-${item.name}-${month}-2026`,
          name: item.name,
          amount: item.amount,
          month: month,
          year: 2026,
          uid: uid,
          categoryId: category.id // Direct assignment instead of { connect }
        }
      });
    }
  }
}
