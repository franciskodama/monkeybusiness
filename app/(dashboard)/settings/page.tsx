import { getUser } from '@/lib/actions/auth';
import { getTransactionRules } from '@/lib/actions/transactions';
import { getSubcategories } from '@/lib/actions/budget';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from './settings-client';

export default async function SettingsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();
  const year = parseInt(
    searchParams.year?.toString() || currentYear.toString(),
    10
  );

  const session = await auth();
  const user = await getUser(session?.user?.email || '');

  if (!user) {
    redirect('/');
  }

  const householdId = user.householdId!;

  const [rules, subcategories] = await Promise.all([
    getTransactionRules(householdId),
    getSubcategories(householdId, year)
  ]);

  const automationCoverage =
    subcategories.length > 0
      ? Math.round(
          (new Set(rules.map((r) => r.subcategoryId)).size /
            subcategories.length) *
            100
        )
      : 0;

  return (
    <SettingsClient
      user={user}
      rules={rules}
      subcategories={subcategories}
      automationCoverage={automationCoverage}
      householdId={householdId}
      year={year}
    />
  );
}
