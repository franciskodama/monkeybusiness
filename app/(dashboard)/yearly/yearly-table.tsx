'use client';

import React, { useState } from 'react';
import { Category } from '@prisma/client';
import {
  getColorCode,
  months,
  formatCurrency,
  getSourceColor
} from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Info,
  Landmark,
  Scale,
  Award,
  TrendingUp,
  Target,
  Plus,
  Minus,
  Equal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import Help from '@/components/Help';
import ExplanationYearly from './explanation-yearly';

interface YearlyTableProps {
  categories: Category[];
  initialSubcategories: any[];
}

export function YearlyTable({
  categories,
  initialSubcategories
}: YearlyTableProps) {
  const [openAction, setOpenAction] = useState(false);
  const [subcategories] = useState(initialSubcategories);
  const [selectedDetails, setSelectedDetails] = useState<{
    name: string;
    month: number;
    transactions: any[];
  } | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = 2026; // Hardcoded to match the project's current scope

  const getMonthStatus = (month: number) => {
    if (month < currentMonth) return 'PAST';
    if (month === currentMonth) return 'CURRENT';
    return 'FUTURE';
  };

  const getSubData = (subName: string, month: number) => {
    return subcategories.find(
      (s) => s.name === subName && s.month === month && s.year === currentYear
    );
  };

  const getDisplayValue = (subName: string, month: number) => {
    const data = getSubData(subName, month);
    const status = getMonthStatus(month);

    if (status !== 'FUTURE') {
      return (
        data?.transactions?.reduce(
          (sum: number, tx: any) => sum + (tx.amount || 0),
          0
        ) || 0
      );
    }
    return data?.amount || 0;
  };

  // Helper to get total income for a specific month using hybrid logic
  const getMonthlyIncome = (month: number) => {
    const status = getMonthStatus(month);
    return subcategories
      .filter((s) => s.category?.isIncome && s.month === month)
      .reduce((sum, s) => {
        if (status !== 'FUTURE') {
          const actual =
            s.transactions?.reduce(
              (s: number, t: any) => s + (t.amount || 0),
              0
            ) || 0;
          return sum + actual;
        }
        return sum + (s.amount || 0);
      }, 0);
  };

  // Helper to get net cash flow (Income - Expenses) using hybrid logic
  const getMonthlyNet = (month: number) => {
    const status = getMonthStatus(month);
    return subcategories
      .filter((s) => s.month === month && s.year === currentYear)
      .reduce((acc, s) => {
        const isIncome = s.category?.isIncome;
        let amount = 0;
        if (status !== 'FUTURE') {
          amount =
            s.transactions?.reduce(
              (sum: number, t: any) => sum + (t.amount || 0),
              0
            ) || 0;
        } else {
          amount = s.amount || 0;
        }
        return isIncome ? acc + amount : acc - amount;
      }, 0);
  };

  // Helper to get total spending by source for a month (Excluding Income)
  const getMonthlySourceTotal = (month: number, source: string) => {
    return subcategories
      .filter(
        (s) =>
          s.month === month && s.year === currentYear && !s.category?.isIncome
      )
      .reduce((acc, s) => {
        const sourceTotal = (s.transactions || [])
          .filter((tx: any) => tx.source === source)
          .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
        return acc + sourceTotal;
      }, 0);
  };

  //--- YEARLY SETTLEMENT LOGIC (Hybrid: Actuals for Past/Current, Target for Future) ---
  const calculateYearlySettlement = () => {
    let yearlyLivingExpenses = 0;
    let yearlyInvestments = 0;
    let hisYearlyEffort = 0;
    let herYearlyEffort = 0;
    let yearlyCredits = 0;

    for (let m = 1; m <= 12; m++) {
      const status = getMonthStatus(m);
      const monthSubs = subcategories.filter(
        (s) => s.month === m && s.year === currentYear
      );

      monthSubs.forEach((sub) => {
        const isIncome = sub.category?.isIncome;
        const isSavings = sub.category?.isSavings;

        let amount = 0;
        if (status !== 'FUTURE') {
          amount =
            sub.transactions?.reduce(
              (sum: number, t: any) => sum + (t.amount || 0),
              0
            ) || 0;
        } else {
          amount = sub.amount || 0;
        }

        if (isIncome) {
          yearlyCredits += amount;
          // Contribution: Funding portion
          const hisFunding = (sub.transactions || [])
            .filter((tx: any) => tx.source === 'His' && status !== 'FUTURE')
            .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
          const herFunding = (sub.transactions || [])
            .filter((tx: any) => tx.source === 'Her' && status !== 'FUTURE')
            .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

          hisYearlyEffort += hisFunding;
          herYearlyEffort += herFunding;
        } else if (isSavings) {
          yearlyInvestments += amount;
          // Contribution: Investment portion (Spending)
          if (status !== 'FUTURE') {
            hisYearlyEffort += (sub.transactions || [])
              .filter((tx: any) => tx.source === 'His')
              .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
            herYearlyEffort += (sub.transactions || [])
              .filter((tx: any) => tx.source === 'Her')
              .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
          }
        } else {
          yearlyLivingExpenses += amount;
          // Contribution: Living Expense portion (Spending)
          if (status !== 'FUTURE') {
            hisYearlyEffort += (sub.transactions || [])
              .filter((tx: any) => tx.source === 'His')
              .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
            herYearlyEffort += (sub.transactions || [])
              .filter((tx: any) => tx.source === 'Her')
              .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
          }
        }
      });
    }

    const balanceBeforeInvestments =
      hisYearlyEffort + herYearlyEffort - yearlyLivingExpenses;
    const finalBalance = balanceBeforeInvestments - yearlyInvestments;

    return {
      yearlyLivingExpenses,
      yearlyInvestments,
      yearlyCredits,
      hisYearlyEffort,
      herYearlyEffort,
      totalEffort: hisYearlyEffort + herYearlyEffort,
      balanceBeforeInvestments,
      finalBalance
    };
  };

  const settlement = calculateYearlySettlement();

  //--- MONTHLY SETTLEMENT LOGIC (For the grid rows) ---
  const calculateMonthlySettlement = (month: number) => {
    let livingExpenses = 0;
    let investments = 0;
    let hisEffort = 0;
    let herEffort = 0;
    let credits = 0;

    const status = getMonthStatus(month);
    const monthSubs = subcategories.filter(
      (s) => s.month === month && s.year === currentYear
    );

    monthSubs.forEach((sub) => {
      const isIncome = sub.category?.isIncome;
      const isSavings = sub.category?.isSavings;

      let amount = 0;
      if (status !== 'FUTURE') {
        amount =
          sub.transactions?.reduce(
            (sum: number, t: any) => sum + (t.amount || 0),
            0
          ) || 0;
      } else {
        amount = sub.amount || 0;
      }

      if (isIncome) {
        credits += amount;
        if (status !== 'FUTURE') {
          hisEffort += (sub.transactions || [])
            .filter((tx: any) => tx.source === 'His')
            .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
          herEffort += (sub.transactions || [])
            .filter((tx: any) => tx.source === 'Her')
            .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
        }
      } else if (isSavings) {
        investments += amount;
        if (status !== 'FUTURE') {
          hisEffort += (sub.transactions || [])
            .filter((tx: any) => tx.source === 'His')
            .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
          herEffort += (sub.transactions || [])
            .filter((tx: any) => tx.source === 'Her')
            .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
        }
      } else {
        livingExpenses += amount;
        if (status !== 'FUTURE') {
          hisEffort += (sub.transactions || [])
            .filter((tx: any) => tx.source === 'His')
            .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
          herEffort += (sub.transactions || [])
            .filter((tx: any) => tx.source === 'Her')
            .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
        }
      }
    });

    const balanceBeforeInvestments = hisEffort + herEffort - livingExpenses;
    const finalBalance = balanceBeforeInvestments - investments;

    return {
      hisEffort,
      herEffort,
      credits,
      totalEffort: hisEffort + herEffort,
      livingExpenses,
      balanceBeforeInvestments,
      investments,
      finalBalance
    };
  };
  return (
    <Card className="m-6 border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-6">
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between items-start mb-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              Yearly Overview
            </h1>
            <p className="text-muted-foreground text-sm lowercase mt-1">
              <span className="uppercase">A</span> full picture of your
              financial year.
            </p>
          </div>
          <div className="hidden sm:block">
            {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 relative">
        <AnimatePresence>
          {openAction && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            >
              <div className="mb-12 border border-slate-200">
                <ExplanationYearly setOpenAction={setOpenAction} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto border bg-background shadow-sm no-scrollbar">
          <table className="w-full border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-secondary/30">
                <th className="sticky left-0 z-20 bg-slate-100 p-4 text-left text-[10px] font-black uppercase border-r w-[220px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Category / Subcategory
                </th>
                {months.map((m, i) => {
                  const status = getMonthStatus(i + 1);
                  return (
                    <th
                      key={m}
                      className={`p-4 text-center text-[12px] font-black uppercase border-r min-w-[110px] ${
                        status === 'PAST'
                          ? 'bg-slate-200/60'
                          : status === 'CURRENT'
                            ? 'bg-primary/20 text-primary'
                            : ''
                      }`}
                    >
                      {m}
                      <div className="text-[8px] font-normal tracking-widest pt-1">
                        {status === 'PAST' ? (
                          <span className="opacity-60">Actual</span>
                        ) : status === 'CURRENT' ? (
                          <span className="text-white font-bold bg-primary px-2 py-1">
                            In progress
                          </span>
                        ) : (
                          <span className="opacity-60">Forecast</span>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="p-4 text-center text-xs font-bold uppercase bg-primary/5">
                  Total YTD
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const uniqueSubNames = Array.from(
                  new Set(
                    subcategories
                      .filter((s) => s.categoryId === category.id)
                      .map((s) => s.name)
                  )
                );

                return (
                  <React.Fragment key={category.id}>
                    <tr
                      style={{
                        backgroundColor: `${getColorCode(category.color).backgroundColor}20`,
                        borderTop: `2px solid ${getColorCode(category.color).backgroundColor}`
                      }}
                      className="border-b"
                    >
                      <td
                        className="sticky left-0 z-10 p-3 font-bold text-sm border-r flex items-center gap-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                        style={{
                          backgroundColor: 'white',
                          borderLeft: `4px solid ${getColorCode(category.color).backgroundColor}`
                        }}
                      >
                        <div
                          className="w-3 h-3 shadow-sm"
                          style={{
                            backgroundColor: getColorCode(category.color)
                              .backgroundColor
                          }}
                        />
                        <span className="uppercase tracking-wider">
                          {category.name}
                        </span>
                      </td>

                      {months.map((_, i) => {
                        const status = getMonthStatus(i + 1);
                        return (
                          <td
                            key={i}
                            className={`border-r border-secondary/20 ${
                              status === 'PAST'
                                ? 'bg-slate-100/60'
                                : status === 'CURRENT'
                                  ? 'bg-primary/10'
                                  : ''
                            }`}
                          />
                        );
                      })}

                      <td className="bg-primary/5 border-l border-secondary/20" />
                    </tr>

                    {uniqueSubNames.map((name) => {
                      let subYtd = 0;
                      return (
                        <tr
                          key={name}
                          className="hover:bg-secondary/5 border-b transition-colors text-xs text-muted-foreground"
                        >
                          <td className="sticky left-0 z-10 bg-white p-3 border-r pl-8 text-sm font-semibold text-primary shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            {name}
                          </td>
                          {months.map((_, i) => {
                            const data = getSubData(name, i + 1);
                            const val = getDisplayValue(name, i + 1);
                            const status = getMonthStatus(i + 1);
                            subYtd += val;

                            return (
                              <td
                                key={i}
                                className={`p-3 text-center border-r font-mono transition-all group relative ${
                                  status === 'PAST'
                                    ? 'bg-slate-100/60'
                                    : status === 'CURRENT'
                                      ? 'bg-primary/10 text-primary font-bold'
                                      : ''
                                } ${
                                  (data?.transactions?.length ?? 0) > 0
                                    ? 'cursor-pointer hover:bg-primary/10 hover:text-primary font-bold'
                                    : ''
                                }`}
                                onClick={() => {
                                  if ((data?.transactions?.length ?? 0) > 0) {
                                    setSelectedDetails({
                                      name: name,
                                      month: i + 1,
                                      transactions: data.transactions
                                    });
                                  }
                                }}
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <span
                                    className={
                                      status === 'CURRENT'
                                        ? 'underline decoration-dotted underline-offset-4'
                                        : ''
                                    }
                                  >
                                    ${formatCurrency(val)}
                                  </span>
                                  {(data?.transactions?.length ?? 0) > 0 && (
                                    <div className="flex items-center gap-1 text-[8px] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-0.5 whitespace-nowrap bg-primary text-white px-1">
                                      <Info size={8} />{' '}
                                      {data.transactions.length} tx
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-3 text-center font-bold bg-primary/5 font-mono">
                            ${formatCurrency(subYtd)}
                          </td>
                        </tr>
                      );
                    })}

                    <tr className="bg-secondary/10 border-b font-bold text-xs">
                      <td className="sticky left-0 z-10 bg-slate-100 p-3 border-r pl-8 italic shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Total {category.name}
                      </td>
                      {months.map((_, i) => {
                        const status = getMonthStatus(i + 1);
                        const catMonthTotal = subcategories
                          .filter(
                            (s) =>
                              s.categoryId === category.id && s.month === i + 1
                          )
                          .reduce((sum, s) => {
                            if (status !== 'FUTURE') {
                              return (
                                sum +
                                (s.transactions?.reduce(
                                  (ts: number, t: any) => ts + (t.amount || 0),
                                  0
                                ) || 0)
                              );
                            }
                            return sum + (s.amount || 0);
                          }, 0);
                        return (
                          <td
                            key={i}
                            className={`p-3 text-center border-r font-mono ${
                              status === 'PAST'
                                ? 'bg-slate-200/60'
                                : status === 'CURRENT'
                                  ? 'bg-primary/20'
                                  : ''
                            }`}
                          >
                            ${formatCurrency(catMonthTotal)}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center bg-primary/10 font-mono text-primary">
                        $
                        {formatCurrency(
                          months.reduce((sum, _, i) => {
                            const status = getMonthStatus(i + 1);
                            const monthSum = subcategories
                              .filter(
                                (s) =>
                                  s.categoryId === category.id &&
                                  s.month === i + 1
                              )
                              .reduce((msum, s) => {
                                if (status !== 'FUTURE') {
                                  return (
                                    msum +
                                    (s.transactions?.reduce(
                                      (ts: number, t: any) =>
                                        ts + (t.amount || 0),
                                      0
                                    ) || 0)
                                  );
                                }
                                return msum + (s.amount || 0);
                              }, 0);
                            return sum + monthSum;
                          }, 0)
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>

            <tfoot>
              {/* SPACER GAP */}
              <tr className="h-2 bg-gray-200">
                <td colSpan={14} className="border-y border-secondary/20" />
              </tr>

              {/* NEW SETTLEMENT GRID ROWS */}
              {[
                {
                  label: 'His Contribution',
                  key: 'hisEffort',
                  color: getSourceColor('His')
                },
                {
                  label: 'Her Contribution',
                  key: 'herEffort',
                  color: getSourceColor('Her')
                },
                { label: 'Total Effort', key: 'totalEffort', color: '#10B981' },
                {
                  label: 'Total Expenses',
                  key: 'livingExpenses',
                  color: '#EF4444'
                },
                {
                  label: 'Ready to Invest',
                  key: 'balanceBeforeInvestments',
                  color: '#F59E0B'
                },
                {
                  label: 'Investments',
                  key: 'investments',
                  color: '#3B82F6'
                }
              ].map((row) => (
                <tr
                  key={row.key}
                  style={{
                    backgroundColor: `${row.color}08`
                  }}
                  className="border-b text-xs text-muted-foreground font-medium"
                >
                  <td
                    style={{
                      borderLeft: `4px solid ${row.color}`,
                      backgroundColor: 'white'
                    }}
                    className="sticky left-0 z-10 p-3 border-r pl-8 uppercase tracking-widest text-[9px] font-black shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                  >
                    {row.label}
                  </td>
                  {months.map((_, i) => {
                    const monthlyData = calculateMonthlySettlement(i + 1);
                    const val = (monthlyData as any)[row.key];
                    const status = getMonthStatus(i + 1);
                    return (
                      <td
                        key={i}
                        className={`p-3 text-center border-r font-mono italic ${
                          status === 'PAST'
                            ? 'bg-slate-200/40'
                            : status === 'CURRENT'
                              ? 'bg-primary/5'
                              : ''
                        }`}
                      >
                        ${formatCurrency(val)}
                      </td>
                    );
                  })}
                  <td
                    className="p-3 text-center font-mono font-black border-l"
                    style={{
                      backgroundColor: `${row.color}15`,
                      color: row.color
                    }}
                  >
                    $
                    {formatCurrency(
                      months.reduce(
                        (acc, _, i) =>
                          acc +
                          (calculateMonthlySettlement(i + 1) as any)[row.key],
                        0
                      )
                    )}
                  </td>
                </tr>
              ))}
              <tr className="h-2 bg-gray-200">
                <td colSpan={14} className="border-y border-secondary/20" />
              </tr>

              {/* NET CASH FLOW ROW */}
              <tr className="bg-slate-900 text-white font-bold">
                <td className="sticky left-0 z-10 bg-slate-900 p-4 border-r uppercase text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Net Cash Flow
                </td>
                {months.map((_, i) => {
                  const settlement = calculateMonthlySettlement(i + 1);
                  const net = settlement.finalBalance;
                  const status = getMonthStatus(i + 1);

                  return (
                    <td
                      key={i}
                      className={`p-4 text-center border-r font-mono text-sm ${
                        status === 'PAST'
                          ? 'bg-slate-950 font-black'
                          : status === 'CURRENT'
                            ? 'bg-primary/30 text-white border-x border-primary font-black'
                            : ''
                      }`}
                    >
                      {net < 0 ? '-' : ''}${formatCurrency(Math.abs(net))}
                    </td>
                  );
                })}
                <td className="p-4 text-center bg-slate-800 font-mono text-sm">
                  $
                  {formatCurrency(
                    months.reduce(
                      (acc, _, i) =>
                        acc + calculateMonthlySettlement(i + 1).finalBalance,
                      0
                    )
                  )}
                </td>
              </tr>

              {/* SAVINGS GOAL % ROW */}
              <tr className="bg-emerald-600 text-white font-bold border-t border-emerald-500">
                <td className="sticky left-0 z-10 bg-emerald-600 p-3 border-r uppercase text-[10px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Savings Rate (%)
                </td>
                {months.map((_, i) => {
                  const settlement = calculateMonthlySettlement(i + 1);
                  const totalSavings =
                    settlement.finalBalance + settlement.investments;
                  const income = settlement.totalEffort;
                  const percentage =
                    income > 0 ? (totalSavings / income) * 100 : 0;
                  const status = getMonthStatus(i + 1);

                  return (
                    <td
                      key={i}
                      className={`p-3 text-center border-r font-mono text-xs ${
                        status === 'PAST'
                          ? 'bg-emerald-700'
                          : status === 'CURRENT'
                            ? 'bg-emerald-400 text-emerald-950 underline decoration-white underline-offset-4'
                            : ''
                      }`}
                    >
                      {percentage > 0 ? percentage.toFixed(1) : '0.0'}%
                    </td>
                  );
                })}
                <td className="p-3 text-center bg-emerald-700 font-mono text-xs">
                  {(() => {
                    const monthsData = months.map((_, i) =>
                      calculateMonthlySettlement(i + 1)
                    );
                    const totalIncome = monthsData.reduce(
                      (sum, d) => sum + d.totalEffort,
                      0
                    );
                    const totalSaved = monthsData.reduce(
                      (sum, d) => sum + d.finalBalance + d.investments,
                      0
                    );
                    const avgPercentage =
                      totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;
                    return `${avgPercentage.toFixed(1)}%`;
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* YEARLY SETTLEMENT SUMMARY */}
        <div className="mt-16 border-t pt-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-slate-900 rounded-none">
              <Scale size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">
                Yearly Settlement
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                Aggregated Financial Logic (YTD + Forecast)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Logic Rows */}
            <div className="lg:col-span-9 space-y-6">
              {/* Row 1: Credits & Expenses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white border-2 border-slate-100 rounded-none shadow-sm flex justify-between items-center group hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <Landmark size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">
                        Total Effort
                      </span>
                      <span className="text-2xl font-mono font-black text-slate-900">
                        $
                        {formatCurrency(
                          settlement.hisYearlyEffort +
                            settlement.herYearlyEffort
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={20} />
                  </div>
                </div>

                <div className="p-6 bg-white border-2 border-slate-100 rounded-none shadow-sm flex justify-between items-center group hover:border-rose-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-none group-hover:bg-rose-600 group-hover:text-white transition-all">
                      <TrendingUp size={24} className="rotate-90" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">
                        Total Expenses
                      </span>
                      <span className="text-2xl font-mono font-black text-slate-900">
                        ${formatCurrency(settlement.yearlyLivingExpenses)}
                      </span>
                    </div>
                  </div>
                  <div className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Minus size={20} />
                  </div>
                </div>
              </div>

              {/* Row 2: Surplus & Investments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-none shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white text-emerald-600 rounded-none shadow-sm">
                      <Equal size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-emerald-700 tracking-widest block mb-1">
                        Ready to Invest
                      </span>
                      <span className="text-2xl font-mono font-black text-emerald-900">
                        ${formatCurrency(settlement.balanceBeforeInvestments)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-none shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white text-blue-600 rounded-none shadow-sm">
                      <Target size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-blue-700 tracking-widest block mb-1">
                        Total Invested (YTD)
                      </span>
                      <span className="text-2xl font-mono font-black text-blue-900">
                        ${formatCurrency(settlement.yearlyInvestments)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Contributions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="p-5 bg-white border-l-4 rounded-none border-2 border-slate-100 shadow-sm flex justify-between items-center"
                  style={{ borderLeftColor: getSourceColor('His') }}
                >
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">
                      His Contribution
                    </span>
                    <span className="text-2xl font-mono font-black text-slate-900">
                      ${formatCurrency(settlement.hisYearlyEffort)}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-none text-slate-400">
                    <Award size={20} />
                  </div>
                </div>

                <div
                  className="p-5 bg-white border-l-4 rounded-none border-2 border-slate-100 shadow-sm flex justify-between items-center"
                  style={{ borderLeftColor: getSourceColor('Her') }}
                >
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">
                      Her Contribution
                    </span>
                    <span className="text-2xl font-mono font-black text-slate-900">
                      ${formatCurrency(settlement.herYearlyEffort)}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-none text-slate-400">
                    <Award size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Final Balance Sidebar */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900 rounded-none p-8 text-white shadow-xl border-2 border-slate-800 h-full flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 block mb-4">
                    Annual Result
                  </span>
                  <div className="space-y-6">
                    <div>
                      <span
                        className={`text-4xl font-mono font-black block ${settlement.finalBalance < 0 ? 'text-rose-500' : 'text-emerald-400'}`}
                      >
                        ${formatCurrency(settlement.finalBalance)}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed uppercase font-bold">
                        {settlement.finalBalance < 0
                          ? 'Negative Year Projection'
                          : 'Positive Year Projection'}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-800 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-slate-500">
                          Savings Rate
                        </span>
                        <span className="font-mono text-sm text-emerald-400">
                          {settlement.yearlyCredits > 0
                            ? (
                                (settlement.yearlyInvestments /
                                  settlement.yearlyCredits) *
                                100
                              ).toFixed(1)
                            : '0.0'}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-slate-500">
                          Living Efficiency
                        </span>
                        <span className="font-mono text-sm text-blue-400">
                          {settlement.yearlyCredits > 0
                            ? (
                                (1 -
                                  settlement.yearlyLivingExpenses /
                                    settlement.yearlyCredits) *
                                100
                              ).toFixed(1)
                            : '0.0'}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center bg-white/5 p-4 rounded-none border border-white/10">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">
                    Target: $0.00 Balance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog
        open={!!selectedDetails}
        onOpenChange={(open: boolean) => !open && setSelectedDetails(null)}
      >
        <DialogContent className="rounded-none border-slate-300 sm:max-w-md max-h-[70vh] flex flex-col p-0 overflow-hidden [&_[data-slot=dialog-close]]:text-white">
          <DialogHeader className="p-6 bg-slate-900 text-white rounded-none">
            <DialogTitle className="uppercase tracking-widest font-black text-xl flex items-center justify-between pr-8">
              <span>{selectedDetails?.name}</span>
              <span className="text-sm font-mono opacity-50 leading-none">
                {selectedDetails ? months[selectedDetails.month - 1] : ''} 2026
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            <div className="flex flex-col divide-y border border-slate-200">
              {selectedDetails?.transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black uppercase tracking-widest">
                      {tx.description}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-tighter">
                        {tx.source}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {tx.date instanceof Date
                          ? tx.date.toLocaleDateString()
                          : tx.date}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm ${
                      tx.amount < 0 ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.amount < 0 ? '+' : ''}$
                    {formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
              Monthly Total
            </span>
            <span className="font-mono font-black text-lg">
              $
              {formatCurrency(
                selectedDetails?.transactions.reduce(
                  (sum, tx) => sum + (tx.amount || 0),
                  0
                ) || 0
              )}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
