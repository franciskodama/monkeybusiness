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
import { BackupRestore } from './backup-restore';
import { User, ShieldCheck, Zap, Settings as SettingsIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tagClass } from '@/lib/classes'; // Reusing your established tag style

export default async function SettingsPage() {
  const session = await auth();
  const user = await getUser(session?.user?.email!);
  const householdId = user?.householdId!;

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
    <Card className="relative border-none shadow-none bg-transparent">
      <CardHeader className="sm:mb-12">
        <CardTitle className="flex justify-between items-center gap-2">
          <p className="text-2xl font-bold">Settings</p>
        </CardTitle>
        <CardDescription className="text-sm">
          Optimize your financial engine.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {/* --- TOP ROW: Using the Dashed Border & Tag Style from CardMessage/CardEmpty --- */}
          <div className="hidden sm:flex flex-col sm:flex-row w-full justify-between gap-8 mb-12">
            {/* Account Profile Card */}
            <div className="relative sm:w-1/3 p-6 pt-10 border border-slate-300 border-dashed flex items-center gap-4">
              <div className="h-12 w-12 rounded-none bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <User size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-xl font-bold">{user?.name || 'User'}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 uppercase font-bold">
                  <ShieldCheck size={10} />
                  Household Admin
                </div>
              </div>
              {/* Floating Tag style from CardMessage */}
              <div className={tagClass}>
                <span className="mr-2">👤</span>Identity
              </div>
            </div>

            {/* Automation Health Card */}
            <div className="relative sm:w-1/3 p-6 pt-10 border border-slate-300 border-dashed flex items-center gap-4">
              <div className="h-12 w-12 rounded-none bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 border border-emerald-200">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xl font-bold">{automationCoverage}%</p>
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Smart Coverage
                </p>
              </div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 p-1 px-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
                Health Status
              </div>
            </div>

            {/* System Version Card */}
            <div className="relative sm:w-1/3 p-6 pt-10 border border-slate-300 border-dashed flex flex-col justify-center text-center">
              <p className="text-xs mb-2 text-muted-foreground italic">
                System engine is healthy.
              </p>
              <p className="text-lg font-bold uppercase tracking-tighter">
                v2.0.26 Online
              </p>
              <div className={tagClass}>
                <span className="mr-2">⚙️</span>System
              </div>
            </div>
          </div>

          {/* --- FUNCTIONAL AREA: Tabs with Spreadsheet-like inner containers --- */}
          <Tabs defaultValue="rules" className="w-full space-y-6">
            <TabsList className="flex w-full sm:w-[400px] bg-muted border border-slate-300 border-dashed p-1 h-12 rounded-none">
              <TabsTrigger
                value="rules"
                className="flex-1 uppercase text-[10px] font-bold tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white rounded-none h-full"
              >
                Smart Rules
              </TabsTrigger>
              <TabsTrigger
                value="backup"
                className="flex-1 uppercase text-[10px] font-bold tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white rounded-none h-full"
              >
                Backup & Restore
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="outline-none">
              <div className="stripe-border w-full min-h-[30em] p-1 border border-slate-300 border-dashed">
                <div className="bg-white w-full h-full min-h-[30em] overflow-hidden">
                  <RulesManager rules={rules} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="backup" className="outline-none">
              <div className="stripe-border w-full min-h-[30em] p-1 border border-slate-300 border-dashed">
                <div className="bg-white w-full h-full min-h-[30em] p-8">
                  <BackupRestore
                    householdId={householdId}
                    currentSubcategories={subcategories}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
