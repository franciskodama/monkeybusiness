import { getUser, getSubcategories } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { CardMessage } from './_components/CardMessage';
import CardUser from './_components/CardUser';
import { ProjectionCard } from './_components/ProjectionCard';
import { SavingsTracker } from './_components/SavingsTracker';
import { FixedVariableTracker } from './_components/FixedVariableTracker';
import { OutlierAlerts } from './_components/OutlierAlerts';
import { User } from '@prisma/client';
import { BurnDownChart } from '@/components/BurnDownChart';
import { SourceBurnChart } from '@/components/SourceBurnChart';
import { tagClass } from '@/lib/classes';
import CardStatus from './_components/CardStatus';
import { SignalsRibbon } from './_components/SignalsRibbon';
import { getReminders } from '@/lib/actions';

export default async function In({ user }: { user: any }) {
  const householdId = user?.householdId!;
  const subcategories = await getSubcategories(householdId);
  const currentMonth = new Date().getMonth() + 1;

  // Logic for the Alerts Card
  const pendingTransactions = subcategories
    .filter((s) => s.month === currentMonth)
    .flatMap((s) => s.transactions || [])
    .filter((t) => !t.subcategoryId).length;

  // Flatten current month transactions and count those without a subcategory
  const pendingCount = subcategories
    .filter((s) => s.month === currentMonth)
    .flatMap((s) => s.transactions || [])
    .filter((t) => !t.subcategoryId).length;

  const reminders = await getReminders(householdId);
  const householdUsers = user.household?.users || [];

  return (
    <div className="flex flex-col gap-8 p-6 mb-8">
      {/* SECTION 1: TOP ROW (4 Column Grid) */}
      <div className="hidden sm:grid grid-cols-4 w-full gap-8">
        {/* User Card */}
        <div className="border border-slate-300 border-dashed p-1 bg-slate-50">
          <div className="bg-white w-full h-full p-6 border border-slate-200 relative">
            <CardUser user={user} />
          </div>
        </div>

        {/* Projection Card */}
        <div className="border border-slate-300 border-dashed p-1 bg-slate-50">
          <div className="bg-white w-full h-full p-6 border border-slate-200 relative">
            <ProjectionCard subcategories={subcategories} />
          </div>
        </div>

        {/* Savings Card */}
        <div className="border border-slate-300 border-dashed p-1 bg-slate-50">
          <div className="bg-white w-full h-full p-6 border border-slate-200 relative text-center">
            <SavingsTracker subcategories={subcategories} />
          </div>
        </div>

        {/* Status Card */}
        <div className="border border-slate-300 border-dashed p-1 bg-slate-50">
          <div className="bg-white w-full h-full p-6 border border-slate-200 relative flex flex-col justify-center items-center">
            <CardStatus
              title={`🚔 Status`}
              description={
                pendingCount > 0
                  ? `${pendingCount} tasks need mapping.`
                  : 'All clear! Systems optimal.'
              }
              buttonText="Manage Rules"
              url="settings"
            />
          </div>
        </div>
      </div>

      {/* SIGNALS RIBBON */}
      <div className="w-full">
        <SignalsRibbon
          householdId={householdId}
          currentUser={user}
          householdUsers={householdUsers as User[]}
          initialReminders={reminders}
        />
      </div>

      {/* SECTION 2: MAIN CHART ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Burn-Down Chart (Left 2/3) */}
        <div className="md:col-span-2 border border-slate-300 border-dashed p-1 bg-slate-50 min-h-[32em]">
          <div className="bg-white w-full h-full p-6 border border-slate-200 relative flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest">
                  Monthly Burn-Down
                </h4>
                <p className="text-[9px] text-muted-foreground uppercase italic leading-none">
                  Actual vs. Target Plan
                </p>
              </div>
            </div>
            <div className="flex-1 min-h-[300px]">
              <BurnDownChart subcategories={subcategories} />
            </div>
            <div className={tagClass}>
              <span className="mr-2">🔥</span>Burn
            </div>
          </div>
        </div>

        {/* Breakdown Panel (Right 1/3) */}
        <div className="md:col-span-1 flex flex-col gap-8">
          {/* Source Totals */}
          <div className="border border-slate-300 border-dashed p-1 bg-slate-50 min-h-[20em]">
            <div className="bg-white w-full h-full p-6 border border-slate-200 relative">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">
                Top Burn Sources
              </h4>
              <div className="h-[250px]">
                <SourceBurnChart subcategories={subcategories} />
              </div>
              <div className={tagClass}>
                <span className="mr-2">💳</span>Sources
              </div>
            </div>
          </div>

          {/* Structure Totals */}
          <div className="border border-slate-300 border-dashed p-1 bg-slate-50 min-h-[20em]">
            <div className="bg-white w-full h-full p-6 border border-slate-200 relative flex flex-col gap-4">
              <FixedVariableTracker subcategories={subcategories} />
              <div className="flex-1">
                <OutlierAlerts subcategories={subcategories} />
              </div>
              <div className={tagClass}>
                <span className="mr-2">🧩</span>Structure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
