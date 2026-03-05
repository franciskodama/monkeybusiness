'use client';

import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Scissors,
  AlertTriangle,
  Target,
  Flame,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { formatCurrencyRounded } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@prisma/client';
import { SubcategoryWithCategory } from '@/lib/types';

interface WasteCutterClientProps {
  user: User;
  subcategories: SubcategoryWithCategory[];
  householdId: string;
}

export default function WasteCutterClient({
  subcategories
}: WasteCutterClientProps) {
  const [showCreepInfo, setShowCreepInfo] = React.useState(false);
  const [showFatInfo, setShowFatInfo] = React.useState(false);
  const [showProtocolInfo, setShowProtocolInfo] = React.useState(false);
  const [showOptimizationInfo, setShowOptimizationInfo] = React.useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  // --- COMPUTE TOP 10 VILLAIN RANKINGS ---

  // Helper to group by subcategory name
  const subcategoryStats = useMemo(() => {
    const stats: Record<
      string,
      {
        name: string;
        currentMonthActual: number;
        ytdActual: number;
        fullYearForecast: number;
        isIncome: boolean;
        isSavings: boolean;
        monthlyHistory: Record<number, number>;
      }
    > = {};

    subcategories.forEach((sub) => {
      if (!stats[sub.name]) {
        stats[sub.name] = {
          name: sub.name,
          currentMonthActual: 0,
          ytdActual: 0,
          fullYearForecast: 0,
          isIncome: sub.category?.isIncome || false,
          isSavings: sub.category?.isSavings || false,
          monthlyHistory: {}
        };
      }

      // Add to forecast (Full Year)
      stats[sub.name].fullYearForecast += sub.amount || 0;

      const actualSum = (sub.transactions || []).reduce(
        (sum: number, tx) => sum + (Number(tx.amount) || 0),
        0
      );

      // Current Month Actuals
      if (sub.month === currentMonth) {
        stats[sub.name].currentMonthActual += actualSum;
      }

      // YTD Actuals
      if (sub.month <= currentMonth) {
        stats[sub.name].ytdActual += actualSum;
      }

      // History for Creep Detection
      stats[sub.name].monthlyHistory[sub.month] = actualSum;
    });

    return Object.values(stats).filter((s) => !s.isIncome && !s.isSavings);
  }, [subcategories, currentMonth]);

  const top10CurrentMonth = useMemo(
    () =>
      [...subcategoryStats]
        .sort((a, b) => b.currentMonthActual - a.currentMonthActual)
        .slice(0, 10),
    [subcategoryStats]
  );

  const top10YTD = useMemo(
    () =>
      [...subcategoryStats]
        .sort((a, b) => b.ytdActual - a.ytdActual)
        .slice(0, 10),
    [subcategoryStats]
  );

  const top10Forecast = useMemo(
    () =>
      [...subcategoryStats]
        .sort((a, b) => b.fullYearForecast - a.fullYearForecast)
        .slice(0, 10),
    [subcategoryStats]
  );

  const top10Variance = useMemo(
    () =>
      [...subcategoryStats]
        .filter((s) => s.fullYearForecast > s.ytdActual)
        .sort(
          (a, b) =>
            b.fullYearForecast -
            b.ytdActual * (12 / currentMonth) -
            (a.fullYearForecast - a.ytdActual * (12 / currentMonth))
        )
        .slice(0, 10),
    [subcategoryStats, currentMonth]
  );

  // --- SPEND-CREEP DETECTOR ---
  const creepAlerts = useMemo(() => {
    return subcategoryStats
      .map((sub) => {
        const current = sub.currentMonthActual;
        const prev1 = sub.monthlyHistory[currentMonth - 1] || 0;
        const prev2 = sub.monthlyHistory[currentMonth - 2] || 0;
        const prev3 = sub.monthlyHistory[currentMonth - 3] || 0;

        const historicalAvg =
          (prev1 + prev2 + prev3) /
          ((prev1 ? 1 : 0) + (prev2 ? 1 : 0) + (prev3 ? 1 : 0) || 1);

        if (current > historicalAvg * 1.15 && current > 50) {
          // 15% increase and significant amount
          const percentIncrease =
            ((current - historicalAvg) / historicalAvg) * 100;
          return {
            name: sub.name,
            current,
            avg: historicalAvg,
            percent: percentIncrease
          };
        }
        return null;
      })
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5);
  }, [subcategoryStats, currentMonth]);

  return (
    <div className="flex flex-col gap-10 p-8 mb-12 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-end pb-4 border-b-2 border-slate-900/5">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 p-4 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
            <Scissors className="text-white" size={16} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900">
              Waste Cutter
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">
              Optimization Lab / Expense Audit / 2026 Strategy
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ACTION CARDS / ALERTS */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 border-rose-500 bg-rose-50/30 overflow-hidden shadow-[8px_8px_0px_rgba(244,63,94,0.1)]">
            <CardHeader className="bg-rose-500 text-white p-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Spend-Creep Detected
                </CardTitle>
                <button
                  onClick={() => setShowCreepInfo(!showCreepInfo)}
                  className="p-1 hover:bg-rose-600 rounded-full transition-colors"
                >
                  <HelpCircle size={14} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence>
                {showCreepInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-4 bg-white border-2 border-rose-100 text-rose-900">
                      <p className="text-xs font-bold leading-relaxed">
                        This early warning system flags any expense that is{' '}
                        <span className="text-rose-600">15% higher</span> than
                        your usual 3-month average. It helps you catch
                        &quot;leaks&quot; early, such as price increases or
                        unmonitored spending spikes before they become your new
                        normal.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-4">
                {creepAlerts.length > 0 ? (
                  creepAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-1 border-b border-rose-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-rose-900 uppercase tracking-tight">
                          {alert.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-rose-600">
                          +{alert.percent.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-rose-700/60 font-medium">
                        Trending above ${formatCurrencyRounded(alert.avg)}/mo
                        average
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-rose-900/60 italic">
                    No significant spend-creepers identified this month.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-500 bg-amber-50/30 overflow-hidden shadow-[8px_8px_0px_rgba(245,158,11,0.1)]">
            <CardHeader className="bg-amber-500 text-white p-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Flame size={14} />
                  Potential &quot;Fat&quot; to Cut
                </CardTitle>
                <button
                  onClick={() => setShowFatInfo(!showFatInfo)}
                  className="p-1 hover:bg-amber-600 rounded-full transition-colors"
                >
                  <HelpCircle size={14} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence>
                {showFatInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-4 bg-white border-2 border-amber-100 text-amber-900">
                      <p className="text-xs font-bold leading-relaxed">
                        This identifies your top 3 biggest potential savings. It
                        compares your current spending rate against your full
                        year budget. If you&apos;re spending less than planned,
                        the remaining &quot;fat&quot; is highlighted here so you
                        can redirect it to your actual goals.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-4">
                {top10Variance.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 border-b border-amber-100 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm font-black text-amber-900 uppercase tracking-tight">
                      {item.name}
                    </span>
                    <p className="text-[10px] text-amber-700/70 font-medium">
                      Projected saving: $
                      {formatCurrencyRounded(
                        item.fullYearForecast -
                          item.ytdActual * (12 / currentMonth)
                      )}{' '}
                      by end of year.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-900 bg-slate-900 text-white shadow-[8px_8px_0px_rgba(15,23,42,0.1)]">
            <CardHeader className="p-4 border-b border-slate-800">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Target size={14} className="text-emerald-400" />
                  Audit Protocol #05
                </CardTitle>
                <button
                  onClick={() => setShowProtocolInfo(!showProtocolInfo)}
                  className="p-1 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <HelpCircle size={14} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <AnimatePresence>
                {showProtocolInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-4 bg-slate-800 border-2 border-slate-700 text-slate-200">
                      <p className="text-xs font-bold leading-relaxed">
                        Technical &quot;rules of thumb&quot; that ensure your
                        financial system is running efficiently. They are
                        designed to keep your wealth moving forward by spotting
                        common mistakes before they become expensive problems.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-xl font-black uppercase tracking-tighter italic">
                &quot;Small leaks sink great ships.&quot;
              </p>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Analyze the YTD Actuals vs Forecast. If reality is lower than
                the planned budget, consider permanently reducing the target in
                the Planner to increase your Wealth Velocity.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RANKINGS */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CURRENT MONTH */}
            <RankingsList
              title="Current Month"
              subtitle="Spikes & Anomalies"
              items={top10CurrentMonth}
              valueKey="currentMonthActual"
              color="rose"
            />

            {/* YTD ACTUALS */}
            <RankingsList
              title="Reality YTD"
              subtitle="The Real Villains"
              items={top10YTD}
              valueKey="ytdActual"
              color="slate"
            />

            {/* FORECAST */}
            <RankingsList
              title="2026 Forecast"
              subtitle="Budgeted Weight"
              items={top10Forecast}
              valueKey="fullYearForecast"
              color="emerald"
            />
          </div>

          <div className="border-2 border-slate-900/5 bg-slate-50/50 p-8">
            <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
              <div className="flex flex-1 justify-between items-start">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900">
                    Optimization Opportunity
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Forecast Variance Analysis
                  </p>
                </div>
                <button
                  onClick={() => setShowOptimizationInfo(!showOptimizationInfo)}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors mr-12 text-slate-400"
                >
                  <HelpCircle size={18} />
                </button>
              </div>
              {/* <div className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1">
                High Impact
              </div> */}
            </div>

            <AnimatePresence>
              {showOptimizationInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="p-6 bg-emerald-50 border-2 border-emerald-100 text-emerald-900 shadow-sm leading-relaxed">
                    <p className="text-sm font-bold">
                      This analysis projects your YTD actuals to a full 12-month
                      period and compares it to your 2026 Forecast.
                    </p>
                    <p className="text-sm font-semibold mt-2">
                      Actionable Insight: This is a list of the top 10
                      subcategories where you have a &quot;Saving
                      Gap&quot;—meaning you&apos;ve budgeted significantly more
                      than you are actually spending. These are prime candidates
                      for permanent budget cuts in the Planner!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
              <div className="space-y-6 border-r border-slate-100 pr-6">
                {top10Variance.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black font-mono text-slate-300 group-hover:text-amber-500 transition-colors">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs font-bold uppercase text-slate-600">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-400 uppercase">
                          Saving Gap
                        </span>
                        <span className="text-xs font-mono font-black text-emerald-600">
                          $
                          {formatCurrencyRounded(
                            item.fullYearForecast -
                              item.ytdActual * (12 / currentMonth)
                          )}
                        </span>
                      </div>
                      <ChevronRight
                        className="text-slate-200 group-hover:text-slate-900 transition-colors"
                        size={16}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pl-6">
                {top10Variance.slice(5, 10).map((item, idx) => (
                  <div
                    key={idx + 5}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black font-mono text-slate-300 group-hover:text-amber-500 transition-colors">
                        {(idx + 6).toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs font-bold uppercase text-slate-600">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-400 uppercase">
                          Saving Gap
                        </span>
                        <span className="text-xs font-mono font-black text-emerald-600">
                          $
                          {formatCurrencyRounded(
                            item.fullYearForecast -
                              item.ytdActual * (12 / currentMonth)
                          )}
                        </span>
                      </div>
                      <ChevronRight
                        className="text-slate-200 group-hover:text-slate-900 transition-colors"
                        size={16}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankingsList({
  title,
  subtitle,
  items,
  valueKey,
  color
}: {
  title: string;
  subtitle: string;
  items: { name: string; [key: string]: unknown }[];
  valueKey: string;
  color: 'rose' | 'slate' | 'emerald';
}) {
  const [showInfo, setShowInfo] = React.useState(false);
  const colorMap = {
    rose: {
      border: 'border-rose-100',
      text: 'text-rose-900',
      num: 'text-rose-500',
      bg: 'bg-rose-500'
    },
    slate: {
      border: 'border-slate-100',
      text: 'text-slate-900',
      num: 'text-slate-500',
      bg: 'bg-slate-900'
    },
    emerald: {
      border: 'border-emerald-100',
      text: 'text-emerald-900',
      num: 'text-emerald-500',
      bg: 'bg-emerald-500'
    }
  }[color];

  return (
    <div
      className={`border-2 border-slate-900/5 bg-white p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.02)]`}
    >
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900">
            {title}
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-300"
        >
          <HelpCircle size={14} />
        </button>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div
              className={`p-4 border-2 ${colorMap.border} ${colorMap.num} bg-slate-50 text-[11px] font-bold leading-relaxed`}
            >
              These are the categories taking the biggest bite out of your
              budget. We show them for three perspectives: what&apos;s happening
              right now (Current), total damage so far (Reality), and what you
              planned (Forecast) so you can see if your targets are realistic.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black font-mono text-slate-300">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-xs font-bold uppercase tracking-tight truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-mono font-black text-slate-900">
                ${formatCurrencyRounded(Number(item[valueKey]) || 0)}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((Number(item[valueKey]) || 0) / (Number(items[0][valueKey]) || 1)) * 100}%`
                }}
                className={`h-full ${colorMap.bg}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
