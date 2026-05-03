'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TransactionInput, TransactionRuleWithSubcategory } from '@/lib/types';
import { getSubcategories } from './budget';

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

export async function addTransaction(data: {
  description: string;
  amount: number;
  date: Date;
  householdId: string;
  subcategoryId: string;
  source: string;
}) {
  try {
    await prisma.transaction.create({
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
  transactions: TransactionInput[],
  householdId: string
) {
  try {
    const dataToSave = transactions.map((tx) => ({
      description: tx.description,
      amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount,
      date: new Date(tx.date),
      householdId: householdId,
      source: tx.source || 'Unknown',
      subcategoryId: tx.subcategoryId || null
    }));

    await prisma.transaction.createMany({
      data: dataToSave
    });

    const updatedItems = await getSubcategories(householdId);

    revalidatePath('/planner');
    revalidatePath('/analytics');

    return { success: true, updatedItems };
  } catch (error) {
    console.error('--- ❌ Bulk Save Error:', error);
    return { success: false };
  }
}

export async function deleteTransaction(
  transactionId: string,
  householdId: string
) {
  try {
    await prisma.transaction.delete({
      where: {
        id: transactionId,
        householdId: householdId
      }
    });

    const updatedItems = await getSubcategories(householdId);
    revalidatePath('/planner');
    revalidatePath('/analytics');

    return { success: true, updatedItems };
  } catch (error) {
    console.error('--- ❌ Delete Transaction Error:', error);
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
      where: { id: id }
    });
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting rule:', error);
    return { success: false };
  }
}

export async function getTransactionRules(householdId: string): Promise<TransactionRuleWithSubcategory[]> {
  try {
    return await prisma.transactionRule.findMany({
      where: { householdId },
      include: {
        subcategory: {
          include: { category: true }
        }
      },
      orderBy: { pattern: 'asc' }
    }) as unknown as TransactionRuleWithSubcategory[];
  } catch (error) {
    console.error('❌ Error fetching rules:', error);
    return [];
  }
}

export async function getRecentTransactions(householdId: string) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { householdId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        subcategory: {
          include: { category: true }
        }
      }
    });
    return transactions;
  } catch (error) {
    console.error('❌ Error fetching recent transactions:', error);
    return [];
  }
}
