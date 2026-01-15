'use server';

import { ColorEnum } from '@prisma/client';
import prisma from './prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { revalidatePath } from 'next/cache';

// AI --------------------------------------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- actions.tsx ---

export async function processStatementWithAI(
  base64File: string,
  householdId: string,
  subcategoriesForCurrentMonth: any[]
) {
  console.log('--- 🚀 Starting AI Process for Household:', householdId);

  // 1. Fetch your "Smart Rules" from the database
  const savedRules = await getTransactionRules(householdId);

  // Helper function to apply rules to a transaction list
  const applySmartRules = (txList: any[]) => {
    return txList.map((tx) => {
      // If AI already found a match, we keep it, otherwise check our patterns
      if (tx.subcategoryId) return tx;

      const foundRule = savedRules.find((rule) =>
        tx.description.toUpperCase().includes(rule.pattern.toUpperCase())
      );

      return {
        ...tx,
        subcategoryId: foundRule?.subcategoryId || null
      };
    });
  };

  // 🟢 MOCK MODE
  const MOCK_MODE = true;

  if (MOCK_MODE) {
    console.log('--- 🧪 MOCK MODE: Applying Smart Rules to fake data');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockTransactions = [
      {
        date: '2026-01-27',
        description: 'AMZN Mktp CA*ZG7NX7801',
        amount: 30.5,
        subcategoryId: null // Let the Smart Rule handle this
      },
      {
        date: '2026-01-27',
        description: 'UBER CANADA UBERTRIP',
        amount: 15.7,
        subcategoryId: null // Let the Smart Rule handle this
      },
      {
        date: '2026-02-01',
        description: 'YSI*PROP PYMNT SVCFEE',
        amount: 42.78,
        subcategoryId: null
      },
      {
        date: '2026-02-01',
        description: 'YSI*InterRent REIT',
        amount: 2444.36,
        subcategoryId:
          subcategoriesForCurrentMonth.find((i) => i.name.includes('Rent'))
            ?.id || null
      },
      {
        date: '2026-02-10',
        description: 'SCOTIABANK PAYMENT',
        amount: -5883.32,
        subcategoryId: null
      }
    ];

    return {
      success: true,
      transactions: applySmartRules(mockTransactions)
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Act as a financial data expert. Extract ALL transactions from this bank statement.
      
      MATCHING RULES:
      - Match transactions to these IDs: ${subcategoriesForCurrentMonth.map((i: any) => `${i.name} (ID: ${i.id})`).join(', ')}
      - If a match is unclear, set "subcategoryId" to null.
      
      CRITICAL EXTRACTION RULES:
      1. **Multi-line Descriptions**: Combine wrapped descriptions into one string.
      2. **Trailing Minus Signs**: Return as negative numbers (e.g., -5883.32).
      3. **Date Normalization**: "YYYY-MM-DD".
      4. **Clean Numbers**: Remove symbols and commas.
      
      Return ONLY a JSON array: [{"date": "ISO string", "description": "string", "amount": number, "subcategoryId": "string or null"}]
    `;

    const result = await model.generateContent([
      { inlineData: { data: base64File, mimeType: 'application/pdf' } },
      { text: prompt }
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      return { success: false, error: 'AI could not read the content.' };
    }

    const cleanedJson = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const aiTransactions = JSON.parse(cleanedJson);

    // Apply Smart Rules to AI results before returning
    return {
      success: true,
      transactions: applySmartRules(aiTransactions)
    };
  } catch (error: any) {
    console.error('--- ❌ Server Action Error:', error.message);
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

// SUBCATEGORY --------------------------------------------------------------------

export const getSubcategories = async (householdId: string) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: { householdId },
      include: { category: true, transactions: true }
    });
    return subcategories || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export async function addSubcategory(data: {
  name: string;
  amount: number;
  categoryId: string;
  householdId: string;
  month: number;
  year: number;
  applyToFuture: boolean;
}) {
  try {
    if (data.applyToFuture) {
      // Loop through each month until December
      for (let m = data.month; m <= 12; m++) {
        // Use 'upsert' to create if new, or update amount if it already exists
        await prisma.subcategory.upsert({
          where: {
            name_month_year_householdId: {
              // This matches your unique constraint
              name: data.name,
              month: m,
              year: data.year,
              householdId: data.householdId
            }
          },
          update: {
            amount: data.amount // Update the amount if it's already there
          },
          create: {
            name: data.name,
            amount: data.amount,
            categoryId: data.categoryId,
            householdId: data.householdId,
            month: m,
            year: data.year
          }
        });
      }
    } else {
      // Single month safe creation
      await prisma.subcategory.upsert({
        where: {
          name_month_year_householdId: {
            name: data.name,
            month: data.month,
            year: data.year,
            householdId: data.householdId
          }
        },
        update: { amount: data.amount },
        create: {
          name: data.name,
          amount: data.amount,
          categoryId: data.categoryId,
          householdId: data.householdId,
          month: data.month,
          year: data.year
        }
      });
    }

    // Fetch the full year's data to sync the UI
    const _currentSubcategories = await prisma.subcategory.findMany({
      where: {
        householdId: data.householdId,
        year: data.year
      },
      include: {
        category: true,
        transactions: true
      },
      orderBy: { name: 'asc' }
    });

    revalidatePath('/table');
    return { success: true, _currentSubcategories };
  } catch (error: any) {
    console.error('--- ❌ Database Error:', error.message);
    return {
      success: false,
      error: 'Database error. Check for duplicate names.'
    };
  }
}

export async function updateSubcategoryAmount(
  id: string,
  amount: number,
  updateFutureMonths: boolean = false
) {
  try {
    const currentItem = await prisma.subcategory.findUnique({ where: { id } });
    if (!currentItem) return { success: false };

    if (updateFutureMonths) {
      await prisma.subcategory.updateMany({
        where: {
          name: currentItem.name,
          householdId: currentItem.householdId,
          year: currentItem.year,
          month: { gte: currentItem.month }
        },
        data: { amount }
      });
    } else {
      await prisma.subcategory.update({
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

export async function deleteSubcategory(
  id: string,
  householdId: string,
  mode: 'SINGLE' | 'FUTURE' | 'ALL'
) {
  try {
    const item = await prisma.subcategory.findUnique({ where: { id } });
    if (!item) return { success: false };

    if (mode === 'SINGLE') {
      await prisma.subcategory.delete({ where: { id, householdId } });
    } else if (mode === 'FUTURE') {
      // Delete from CURRENT month to 12
      await prisma.subcategory.deleteMany({
        where: {
          name: item.name,
          householdId,
          year: item.year,
          month: { gte: item.month }
        }
      });
    } else if (mode === 'ALL') {
      // Delete months 1 through 12
      await prisma.subcategory.deleteMany({
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
  subcategoryId: string;
}) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: data.date,
        householdId: data.householdId,
        subcategoryId: data.subcategoryId,
        source: 'Manual'
      }
    });

    const updatedItems = await getSubcategories(data.householdId);
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
      subcategoryId: tx.subcategoryId || null
    }));

    // 2. Efficiently create all transactions at once
    await prisma.transaction.createMany({
      data: dataToSave
    });

    // 3. Fetch fresh budget items so the table updates instantly
    const updatedItems = await getSubcategories(householdId);

    return {
      success: true,
      updatedItems // Return these so the UI reflects the new "Actual" totals
    };
  } catch (error) {
    console.error('--- ❌ Bulk Save Error:', error);
    return { success: false };
  }
}

/**
 * Saves a new matching rule.
 * Pattern is sanitized to uppercase to make matching case-insensitive.
 */
export async function addTransactionRule(data: {
  pattern: string;
  subcategoryId: string;
  householdId: string;
}) {
  try {
    const rule = await prisma.transactionRule.upsert({
      where: {
        pattern_householdId: {
          pattern: data.pattern.toUpperCase(),
          householdId: data.householdId
        }
      },
      update: {
        subcategoryId: data.subcategoryId
      },
      create: {
        pattern: data.pattern.toUpperCase(),
        subcategoryId: data.subcategoryId,
        householdId: data.householdId
      }
    });
    return { success: true, rule };
  } catch (error) {
    console.error('❌ Error adding transaction rule:', error);
    return { success: false };
  }
}

/**
 * Fetches all rules for a household to be used during the import process.
 */
export async function getTransactionRules(householdId: string) {
  try {
    return await prisma.transactionRule.findMany({
      where: { householdId }
    });
  } catch (error) {
    console.error('❌ Error fetching rules:', error);
    return [];
  }
}

export async function deleteTransactionRule(id: string) {
  try {
    await prisma.transactionRule.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
