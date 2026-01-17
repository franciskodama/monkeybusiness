'use client';

import { PiggyBank, ArrowRight, Target } from 'lucide-react';
import { formatCurrencyRounded } from '@/lib/utils';
import { tagClass } from '@/lib/classes';

export function SavingsTracker({ subcategories }: { subcategories: any[] }) {
  const currentMonth = new Date().getMonth() + 1;

  // 1. Filter savings categories
  const savingsItems = subcategories.filter(
    (s) => s.month === currentMonth && s.category?.isSavings
  );

  const targetSavings = savingsItems.reduce(
    (sum, s) => sum + (s.amount || 0),
    0
  );
  const actualSavings = savingsItems.reduce((sum, s) => {
    const txTotal = (s.transactions || []).reduce(
      (tSum: number, tx: any) => tSum + tx.amount,
      0
    );
    return sum + txTotal;
  }, 0);

  const progress =
    targetSavings > 0 ? (actualSavings / targetSavings) * 100 : 0;

  return (
    <div className="relative flex flex-col justify-between w-full h-full">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Family Savings Goal
        </h4>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black">
            ${formatCurrencyRounded(actualSavings)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Saved of ${formatCurrencyRounded(targetSavings)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-none relative overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center bg-white p-2 border border-slate-200">
          <div className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Target className="w-3 h-3" />
            {progress >= 100
              ? 'Goal Reached'
              : `${progress.toFixed(0)}% Complete`}
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase italic">
            {targetSavings - actualSavings > 0
              ? `$${formatCurrencyRounded(targetSavings - actualSavings)} to go`
              : 'Keep it up!'}
          </p>
        </div>
      </div>

      <div className={tagClass}>
        <span className="mr-2">💰</span>Savings
      </div>
    </div>
  );
}
