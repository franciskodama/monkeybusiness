import { auth } from '@/lib/auth';

import { BudgetItem, Category } from '@prisma/client';
import { addUser, getBudgetItems, getCategories, getUser } from '@/lib/actions';
import Table from './table';

export default async function TablePage() {
  const session = await auth();
  const user = await getUser(session?.user?.email ?? '');
  const householdId = user?.householdId;

  let categories: Category[] = [];
  let budgetItems: BudgetItem[] = [];

  const fetchedCategories = await getCategories(householdId ?? '');
  if (Array.isArray(fetchedCategories)) {
    categories = fetchedCategories;
  }

  const fetchedBudgetItems = await getBudgetItems(householdId ?? '');
  if (Array.isArray(fetchedBudgetItems)) {
    budgetItems = fetchedBudgetItems;
  }
  return (
    <Table
      user={user}
      householdId={householdId ?? ''}
      categories={categories}
      budgetItems={budgetItems}
    />
  );
}
