import { getSubcategories } from '@/lib/actions';
import WasteCutterClient from './waste-cutter-client';

export default async function WasteCutter({ user }: { user: any }) {
  const householdId = user?.householdId!;
  const subcategories = await getSubcategories(householdId);

  return (
    <WasteCutterClient
      user={user}
      subcategories={subcategories}
      householdId={householdId}
    />
  );
}
