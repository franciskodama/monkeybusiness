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

import { SubcategoryWithCategory } from '@/lib/types';

interface AnnualStrategicChartProps {
  subcategories: SubcategoryWithCategory[];
  year: number;
}

export function AnnualStrategicChart({
  subcategories,
  year
}: AnnualStrategicChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const today = new Date();
  const currentMonth = year < today.getFullYear() 
    ? 12 
    : year > today.getFullYear() 
      ? 0 
      : today.getMonth() + 1;

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
        const actualAmount = txs.reduce((sum: number, tx) => {
          const amount =
            typeof tx.amount === 'string'
              ? parseFloat(tx.amount)
              : tx.amount || 0;
          return sum + amount;
        }, 0);

        if (sub.category?.isSavings) actualSavings += actualAmount;
        else if (!sub.category?.isIncome) actualExpenses += actualAmount;

        // Contribution: sum of transactions from PERSON1 and PERSON2 sources
        actualContribution += txs
          .filter((tx) => {
            const s = tx.source?.toUpperCase();
            return s === 'PERSON1' || s === 'PERSON2';
          })
          .reduce((sum: number, tx) => {
            const amount =
              typeof tx.amount === 'string'
                ? parseFloat(tx.amount)
                : tx.amount || 0;
            return sum + amount;
          }, 0);
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
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
          barGap={2}
          barCategoryGap="15%"
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
            interval={0}
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
            barSize={10}
          />
          <Bar
            dataKey="contribution"
            fill="#10b981"
            name="Actual Contribution"
            barSize={10}
          />

          <Bar
            dataKey="targetExpenses"
            fill="#ef4444"
            opacity={0.15}
            name="Target Expenses"
            barSize={10}
          />
          <Bar
            dataKey="expenses"
            fill="#ef4444"
            name="Actual Expenses"
            barSize={10}
          />

          <Bar
            dataKey="targetSavings"
            fill="#3b82f6"
            opacity={0.15}
            name="Target Savings"
            barSize={10}
          />
          <Bar
            dataKey="savings"
            fill="#3b82f6"
            name="Actual Savings"
            barSize={10}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
