'use client';

import { Lock, Shuffle, Info } from 'lucide-react';
import { formatCurrencyRounded } from '@/lib/utils';
import { tagClass } from '@/lib/classes';

export function FixedVariableTracker({
  subcategories
}: {
  subcategories: any[];
}) {
  const currentMonth = new Date().getMonth() + 1;

  // 1. Group items across the FULL YEAR
  const yearItems = subcategories.filter(
    (s) => !s.category?.isIncome && !s.category?.isSavings
  );

  const fixedTotal = yearItems
    .filter((s) => s.category?.isFixed)
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const variableTotal = yearItems
    .filter((s) => !s.category?.isFixed)
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const total = fixedTotal + variableTotal;
  const fixedPercent = total > 0 ? (fixedTotal / total) * 100 : 0;

  return (
    <div className="relative flex flex-col justify-between w-full h-full">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Annual Strategic Commitment
        </h4>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black">
            {fixedPercent.toFixed(0)}%
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Fixed Costs (2026)
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* Simple Bar Breakdown */}
        <div className="flex w-full h-2 rounded-none overflow-hidden bg-slate-800">
          <div
            className="h-full bg-white transition-all duration-1000"
            style={{ width: `${fixedPercent}%` }}
          />
          <div
            className="h-full bg-slate-600 transition-all duration-1000"
            style={{ width: `${100 - fixedPercent}%` }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1 font-black uppercase tracking-tighter text-white">
              <Lock className="w-3 h-3" /> Fixed: $
              {formatCurrencyRounded(fixedTotal)}
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1 font-bold italic text-slate-400 uppercase tracking-tighter">
              <Shuffle className="w-3 h-3" /> Variable: $
              {formatCurrencyRounded(variableTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
