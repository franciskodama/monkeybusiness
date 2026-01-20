'use server';

import { ColorEnum } from '@prisma/client';
import prisma from './prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { revalidatePath } from 'next/cache';
import { auth } from './auth';
import { resend } from './resend';

// AI --------------------------------------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- actions.tsx ---

export async function matchTransactionsWithRules(
  txList: any[],
  householdId: string
) {
  const [savedRules, allSubcategories] = await Promise.all([
    getTransactionRules(householdId),
    prisma.subcategory.findMany({
      where: { householdId, year: 2026 },
      include: { category: true }
    })
  ]);

  return txList.map((tx) => {
    // 1. Identify the target month safely (handle YYYY-MM-DD strings without TZ shifts)
    let currentId = tx.subcategoryId || null;
    const dateParts = tx.date.split('-');
    const txMonth = parseInt(dateParts[1], 10);
    const txYear = parseInt(dateParts[0], 10);

    // 2. Check for "Smart Rules" match (highest priority)
    const foundRule = savedRules.find((rule) =>
      tx.description.toUpperCase().includes(rule.pattern.toUpperCase())
    );

    if (foundRule) {
      const targetSub = allSubcategories.find(
        (s) => s.name === foundRule.subcategory.name && s.month === txMonth
      );
      if (targetSub) return { ...tx, subcategoryId: targetSub.id };
    }

    // 3. If there's an existing ID (from AI or manual input), pivot it to the current month to ensure it shows up in the dropdown
    if (currentId) {
      const aiPickedSub = allSubcategories.find((s) => s.id === currentId);
      if (aiPickedSub) {
        const targetSub = allSubcategories.find(
          (s) => s.name === aiPickedSub.name && s.month === txMonth
        );
        if (targetSub) return { ...tx, subcategoryId: targetSub.id };
      }
    }

    return { ...tx, subcategoryId: currentId };
  });
}

export async function processStatementWithAI(
  base64File: string,
  householdId: string,
  subcategoriesForCurrentMonth: any[]
) {
  // 🟢 MOCK MODE
  const MOCK_MODE = false; // Turn off mock for real testing if needed, though prompt is below

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
      transactions: await matchTransactionsWithRules(
        mockTransactions,
        householdId
      )
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const allSubcategories = await prisma.subcategory.findMany({
      where: { householdId, year: 2026 }
    });

    const uniqueNames = Array.from(
      new Set(allSubcategories.map((s) => s.name))
    );

    const prompt = `
      Act as a financial data expert. Extract ALL transactions from this bank statement.
      
      MATCHING RULES:
      - Match transactions to these categories: ${uniqueNames.join(', ')}
      - If you find a match, you MUST return the ID for that category from this list:
        ${allSubcategories
          .filter((s) => s.month === new Date().getMonth() + 1)
          .map((s) => `${s.name} (ID: ${s.id})`)
          .join(', ')}
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
    const processedTransactions = await matchTransactionsWithRules(
      aiTransactions,
      householdId
    );

    return {
      success: true,
      transactions: processedTransactions
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
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ uid: user.uid }, { email: user.email }]
      },
      include: { household: true }
    });

    if (existingUser) return existingUser;

    // Create a new unique household for every new user
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const household = await prisma.household.create({
      data: {
        name: `${user.name.split(' ')[0]}'s Household`,
        inviteCode: inviteCode
      }
    });

    try {
      const newUser = await prisma.user.create({
        data: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          image: user.image,
          householdId: household.id
        },
        include: {
          household: true
        }
      });
      return newUser;
    } catch (err: any) {
      // Handle race condition: if user was created by another simultaneous request
      if (err.code === 'P2002') {
        return await prisma.user.findUnique({
          where: { uid: user.uid },
          include: { household: true }
        });
      }
      throw err;
    }
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
        householdId: true,
        household: {
          include: {
            users: true
          }
        }
      }
    });

    if (user?.household && !user.household.inviteCode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const updatedHousehold = await prisma.household.update({
        where: { id: user.householdId! },
        data: { inviteCode: code },
        include: { users: true }
      });
      user.household = updatedHousehold;
    }

    return user;
  } catch (error) {
    console.error('--- ❌ Error fetching user:', error);
    return null;
  }
}

