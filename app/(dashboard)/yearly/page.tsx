import { getUser } from '@/lib/actions/auth';
import { getCategories, getSubcategories } from '@/lib/actions/budget';
import { auth } from '@/lib/auth';
import { YearlyTable } from './yearly-table';

export default async function YearlyPage() {
  const session = await auth();
  const user = await getUser(session?.user?.email || '');
  const householdId = user?.householdId || '';

  const categories = await getCategories(householdId);
  const allSubcategories = await getSubcategories(householdId);

  const householdUsers = user?.household?.users || [];
  const p1Name =
    user?.household?.person1Name ||
    householdUsers[0]?.name?.split(' ')[0] ||
    'Partner 1';
  const p2Name =
    user?.household?.person2Name ||
    householdUsers[1]?.name?.split(' ')[0] ||
    'Partner 2';

  return (
    <YearlyTable
      categories={categories || []}
      initialSubcategories={allSubcategories || []}
      person1Name={p1Name}
      person2Name={p2Name}
    />
  );
}
