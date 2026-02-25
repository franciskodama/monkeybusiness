'use client';

import {
  CreditCard,
  ArrowUpRight,
  Wallet,
  Landmark,
  Award
} from 'lucide-react';
import { getSourceColor, formatCurrency } from '@/lib/utils';

export function SourceBreakdown({
  transactions,
  onSourceClick
}: {
  transactions: any[];
  onSourceClick?: (source: string, transactions: any[]) => void;
}) {
  const sources = ['His', 'Her', 'Family'];

  // Initialize data for the three sources
  const data: Record<
    string,
    { spending: number; funding: number; txs: any[] }
  > = {
    His: { spending: 0, funding: 0, txs: [] },
    Her: { spending: 0, funding: 0, txs: [] },
    Family: { spending: 0, funding: 0, txs: [] }
  };

  // Populate data from transactions
  transactions.forEach((tx) => {
    const s = tx.source;
    if (data[s]) {
      if (tx.isIncome) {
        data[s].funding += tx.amount;
      } else {
        data[s].spending += tx.amount;
      }
      data[s].txs.push(tx);
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
                const isHis = source === 'His';
                return (
                  <th
                    key={source}
                    className={`p-4 text-center text-xs font-black uppercase tracking-widest cursor-pointer transition-all border-l ${
                      isHis ? 'text-slate-900' : 'text-white'
                    } hover:opacity-90`}
                    style={{ backgroundColor: sourceColor }}
                    onClick={() => onSourceClick?.(source, data[source].txs)}
                  >
                    {source}
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

            <tr className="bg-slate-900 text-white font-black group">
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
