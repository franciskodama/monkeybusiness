import { auth } from '@/lib/auth';

import { getBudgetItems, getCategories, getUser } from '@/lib/actions';
import Table from './table';
import { Spinner } from '@/lib/icons';

export default async function TablePage() {
  const session = await auth();
  const user = await getUser(session?.user?.email ?? '');
  const householdId = user?.householdId;

  if (!householdId) {
    return <div>Please contact support to set up your household.</div>;
  }

  const categories = await getCategories(householdId);
  const budgetItems = await getBudgetItems(householdId);

  return (
    <>
      {user.householdId && categories && budgetItems ? (
        <Table
          user={user}
          householdId={householdId}
          categories={categories}
          budgetItems={budgetItems}
        />
      ) : (
        <Spinner />
      )}
    </>
  );
}
