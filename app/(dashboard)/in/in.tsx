import { getSubcategories, getReminders } from '@/lib/actions';
import { User } from '@prisma/client';
import InClient from './in-client';

export default async function In({ user }: { user: any }) {
  const householdId = user?.householdId!;
  const subcategories = await getSubcategories(householdId);
  const currentMonth = new Date().getMonth() + 1;

  // Flatten current month transactions and count those without a subcategory
  const pendingCount = subcategories
    .filter((s) => s.month === currentMonth)
    .flatMap((s) => s.transactions || [])
    .filter((t) => !t.subcategoryId).length;

  const reminders = await getReminders(householdId);
  const householdUsers = (user.household?.users || []) as User[];

  return (
    <InClient
      user={user}
      subcategories={subcategories}
      pendingCount={pendingCount}
      reminders={reminders}
      householdUsers={householdUsers}
      householdId={householdId}
    />
  );
}
