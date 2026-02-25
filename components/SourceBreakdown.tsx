'use client';

import { CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { getSourceColor } from '@/lib/utils';

export function SourceBreakdown({
  transactions,
  onSourceClick
}: {
  transactions: any[];
  onSourceClick?: (source: string, transactions: any[]) => void;
}) {
  // Grouping logic
  const sourceTotals = transactions.reduce(
    (acc: Record<string, { total: number; txs: any[] }>, tx) => {
      const sourceName = tx.source || 'Other/Unknown';
      if (!acc[sourceName]) {
        acc[sourceName] = { total: 0, txs: [] };
      }
      acc[sourceName].total += tx.amount;
      acc[sourceName].txs.push(tx);
      return acc;
    },
    {}
  );

  const sortedSources = Object.entries(sourceTotals).sort(
    (a, b) => Math.abs(b[1].total) - Math.abs(a[1].total)
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
            Summary of spending and income by source (Click to see details)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {sortedSources.map(([source, { total, txs }]) => {
          const isIncome = total < 0;
          const sourceColor = getSourceColor(source);
          return (
            <div
              key={source}
              className="p-3 border bg-background shadow-sm hover:shadow-md hover:bg-slate-50 transition-all relative overflow-hidden cursor-pointer group"
              style={{ borderTop: `3px solid ${sourceColor}` }}
              onClick={() => onSourceClick?.(source, txs)}
            >
              <div className="flex justify-between items-start mb-2 text-muted-foreground group-hover:text-foreground">
                <span className="text-[9px] font-black uppercase truncate max-w-[100px]">
                  {source}
                </span>
                {isIncome ? (
                  <ArrowDownLeft size={12} className="text-emerald-500" />
                ) : (
                  <ArrowUpRight size={12} style={{ color: sourceColor }} />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-md font-mono font-bold ${isIncome ? 'text-emerald-600' : 'text-foreground'}`}
                >
                  {isIncome ? '' : '$'}
                  {Math.abs(total).toLocaleString(undefined, {
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
