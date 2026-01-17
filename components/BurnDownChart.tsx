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
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const today = now.getDate();

  // 1. Calculate Total Monthly Budget (Target)
  const totalPlanned = subcategories
    .filter((s) => s.month === currentMonth && !s.category?.isIncome)
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  // 2. Flatten and group transactions by day
  const allTransactions = subcategories
    .filter((s) => s.month === currentMonth)
    .flatMap((s) => s.transactions || []);

  const dailySpend: Record<number, number> = {};
  allTransactions.forEach((tx) => {
    const day = new Date(tx.date).getDate();
    dailySpend[day] = (dailySpend[day] || 0) + tx.amount;
  });

  // 3. Build cumulative data array
  let runningTotal = 0;
  const chartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;

    // Only show actual data up until today
    if (day <= today) {
      runningTotal += dailySpend[day] || 0;
    }

    return {
      day,
      // The "Actual" line
      actual: day <= today ? runningTotal : null,
      // The "Perfect" linear line
      planned: (totalPlanned / daysInMonth) * day
    };
  });

  return (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748b' }}
          interval={2}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#94a3b8' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '0px',
            border: '1px solid #cbd5e1',
            fontSize: '10px',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}
          cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
        />
        {/* Planned Path: Dashed and light */}
        <Line
          type="linear"
          dataKey="planned"
          stroke="#cbd5e1"
          strokeDasharray="4 4"
          dot={false}
          strokeWidth={1}
          name="Planned"
          connectNulls
        />
        {/* Actual Path: Bold, Black, and Step-style */}
        <Line
          type="stepAfter"
          dataKey="actual"
          stroke="#0f172a"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: '#0f172a' }}
          name="Actual"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
