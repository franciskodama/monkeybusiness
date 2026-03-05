export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

import AnalyticsClient from './analytics-client';
import { auth } from '@/lib/auth';
import { getUser, getSubcategories } from '@/lib/actions';

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

  return <AnalyticsClient subcategories={subcategories} />;
}
