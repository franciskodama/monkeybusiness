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
import { Info } from 'lucide-react';
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
                <th className="sticky left-0 z-20 bg-secondary/30 p-4 text-left text-[10px] font-base uppercase border-r w-[220px]">
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
                          <span className="text-primary font-bold bg-accent px-2 py-1">
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
                      <td className="sticky left-0 z-10 p-3 font-bold text-sm border-r flex items-center gap-3">
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
                          <td className="sticky left-0 z-10 bg-background p-3 border-r pl-8 text-sm font-semibold text-primary">
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
                      <td className="sticky left-0 z-10 bg-secondary/10 p-3 border-r pl-8 italic">
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
              {/* NET CASH FLOW ROW */}
              <tr className="bg-slate-900 text-white font-bold">
                <td className="sticky left-0 z-10 bg-slate-900 p-4 border-r uppercase text-xs">
                  Net Cash Flow
                </td>
                {months.map((_, i) => {
                  const net = getMonthlyNet(i + 1);
                  const status = getMonthStatus(i + 1);
                  return (
                    <td
                      key={i}
                      className={`p-4 text-center border-r font-mono text-sm ${
                        status === 'PAST'
                          ? 'bg-slate-950 font-black'
                          : status === 'CURRENT'
                            ? 'bg-primary/30 text-slate-900 border-x border-primary font-black'
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
                    months.reduce((acc, _, i) => acc + getMonthlyNet(i + 1), 0)
                  )}
                </td>
              </tr>

              {/* NEW: SAVINGS GOAL % ROW */}
              <tr className="bg-emerald-600 text-white font-bold border-t border-emerald-500">
                <td className="sticky left-0 z-10 bg-emerald-600 p-3 border-r uppercase text-[10px]">
                  Savings Rate (%)
                </td>
                {months.map((_, i) => {
                  const income = getMonthlyIncome(i + 1);
                  const net = getMonthlyNet(i + 1);
                  const percentage = income > 0 ? (net / income) * 100 : 0;
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
                    const totalIncome = months.reduce(
                      (sum, _, i) => sum + getMonthlyIncome(i + 1),
                      0
                    );
                    const totalNet = months.reduce(
                      (acc, _, i) => acc + getMonthlyNet(i + 1),
                      0
                    );
                    return totalIncome > 0
                      ? ((totalNet / totalIncome) * 100).toFixed(1)
                      : '0.0';
                  })()}
                  %
                </td>
              </tr>

              {/* SPACER GAP */}
              <tr className="h-2 bg-gray-200">
                <td colSpan={14} className="border-y border-secondary/20" />
              </tr>

              {/* SOURCE BREAKDOWN ROWS */}
              {['Family', 'His', 'Her'].map((source) => {
                const sourceColor = getSourceColor(source);
                return (
                  <tr
                    key={source}
                    style={{
                      backgroundColor: `${sourceColor}08`
                    }}
                    className="border-b text-xs text-muted-foreground font-medium"
                  >
                    <td
                      style={{ borderLeft: `4px solid ${sourceColor}` }}
                      className="sticky left-0 z-10 bg-inherit p-3 border-r pl-8 uppercase tracking-widest text-[9px] font-black"
                    >
                      Total {source}
                    </td>
                    {months.map((_, i) => {
                      const val = getMonthlySourceTotal(i + 1, source);
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
                        backgroundColor: `${sourceColor}15`,
                        color: sourceColor
                      }}
                    >
                      {(() => {
                        const total = months.reduce(
                          (acc, _, i) =>
                            acc + getMonthlySourceTotal(i + 1, source),
                          0
                        );
                        return `$${formatCurrency(total)}`;
                      })()}
                    </td>
                  </tr>
                );
              })}
              {/* SPACER GAP */}
              <tr className="h-2 bg-gray-200">
                <td colSpan={14} className="border-y border-secondary/20" />
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>

      <Dialog
        open={!!selectedDetails}
        onOpenChange={(open) => !open && setSelectedDetails(null)}
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
