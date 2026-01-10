'use server';

import { ColorEnum } from '@prisma/client';
import prisma from './prisma';

// USER --------------------------------------------------------------------

export async function addUser(user: {
  uid: string;
  email: string;
  name: string;
  image: string;
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { uid: user.uid },
      include: { household: true }
    });

    if (existingUser) return existingUser;

    // For now, we use our 'MONKEY_HOUSEHOLD_1' shortcut
    const household = await prisma.household.upsert({
      where: { id: 'MONKEY_HOUSEHOLD_1' },
      update: {},
      create: {
        id: 'MONKEY_HOUSEHOLD_1',
        name: 'Kodama Family Household'
      }
    });

    const newUser = await prisma.user.create({
      data: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        image: user.image,
        householdId: household.id
      }
    });

    return newUser;
  } catch (error) {
    console.error('Error in addUser:', error);
    return null;
  }
}

export async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      },
      select: {
        uid: true,
        email: true,
        name: true,
        image: true,
        householdId: true
      }
    });

    return user;
  } catch (error) {
    console.error('--- ❌ Error fetching user:', error);
    return null;
  }
}

// CARD TOTALS --------------------------------------------------------------------

export async function getCreditCardTotals(
  householdId: string,
  month: number,
  year: number
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const totals = await prisma.transaction.groupBy({
    by: ['source'],
    where: {
      householdId: householdId,
      date: {
        gte: startDate,
        lt: endDate
      }
    },
    _sum: {
      amount: true
    }
  });

  return totals.map((item) => ({
    source: item.source,
    total: item._sum.amount || 0
  }));
}

// CATEGORY --------------------------------------------------------------------

export const getCategories = async (householdId: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        householdId
      }
    });
    return categories;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export async function addCategory({
  householdId,
  name,
  color
}: {
  householdId: string;
  name: string;
  color: ColorEnum;
}) {
  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        color,
        householdId
      }
    });

    console.log('--- ✅ Category Created:', newCategory.name);
    return newCategory;
  } catch (error: any) {
    console.error('--- ❌ PRISMA ERROR DETAILS:', error.message);

    if (error.code === 'P2003') {
      console.error(
        '--- ❌ ERROR: The householdId does not exist in the User table.'
      );
    }
    return null;
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
    throw new Error('--- ❌ Failed to delete Category');
  }
}

// BUDGET ITEM --------------------------------------------------------------------

export const getBudgetItems = async (householdId: string) => {
  try {
    const budgetItems = await prisma.budgetItem.findMany({
      where: { householdId },
      include: { category: true, transactions: true }
    });
    return budgetItems || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export async function addBudgetItem({
  householdId,
  name,
  categoryId,
  amount
}: {
  householdId: string;
  name: string;
  categoryId: string;
  amount: number;
}) {
  try {
    const year = 2026;
    const items = [];
    for (let month = 1; month <= 12; month++) {
      items.push({
        name,
        amount,
        month,
        year,
        householdId,
        categoryId
      });
    }
    await prisma.budgetItem.createMany({
      data: items
    });

    const updatedItems = await getBudgetItems(householdId);
    return { success: true, updatedItems };
  } catch (error) {
    console.error('Error creating budget items:', error);
    return null;
  }
}

export async function updateBudgetItemAmount(
  id: string,
  amount: number,
  updateFutureMonths: boolean = false
) {
  try {
    const currentItem = await prisma.budgetItem.findUnique({ where: { id } });
    if (!currentItem) return { success: false };

    if (updateFutureMonths) {
      await prisma.budgetItem.updateMany({
        where: {
          name: currentItem.name,
          householdId: currentItem.householdId,
          year: currentItem.year,
          month: { gte: currentItem.month }
        },
        data: { amount }
      });
    } else {
      await prisma.budgetItem.update({
        where: { id },
        data: { amount }
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to update:', error);
    return { success: false };
  }
}

export async function deleteBudgetItem(
  id: string,
  householdId: string,
  mode: 'SINGLE' | 'FUTURE' | 'ALL'
) {
  try {
    const item = await prisma.budgetItem.findUnique({ where: { id } });
    if (!item) return { success: false };

    if (mode === 'SINGLE') {
      await prisma.budgetItem.delete({ where: { id, householdId } });
    } else if (mode === 'FUTURE') {
      // Delete from CURRENT month to 12
      await prisma.budgetItem.deleteMany({
        where: {
          name: item.name,
          householdId,
          year: item.year,
          month: { gte: item.month }
        }
      });
    } else if (mode === 'ALL') {
      // Delete months 1 through 12
      await prisma.budgetItem.deleteMany({
        where: { name: item.name, householdId, year: item.year }
      });
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
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
