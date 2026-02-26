'use client';

import {
  Wallet,
  Landmark,
  TrendingUp,
  Scale,
  Award,
  Plus,
  Minus,
  Equal,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getSourceColor, formatCurrency } from '@/lib/utils';
import { barlow } from '@/lib/fonts';

interface Transaction {
  id: string;
  amount: number;
  source: string;
  isIncome: boolean;
  isSavings: boolean;
  description: string;
}

export function MonthSettlement({
  transactions,
  brlRate,
  onSourceClick
}: {
  transactions: Transaction[];
  brlRate: number;
  onSourceClick?: (source: string, transactions: Transaction[]) => void;
}) {
  // Initialize data
  const data: Record<
    string,
    {
      livingExpenses: number;
      investments: number;
      deposits: number;
      txs: Transaction[];
    }
  > = {
    His: { livingExpenses: 0, investments: 0, deposits: 0, txs: [] },
    Her: { livingExpenses: 0, investments: 0, deposits: 0, txs: [] },
    Family: { livingExpenses: 0, investments: 0, deposits: 0, txs: [] }
  };

  transactions.forEach((tx) => {
    const s = tx.source;
    if (data[s]) {
      if (tx.isIncome) {
        data[s].deposits += tx.amount;
      } else if (tx.isSavings) {
        data[s].investments += tx.amount;
      } else {
        data[s].livingExpenses += tx.amount;
      }
      data[s].txs.push(tx);
    }
  });

  const totalLivingExpenses =
    data.His.livingExpenses +
    data.Her.livingExpenses +
    data.Family.livingExpenses;
  const totalDeposits = data.His.deposits + data.Her.deposits;
  const balanceBeforeInvestments = totalDeposits - totalLivingExpenses;
  const totalInvested =
    data.His.investments + data.Her.investments + data.Family.investments;
  const finalBalance = balanceBeforeInvestments - totalInvested;

  const hisTotalContribution =
    data.His.livingExpenses + data.His.investments + data.His.deposits;
  const herTotalContribution =
    data.Her.livingExpenses + data.Her.investments + data.Her.deposits;
  const grandTotalContribution = hisTotalContribution + herTotalContribution;

  if (transactions.length === 0) return null;

  const EquationBox = ({
    title,
    value,
    color = 'slate',
    subtitle,
    isCurrency = true,
    onClick
  }: {
    title: string;
    value: number;
    color?: 'slate' | 'cyan' | 'orange' | 'red' | 'emerald' | 'yellow';
    subtitle?: string;
    isCurrency?: boolean;
    onClick?: () => void;
  }) => {
    const colors = {
      slate: 'bg-slate-50 border-slate-200 text-slate-900',
      cyan: 'bg-cyan-50 border-cyan-200 text-cyan-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900'
    };

    return (
      <motion.div
        whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
        onClick={onClick}
        className={`p-4 border rounded-xl flex flex-col justify-center items-center text-center transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${colors[color]}`}
      >
        <span className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">
          {title}
        </span>
        <span
          className={`font-mono font-black ${isCurrency ? 'text-lg' : 'text-xl'}`}
        >
          {isCurrency ? `$${formatCurrency(value)}` : value}
        </span>
        {subtitle && (
          <span className="text-[9px] uppercase font-bold mt-1 opacity-50">
            {subtitle}
          </span>
        )}
      </motion.div>
    );
  };

  const Operator = ({
    icon: Icon,
    color = 'slate-400'
  }: {
    icon: any;
    color?: string;
  }) => (
    <div className={`flex items-center justify-center p-2 ${color}`}>
      <Icon size={16} strokeWidth={3} />
    </div>
  );

  return (
    <div className="mt-16 pt-12 border-t border-slate-100">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2.5 bg-slate-900 rounded-xl">
          <Scale size={20} className="text-white" />
        </div>
        <div>
          <h3
            className={`text-lg font-black uppercase tracking-tight ${barlow.className}`}
          >
            Month Settlement
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            Detailed Financial Flow & Balance Logic
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Logic Equation Section */}
        <div className="lg:col-span-9 space-y-6">
          {/* Row 1: Expenses */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Step 1: Living Expenses
            </span>
            <div className="grid grid-cols-7 items-center gap-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="col-span-2">
                <EquationBox
                  title="His Paid"
                  value={data.His.livingExpenses}
                  color="cyan"
                  onClick={() =>
                    onSourceClick?.(
                      'His',
                      data.His.txs.filter((t) => !t.isIncome && !t.isSavings)
                    )
                  }
                />
              </div>
              <Operator icon={Plus} />
              <div className="col-span-2">
                <EquationBox
                  title="Her Paid"
                  value={data.Her.livingExpenses}
                  color="orange"
                  onClick={() =>
                    onSourceClick?.(
                      'Her',
                      data.Her.txs.filter((t) => !t.isIncome && !t.isSavings)
                    )
                  }
                />
              </div>
              <Operator icon={Plus} />
              <div className="col-span-1">
                <EquationBox
                  title="Family"
                  value={data.Family.livingExpenses}
                  color="red"
                  onClick={() =>
                    onSourceClick?.(
                      'Family',
                      data.Family.txs.filter((t) => !t.isIncome && !t.isSavings)
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Row 2: Credits */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Step 2: Pool Funding (Credits)
            </span>
            <div className="grid grid-cols-7 items-center gap-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="col-span-3">
                <EquationBox
                  title="His Deposited"
                  value={data.His.deposits}
                  color="cyan"
                  onClick={() =>
                    onSourceClick?.(
                      'His',
                      data.His.txs.filter((t) => t.isIncome)
                    )
                  }
                />
              </div>
              <Operator icon={Plus} />
              <div className="col-span-3">
                <EquationBox
                  title="Her Deposited"
                  value={data.Her.deposits}
                  color="orange"
                  onClick={() =>
                    onSourceClick?.(
                      'Her',
                      data.Her.txs.filter((t) => t.isIncome)
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Row 3: Logic Result */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Step 3: Calculating Surplus
            </span>
            <div className="grid grid-cols-10 items-center gap-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="col-span-2">
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] uppercase font-black text-emerald-700 tracking-tighter">
                    Total Credits
                  </span>
                  <span className="font-mono font-black text-emerald-800">
                    ${formatCurrency(totalDeposits)}
                  </span>
                </div>
              </div>
              <Operator icon={Minus} color="text-rose-500" />
              <div className="col-span-2">
                <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] uppercase font-black text-rose-700 tracking-tighter">
                    Total Expenses
                  </span>
                  <span className="font-mono font-black text-rose-800">
                    ${formatCurrency(totalLivingExpenses)}
                  </span>
                </div>
              </div>
              <Operator icon={Equal} />
              <div className="col-span-4 transition-all duration-500">
                <EquationBox
                  title="Ready to Invest"
                  value={balanceBeforeInvestments}
                  color={balanceBeforeInvestments >= 0 ? 'emerald' : 'red'}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Total Effort (Contribution) */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Individual Effort (Spending + Funding)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div
                className="p-4 rounded-2xl border-l-4 shadow-sm bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ borderLeftColor: getSourceColor('His') }}
                onClick={() => onSourceClick?.('His', data.His.txs)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">
                      His Contribution
                    </span>
                    <h4 className="text-xl font-mono font-black text-slate-900">
                      ${formatCurrency(hisTotalContribution)}
                    </h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700">
                    <Award size={16} />
                  </div>
                </div>
              </div>
              <div
                className="p-4 rounded-2xl border-l-4 shadow-sm bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ borderLeftColor: getSourceColor('Her') }}
                onClick={() => onSourceClick?.('Her', data.Her.txs)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">
                      Her Contribution
                    </span>
                    <h4 className="text-xl font-mono font-black text-slate-900">
                      ${formatCurrency(herTotalContribution)}
                    </h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
                    <Award size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Result Sidebar */}
        <div className="lg:col-span-3 h-full">
          <div className="bg-slate-900 rounded-3xl p-6 text-white h-full flex flex-col shadow-xl border border-slate-800">
            <div className="flex-1 space-y-8">
              <div>
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 block mb-3">
                  Grand Total Effort
                </span>
                <div className="space-y-1">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-mono font-black text-emerald-400">
                      ${formatCurrency(grandTotalContribution)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 mb-1.5 underline decoration-emerald-500/30">
                      CAD
                    </span>
                  </div>
                  <div className="flex items-end gap-2 opacity-80">
                    <span className="text-lg font-mono font-black text-slate-300">
                      R$ {formatCurrency(grandTotalContribution * brlRate)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 mb-1.5">
                      BRL
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-blue-400" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Total Invested
                  </span>
                </div>
                <span className="text-xl font-mono font-black text-blue-400">
                  ${formatCurrency(totalInvested)}
                </span>
              </div>

              <div
                className={`p-5 rounded-2xl border-2 transition-all duration-1000 ${
                  Math.abs(finalBalance) < 0.01
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Final Balance
                  </span>
                  {Math.abs(finalBalance) < 0.01 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-emerald-500 text-white p-1 rounded-full"
                    >
                      <CheckCircle2 size={12} />
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-3xl font-mono font-black ${
                      finalBalance < 0
                        ? 'text-rose-500'
                        : finalBalance > 0
                          ? 'text-emerald-400'
                          : 'text-emerald-500'
                    }`}
                  >
                    ${formatCurrency(finalBalance)}
                  </span>
                  <p className="text-[9px] uppercase font-bold text-slate-500 mt-2 leading-relaxed">
                    {Math.abs(finalBalance) < 0.01
                      ? 'Perfectly Balanced. All dollars have a job.'
                      : finalBalance > 0
                        ? `${formatCurrency(finalBalance)} remaining to be assigned.`
                        : 'Over-spent the pool. Review living costs.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-[8px] uppercase font-black text-slate-600 tracking-widest text-center">
                Goal: Zero Balance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
