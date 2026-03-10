import { auth } from '@/lib/auth';

import {
  getCategories,
  getSubcategories,
  getCurrenciesFromApi
} from '@/lib/actions/budget';
import { getUser } from '@/lib/actions/auth';
import Planner from './planner';
import { Spinner } from '@/lib/icons';

export default async function PlannerPage() {
  const session = await auth();
  const user = await getUser(session?.user?.email ?? '');
  const householdId = user?.householdId;

  if (!householdId) {
    return <div>Please contact support to set up your household.</div>;
  }

  const categories = await getCategories(householdId);
  const subcategories = await getSubcategories(householdId);

  // Fetch currency data (BRL to CAD)
  const currencyData = await getCurrenciesFromApi();
  let brlRate = 4.15; // Default fallback
  if (currencyData?.data) {
    const { BRL, CAD } = currencyData.data;
    if (BRL && CAD) {
      brlRate = BRL / CAD;
    }
  }

  return (
    <>
      {user.householdId && categories && subcategories ? (
        <Planner
          householdId={householdId}
          categories={categories}
          subcategories={subcategories}
          brlRate={brlRate}
          person1Name={user.household?.person1Name}
          person2Name={user.household?.person2Name}
        />
      ) : (
        <Spinner />
      )}
    </>
  );
}
