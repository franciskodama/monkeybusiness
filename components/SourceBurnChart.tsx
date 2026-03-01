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

export function SourceBurnChart({ subcategories }: { subcategories: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    .flatMap((s) => s.transactions || []);

  // 2. Calculate totals per source (Accumulated YTD)
  const sourceData: Record<string, number> = {
    FAMILY: 0,
    HIS: 0,
    HER: 0
  };

  transactions.forEach((tx) => {
    if (tx.amount > 0) {
      const source = tx.source?.toUpperCase();
      if (source && sourceData.hasOwnProperty(source)) {
        sourceData[source] += tx.amount;
      }
    }
  });

  const total = Object.values(sourceData).reduce((sum, val) => sum + val, 0);

  // 3. Transform to chart data with percentages
  const data = Object.entries(sourceData)
    .map(([name, value]) => ({
      name: name,
      value: value,
      percentage: total > 0 ? (value / total) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  const COLOR_MAP: Record<string, string> = {
    FAMILY: '#EF4444',
    HIS: '#22D3EE',
    HER: '#F97316'
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
                fill={COLOR_MAP[entry.name] || '#64748B'}
              />
            ))}
            <LabelList
              dataKey="percentage"
              position="right"
              formatter={(val: any) => `${Number(val).toFixed(0)}%`}
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
