import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { getUser, getTransactionRules, getSubcategories } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { RulesManager } from './rules-manager';
import { User, ShieldCheck, Zap } from 'lucide-react';

export default async function SettingsPage() {
  const session = await auth();
  const user = await getUser(session?.user?.email!);
  const householdId = user?.householdId!;

  // Fetching data for the Health Stats
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
    <Card className="relative">
      <CardHeader className="sm:mb-12">
        <CardTitle className="flex justify-between items-center gap-2">
          Settings
        </CardTitle>
        <CardDescription>
          Optimize your financial engine. Refine automation rules and household
          preferences for a smarter, hands-off budget.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-12">
        {/* --- SECTION 1: USER PROFILE & STATS --- */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="p-4 rounded-xl border bg-secondary/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Account Profile
              </p>
              <p className="text-sm font-bold">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase mt-0.5">
                <ShieldCheck size={10} className="text-emerald-600" />
                Household Admin
              </div>
            </div>
          </div>

          {/* Automation Health Card */}
          <div className="p-4 rounded-xl border bg-primary/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Automation Health
              </p>
              <p className="text-sm font-bold">
                {automationCoverage}% Coverage
              </p>
              <p className="text-[10px] text-muted-foreground uppercase mt-0.5">
                {rules.length} Active Smart Rules
              </p>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: RULES MANAGER --- */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              Smart Rules
            </h1>
            <p className="text-muted-foreground text-sm lowercase">
              <span className="uppercase">T</span>hese are the patterns the app
              has learned to auto-link transactions to subcategories.
            </p>
          </div>

          {/* Centered Rules Container */}
          <div className="flex flex-col w-full min-h-[32em] border rounded-xl bg-background/50 overflow-hidden">
            <RulesManager householdId={householdId} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
