'use server';

import { ColorEnum } from '@prisma/client';
import prisma from './prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { revalidatePath } from 'next/cache';

// AI --------------------------------------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function processStatementWithAI(
  base64File: string,
  householdId: string,
  budgetItemsForCurrentMonth: any[]
) {
  console.log('--- 🚀 Starting AI Process for Household:', householdId); // Server-side log

  // 🟢 TURN THIS TO TRUE TO BYPASS THE 429 ERROR
  const MOCK_MODE = true;

  if (MOCK_MODE) {
    console.log(
      '--- 🧪 MOCK MODE: Returning fake transactions from Scotiabank test'
    );
    // We simulate a 2-second delay so the UI "loading" state looks real
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      success: true,
      transactions: [
        {
          date: '2026-01-27',
          description: 'AMZN Mktp CA*ZG7NX7801',
          amount: 30.5,
          budgetItemId:
            budgetItemsForCurrentMonth.find((i) => i.name.includes('Amazon'))
              ?.id || null
        },
        {
          date: '2026-01-27',
          description: 'UBER CANADA UBERTRIP',
          amount: 15.7,
          budgetItemId:
            budgetItemsForCurrentMonth.find((i) => i.name.includes('Uber'))
              ?.id || null
        },
        {
          date: '2026-02-01',
          description: 'YSI*PROP PYMNT SVCFEE',
          amount: 42.78,
          budgetItemId: null
        },
        {
          date: '2026-02-01',
          description: 'YSI*InterRent REIT',
          amount: 2444.36,
          budgetItemId:
            budgetItemsForCurrentMonth.find((i) => i.name.includes('Rent'))
              ?.id || null
        },
        {
          date: '2026-02-10',
          description: 'SCOTIABANK PAYMENT',
          amount: -5883.32,
          budgetItemId: null
        }
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
  Act as a financial data expert. Extract ALL transactions from this bank statement.
  
  MATCHING RULES:
  - Match transactions to these IDs: ${budgetItemsForCurrentMonth.map((i: any) => `${i.name} (ID: ${i.id})`).join(', ')}
  - If a match is unclear, set "budgetItemId" to null.
  
  CRITICAL EXTRACTION RULES:
  1. **Multi-line Descriptions**: Some descriptions wrap across multiple lines (e.g., UBER CANADA on line 1, TORONTO ON on line 2). Combine these into a single clean description string.
  2. **Trailing Minus Signs**: If an amount ends with a minus sign (e.g., "5,883.32-"), this is a CREDIT or PAYMENT. Return it as a negative number (e.g., -5883.32).
  3. **Date Normalization**: Return all dates in "YYYY-MM-DD" format. Assume the year is 2026.
  4. **Clean Numbers**: Remove currency symbols ($) and commas from amounts.
  
  Return ONLY a JSON array: [{"date": "ISO string", "description": "string", "amount": number, "budgetItemId": "string or null"}]
`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64File,
          mimeType: 'application/pdf'
        }
      },
      { text: prompt }
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      console.error(
        '--- ⚠️ AI returned empty text. Possible safety filter block.'
      );
      return {
        success: false,
        error: 'AI could not read the content. Try a different file.'
      };
    }

    const cleanedJson = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return { success: true, transactions: JSON.parse(cleanedJson) };
  } catch (error: any) {
    console.error('--- ❌ Server Action Error:', error.message); // This will show in your terminal
    return {
      success: false,
      error:
        error.message || 'A server error occurred while processing the PDF.'
    };
  }
}

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

    // For now, we use our 'MONKEY_HOUSEHOLD_1' shortcut -
    // TODO: WE NEED TO CHANGE THAT IF OTHER PEOPLE JOIN

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

/**
 * Rewritten addBudgetItem to support:
 * 1. Single month creation
 * 2. Multi-month "recurring" creation (rest of year)
 * 3. Fresh data return for UI syncing
 */
export async function addBudgetItem(data: {
  name: string;
  amount: number;
  categoryId: string;
  householdId: string;
  month: number;
  year: number;
  applyToFuture: boolean;
}) {
  try {
    // 1. Prepare the data for creation
    if (data.applyToFuture) {
      // Create a series of items from the current selected month until December (12)
      const itemsToCreate = [];
      for (let m = data.month; m <= 12; m++) {
        itemsToCreate.push({
          name: data.name,
          amount: data.amount,
          categoryId: data.categoryId,
          householdId: data.householdId,
          month: m,
          year: data.year
        });
      }

      // Use createMany for high-performance batch insertion
      await prisma.budgetItem.createMany({
        data: itemsToCreate
      });
    } else {
      // Standard single-month creation
      await prisma.budgetItem.create({
        data: {
          name: data.name,
          amount: data.amount,
          categoryId: data.categoryId,
          householdId: data.householdId,
          month: data.month,
          year: data.year
        }
      });
    }

    // 2. Fetch the updated list of budget items for the specific month/year
    // This is what the UI (useEffect) is waiting for to refresh the table
    const _currentbudgetItems = await prisma.budgetItem.findMany({
      where: {
        householdId: data.householdId,
        month: data.month,
        year: data.year
      },
      include: {
        category: true // Include categories if your table uses them for colors/names
      },
      orderBy: {
        name: 'asc'
      }
    });

    // 3. Clear Next.js cache so other parts of the app also see the new data
    revalidatePath('/table');

    return {
      success: true,
      _currentbudgetItems
    };
  } catch (error) {
    console.error('--- ❌ Database Error adding budget item:', error);
    return {
      success: false,
      error: 'Failed to create budget item(s).'
    };
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

// TRANSACTIONS --------------------------------------------------------------------

export async function addTransaction(data: {
  description: string;
  amount: number;
  date: Date;
  householdId: string;
  budgetItemId: string;
}) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: data.date,
        householdId: data.householdId,
        budgetItemId: data.budgetItemId,
        source: 'Manual'
      }
    });

    const updatedItems = await getBudgetItems(data.householdId);
    return { success: true, updatedItems };
  } catch (error) {
    console.error('Transaction Error:', error);
    return { success: false };
  }
}

export async function bulkAddTransactions(
  transactions: any[],
  householdId: string
) {
  try {
    // 1. Prepare the data for Prisma
    const dataToSave = transactions.map((tx) => ({
      description: tx.description,
      amount: parseFloat(tx.amount),
      // AI sometimes gives weird date formats, we ensure it's a valid Date object
      date: new Date(tx.date),
      householdId: householdId,
      source: 'AI Import',
      // This is the ID from your dropdown/AI match
      budgetItemId: tx.budgetItemId || null
    }));

    // 2. Efficiently create all transactions at once
    await prisma.transaction.createMany({
      data: dataToSave
    });

    // 3. Fetch fresh budget items so the table updates instantly
    const updatedItems = await getBudgetItems(householdId);

    return {
      success: true,
      updatedItems // Return these so the UI reflects the new "Actual" totals
    };
  } catch (error) {
    console.error('--- ❌ Bulk Save Error:', error);
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
