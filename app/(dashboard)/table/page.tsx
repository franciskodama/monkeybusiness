import { auth } from '@/lib/auth';

import { getCategories, getSubcategories, getUser } from '@/lib/actions';
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
  const subcategories = await getSubcategories(householdId);

  return (
    <>
      {user.householdId && categories && subcategories ? (
        <Table
          user={user}
          householdId={householdId}
          categories={categories}
          subcategories={subcategories}
        />
      ) : (
        <Spinner />
      )}
    </>
  );
}
