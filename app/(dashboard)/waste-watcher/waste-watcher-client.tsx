'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Scissors,
  TrendingUp,
  AlertTriangle,
  Target,
  Flame,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { formatCurrencyRounded } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WasteWatcherClientProps {
  user: any;
  subcategories: any[];
  householdId: string;
}

export default function WasteWatcherClient({
  user,
  subcategories,
  householdId
}: WasteWatcherClientProps) {
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

    subcategories.forEach((sub: any) => {
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
        (sum: number, tx: any) => sum + (tx.amount || 0),
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
      .filter(Boolean)
      .sort((a: any, b: any) => b.percent - a.percent)
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
              Waste Watcher
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
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} />
                Spend-Creep Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {creepAlerts.length > 0 ? (
                  creepAlerts.map((alert: any, idx) => (
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
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Flame size={14} />
                Potential "Fat" to Cut
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Target size={14} className="text-emerald-400" />
                Audit Protocol #05
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <p className="text-xl font-black uppercase tracking-tighter italic">
                "Small leaks sink great ships."
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
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900">
                  Optimization Opportunity
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Forecast Variance Analysis
                </p>
              </div>
              <div className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1">
                High Impact
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {top10Variance.slice(0, 10).map((item, idx) => (
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
  items: any[];
  valueKey: string;
  color: 'rose' | 'slate' | 'emerald';
}) {
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
      <div className="mb-6">
        <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900">
          {title}
        </h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          {subtitle}
        </p>
      </div>

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
                ${formatCurrencyRounded(item[valueKey])}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(item[valueKey] / (items[0][valueKey] || 1)) * 100}%`
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
