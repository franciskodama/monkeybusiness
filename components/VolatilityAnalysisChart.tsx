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

  // 2. Group data by Subcategory
  const subcategoryDataMap: Record<
    string,
    { totals: number[]; color: string; parentCategory: string }
  > = {};

  subcategories.forEach((s) => {
    if (s.year === targetYear && !s.category?.isIncome && s.name) {
      const subName = s.name;
      if (!subcategoryDataMap[subName]) {
        subcategoryDataMap[subName] = {
          totals: new Array(12).fill(0),
          color: s.category?.color || 'GRAY',
          parentCategory: s.category?.name || 'Uncategorized'
        };
      }

      const txSum = (s.transactions || []).reduce(
        (sum: number, tx: any) => sum + (tx.amount || 0),
        0
      );
      subcategoryDataMap[subName].totals[s.month - 1] += txSum;
    }
  });

  // 3. Calculate metrics
  const now = new Date();
  const currentFullYear = now.getFullYear();
  const currentMonthIdx = now.getMonth(); // 0-indexed (2 for March)

  // Use closed months only for current year behavior (e.g., if it's March, show Jan-Feb)
  let analysisMonths = 12;
  let dynamicLabel = `Jan - Dec ${targetYear}`;

  if (targetYear === currentFullYear) {
    analysisMonths = currentMonthIdx > 0 ? currentMonthIdx : 1;
    const monthNamesShort = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    dynamicLabel =
      currentMonthIdx > 0
        ? `Analyzing Closed Behavior: Jan - ${monthNamesShort[currentMonthIdx - 1]}`
        : `Analyzing Current Window: Jan`;
  }

  const chartData = Object.entries(subcategoryDataMap)
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
        parentCategory: data.parentCategory,
        x: index + 1,
        y: parseFloat(volatility.toFixed(1)),
        z: mean,
        color: getColorCode(data.color).backgroundColor,
        average: mean
      };
    })
    .filter((d) => d.average > 1)
    .sort((a, b) => b.y - a.y);

  // Helper to ensure colors are visible on dark background
  const getVisibleColor = (hex: string) => {
    // If it's too dark (like black or dark brown), we'll lighten it for the index
    if (hex === '#000000') return '#475569'; // Slate 600
    if (hex === '#A52A2A') return '#C2410C'; // Brighter Orange/Brown
    return hex;
  };

  if (!mounted)
    return <div className="w-full h-[350px] bg-slate-900/10 animate-pulse" />;

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center border-2 border-dashed border-slate-800/30">
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
          Awaiting Subcategory Data
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
            stroke="#f1f5f9"
            opacity={0.1}
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
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
            domain={[0, 'auto']}
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[80, 2000]}
            name="Avg Monthly Spend"
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900 border-2 border-slate-700 p-4 shadow-xl text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-emerald-400">
                      {data.name}
                    </p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-3 border-b border-white/10 pb-2">
                      {data.parentCategory}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between gap-8">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          Avg Spend /Mo
                        </span>
                        <span className="text-xs font-mono font-black border-b border-slate-800">
                          ${formatCurrencyRounded(data.average)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          Stability Index
                        </span>
                        <span className="text-xs font-mono font-black text-rose-400">
                          {data.y}%
                        </span>
                      </div>
                      <p className="text-[8px] text-slate-500 italic mt-2 leading-tight">
                        {data.y > 60
                          ? 'High variance: Volatile spending behavior detected.'
                          : 'Stable: This behavior follows a consistent pattern.'}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter name="Subcategories" data={chartData}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getVisibleColor(entry.color)}
                fillOpacity={1}
                stroke="#ffffff"
                strokeWidth={1}
                style={{
                  filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.15))'
                }}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 bg-slate-900 px-3 py-1.5 border border-slate-800 shadow-xl">
          {dynamicLabel}
        </p>
      </div>
    </div>
  );
}
