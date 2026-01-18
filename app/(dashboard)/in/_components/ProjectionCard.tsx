'use client';

import { Rocket, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { formatCurrencyRounded } from '@/lib/utils';
import { tagClass } from '@/lib/classes';

export function ProjectionCard({ subcategories }: { subcategories: any[] }) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const today = now.getDate();

  // 1. Calculate Total Monthly Budget
  const totalTarget = subcategories
    .filter((s) => s.month === currentMonth && !s.category?.isIncome)
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  // 2. Calculate Actual Spending (Excluding Income)
  const spentSoFar = subcategories
    .filter((s) => s.month === currentMonth && !s.category?.isIncome)
    .flatMap((s) => s.transactions || [])
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 3. EOM Projection
  const projectedEOM = today > 0 ? (spentSoFar / today) * daysInMonth : 0;

  // 4. Velocity
  // How much we SHOULD have spent by today if linear
  const targetToDate = (totalTarget / daysInMonth) * today;
  const velocity = targetToDate > 0 ? spentSoFar / targetToDate : 0;

  let status = {
    label: 'On Track',
    color: 'text-emerald-600',
    icon: <CheckCircle2 className="w-4 h-4" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100'
  };

  if (velocity > 1.1) {
    status = {
      label: 'High Velocity',
      color: 'text-rose-600',
      icon: <Rocket className="w-4 h-4" />,
      bg: 'bg-rose-50',
      border: 'border-rose-100'
    };
  } else if (velocity < 0.9) {
    status = {
      label: 'Under Speed',
      color: 'text-blue-600',
      icon: <TrendingUp className="w-4 h-4" />,
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    };
  }

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          EOM Projection
        </h4>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black">
            ${formatCurrencyRounded(projectedEOM)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Est. Total
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-none relative">
          {/* Target mark for today */}
          <div
            className="absolute top-0 h-full w-0.5 bg-slate-400 z-10"
            style={{ left: `${(today / daysInMonth) * 100}%` }}
          />
          {/* Actual spend bar */}
          <div
            className={`h-full transition-all duration-1000 ${velocity > 1 ? 'bg-rose-500' : 'bg-primary'}`}
            style={{
              width: `${Math.min((spentSoFar / totalTarget) * 100, 100)}%`
            }}
          />
        </div>

        <div className="flex justify-between items-center bg-white p-2 border border-slate-200">
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${status.bg} ${status.color} border ${status.border}`}
          >
            {status.icon}
            {status.label}
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            {(velocity * 100).toFixed(0)}% Speed
          </span>
        </div>
      </div>

      <div className={tagClass}>
        <span className="mr-2">🚀</span>Projection
      </div>
    </div>
  );
}
