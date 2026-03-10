'use client';

import { CreditCard, Wallet, Landmark, Award } from 'lucide-react';
import { getSourceColor, formatCurrency } from '@/lib/utils';
import { TransactionInput } from '@/lib/types';

export function SourceBreakdown({
  transactions,
  onSourceClick,
  person1Name = 'Partner 1',
  person2Name = 'Partner 2'
}: {
  transactions: TransactionInput[];
  onSourceClick?: (source: string, transactions: TransactionInput[]) => void;
  person1Name?: string;
  person2Name?: string;
}) {
  const sources = ['PERSON1', 'PERSON2', 'Family'];
  const sourceLabels: Record<string, string> = {
    PERSON1: person1Name,
    PERSON2: person2Name,
    Family: 'Family'
  };

  // Initialize data for the three sources
  const data: Record<
    string,
    { spending: number; funding: number; txs: TransactionInput[] }
  > = {
    PERSON1: { spending: 0, funding: 0, txs: [] },
    PERSON2: { spending: 0, funding: 0, txs: [] },
    Family: { spending: 0, funding: 0, txs: [] }
  };

  // Populate data from transactions
  transactions.forEach((tx) => {
    const s = tx.source;
    if (s && data[s]) {
      if (tx.amount) {
        const amount =
          typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        // In this simplified logic, we'll treat all as spending.
        // If we want to support funding/income specifically, we'd need that flag on TransactionInput.
        data[s].spending += amount;
        data[s].txs.push(tx);
      }
    }
  });

  if (transactions.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CreditCard size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-tight">
            Account Activity
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase">
            Settlement Summary (Click source column for details)
          </p>
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-4 text-left text-[10px] uppercase font-black tracking-widest text-slate-400 w-1/4">
                Movement Type
              </th>
              {sources.map((source) => {
                const sourceColor = getSourceColor(source);
                const isPerson1 = source === 'PERSON1';
                return (
                  <th
                    key={source}
                    className={`p-4 text-center text-xs font-black uppercase tracking-widest cursor-pointer transition-all border-l ${
                      isPerson1 ? 'text-slate-900' : 'text-white'
                    } hover:opacity-90`}
                    style={{ backgroundColor: sourceColor }}
                    onClick={() => onSourceClick?.(source, data[source].txs)}
                  >
                    {sourceLabels[source]}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b group hover:bg-slate-50 transition-colors">
              <td className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-4">
                <Wallet size={18} className="text-slate-400" />
                Total Spending
              </td>
              {sources.map((source) => (
                <td
                  key={source}
                  className="p-4 text-center font-mono font-bold text-sm border-l"
                >
                  ${formatCurrency(data[source].spending)}
                </td>
              ))}
            </tr>

            <tr className="border-b group hover:bg-emerald-50/30 transition-colors text-slate-500">
              <td className="p-4 text-xs font-bold uppercase tracking-widest flex items-center gap-4">
                <Landmark size={18} className="text-slate-400" />
                Pool Funding
              </td>
              {sources.map((source) => (
                <td
                  key={source}
                  className="p-4 text-center font-mono font-bold text-sm border-l"
                >
                  ${formatCurrency(data[source].funding)}
                </td>
              ))}
            </tr>

            <tr className="bg-slate-800 text-white font-black group">
              <td className="p-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-4 mt-1">
                <Award size={18} className="text-white" />
                Total Contribution
              </td>
              {sources.map((source) => (
                <td
                  key={source}
                  className="p-4 text-center font-mono text-lg border-l border-slate-700"
                >
                  $
                  {formatCurrency(data[source].spending + data[source].funding)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
