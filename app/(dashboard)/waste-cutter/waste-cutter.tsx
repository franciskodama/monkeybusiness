import { User } from '@prisma/client';
import { getSubcategories } from '@/lib/actions/budget';
import WasteCutterClient from './waste-cutter-client';

export default async function WasteCutter({ user }: { user: User }) {
  const householdId = user?.householdId || '';
  const subcategories = await getSubcategories(householdId);

  return (
    <WasteCutterClient
      user={user}
      subcategories={subcategories}
      householdId={householdId}
    />
  );
}
