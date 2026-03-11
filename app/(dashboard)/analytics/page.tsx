export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

import AnalyticsClient from './analytics-client';
import { auth } from '@/lib/auth';
import { getUser } from '@/lib/actions/auth';
import { getSubcategories } from '@/lib/actions/budget';

export default async function AnalyticsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();
  const year = parseInt(searchParams.year?.toString() || currentYear.toString(), 10);
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const dbUser = await getUser(session.user.email ?? '');

  if (!dbUser) {
    redirect('/');
  }

  const householdId = dbUser.householdId!;
  const subcategories = await getSubcategories(householdId, year);

  return <AnalyticsClient subcategories={subcategories} year={year} />;
}
