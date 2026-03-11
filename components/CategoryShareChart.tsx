'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrencyRounded, getColorCode } from '@/lib/utils';
import { SubcategoryWithCategory } from '@/lib/types';

export function CategoryShareChart({
  subcategories,
  showList = false,
  year
}: {
  subcategories: SubcategoryWithCategory[];
  showList?: boolean;
  year: number;
}) {
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
  const currentYear = year;

  // 1. Group transactions by category (EXCLUDING income and savings categories)
  const categoryTotals: Record<string, { amount: number; color: string }> = {};

  subcategories.forEach((s) => {
    // Include all categories except Income (Savings are an allocation too)
    if (
      s.year === currentYear &&
      s.month <= currentMonth &&
      !s.category?.isIncome
    ) {
      const categoryName = s.category?.name || 'Uncategorized';
      const categoryColor = s.category?.color || 'GRAY';

      const actualAmount = (s.transactions || []).reduce(
        (sum: number, tx: { amount?: number | string }) => {
          const amount =
            typeof tx.amount === 'string'
              ? parseFloat(tx.amount)
              : tx.amount || 0;
          return sum + amount;
        },
        0
      );

      if (actualAmount > 0) {
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = { amount: 0, color: categoryColor };
        }
        categoryTotals[categoryName].amount += actualAmount;
      }
    }
  });

  const rawData = Object.entries(categoryTotals)
    .map(([name, data]) => ({
      name,
      value: data.amount,
      color: getColorCode(data.color).backgroundColor
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalAmount = rawData.reduce((sum, d) => sum + d.value, 0);

  const data = rawData.map((d) => ({
    ...d,
    percentage: totalAmount > 0 ? (d.value / totalAmount) * 100 : 0
  }));

  if (!mounted)
    return <div className="w-full h-[250px] animate-pulse bg-slate-800/20" />;

  if (data.length === 0)
    return (
      <div className="w-full h-[250px] flex items-center justify-center border-2 border-dashed border-slate-800/50 mt-4">
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
          Awaiting Transactions
        </p>
      </div>
    );

  return (
    <div className="w-full">
      <div className="w-full h-[250px] min-h-[250px] mt-4 overflow-hidden relative group">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border-2 border-slate-900 p-3 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] text-slate-900">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1 border-b border-slate-100 pb-1">
                        {data.name}
                      </p>
                      <div className="flex flex-col">
                        <p className="text-xs font-mono font-black">
                          ${formatCurrencyRounded(data.value)}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                          {data.percentage.toFixed(1)}% OF TOTAL
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Total
          </span>
          <span className="text-xl font-mono font-black text-slate-900">
            ${formatCurrencyRounded(totalAmount)}
          </span>
        </div>

        {/* Mini Legend for largest slices (Only if list is hidden) */}
        {!showList && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 pb-2">
            {data.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Category Breakdown List */}
      {showList && (
        <div className="mt-8 space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-6 font-mono border-b border-slate-100 pb-2">
            Detailed Breakdown
          </h4>
          {data.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono font-black text-slate-900">
                  ${formatCurrencyRounded(item.value)}
                </span>
                <span className="text-[9px] font-black text-slate-400 w-10 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
