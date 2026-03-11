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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { ColorEnum } from '@prisma/client';

interface SubcategoryTrendChartProps {
  subcategories: SubcategoryWithCategory[];
  year: number;
}

export function SubcategoryTrendChart({
  subcategories,
  year
}: SubcategoryTrendChartProps) {
  const [mounted, setMounted] = useState(false);

  // 1. Identify all unique expense/savings categories
  const categoriesMap = new Map<string, { color: ColorEnum; id: string }>();
  subcategories.forEach((s) => {
    if (!s.category?.isIncome && s.category?.name) {
      categoriesMap.set(s.category.name, {
        color: s.category.color as ColorEnum,
        id: s.category.id
      });
    }
  });

  const categoryNames = Array.from(categoriesMap.keys()).sort();

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return categoryNames.length > 0 ? categoryNames[0] : '';
  });

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

  // 2. Filter subcategories for the selected category
  const filteredSubcategories = subcategories.filter(
    (s) => s.category?.name === selectedCategory
  );

  // 3. Identify unique subcategory names in this category
  const subcategoryNames = Array.from(
    new Set(filteredSubcategories.map((s) => s.name))
  ).sort();

  // 4. Process data for each month
  const chartData = months.map((monthName, index) => {
    const monthIndex = index + 1;
    const dataPoint: Record<string, string | number> = {
      month: monthName.substring(0, 3)
    };

    subcategoryNames.forEach((subName) => {
      // Calculate total actual for this subcategory in this month
      const totalActual = filteredSubcategories
        .filter(
          (s) =>
            s.month === monthIndex &&
            s.year === currentYear &&
            s.name === subName
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
        dataPoint[subName] = totalActual;
      }
    });

    return dataPoint;
  });

  if (!mounted)
    return <div className="w-full h-[400px] bg-slate-50 animate-pulse" />;

  // Generate colors for subcategories
  const categoryColorInfo = categoriesMap.get(selectedCategory);
  const baseColor = categoryColorInfo
    ? getColorCode(categoryColorInfo.color).backgroundColor
    : '#64748b';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Select Category
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[240px] border-2 border-slate-900 rounded-none h-10 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(0,0,0,0.1)] focus:ring-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
              {categoryNames.map((name) => (
                <SelectItem
                  key={name}
                  value={name}
                  className="font-bold uppercase text-xs focus:bg-slate-900 focus:text-white rounded-none cursor-pointer"
                >
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
            {subcategoryNames.map((subName, index) => {
              // Create different shades or use a predefined palette
              const colors = [
                '#0f172a',
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6',
                '#ec4899',
                '#06b6d4',
                '#84cc16',
                '#f97316'
              ];
              const strokeColor =
                index === 0 ? baseColor : colors[index % colors.length];

              return (
                <Line
                  key={subName}
                  type="monotone"
                  dataKey={subName}
                  stroke={strokeColor}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
