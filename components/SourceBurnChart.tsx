'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LabelList
} from 'recharts';
import { formatCurrencyRounded } from '@/lib/utils';
import { TransactionInput, SubcategoryWithCategory } from '@/lib/types';

export function SourceBurnChart({
  subcategories,
  person1Name = 'Partner 1',
  person2Name = 'Partner 2'
}: {
  subcategories: SubcategoryWithCategory[];
  person1Name?: string;
  person2Name?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wrap In RAF to avoid "setState synchronously in effect" warning during build/hydration
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // 1. Extract transactions for the YEAR-TO-DATE (EXCLUDING income categories)
  const transactions = subcategories
    .filter(
      (s) =>
        s.year === currentYear &&
        s.month <= currentMonth &&
        !s.category?.isIncome
    )
    .flatMap((s) => s.transactions || []) as TransactionInput[];

  // 2. Calculate totals per source (Accumulated YTD)
  const sourceData: Record<string, number> = {
    FAMILY: 0,
    PERSON1: 0,
    PERSON2: 0
  };

  const sourceLabels: Record<string, string> = {
    FAMILY: 'FAMILY',
    PERSON1: person1Name.toUpperCase(),
    PERSON2: person2Name.toUpperCase()
  };

  transactions.forEach((tx) => {
    if (tx.amount) {
      const amount =
        typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      if (amount > 0) {
        const source = tx.source?.toUpperCase();

        if (source && sourceData.hasOwnProperty(source)) {
          sourceData[source] += amount;
        }
      }
    }
  });

  const total = Object.values(sourceData).reduce((sum, val) => sum + val, 0);

  // 3. Transform to chart data with percentages
  const data = Object.entries(sourceData)
    .map(([name, value]) => ({
      name: sourceLabels[name] || name,
      value: value,
      rawName: name,
      percentage: total > 0 ? (value / total) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  const COLOR_MAP: Record<string, string> = {
    FAMILY: '#EF4444',
    PERSON1: '#22D3EE',
    PERSON2: '#F97316'
  };

  if (!mounted) return <div className="w-full h-[250px]" />;

  return (
    <div className="w-full h-[250px] min-h-[250px] mt-4 overflow-hidden">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            width={70}
            tick={{
              fontSize: 10,
              fontWeight: 900,
              fill: '#94A3B8',
              letterSpacing: '0.05em'
            }}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-slate-200 p-2 shadow-sm rounded-none text-slate-900">
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      {data.name}
                    </p>
                    <p className="text-[10px] font-mono">
                      ${formatCurrencyRounded(data.value)} (
                      {data.percentage.toFixed(1)}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="percentage"
            radius={0}
            barSize={24}
            background={{ fill: '#1e293b' }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLOR_MAP[entry.rawName] || '#64748B'}
              />
            ))}
            <LabelList
              dataKey="percentage"
              position="right"
              formatter={(val: string | number | undefined | null | boolean) =>
                `${Number(val ?? 0).toFixed(0)}%`
              }
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                fill: '#FFFFFF',
                fontFamily: 'monospace',
                textShadow: '0px 0px 2px rgba(0,0,0,0.5)'
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
