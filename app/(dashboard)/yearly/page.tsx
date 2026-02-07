import { getCategories, getSubcategories, getUser } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { YearlyTable } from './yearly-table';

export default async function YearlyPage() {
  const session = await auth();
  const user = await getUser(session?.user?.email!);
  const householdId = user?.householdId!;

  const categories = await getCategories(householdId);
  const allSubcategories = await getSubcategories(householdId);

  return (
    <YearlyTable
      categories={categories || []}
      initialSubcategories={allSubcategories || []}
    />
  );
}
