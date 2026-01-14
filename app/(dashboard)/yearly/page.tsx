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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight uppercase">
          2026 Yearly Overview
        </h1>
        <p className="text-muted-foreground text-sm lowercase">
          <span className="uppercase">A</span> full picture of your financial
          year.
        </p>
      </div>

      <YearlyTable
        categories={categories || []}
        initialSubcategories={allSubcategories || []}
      />
    </div>
  );
}
