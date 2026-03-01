'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Flame,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  Calendar,
  ChartColumn
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

  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  // --- COMPUTE STRATEGIC METRICS ---

  // 1. Monthly Efficiency for YTD
  const ytdMonths = Array.from({ length: currentMonth }, (_, i) => i + 1);
  const monthlyEfficiencies = ytdMonths.map((m) => {
    const monthSubs = subcategories.filter((s) => s.month === m);
    const contribution = monthSubs.reduce(
      (sum, s) =>
        sum +
        (s.transactions || [])
          .filter((tx: any) => tx.source === 'His' || tx.source === 'Her')
          .reduce((ts: number, t: any) => ts + (t.amount || 0), 0),
      0
    );
    const expenses = monthSubs
      .filter((s) => !s.category?.isIncome && !s.category?.isSavings)
      .reduce(
        (sum, s) =>
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
      (sum, s) =>
        sum +
        (s.transactions || [])
          .filter((tx: any) => tx.source === 'His' || tx.source === 'Her')
          .reduce((ts: number, t: any) => ts + (t.amount || 0), 0),
      0
    );
  const totalYtdSavings = subcategories
    .filter((s) => s.month <= currentMonth && s.category?.isSavings)
    .reduce(
      (sum, s) =>
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
      (sum, s) =>
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
      (sum, s) =>
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

  return (
    <div className="flex flex-col gap-10 p-8 mb-12 max-w-[1600px] mx-auto">
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
            <Card className="rounded-none border-2 border-slate-300 shadow-none">
              <ExplanationIn setOpenAction={setOpenAction} />
            </Card>
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
          value={pendingCount}
          subValue={pendingCount > 0 ? 'Pending Tasks' : 'All Tasks Mapped'}
          explanation="Ensures all imported transactions are mapped to categories. When this is 0, your strategic data is 100% accurate."
          icon={ShieldAlert}
          color={pendingCount > 0 ? 'amber' : 'emerald'}
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
