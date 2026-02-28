'use client';

import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { months } from '@/lib/utils';

interface AnnualStrategicChartProps {
  subcategories: any[];
}

export function AnnualStrategicChart({
  subcategories
}: AnnualStrategicChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  // Process data for 12 months
  const chartData = months.map((monthName, index) => {
    const monthIndex = index + 1;
    const monthSubs = subcategories.filter((s) => s.month === monthIndex);

    // Calculate totals for this month
    let targetContribution = 0;
    let targetExpenses = 0;
    let targetSavings = 0;

    let actualContribution = 0;
    let actualExpenses = 0;
    let actualSavings = 0;

    monthSubs.forEach((sub) => {
      // 1. PROJECTED / PLANNED totals (for the whole year)
      // We count all 'isIncome' as target contribution for now as subcategories don't own a source
      if (sub.category?.isIncome) targetContribution += sub.amount || 0;
      else if (sub.category?.isSavings) targetSavings += sub.amount || 0;
      else targetExpenses += sub.amount || 0;

      // 2. ACTUAL totals (Reality - only for past/current)
      if (monthIndex <= currentMonth) {
        const txs = sub.transactions || [];
        const actualAmount = txs.reduce(
          (sum: number, tx: any) => sum + (tx.amount || 0),
          0
        );

        if (sub.category?.isSavings) actualSavings += actualAmount;
        else if (!sub.category?.isIncome) actualExpenses += actualAmount;

        // Contribution: sum of transactions from His and Her sources
        actualContribution += txs
          .filter((tx: any) => tx.source === 'His' || tx.source === 'Her')
          .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
      }
    });

    const hasActualData = monthIndex <= currentMonth;

    return {
      month: monthName,
      // Target values (The Projection line)
      targetContribution,
      targetExpenses,
      targetSavings,
      // Actual values (The Reality bars)
      contribution: hasActualData ? actualContribution : null,
      expenses: hasActualData ? actualExpenses : null,
      savings: hasActualData ? actualSavings : null
    };
  });

  if (!mounted)
    return <div className="w-full h-[400px] bg-slate-50 animate-pulse" />;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          barGap={0}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 'black', fill: '#64748b' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{
              borderRadius: '0px',
              border: '2px solid #0f172a',
              fontSize: '10px',
              textTransform: 'uppercase',
              fontWeight: 'black',
              padding: '12px',
              boxShadow: '4px 4px 0px rgba(0,0,0,0.1)'
            }}
          />

          {/* TARGETS (PROJECTION) - GHOST BARS */}
          <Bar
            dataKey="targetContribution"
            fill="#10b981"
            opacity={0.15}
            name="Target Contribution"
            barSize={20}
            xAxisId={0}
          />
          <Bar
            dataKey="targetExpenses"
            fill="#ef4444"
            opacity={0.15}
            name="Target Expenses"
            barSize={20}
            xAxisId={0}
          />
          <Bar
            dataKey="targetSavings"
            fill="#3b82f6"
            opacity={0.15}
            name="Target Savings"
            barSize={20}
            xAxisId={0}
          />

          {/* REALITY (ACTUAL) - SOLID BARS */}
          <Bar
            dataKey="contribution"
            fill="#10b981"
            name="Actual Contribution"
            radius={[0, 0, 0, 0]}
            barSize={20}
          />
          <Bar
            dataKey="expenses"
            fill="#ef4444"
            name="Actual Expenses"
            radius={[0, 0, 0, 0]}
            barSize={20}
          />
          <Bar
            dataKey="savings"
            fill="#3b82f6"
            name="Actual Savings"
            radius={[0, 0, 0, 0]}
            barSize={20}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
