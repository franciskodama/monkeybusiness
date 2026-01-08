'use server';

import { BudgetItem, color_enum } from '@prisma/client';
import prisma from './prisma';
import { randomUUID } from 'crypto';
import { v4 } from 'uuid';

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

export async function getCreditCardTotals(
  uid: string,
  month: number,
  year: number
) {
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

// export async function seedSection(
//   uid: string,
//   categoryName: string,
//   items: { name: string; amount: number }[]
// ) {
//   const category = await prisma.category.upsert({
//     where: {
//       name_householdId: {
//         name: categoryName,
//         householdId
//       }
//     },
//     update: {},
//     create: {
//       name: categoryName,
//       uid: uid
//     }
//   });

//   for (const item of items) {
//     for (let month = 1; month <= 12; month++) {
//       await prisma.budgetItem.upsert({
//         where: {
//           name_month_year_uid: {
//             name: item.name,
//             month: month,
//             year: 2026,
//             uid: uid
//           }
//         },
//         update: {
//           amount: item.amount,
//           categoryId: category.id
//         },
//         create: {
//           name: item.name,
//           amount: item.amount,
//           month: month,
//           year: 2026,
//           uid: uid,
//           categoryId: category.id
//         }
//       });
//     }
//   }
// }

// CATEGORY --------------------------------------------------------------------

export const getCategories = async (uid: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        uid
      }
    });
    return categories;
  } catch (error) {
    console.log(error);
    throw new Error('🚨 Failed to get Categories');
  }
};

export async function addCategory({
  uid,
  name,
  color
}: {
  uid: string;
  name: string;
  color: color_enum;
}) {
  try {
    await prisma.category.create({
      data: {
        householdId,
        id: randomUUID(),
        name,
        color
      }
    });
    return true;
  } catch (error) {
    console.log(error);
    throw new Error('🚨 Failed to add Category');
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: {
        id
      }
    });
    return true;
  } catch (error) {
    console.log(error);
    throw new Error('🚨 Failed to delete Category');
  }
}

// BUDGET ITEM --------------------------------------------------------------------

export const getBudgetItems = async (householdId: string) => {
  try {
    const budgetItems = await prisma.budgetItem.findMany({
      where: {
        householdId
      },
      include: {
        category: true
      }
    });
    return budgetItems;
  } catch (error) {
    return false;
  }
};

export async function addBudgetItem(formData: BudgetItem) {
  const { householdId, name, amount, month, year, categoryId } = formData;

  try {
    await prisma.budgetItem.create({
      data: {
        householdId,
        id: v4(),
        name,
        amount,
        month,
        year,
        categoryId
      }
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function deleteBudgetItem(id: string) {
  try {
    await prisma.budgetItem.delete({
      where: {
        id
      }
    });
    return true;
  } catch (error) {
    console.log(error);
    throw new Error('🚨 Failed to delete Budget Item');
  }
}
