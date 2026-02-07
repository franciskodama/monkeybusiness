import { getUser, getTransactionRules, getSubcategories } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
  const session = await auth();
  const user = await getUser(session?.user?.email!);

  if (!user) {
    redirect('/');
  }

  const householdId = user.householdId!;

  const [rules, subcategories] = await Promise.all([
    getTransactionRules(householdId),
    getSubcategories(householdId)
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
    />
  );
}
