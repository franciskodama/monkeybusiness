'use client';

import { AlertCircle, ArrowUpRight, MinusCircle } from 'lucide-react';
import { formatCurrencyRounded } from '@/lib/utils';

export function OutlierAlerts({ subcategories }: { subcategories: any[] }) {
  const currentMonth = new Date().getMonth() + 1;

  // 1. Calculate Average Spending per Subcategory (excluding current month)
  const historicalSubcategories = subcategories.filter(
    (s) => s.month !== currentMonth
  );
  const currentSubcategories = subcategories.filter(
    (s) => s.month === currentMonth
  );

  const anomalies: {
    name: string;
    current: number;
    avg: number;
    diff: number;
  }[] = [];

  // Group historical by name
  const historyMap: Record<string, { total: number; count: number }> = {};
  historicalSubcategories.forEach((s) => {
    const actual = (s.transactions || []).reduce(
      (sum: number, tx: any) => sum + tx.amount,
      0
    );
    if (!historyMap[s.name]) historyMap[s.name] = { total: 0, count: 0 };
    historyMap[s.name].total += actual;
    historyMap[s.name].count += 1;
  });

  currentSubcategories.forEach((s) => {
    const actual = (s.transactions || []).reduce(
      (sum: number, tx: any) => sum + tx.amount,
      0
    );
    const history = historyMap[s.name];

    if (history && history.count > 0) {
      const avg = history.total / history.count;
      // If we are already > 20% higher than average and it's a significant amount (> $50)
      if (actual > avg * 1.2 && actual - avg > 50) {
        anomalies.push({
          name: s.name,
          current: actual,
          avg: avg,
          diff: ((actual - avg) / avg) * 100
        });
      }
    } else {
      // Fallback: compare with TARGET if no history
      if (s.amount && actual > s.amount * 1.2 && actual - s.amount > 50) {
        anomalies.push({
          name: s.name,
          current: actual,
          avg: s.amount,
          diff: ((actual - s.amount) / s.amount) * 100
        });
      }
    }
  });

  if (anomalies.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-slate-100 italic font-medium">
      <div className="flex items-center gap-2 mb-4 text-rose-600">
        <AlertCircle className="w-4 h-4" />
        <h4 className="text-[10px] font-black uppercase tracking-widest">
          Habit Anomaly Detected
        </h4>
      </div>

      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {anomalies.map((a, i) => (
          <div key={i} className="flex justify-between items-start gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase">{a.name}</span>
              <p className="text-[9px] text-muted-foreground uppercase">
                Spending is {a.diff.toFixed(0)}% above normal habit ($
                {formatCurrencyRounded(a.avg)})
              </p>
            </div>
            <div className="flex items-center text-rose-600 font-mono font-bold text-xs">
              <ArrowUpRight className="w-3 h-3 mr-1" />$
              {formatCurrencyRounded(a.current)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