export async function joinHousehold(inviteCode: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'Unauthorized' };

    const household = await prisma.household.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() }
    });

    if (!household) {
      return { success: false, error: 'Invite code not found' };
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { householdId: household.id }
    });

    revalidatePath('/settings');
    revalidatePath('/in');
    revalidatePath('/planner');

    return { success: true };
  } catch (error) {
    console.error('❌ Error joining household:', error);
    return { success: false, error: 'Failed to join' };
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
      },
      orderBy: {
        order: 'asc'
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
  color,
  isIncome = false,
  isSavings = false,
  isFixed = false
}: {
  householdId: string;
  name: string;
  color: ColorEnum;
  isIncome?: boolean;
  isSavings?: boolean;
  isFixed?: boolean;
}) {
  try {
    const count = await prisma.category.count({ where: { householdId } });
    const newCategory = await prisma.category.create({
      data: {
        name,
        color,
        isIncome,
        isSavings,
        isFixed,
        householdId,
        order: count
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

export async function updateCategory(data: {
  id: string;
  name: string;
  color: ColorEnum;
  isIncome: boolean;
  isSavings: boolean;
  isFixed: boolean;
}) {
  try {
    const updated = await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        color: data.color,
        isIncome: data.isIncome,
        isSavings: data.isSavings,
        isFixed: data.isFixed
      }
    });
    revalidatePath('/planner');
    return { success: true, category: updated };
  } catch (error) {
    console.error('❌ Error updating category:', error);
    return { success: false };
  }
}

export async function reorderCategories(orderedIds: string[]) {
  try {
    const updates = orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { order: index }
      })
    );
    await prisma.$transaction(updates);
    revalidatePath('/planner');
    return { success: true };
  } catch (error) {
    console.error('❌ Error reordering categories:', error);
    return { success: false };
  }
}

// SUBCATEGORY --------------------------------------------------------------------

export const getSubcategories = async (householdId: string) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: {
        householdId,
        year: 2026 // Ensure we get the full year's budget items
      },
      include: {
        category: true,
        transactions: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return subcategories;
  } catch (error) {
    console.error('❌ Prisma Fetch Error:', error);
    return [];
  }
};

export const getRecentSubcategories = async (householdId: string) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;

  return await prisma.subcategory.findMany({
    where: {
      householdId,
      // Fetch both months to cover statement overlaps
      month: { in: [currentMonth, lastMonth] }
    },
    include: { category: true }
  });
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

    revalidatePath('/planner');
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

export async function renameSubcategory(data: {
  householdId: string;
  oldName: string;
  newName: string;
  year: number;
}) {
  try {
    await prisma.subcategory.updateMany({
      where: {
        name: data.oldName,
        householdId: data.householdId,
        year: data.year
      },
      data: {
        name: data.newName
      }
    });
    revalidatePath('/planner');
    return { success: true };
  } catch (error) {
    console.error('❌ Error renaming subcategory:', error);
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
  source: string;
}) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: data.date,
        householdId: data.householdId,
        subcategoryId: data.subcategoryId,
        source: data.source
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
      source: tx.source,
      // This is the ID from your dropdown/AI match
      subcategoryId: tx.subcategoryId || null
    }));

    // 2. Efficiently create all transactions at once
    await prisma.transaction.createMany({
      data: dataToSave
    });

    // 3. Fetch fresh budget items so the table updates instantly
    const updatedItems = await getSubcategories(householdId);

    revalidatePath('/planner');

    return {
      success: true,
      updatedItems // Return these so the UI reflects the new "Actual" totals
    };
  } catch (error) {
    console.error('--- ❌ Bulk Save Error:', error);
    return { success: false };
  }
}

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

export async function deleteTransactionRule(id: string) {
  try {
    await prisma.transactionRule.delete({
      where: {
        id: id
      } as any
    });

    revalidatePath('/settings');

    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting rule:', error);
    return { success: false };
  }
}

/**
 * Fetches all rules for a household to be used during the import process.
 */
export async function getTransactionRules(householdId: string) {
  try {
    return await prisma.transactionRule.findMany({
      where: { householdId },
      include: {
        subcategory: {
          include: {
            category: true // Fetches the parent category name
          }
        }
      },
      orderBy: {
        pattern: 'asc' // Keeps your list sharp and alphabetical
      }
    });
  } catch (error) {
    console.error('❌ Error fetching rules:', error);
    return [];
  }
}

// SEEDING --------------------------------------------------------------------

