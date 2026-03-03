'use client';

import React, { useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getColorCode, formatCurrencyRounded } from '@/lib/utils';

interface VolatilityAnalysisChartProps {
  subcategories: any[];
}

export function VolatilityAnalysisChart({
  subcategories
}: VolatilityAnalysisChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Identify years and the latest year with data
  const years = Array.from(new Set(subcategories.map((s) => s.year))).sort(
    (a, b) => b - a
  );
  const targetYear = years[0] || 2026;

  // 2. Group data by category
  const categoryDataMap: Record<string, { totals: number[]; color: string }> =
    {};

  subcategories.forEach((s) => {
    if (s.year === targetYear && !s.category?.isIncome && s.category?.name) {
      const catName = s.category.name;
      if (!categoryDataMap[catName]) {
        categoryDataMap[catName] = {
          totals: new Array(12).fill(0), // Always analyze full 12 month cycle
          color: s.category.color
        };
      }

      const txSum = (s.transactions || []).reduce(
        (sum: number, tx: any) => sum + (tx.amount || 0),
        0
      );
      categoryDataMap[catName].totals[s.month - 1] += txSum;
    }
  });

  // 3. Calculate metrics (Volatility & Volume)
  // We analyze the window up to the current month of the target year or the full year if it's a past year
  const analysisMonths =
    targetYear === new Date().getFullYear() ? new Date().getMonth() + 1 : 12;

  const chartData = Object.entries(categoryDataMap)
    .map(([name, data], index) => {
      const relevantTotals = data.totals.slice(0, analysisMonths);
      const sum = relevantTotals.reduce((a, b) => a + b, 0);
      const mean = sum / analysisMonths;

      // Variance and Standard Deviation
      const variance =
        relevantTotals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
        analysisMonths;
      const stdDev = Math.sqrt(variance);

      // Volatility (Coefficient of Variation) as a percentage
      const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;

      return {
        name,
        x: index + 1,
        y: parseFloat(volatility.toFixed(1)),
        z: mean,
        color: getColorCode(data.color).backgroundColor,
        average: mean
      };
    })
    .filter((d) => d.average > 0)
    .sort((a, b) => b.y - a.y);

  if (!mounted)
    return <div className="w-full h-[350px] bg-slate-900/10 animate-pulse" />;

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center border-2 border-dashed border-slate-800/30">
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
          Awaiting Behavioral Data
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 40, bottom: 60, left: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#334155"
            opacity={0.3}
          />
          <XAxis
            type="number"
            dataKey="x"
            hide
            domain={[0, chartData.length + 1]}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Volatility"
            unit="%"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
            domain={[0, 'auto']}
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[100, 2000]}
            name="Avg Monthly Spend"
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900 border-2 border-slate-700 p-4 shadow-xl text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 border-b border-white/10 pb-2 text-emerald-400">
                      {data.name}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between gap-8">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          Avg Spend /Mo
                        </span>
                        <span className="text-xs font-mono font-black">
                          ${formatCurrencyRounded(data.average)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          Volatility Index
                        </span>
                        <span className="text-xs font-mono font-black text-rose-400">
                          {data.y}%
                        </span>
                      </div>
                      <p className="text-[8px] text-slate-500 italic mt-2 leading-tight">
                        {data.y > 50
                          ? 'High variance: Spending behavior is unpredictable.'
                          : 'Stable category: Behavior is consistent.'}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter name="Categories" data={chartData}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                fillOpacity={0.8}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Label overlays for specific high volatility or high volume bubbles */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-4 px-4 pb-2">
        {chartData.slice(0, 5).map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 opacity-60">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-[8px] font-bold uppercase text-slate-500 tracking-tighter">
              {d.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
