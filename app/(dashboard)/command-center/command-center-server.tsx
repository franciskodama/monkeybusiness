import { getSubcategories, getReminders } from '@/lib/actions';
import { User } from '@prisma/client';
import CommandCenterClient from './command-center-client';

export default async function CommandCenterServer({
  user
}: {
  user: User & { household?: { users: User[] } | null };
}) {
  const householdId = user.householdId;
  if (!householdId) return null;
  const subcategories = await getSubcategories(householdId);

  const reminders = await getReminders(householdId);
  const householdUsers = (user.household?.users || []) as User[];

  return (
    <CommandCenterClient
      user={user}
      subcategories={subcategories}
      reminders={reminders}
      householdUsers={householdUsers}
      householdId={householdId}
    />
  );
}
