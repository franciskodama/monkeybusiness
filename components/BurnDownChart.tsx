// app/(dashboard)/_components/BurnDownChart.tsx
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function BurnDownChart({ subcategories }: { subcategories: any[] }) {
  // 1. Data Processing: Calculate cumulative spend per day
  const daysInMonth = new Date(2026, new Date().getMonth() + 1, 0).getDate();
  const currentMonth = new Date().getMonth() + 1;

  const totalBudget = subcategories
    .filter(
      (s) =>
        s.month === currentMonth && s.category.name.toLowerCase() !== 'income'
    )
    .reduce((sum, s) => sum + s.amount, 0);

  const data = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    // ... Logic to sum transactions up to this day
    return {
      day,
      actual: 400 + i * 20,
      planned: (totalBudget / daysInMonth) * day
    };
  });

  return (
    <ResponsiveContainer width="100%" height="85%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fontWeight: 'bold' }}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            borderRadius: '0px',
            border: '1px solid #cbd5e1',
            fontSize: '10px'
          }}
        />
        {/* Planned Path (Dashed) */}
        <Line
          type="linear"
          dataKey="planned"
          stroke="#cbd5e1"
          strokeDasharray="5 5"
          dot={false}
          strokeWidth={1}
        />
        {/* Actual Spend (Solid) */}
        <Line
          type="stepAfter"
          dataKey="actual"
          stroke="#0f172a"
          strokeWidth={2}
          dot={{ r: 0 }}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
