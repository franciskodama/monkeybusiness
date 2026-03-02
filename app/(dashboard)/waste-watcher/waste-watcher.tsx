import { getSubcategories } from '@/lib/actions';
import WasteWatcherClient from './waste-watcher-client';

export default async function WasteWatcher({ user }: { user: any }) {
  const householdId = user?.householdId!;
  const subcategories = await getSubcategories(householdId);

  return (
    <WasteWatcherClient
      user={user}
      subcategories={subcategories}
      householdId={householdId}
    />
  );
}
