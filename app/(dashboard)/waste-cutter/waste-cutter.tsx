import { User } from '@prisma/client';
import { getSubcategories } from '@/lib/actions/budget';
import WasteCutterClient from './waste-cutter-client';

export default async function WasteCutter({ user, year }: { user: User, year: number }) {
  const householdId = user?.householdId || '';
  const subcategories = await getSubcategories(householdId, year);

  return (
    <WasteCutterClient
      user={user}
      subcategories={subcategories}
      householdId={householdId}
      year={year}
    />
  );
}
