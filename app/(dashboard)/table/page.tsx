import { auth } from '@/lib/auth';

import { BudgetItem, Category } from '@prisma/client';
import { getCategories } from '@/lib/actions';
import Table from './table';

export default async function TablePage() {
  const session = await auth();
  const uid = session?.user?.email;

  let categories: Category[] = [];
  let shortcuts: BudgetItem[] = [];

  const fetchedCategories = await getCategories(householdId);
  if (Array.isArray(fetchedCategories)) {
    categories = fetchedCategories;
  }

  const fetchedBudgetItems = await getBudgetItems(householdId);
  if (Array.isArray(fetchedBudgetItems)) {
    budgetItems = fetchedBudgetItems;
  }
  return (
    <Table
      uid={uid}
      householdId={householdId}
      categories={categories}
      budgetItems={budgetItems}
    />
  );
}
