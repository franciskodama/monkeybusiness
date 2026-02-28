'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Minus,
  Flame,
  Equal,
  CheckCircle2,
  Rocket,
  ChessQueen,
  X,
  Target,
  AlertCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
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
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const metricExplanations: Record<
    string,
    { label: string; desc: string; icon: any }
  > = {
    savingsRate: {
      label: 'Savings Rate',
      desc: 'The percentage of your total monthly effort that was converted into investments. Goal: 30%+',
      icon: TrendingUp
    },
    efficiency: {
      label: 'Living Efficiency',
      desc: 'Efficiency measures how much income remains after all living costs. High efficiency enables growth.',
      icon: Target
    },
    burn: {
      label: 'Daily Burn',
      desc: 'Your average maintenance cost per day. Lower burn rates provide greater financial freedom.',
      icon: Flame
    },
    settlement: {
      label: 'Final Settlement',
      desc: 'A Zero-Balance goal ensures every dollar brought into the pool is accounted for as spending or saving.',
      icon: Target
    },
    status: {
      label: 'Performance Status',
      desc: 'This badge reflects your current wealth velocity based on your savings rate. High velocity (30%+) means you are rapidly building future freedom.',
      icon: Rocket
    }
  };

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

  const hisTotalContribution =
    data.His.livingExpenses + data.His.investments + data.His.deposits;
  const herTotalContribution =
    data.Her.livingExpenses + data.Her.investments + data.Her.deposits;
  const grandTotalContribution = hisTotalContribution + herTotalContribution;

  const totalLivingExpenses =
    data.His.livingExpenses +
    data.Her.livingExpenses +
    data.Family.livingExpenses;

  const balanceBeforeInvestments = grandTotalContribution - totalLivingExpenses;
  const totalInvested =
    data.His.investments + data.Her.investments + data.Family.investments;
  const finalBalance = balanceBeforeInvestments - totalInvested;

  // Performance Metrics
  const savingsRate =
    grandTotalContribution > 0
      ? (totalInvested / grandTotalContribution) * 100
      : 0;

  const livingEfficiency =
    grandTotalContribution > 0
      ? (1 - totalLivingExpenses / grandTotalContribution) * 100
      : 0;

  const dailyBurn = totalLivingExpenses / 30;

  const hisSplit =
    grandTotalContribution > 0
      ? (hisTotalContribution / grandTotalContribution) * 100
      : 0;

  const herSplit =
    grandTotalContribution > 0
      ? (herTotalContribution / grandTotalContribution) * 100
      : 0;

  if (transactions.length === 0) return null;

  const MetricTooltip = ({ metric }: { metric: string }) => (
    <AnimatePresence>
      {activeMetric === metric && metricExplanations[metric] && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="bg-slate-900 border-2 border-slate-700 p-4 relative shadow-[4px_4px_0px_rgba(30,41,59,1)] mb-2"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMetric(null);
            }}
            className="absolute top-2 right-2 text-slate-500 hover:text-white"
          >
            <X size={12} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            {React.createElement(metricExplanations[metric].icon, {
              size: 10,
              className: 'text-slate-400'
            })}
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Definition / {metricExplanations[metric].label}
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-300 font-semibold">
            {metricExplanations[metric].desc}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );

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
      slate:
        'bg-slate-50 border-slate-100 text-slate-900 shadow-[4px_4px_0px_rgba(241,245,249,1)]',
      cyan: 'bg-cyan-50 border-cyan-100 text-cyan-900 shadow-[4px_4px_0px_rgba(165,243,252,0.4)]',
      orange:
        'bg-orange-50 border-orange-100 text-orange-900 shadow-[4px_4px_0px_rgba(254,215,170,0.4)]',
      red: 'bg-red-50 border-red-100 text-red-900 shadow-[4px_4px_0px_rgba(255,241,242,1)]',
      emerald:
        'bg-emerald-50 border-emerald-100 text-emerald-900 shadow-[4px_4px_0px_rgba(209,250,229,1)]',
      yellow:
        'bg-yellow-50 border-yellow-100 text-yellow-900 shadow-[4px_4px_0px_rgba(254,240,138,0.4)]'
    };

    return (
      <motion.div
        whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
        onClick={onClick}
        className={`p-4 border-2 rounded-none flex flex-col justify-center items-center text-center transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${colors[color]}`}
      >
        <span className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">
          {title}
        </span>
        <span
          className={`font-mono font-black ${isCurrency ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}
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
    color = 'text-slate-800',
    className = ''
  }: {
    icon: any;
    color?: string;
    className?: string;
  }) => (
    <div
      className={`flex items-center justify-center p-1 ${color} ${className}`}
    >
      <Icon size={18} strokeWidth={3} />
    </div>
  );

  return (
    <div className="mt-16 pt-12 border-t border-slate-100">
      <div className="flex items-center gap-3 mb-20">
        <div className="p-2.5 bg-slate-900 rounded-none">
          <ChessQueen size={20} className="text-white" />
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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-none bg-slate-400 border-2 border-slate-400 flex items-center justify-center font-mono font-black text-white text-[9px]">
                1
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Step 1: Living Expenses
              </span>
            </div>
            <div className="flex flex-col md:grid md:grid-cols-7 items-center gap-1 bg-white p-2 rounded-none">
              <div className="w-full md:col-span-2">
                <EquationBox
                  title="His Payments"
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
              <Operator
                icon={Plus}
                className="rotate-90 md:rotate-0 py-1 md:py-2"
              />
              <div className="w-full md:col-span-2">
                <EquationBox
                  title="Her Payments"
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
              <Operator
                icon={Plus}
                className="rotate-90 md:rotate-0 py-1 md:py-2"
              />
              <div className="w-full md:col-span-1">
                <EquationBox
                  title="Family Payments"
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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-none bg-slate-400 border-2 border-slate-400 flex items-center justify-center font-mono font-black text-white text-[9px]">
                2
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Step 2: Pool Funding (Credits)
              </span>
            </div>
            <div className="flex flex-col md:grid md:grid-cols-7 items-center gap-0.5 bg-white p-2 rounded-none">
              <div className="w-full md:col-span-3">
                <EquationBox
                  title="His Deposits"
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
              <Operator
                icon={Plus}
                className="rotate-90 md:rotate-0 py-1 md:py-2"
              />
              <div className="w-full md:col-span-3">
                <EquationBox
                  title="Her Deposits"
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

          {/* Row 3: Total Effort (Contribution) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-none bg-slate-400 border-2 border-slate-400 flex items-center justify-center font-mono font-black text-white text-[9px]">
                3
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Step 3: Individual Effort (Spending + Funding)
              </span>
            </div>
            <div className="flex flex-col md:grid md:grid-cols-7 items-center gap-0.5 bg-white p-2 rounded-none">
              <div className="w-full md:col-span-3">
                <EquationBox
                  title="His Contribution"
                  value={hisTotalContribution}
                  color="cyan"
                  onClick={() => onSourceClick?.('His', data.His.txs)}
                />
              </div>
              <Operator
                icon={Plus}
                className="rotate-90 md:rotate-0 py-1 md:py-2"
              />
              <div className="w-full md:col-span-3">
                <EquationBox
                  title="Her Contribution"
                  value={herTotalContribution}
                  color="orange"
                  onClick={() => onSourceClick?.('Her', data.Her.txs)}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Logic Result */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-none bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center font-mono font-black text-white text-[9px]">
                4
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                Step 4: Calculating Surplus
              </span>
            </div>
            <div className="flex flex-col md:grid md:grid-cols-10 items-center gap-0.5 bg-white p-2 rounded-none">
              <div className="w-full md:col-span-2">
                <div className="p-4 rounded-none border border-emerald-100 bg-emerald-50/50 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_rgba(209,250,229,0.5)]">
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">
                    Total Effort
                  </span>
                  <span className="font-mono font-black text-emerald-800 text-base sm:text-lg">
                    ${formatCurrency(grandTotalContribution)}
                  </span>
                </div>
              </div>
              <Operator
                icon={Minus}
                color="text-rose-500"
                className="rotate-90 md:rotate-0 py-1 md:py-2"
              />
              <div className="w-full md:col-span-2 flex flex-col gap-0.5">
                <div
                  className={`rounded-none border border-rose-100 bg-rose-50/50 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_rgba(255,241,242,0.8)] 
  ${totalLivingExpenses > grandTotalContribution ? 'p-2 mb-1' : 'p-4'}`}
                >
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">
                    Total Expenses
                  </span>
                  <span className="font-mono font-black text-rose-800 text-base sm:text-lg">
                    ${formatCurrency(totalLivingExpenses)}
                  </span>
                </div>
                {totalLivingExpenses > grandTotalContribution && (
                  <div className="flex items-center justify-center gap-2 py-1.5 bg-rose-500 border-2 border-rose-500 shadow-[4px_4px_0px_rgba(251,113,133,0.2)]">
                    <AlertCircle size={10} className="text-white" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">
                      Deficit Warning
                    </span>
                  </div>
                )}
              </div>
              <Operator
                icon={Equal}
                className="rotate-90 md:rotate-0 py-1 md:py-2"
              />
              <div className="w-full md:col-span-4 transition-all duration-500">
                <EquationBox
                  title="Ready to Invest"
                  value={balanceBeforeInvestments}
                  color={balanceBeforeInvestments >= 0 ? 'emerald' : 'red'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Final Result Sidebar */}
        <div className="lg:col-span-3 h-full">
          <div className="bg-slate-900 rounded-none p-6 text-white h-full flex flex-col border-2 border-slate-800 shadow-[6px_6px_0px_rgba(15,23,42,0.3)] min-h-[600px]">
            <div className="flex-1 space-y-8">
              {/* 1. Score: Grand Total */}
              <div>
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 block mb-3">
                  Monthly Effort
                </span>
                <div className="space-y-1">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-mono font-black text-emerald-400">
                      ${formatCurrency(grandTotalContribution)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 mb-1 underline decoration-emerald-500/30">
                      CAD
                    </span>
                  </div>
                  <div className="flex items-end gap-2 opacity-60">
                    <span className="text-base font-mono font-black text-slate-400">
                      R$ {formatCurrency(grandTotalContribution * brlRate)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mb-0.5">
                      BRL
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Funding Split Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                  <span>His {Math.round(hisSplit)}%</span>
                  <span>Her {Math.round(herSplit)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 flex rounded-none overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-1000"
                    style={{ width: `${hisSplit}%` }}
                  />
                  <div
                    className="h-full bg-orange-500 transition-all duration-1000"
                    style={{ width: `${herSplit}%` }}
                  />
                </div>
              </div>

              {/* 3. Performance Index Table */}
              <div className="space-y-4 pt-4 border-t border-slate-800/50">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-600">
                  Performance Index
                </span>
                <div className="space-y-4">
                  <div
                    onClick={() =>
                      setActiveMetric(
                        activeMetric === 'savingsRate' ? null : 'savingsRate'
                      )
                    }
                    className={`flex justify-between items-center group cursor-help transition-all p-1.5 -mx-1.5 border border-transparent hover:border-slate-800 ${activeMetric === 'savingsRate' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-400 transition-colors">
                      <div
                        className={`w-1 h-1 transition-all ${activeMetric === 'savingsRate' ? 'bg-emerald-400 scale-150' : 'bg-emerald-500'}`}
                      />
                      <span className="text-[10px] font-bold uppercase transition-all">
                        Savings Rate
                      </span>
                    </div>
                    <span className="font-mono text-sm font-black text-emerald-400">
                      {savingsRate.toFixed(1)}%
                    </span>
                  </div>
                  <MetricTooltip metric="savingsRate" />

                  <div
                    onClick={() =>
                      setActiveMetric(
                        activeMetric === 'efficiency' ? null : 'efficiency'
                      )
                    }
                    className={`flex justify-between items-center group cursor-help transition-all p-1.5 -mx-1.5 border border-transparent hover:border-slate-800 ${activeMetric === 'efficiency' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-400 transition-colors">
                      <div
                        className={`w-1 h-1 transition-all ${activeMetric === 'efficiency' ? 'bg-blue-400 scale-150' : 'bg-blue-500'}`}
                      />
                      <span className="text-[10px] font-bold uppercase transition-all">
                        Living Efficiency
                      </span>
                    </div>
                    <span className="font-mono text-sm font-black text-blue-400">
                      {livingEfficiency.toFixed(1)}%
                    </span>
                  </div>
                  <MetricTooltip metric="efficiency" />

                  <div
                    onClick={() =>
                      setActiveMetric(activeMetric === 'burn' ? null : 'burn')
                    }
                    className={`flex justify-between items-center group cursor-help transition-all p-1.5 -mx-1.5 border border-transparent hover:border-slate-800 ${activeMetric === 'burn' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-100 transition-colors">
                      <div
                        className={`w-1 h-1 transition-all ${activeMetric === 'burn' ? 'bg-slate-100 scale-150' : 'bg-slate-500'}`}
                      />
                      <span className="text-[10px] font-bold uppercase transition-all">
                        Daily Burn
                      </span>
                    </div>
                    <span className="font-mono text-sm font-black text-slate-300">
                      ${formatCurrency(dailyBurn)}/d
                    </span>
                  </div>
                  <MetricTooltip metric="burn" />
                </div>
              </div>

              {/* 4. Total Invested Card */}
              <div className="p-4 rounded-none bg-slate-800/40 border border-slate-700/50 shadow-[2px_2px_0px_rgba(30,41,59,0.5)]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={12} className="text-blue-400" />
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                    Capital Build
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-black text-blue-400">
                    ${formatCurrency(totalInvested)}
                  </span>
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                    Invested
                  </span>
                </div>
              </div>

              {/* 5. Final Balance (The Anchor) */}
              <div
                onClick={() =>
                  setActiveMetric(
                    activeMetric === 'settlement' ? null : 'settlement'
                  )
                }
                className={`p-5 rounded-none border-2 transition-all duration-1000 cursor-help ${
                  Math.abs(finalBalance) < 0.01
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : finalBalance < 0
                      ? 'bg-rose-500/5 border-rose-500/50'
                      : 'bg-white/5 border-white/10'
                } ${activeMetric === 'settlement' ? 'ring-2 ring-slate-400 border-slate-400' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Final Settlement
                  </span>
                  {Math.abs(finalBalance) < 0.01 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-emerald-500 text-white p-1 rounded-none"
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
                  <p className="text-[9px] uppercase font-bold text-slate-500 mt-2 leading-relaxed tracking-tight underline decoration-slate-500/20">
                    {Math.abs(finalBalance) < 0.01
                      ? 'Perfect Balance Found'
                      : finalBalance > 0
                        ? `${formatCurrency(finalBalance)} Unassigned Funds`
                        : `${formatCurrency(Math.abs(finalBalance))} Deficit detected`}
                  </p>
                </div>
              </div>
              <MetricTooltip metric="settlement" />
            </div>

            {/* Performance Badge / Conclusion */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div
                onClick={() =>
                  setActiveMetric(activeMetric === 'status' ? null : 'status')
                }
                className={`p-3 border-2 flex items-center justify-center gap-3 group transition-all cursor-help ${activeMetric === 'status' ? 'bg-slate-800 border-slate-600' : 'bg-white/5 border-slate-800 hover:bg-slate-800'}`}
              >
                {savingsRate > 30 ? (
                  <Rocket
                    size={14}
                    className="text-emerald-400 group-hover:scale-125 transition-transform"
                  />
                ) : (
                  <TrendingUp size={14} className="text-slate-500" />
                )}
                <span className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em]">
                  {savingsRate > 30
                    ? 'High Wealth Velocity'
                    : savingsRate > 15
                      ? 'Stable Growth'
                      : 'Cash Flow Active'}
                </span>
              </div>
              <MetricTooltip metric="status" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