export async function seedHouseholdBudget(
  householdId: string,
  template: any[]
) {
  try {
    for (const cat of template) {
      const category = await prisma.category.upsert({
        where: {
          name_householdId: {
            name: cat.name,
            householdId: householdId
          }
        },
        update: {
          color: cat.color || 'BLUE',
          isIncome: cat.isIncome || false,
          isSavings: cat.isSavings || false,
          isFixed: cat.isFixed || false,
          order: cat.order || 0
        },
        create: {
          name: cat.name,
          color: cat.color || 'BLUE',
          isIncome: cat.isIncome || false,
          isSavings: cat.isSavings || false,
          isFixed: cat.isFixed || false,
          order: cat.order || 0,
          householdId
        }
      });

      for (const sub of cat.subcategories) {
        const batchData = Array.from({ length: 12 }, (_, i) => ({
          name: sub.name,
          amount: sub.amount,
          month: i + 1,
          year: 2026,
          categoryId: category.id,
          householdId
        }));

        await prisma.subcategory.createMany({
          data: batchData,
          skipDuplicates: true
        });
      }
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

// REMINDERS --------------------------------------------------------------------

export async function getReminders(householdId: string) {
  try {
    return await prisma.reminder.findMany({
      where: { householdId, isDone: false },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('❌ Error fetching reminders:', error);
    return [];
  }
}

export async function addReminder(data: {
  text: string;
  targetUserId: string;
  creatorId: string;
  householdId: string;
}) {
  try {
    const reminder = await prisma.reminder.create({
      data: {
        text: data.text,
        targetUserId: data.targetUserId,
        creatorId: data.creatorId,
        householdId: data.householdId
      }
    });

    // Notify Target User via Email
    const targetUser = await prisma.user.findUnique({
      where: { uid: data.targetUserId }
    });

    if (targetUser?.name) {
      const targetLabel = targetUser.name.split(' ')[0].toUpperCase();
      const logoUrl =
        'https://monkeybusiness-olive.vercel.app/logo/logo-monkeybusiness-150x124-shaved.png';

      await resend.emails.send({
        from: 'Monkey Business <onboarding@resend.dev>',
        to: process.env.RESEND_EMAIL_SERVER!,
        subject: `[MONKEY BUSINESS: ${targetLabel}] New Signal Received 📡`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; color: #0f172a;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="Monkey Business" width="80" />
            </div>
            
            <h1 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; text-align: center;">
              Incoming Signal 📡
            </h1>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 30px; margin-bottom: 30px;">
              <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 10px; margin-top: 0;">
                Message for ${targetUser.name.split(' ')[0]}
              </p>
              <p style="font-size: 20px; font-weight: 600; line-height: 1.4; margin: 0; color: #0f172a;">
                "${data.text}"
              </p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
              A new reminder has been added to your household dashboard. <br/>
              Let's keep the engine running smoothly!
            </p>
            
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://monkeybusiness-olive.vercel.app/in" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">
                Open Dashboard
              </a>
            </div>
            
            <div style="margin-top: 60px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center;">
              <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">
                Monkey Business • Synergy Intelligence
              </p>
            </div>
          </div>
        `
      });
    }

    revalidatePath('/in');
    return { success: true, reminder };
  } catch (error) {
    console.error('❌ Error adding reminder:', error);
    return { success: false };
  }
}

export async function deleteReminder(id: string) {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id }
    });

    if (!reminder) return { success: false };

    // Before deleting, notify the creator that it's DONE
    const creatorUser = await prisma.user.findUnique({
      where: { uid: reminder.creatorId }
    });

    if (creatorUser?.name) {
      // Get the name of the person who finished it
      const session = await auth();
      const finisherName = session?.user?.name || 'Someone';
      const creatorLabel = creatorUser.name.split(' ')[0].toUpperCase();
      const logoUrl =
        'https://monkeybusiness-olive.vercel.app/logo/logo-monkeybusiness-150x124-shaved.png';

      await resend.emails.send({
        from: 'Monkey Business <onboarding@resend.dev>',
        to: process.env.RESEND_EMAIL_SERVER!,
        subject: `[MONKEY BUSINESS: ${creatorLabel}] Mission Accomplished! ✅`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; color: #0f172a;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="Monkey Business" width="80" />
            </div>
            
            <h1 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; text-align: center; color: #10b981;">
              Task Completed ✅
            </h1>
            
            <div style="text-align: center; padding: 30px; border: 1px dashed #cbd5e1; margin-bottom: 30px;">
               <p style="font-size: 14px; color: #475569; margin-bottom: 10px;">
                Good news, <strong>${creatorUser.name.split(' ')[0]}</strong>!
              </p>
              <p style="font-size: 18px; font-weight: 600; line-height: 1.4; margin: 0; color: #0f172a;">
                <strong>${finisherName}</strong> has finished the task:
              </p>
              <p style="font-size: 18px; font-weight: 400; font-style: italic; color: #10b981; margin-top: 10px;">
                "${reminder.text}"
              </p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
              Your household just got a little lighter. <br/>
              Everything is in sync! 🚀
            </p>
            
            <div style="margin-top: 60px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center;">
              <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">
                Monkey Business • Synergy Intelligence
              </p>
            </div>
          </div>
        `
      });
    }

    await prisma.reminder.delete({
      where: { id }
    });

    revalidatePath('/in');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting reminder:', error);
    return { success: false };
  }
}
