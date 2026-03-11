import { getSubcategories } from '@/lib/actions/budget';
import { getReminders } from '@/lib/actions/radar';
import { User, Household } from '@prisma/client';
import CommandCenterClient from './command-center-client';

export default async function CommandCenterServer({
  user,
  year
}: {
  user: User & { household?: (Household & { users: User[] }) | null };
  year: number;
}) {
  const householdId = user.householdId;
  if (!householdId) return null;
  const subcategories = await getSubcategories(householdId, year);

  const reminders = await getReminders(householdId);
  const householdUsers = (user.household?.users || []) as User[];

  return (
    <CommandCenterClient
      user={user}
      subcategories={subcategories}
      reminders={reminders}
      householdUsers={householdUsers}
      householdId={householdId}
      year={year}
    />
  );
}
