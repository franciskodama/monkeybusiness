export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

import AnalyticsClient from './analytics-client';
import { auth } from '@/lib/auth';
import { getUser, getSubcategories, getReminders } from '@/lib/actions';
import { Spinner } from '@/lib/icons';

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const dbUser = await getUser(session.user.email ?? '');

  if (!dbUser) {
    redirect('/');
  }

  const householdId = dbUser.householdId!;
  const subcategories = await getSubcategories(householdId);
  const reminders = await getReminders(householdId);
  const householdUsers = dbUser.household?.users || [];

  return (
    <AnalyticsClient
      user={dbUser}
      subcategories={subcategories}
      reminders={reminders}
      householdUsers={householdUsers}
      householdId={householdId}
    />
  );
}
