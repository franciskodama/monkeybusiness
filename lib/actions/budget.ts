'use server';

import prisma from '@/lib/prisma';
import { ColorEnum } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { BudgetTemplateCategory } from '@/lib/types';

export const getCategories = async (householdId: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: { householdId },
      orderBy: { order: 'asc' }
    });
    return categories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
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
    return newCategory;
  } catch (error: unknown) {
    console.error('--- ❌ Error adding category:', error);
    return null;
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error('--- ❌ Failed to delete Category:', error);
    throw new Error('Failed to delete Category');
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
    revalidatePath('/analytics');
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
    revalidatePath('/analytics');
    return { success: true };
  } catch (error) {
    console.error('❌ Error reordering categories:', error);
    return { success: false };
  }
}

export const getSubcategories = async (householdId: string, year?: number) => {
  const targetYear = year || new Date().getFullYear();
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: {
        householdId,
        year: targetYear
      },
      include: {
        category: true,
        transactions: true
      },
      orderBy: { name: 'asc' }
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
    for (let m = 1; m <= 12; m++) {
      const isTarget = m === data.month || (m > data.month && data.applyToFuture);
      const targetAmount = isTarget ? data.amount : 0;

      await prisma.subcategory.upsert({
        where: {
          subcategory_unique_auth: {
            name: data.name,
            month: m,
            year: data.year,
            householdId: data.householdId,
            categoryId: data.categoryId
          }
        },
        update: isTarget ? { amount: targetAmount } : {},
        create: {
          name: data.name,
          amount: targetAmount,
          categoryId: data.categoryId,
          householdId: data.householdId,
          month: m,
          year: data.year
        }
      });
    }

    const _currentSubcategories = await prisma.subcategory.findMany({
      where: { householdId: data.householdId, year: data.year },
      include: { category: true, transactions: true },
      orderBy: { name: 'asc' }
    });

    revalidatePath('/planner');
    revalidatePath('/analytics');
    return { success: true, _currentSubcategories };
  } catch (error: unknown) {
    console.error('--- ❌ Database Error:', error);
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
          month: { gte: currentItem.month },
          categoryId: currentItem.categoryId
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
    console.error('Failed to update subcategory:', error);
    return { success: false };
  }
}

export async function renameSubcategory(data: {
  householdId: string;
  oldName: string;
  newName: string;
  year: number;
  categoryId?: string;
}) {
  try {
    const itemToRename = await prisma.subcategory.findFirst({
      where: {
        name: data.oldName,
        householdId: data.householdId,
        year: data.year,
        ...(data.categoryId && { categoryId: data.categoryId })
      }
    });

    if (!itemToRename) return { success: false };

    await prisma.subcategory.updateMany({
      where: {
        name: data.oldName,
        householdId: data.householdId,
        year: data.year,
        categoryId: itemToRename.categoryId
      },
      data: { name: data.newName }
    });
    revalidatePath('/planner');
    revalidatePath('/analytics');
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
      await prisma.subcategory.deleteMany({
        where: {
          name: item.name,
          householdId,
          year: item.year,
          month: { gte: item.month },
          categoryId: item.categoryId
        }
      });
    } else if (mode === 'ALL') {
      await prisma.subcategory.deleteMany({
        where: {
          name: item.name,
          householdId,
          year: item.year,
          categoryId: item.categoryId
        }
      });
    }
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting subcategory:', error);
    return { success: false };
  }
}

export async function seedHouseholdBudget(
  householdId: string,
  template: BudgetTemplateCategory[],
  year?: number
) {
  try {
    const targetYear = year || new Date().getFullYear();
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
          year: targetYear,
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
    console.error('❌ Seeding Error:', error);
    return { success: false };
  }
}

export async function getCurrenciesFromApi() {
  try {
    const apiKey = process.env.FREECURRENCYAPI_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=BRL,CAD`
    );
    return await response.json();
  } catch (error) {
    console.error('❌ Failed to fetch currencies:', error);
    return null;
  }
}
