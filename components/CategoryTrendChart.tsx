'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { months, getColorCode } from '@/lib/utils';
import { SubcategoryWithCategory } from '@/lib/types';

interface CategoryTrendChartProps {
  subcategories: SubcategoryWithCategory[];
}

export function CategoryTrendChart({ subcategories }: CategoryTrendChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const currentYear = 2026;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  // 1. Identify all unique expense/savings categories
  const categoriesMap = new Map<string, string>();
  subcategories.forEach((s) => {
    if (!s.category?.isIncome && s.category?.name) {
      categoriesMap.set(s.category.name, s.category.color);
    }
  });

  const categoryNames = Array.from(categoriesMap.keys());

  // 2. Process data for each month
  const chartData = months.map((monthName, index) => {
    const monthIndex = index + 1;
    const dataPoint: Record<string, string | number> = {
      month: monthName.substring(0, 3)
    };

    categoryNames.forEach((catName) => {
      // Calculate total actual for this category in this month
      const totalActual = subcategories
        .filter(
          (s) =>
            s.month === monthIndex &&
            s.year === currentYear &&
            s.category?.name === catName
        )
        .reduce((sum, s) => {
          const txSum = (s.transactions || []).reduce(
            (tSum: number, tx: { amount?: number | string }) => {
              const amount =
                typeof tx.amount === 'string'
                  ? parseFloat(tx.amount)
                  : tx.amount || 0;
              return tSum + amount;
            },
            0
          );
          return sum + txSum;
        }, 0);

      // Only add data if it's past/current month OR has data
      if (monthIndex <= currentMonth || totalActual > 0) {
        dataPoint[catName] = totalActual;
      }
    });

    return dataPoint;
  });

  if (!mounted)
    return <div className="w-full h-[400px] bg-slate-50 animate-pulse" />;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
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
          <Legend
            verticalAlign="top"
            align="right"
            iconType="rect"
            wrapperStyle={{
              fontSize: '12px',
              fontWeight: 'black',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              paddingBottom: '20px'
            }}
          />
          {categoryNames.map((catName) => (
            <Line
              key={catName}
              type="monotone"
              dataKey={catName}
              stroke={
                getColorCode(categoriesMap.get(catName) || 'GRAY')
                  .backgroundColor
              }
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
