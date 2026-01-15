// app/(dashboard)/settings/page.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { getUser } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { RulesManager } from './rules-manager';

export default async function SettingsPage() {
  const session = await auth();
  const user = await getUser(session?.user?.email!);
  const householdId = user?.householdId!;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight uppercase">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm lowercase">
          <span className="uppercase">M</span>anage your household preferences
          and rules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg uppercase font-bold">
            Smart Rules
          </CardTitle>
          <CardDescription className="text-xs">
            These are the patterns the app has learned to auto-link transactions
            to subcategories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RulesManager householdId={householdId} />
        </CardContent>
      </Card>
    </div>
  );
}
