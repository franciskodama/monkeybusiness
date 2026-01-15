'use client';

import { CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export function SourceBreakdown({ transactions }: { transactions: any[] }) {
  // Grouping logic
  const sourceTotals = transactions.reduce(
    (acc: Record<string, number>, tx) => {
      const sourceName = tx.source || 'Other/Unknown';
      // If it's income (amount < 0 in our system), we still want to see the total deposited
      acc[sourceName] = (acc[sourceName] || 0) + tx.amount;
      return acc;
    },
    {}
  );

  const sortedSources = Object.entries(sourceTotals).sort(
    (a, b) => Math.abs(b[1]) - Math.abs(a[1])
  );

  if (transactions.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CreditCard size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-tight">
            Account Activity
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase">
            Summary of spending and income by source
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {sortedSources.map(([source, amount]) => {
          const isIncome = amount < 0;
          return (
            <div
              key={source}
              className="p-3 rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-black uppercase text-muted-foreground truncate max-w-[100px]">
                  {source}
                </span>
                {isIncome ? (
                  <ArrowDownLeft size={12} className="text-emerald-500" />
                ) : (
                  <ArrowUpRight size={12} className="text-red-500" />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-md font-mono font-bold ${isIncome ? 'text-emerald-600' : 'text-foreground'}`}
                >
                  {isIncome ? '' : '$'}
                  {Math.abs(amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                  })}
                </span>
                <span className="text-[8px] uppercase text-muted-foreground font-medium">
                  {isIncome ? 'Total Deposits' : 'Total Charges'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
