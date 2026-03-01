'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Flame,
  ArrowUpRight,
  Activity,
  ChartColumn,
  ShieldAlert,
  X,
  PiggyBank,
  Binoculars
} from 'lucide-react';
import Help from '@/components/Help';
import ExplanationIn from './explanation-in';
import { SignalsRibbon } from './_components/SignalsRibbon';
import { AnnualStrategicChart } from '@/components/AnnualStrategicChart';
import { DashboardMetric } from './_components/DashboardMetric';
import { SourceBurnChart } from '@/components/SourceBurnChart';
import { FixedVariableTracker } from './_components/FixedVariableTracker';
import { OutlierAlerts } from './_components/OutlierAlerts';
import { formatCurrencyRounded } from '@/lib/utils';
import { User } from '@prisma/client';

interface InClientProps {
  user: any;
  subcategories: any[];
  pendingCount: number;
  reminders: any[];
  householdUsers: User[];
  householdId: string;
}

export default function InClient({
  user,
  subcategories,
  pendingCount,
  reminders,
  householdUsers,
  householdId
}: InClientProps) {
  const [openAction, setOpenAction] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showLogic, setShowLogic] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  // --- COMPUTE STRATEGIC METRICS ---

  // 1. Monthly Efficiency for YTD
  const ytdMonths = Array.from({ length: currentMonth }, (_, i) => i + 1);
  const monthlyEfficiencies = ytdMonths.map((m) => {
    const monthSubs = subcategories.filter((s) => s.month === m);
    const contribution = monthSubs.reduce(
      (sum: number, s: any) =>
        sum +
        (s.transactions || [])
          .filter((tx: any) => tx.source === 'His' || tx.source === 'Her')
          .reduce((ts: number, t: any) => ts + (t.amount || 0), 0),
      0
    );
    const expenses = monthSubs
      .filter((s) => !s.category?.isIncome && !s.category?.isSavings)
      .reduce(
        (sum: number, s: any) =>
          sum +
          (s.transactions || []).reduce(
            (ts: number, t: any) => ts + (t.amount || 0),
            0
          ),
        0
      );
    return contribution > 0 ? (contribution - expenses) / contribution : 0;
  });
  const avgEfficiency =
    (monthlyEfficiencies.reduce((a, b) => a + b, 0) / currentMonth) * 100;

  // 2. Savings Velocity (Weighted YTD)
  const totalYtdContribution = subcategories
    .filter((s) => s.month <= currentMonth)
    .reduce(
      (sum: number, s: any) =>
        sum +
        (s.transactions || [])
          .filter((tx: any) => tx.source === 'His' || tx.source === 'Her')
          .reduce((ts: number, t: any) => ts + (t.amount || 0), 0),
      0
    );
  const totalYtdSavings = subcategories
    .filter((s) => s.month <= currentMonth && s.category?.isSavings)
    .reduce(
      (sum: number, s: any) =>
        sum +
        (s.transactions || []).reduce(
          (ts: number, t: any) => ts + (t.amount || 0),
          0
        ),
      0
    );
  const savingsVelocity =
    totalYtdContribution > 0
      ? (totalYtdSavings / totalYtdContribution) * 100
      : 0;

  // 3. Burn Rate Analysis (Current Month vs YTD Average)
  const currentMonthExpenses = subcategories
    .filter(
      (s) =>
        s.month === currentMonth &&
        !s.category?.isIncome &&
        !s.category?.isSavings
    )
    .reduce(
      (sum: number, s: any) =>
        sum +
        (s.transactions || []).reduce(
          (ts: number, t: any) => ts + (t.amount || 0),
          0
        ),
      0
    );
  const ytdTotalExpenses = subcategories
    .filter(
      (s) =>
        s.month <= currentMonth &&
        !s.category?.isIncome &&
        !s.category?.isSavings
    )
    .reduce(
      (sum: number, s: any) =>
        sum +
        (s.transactions || []).reduce(
          (ts: number, t: any) => ts + (t.amount || 0),
          0
        ),
      0
    );
  const avgMonthlyExpense = ytdTotalExpenses / currentMonth;
  const burnDiff =
    avgMonthlyExpense > 0
      ? ((currentMonthExpenses - avgMonthlyExpense) / avgMonthlyExpense) * 100
      : 0;

  // 4. Strategic Friction (New System Health Logic)
  const frictionPoints: {
    type: 'expense' | 'forecast' | 'savings';
    message: string;
  }[] = [];

  // A. Current Month Overruns
  const currentMonthSubs = subcategories.filter(
    (s) => s.month === currentMonth
  );
  currentMonthSubs.forEach((s: any) => {
    if (s.category?.isIncome || s.category?.isSavings) return;
    const actual = (s.transactions || []).reduce(
      (sum: number, tx: any) => sum + (tx.amount || 0),
      0
    );
    const target = s.amount || 0;
    if (target > 0 && actual > target * 1.1) {
      frictionPoints.push({
        type: 'expense',
        message: `Budget Overrun: ${s.name}`
      });
    }
  });

  // B. Annual Deficit (Actuals YTD)
  const ytdActualExpenses = subcategories
    .filter(
      (s) =>
        s.month <= currentMonth &&
        !s.category?.isIncome &&
        !s.category?.isSavings
    )
    .reduce(
      (sum: number, s: any) =>
        sum +
        (s.transactions || []).reduce(
          (ts: number, t: any) => ts + (t.amount || 0),
          0
        ),
      0
    );

  const ytdActualContribution = subcategories
    .filter((s) => s.month <= currentMonth)
    .reduce(
      (sum: number, s: any) =>
        sum +
        (s.transactions || [])
          .filter((tx: any) => tx.source === 'His' || tx.source === 'Her')
          .reduce((ts: number, t: any) => ts + (t.amount || 0), 0),
      0
    );

  if (ytdActualExpenses > ytdActualContribution) {
    frictionPoints.push({
      type: 'expense',
      message: 'Annual Deficit: YTD Expenses exceed Contribution'
    });
  }

  // C. Annual Forecast Risk (Planned Full Year)
  const fullYearPlannedExpenses = subcategories
    .filter((s) => !s.category?.isIncome && !s.category?.isSavings)
    .reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

  const fullYearPlannedContribution = subcategories
    .filter((s) => s.category?.isIncome)
    .reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

  if (fullYearPlannedExpenses > fullYearPlannedContribution) {
    frictionPoints.push({
      type: 'forecast',
      message: 'Forecast Risk: Total 2026 Budget is Negative'
    });
  }

  // D. Savings Performance Gap
  const ytdActualSavings = subcategories
    .filter((s) => s.month <= currentMonth && s.category?.isSavings)
    .reduce(
      (sum: number, s: any) =>
        sum +
        (s.transactions || []).reduce(
          (ts: number, t: any) => ts + (t.amount || 0),
          0
        ),
      0
    );

  const ytdPlannedSavings = subcategories
    .filter((s) => s.month <= currentMonth && s.category?.isSavings)
    .reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

  if (ytdPlannedSavings > 0 && ytdActualSavings < ytdPlannedSavings * 0.9) {
    frictionPoints.push({
      type: 'savings',
      message: 'Savings Gap: Below 90% of Investment Target'
    });
  }

  const totalFriction = frictionPoints.length;

  return (
    <div className="flex flex-col gap-10 p-8 mb-12 max-w-[1600px] mx-auto">
      {/* DIAGNOSTIC DRAWER */}
      <AnimatePresence>
        {showDiagnostics && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDiagnostics(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 cursor-zoom-out"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-white z-[60] shadow-2xl border-l-2 border-slate-200"
            >
              <div className="h-full flex flex-col">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-100 p-3 rounded-none border border-amber-200">
                      <ShieldAlert className="text-amber-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 leading-none">
                        System Diagnostics
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Friction Point Audit
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDiagnostics(false)}
                    className="p-2 hover:bg-slate-200 transition-colors"
                  >
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {/* FRICTION POINTS SECTION */}
                  {frictionPoints.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 font-mono">
                        Active Alerts ({frictionPoints.length})
                      </h4>
                      <div className="space-y-4">
                        {frictionPoints.map((point, idx) => {
                          const config = {
                            expense: {
                              border: 'border-rose-100',
                              bg: 'bg-rose-50/50',
                              icon: Flame,
                              iconColor: 'text-rose-600',
                              text: 'text-rose-900',
                              subtext: 'text-rose-700/60'
                            },
                            forecast: {
                              border: 'border-amber-100',
                              bg: 'bg-amber-50/50',
                              icon: Binoculars,
                              iconColor: 'text-amber-600',
                              text: 'text-amber-900',
                              subtext: 'text-amber-700/60'
                            },
                            savings: {
                              border: 'border-blue-100',
                              bg: 'bg-blue-50/50',
                              icon: PiggyBank,
                              iconColor: 'text-blue-600',
                              text: 'text-blue-900',
                              subtext: 'text-blue-700/60'
                            }
                          }[point.type];

                          const Icon = config.icon;

                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              key={idx}
                              className={`p-5 border-2 ${config.border} ${config.bg} flex items-start gap-4 group`}
                            >
                              <div
                                className={`${config.iconColor} mt-0.5 shrink-0`}
                              >
                                <Icon size={18} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span
                                  className={`text-sm font-bold ${config.text} tracking-tight`}
                                >
                                  {point.message}
                                </span>
                                <p
                                  className={`text-[11px] ${config.subtext} font-semibold leading-relaxed`}
                                >
                                  Manual intervention suggested to restore
                                  system efficiency.
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-10">
                      <div className="bg-emerald-50 p-6 rounded-full mb-6">
                        <Activity className="text-emerald-500" size={40} />
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900">
                        System Nominal
                      </h4>
                      <p className="text-sm text-slate-500 font-medium max-w-[250px] mx-auto mt-2">
                        All financial vectors are within strategic parameters.
                        No friction detected.
                      </p>
                    </div>
                  )}

                  {/* SYSTEM LOGIC SECTION */}
                  <div className="pt-8 border-t border-slate-100">
                    <button
                      onClick={() => setShowLogic(!showLogic)}
                      className="flex items-center justify-between w-full group"
                    >
                      <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-900 group-hover:text-amber-600 transition-colors">
                        Deconstruct Audit Protocols
                      </h4>
                      <div
                        className={`transition-transform duration-300 ${showLogic ? 'rotate-180' : ''}`}
                      >
                        <TrendingUp className="text-slate-300" size={16} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {showLogic && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 space-y-6">
                            <div className="p-5 bg-slate-50 border border-slate-200 font-mono">
                              <div className="flex flex-col gap-4">
                                <div className="space-y-1 mb-1">
                                  <span className="text-[9px] font-black px-2 py-1 bg-rose-500 text-white  uppercase tracking-widest">
                                    Protocol 01: Budget Integrity
                                  </span>
                                  <p className="text-xs font-bold text-slate-600">
                                    Actual &gt; (Target increased by 10%)
                                  </p>
                                </div>
                                <div className="space-y-1 mb-1">
                                  <span className="text-[9px] font-black px-2 py-1 bg-rose-500 text-white uppercase tracking-widest">
                                    Protocol 02: Annual Liquidity
                                  </span>
                                  <p className="text-xs font-bold text-slate-600">
                                    YTD Expenses &gt; YTD Contributions
                                  </p>
                                </div>
                                <div className="space-y-1 mb-1">
                                  <span className="text-[9px] font-black px-2 py-1 bg-amber-500 text-white uppercase tracking-widest">
                                    Protocol 03: Forecast Risk
                                  </span>
                                  <p className="text-xs font-bold text-slate-600">
                                    2026 Planned Deficit &gt; 0
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] font-black px-2 py-1 bg-blue-500 text-white uppercase tracking-widest">
                                    Protocol 04: Accumulation Gap
                                  </span>
                                  <p className="text-xs font-bold text-slate-600">
                                    Actual Savings &lt; (90% of Target)
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed italic px-4">
                              These protocols ensure real-time technical
                              compliance with your 2026 Strategic Plan.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {frictionPoints.length > 0 && (
                    <div className="p-6 bg-slate-900 text-white space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-mono">
                        Strategic Note
                      </h4>
                      <p className="text-xs font-medium leading-relaxed italic opacity-80">
                        "Clean system health ensures maximum Wealth Velocity.
                        Address these points to minimize capital leakage."
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => setShowDiagnostics(false)}
                    className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    Close Diagnostics
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end pb-4">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 p-4 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
            <Activity className="text-white" size={16} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-slate-900">
              Command Center
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">
              Strategic Financial Intelligence /{' '}
              {now.toLocaleString('default', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          {!openAction && <Help setOpenAction={setOpenAction} />}
        </div>
      </div>

      <AnimatePresence>
        {openAction && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ExplanationIn setOpenAction={setOpenAction} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP ROW: STRATEGIC METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetric
          label="Strategic Efficiency"
          value={`${avgEfficiency.toFixed(1)}%`}
          subValue="Year-to-Date Average"
          explanation="Calculates your overall income-to-living expense health. A high score means your earnings are being managed with precision, leaving more room for wealth building."
          icon={Target}
          color="emerald"
          trend={{ value: 4, isPositive: true }}
        />
        <DashboardMetric
          label="Wealth Velocity"
          value={`${savingsVelocity.toFixed(1)}%`}
          subValue="Savings / Effort Ratio"
          explanation="The ratio of investments to contributions. Tracks how fast your capital is moving toward the goal. 30% or more is considered High Velocity."
          icon={TrendingUp}
          color="blue"
        />
        <DashboardMetric
          label="Monthly Burn Rate"
          value={`$${formatCurrencyRounded(currentMonthExpenses)}`}
          subValue={
            burnDiff > 0
              ? `${burnDiff.toFixed(1)}% above average`
              : `${Math.abs(burnDiff).toFixed(1)}% below average`
          }
          explanation="Compares this month's total living expenses to your historical year-to-date average. Helps you spot spend-creep early."
          icon={Flame}
          color={burnDiff > 10 ? 'rose' : 'slate'}
          trend={{
            value: Math.abs(Math.round(burnDiff)),
            isPositive: burnDiff <= 0
          }}
        />
        <DashboardMetric
          label="System Health"
          value={totalFriction}
          subValue={
            totalFriction > 0
              ? `${totalFriction} Friction Points`
              : 'Mission Clear'
          }
          explanation="Real-time audit of your financial system. It identifies friction points like budget overruns, annual deficits, and savings gaps that require immediate attention."
          icon={ShieldAlert}
          color={totalFriction > 0 ? 'amber' : 'emerald'}
          onClick={() => setShowDiagnostics(true)}
        />
      </div>

      {/* SIGNALS RIBBON - MISSION CONTROL */}
      <SignalsRibbon
        householdId={householdId}
        currentUser={user}
        householdUsers={householdUsers}
        initialReminders={reminders}
      />

      {/* CENTER PIECE: ANNUAL PERFORMANCE MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border-2 border-slate-200 p-8 shadow-[10px_10px_0px_rgba(15,23,42,0.05)] relative overflow-hidden">
            <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-2">
                  <ChartColumn
                    size={32}
                    strokeWidth={1.6}
                    className="text-slate-900"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight leading-none text-slate-900">
                    Annual Performance Path
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Projection vs Reality / 12-Month Flow
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500" />
                  <span className="text-[9px] font-black uppercase text-slate-500">
                    Contribution
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500" />
                  <span className="text-[9px] font-black uppercase text-slate-500">
                    Expenses
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500" />
                  <span className="text-[9px] font-black uppercase text-slate-500">
                    Savings
                  </span>
                </div>
              </div>
            </div>

            <AnnualStrategicChart subcategories={subcategories} />

            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end items-center italic text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Jan 2026 - Dec 2026
            </div>
          </div>
        </div>

        {/* SIDE BAR: DRILL DOWN INSIGHTS */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 p-8 text-white shadow-[10px_10px_0px_rgba(15,23,42,0.1)] h-full">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-2 text-white">
              <ArrowUpRight className="text-emerald-400" size={20} />
              Strategic Drill-Down
            </h3>

            <div className="space-y-12">
              <div className="group">
                <OutlierAlerts subcategories={subcategories} />
              </div>

              <div className="pt-8 border-t border-slate-800">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">
                  Source Analytics
                </h4>
                <div className="h-[250px] -mx-4">
                  <SourceBurnChart subcategories={subcategories} />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800">
                <FixedVariableTracker subcategories={subcategories} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
