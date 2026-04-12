import { auth } from '@/lib/auth';

import {
  getCategories,
  getSubcategories,
  getCurrenciesFromApi
} from '@/lib/actions/budget';
import { getUser } from '@/lib/actions/auth';
import Planner from './planner';
import { Spinner } from '@/lib/icons';
import { getRecentTransactions } from '@/lib/actions/transactions';

export default async function PlannerPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();
  const year = parseInt(searchParams.year?.toString() || currentYear.toString(), 10);
  const session = await auth();
  const user = await getUser(session?.user?.email ?? '');
  const householdId = user?.householdId;

  if (!householdId) {
    return <div>Please contact support to set up your household.</div>;
  }

  const categories = await getCategories(householdId);
  const subcategories = await getSubcategories(householdId, year);
  const recentTransactions = await getRecentTransactions(householdId);

  // Fetch currency data (BRL to CAD)
  const currencyData = await getCurrenciesFromApi();
  let brlRate = 4.15; // Default fallback
  if (currencyData?.data) {
    const { BRL, CAD } = currencyData.data;
    if (BRL && CAD) {
      brlRate = BRL / CAD;
    }
  }

  const householdUsers = user.household?.users || [];
  const p1Name =
    user.household?.person1Name ||
    householdUsers[0]?.name?.split(' ')[0] ||
    'Partner 1';
  const p2Name =
    user.household?.person2Name ||
    householdUsers[1]?.name?.split(' ')[0] ||
    'Partner 2';

  return (
    <>
      {user.householdId && categories && subcategories ? (
        <Planner
          householdId={householdId}
          categories={categories}
          subcategories={subcategories}
          brlRate={brlRate}
          person1Name={p1Name}
          person2Name={p2Name}
          year={year}
          recentTransactions={recentTransactions}
        />
      ) : (
        <Spinner />
      )}
    </>
  );
}
