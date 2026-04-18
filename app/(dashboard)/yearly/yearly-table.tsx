'use client';

import React, { useState, useRef } from 'react';
import {
  Info,
  AlertCircle,
  ChessKing,
  TrendingUp,
  X,
  Target,
  Minus,
  FileText,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AnimatePresence, motion } from 'framer-motion';

import { Category } from '@prisma/client';
import { SubcategoryWithCategory, TransactionInput } from '@/lib/types';
import {
  getColorCode,
  months,
  formatCurrency,
  getSourceColor,
  formatDate
} from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExplanationYearly from './explanation-yearly';
import { Button } from '@/components/ui/button';

interface YearlyTableProps {
  categories: Category[];
  initialSubcategories: SubcategoryWithCategory[];
  person1Name?: string;
  person2Name?: string;
  year: number;
}

export function YearlyTable({
  categories,
  initialSubcategories,
  person1Name = 'Partner 1',
  person2Name = 'Partner 2',
  year
}: YearlyTableProps) {
  const [openAction, setOpenAction] = useState(false);
  const [subcategories] =
    useState<SubcategoryWithCategory[]>(initialSubcategories);
  const [selectedDetails, setSelectedDetails] = useState<{
    name: string;
    month: number;
    transactions: TransactionInput[];
  } | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const handleExportPDF = async () => {
    if (!tableRef.current) return;
    setIsExporting(true);

    try {
      const element = tableRef.current;
      const fullWidth = element.scrollWidth;
      const fullHeight = element.scrollHeight;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth + 100, // Add a small buffer
        onclone: (clonedDoc) => {
          const table = clonedDoc.getElementById('yearly-table-capture');
          if (table) {
            table.style.width = `${fullWidth}px`;
            table.style.height = `${fullHeight}px`;
            table.style.overflow = 'visible';
            table.style.position = 'absolute';
            table.style.left = '0';
            table.style.top = '0';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`family-audit-${year}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const metricExplanations: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { label: string; desc: string; icon: any }
  > = {
    savingsRate: {
      label: 'Savings Rate',
      desc: 'Annualized percentage of effort assigned to investments. Tracks wealth building consistency over the year.',
      icon: TrendingUp
    },
    efficiency: {
      label: 'Living Efficiency',
      desc: 'Measures how well you are staying within the pool budget across all months so far.',
      icon: Target
    },
    burn: {
      label: 'YTD Burn',
      desc: 'The cumulative total of all living expenses paid from the family pool since January.',
      icon: Minus
    },
    settlement: {
      label: 'Final Settlement',
      desc: 'The net result of all year-to-date income versus all spending and saving missions.',
      icon: Target
    },
    status: {
      label: 'Annual Efficiency Status',
      desc: 'Master Efficiency is awarded when your investment speed and living costs are perfectly optimized at an annual scale. Stable Growth means your velocity is active.',
      icon: ChessKing
    }
  };

  const MetricTooltip = ({ metric }: { metric: string }) => (
    <AnimatePresence>
      {activeMetric === metric && metricExplanations[metric] && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="bg-slate-900 border-2 border-slate-700 p-4 relative shadow-[4px_4px_0px_rgba(30,41,59,1)] mb-4"
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
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Annual Definition / {metricExplanations[metric].label}
            </span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-300 font-bold">
            {metricExplanations[metric].desc}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = year;

  const getAmount = (amount: number | string | null | undefined): number => {
    if (amount === null || amount === undefined) return 0;
    if (typeof amount === 'number') return amount;
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  };

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
          (sum: number, tx) => sum + getAmount(tx.amount),
          0
        ) || 0
      );
    }
    return data?.amount || 0;
  };

  //--- YEARLY SETTLEMENT LOGIC (Separate Forecast vs Reality) ---
  const calculateYearlySettlement = () => {
    const forecast = { effort: 0, expenses: 0, investments: 0 };
    const reality = {
      p1Actual: 0,
      p2Actual: 0,
      effort: 0,
      expenses: 0,
      investments: 0
    };

    for (let m = 1; m <= 12; m++) {
      const status = getMonthStatus(m);
      const monthSubs = subcategories.filter(
        (s) => s.month === m && s.year === currentYear
      );

      monthSubs.forEach((sub) => {
        const isIncome = sub.category?.isIncome;
        const isSavings = sub.category?.isSavings;

        // FORECAST: Always uses sub.amount for the full 12 months
        if (isIncome) forecast.effort += sub.amount || 0;
        else if (isSavings) forecast.investments += sub.amount || 0;
        else forecast.expenses += sub.amount || 0;

        // REALITY: Only PAST/CURRENT based on transactions
        if (status !== 'FUTURE') {
          const actualAmount =
            sub.transactions?.reduce(
              (tsum: number, t) => tsum + getAmount(t.amount),
              0
            ) || 0;

          if (isIncome) reality.effort += actualAmount;
          else if (isSavings) reality.investments += actualAmount;
          else reality.expenses += actualAmount;

          // Individual actuals (Person 1 vs Person 2) - ALL transactions count as "Contribution"
          const person1 = (sub.transactions || [])
            .filter((tx) => tx.source === 'PERSON1')
            .reduce((tsum: number, tx) => tsum + getAmount(tx.amount), 0);
          const person2 = (sub.transactions || [])
            .filter((tx) => tx.source === 'PERSON2')
            .reduce((tsum: number, tx) => tsum + getAmount(tx.amount), 0);

          reality.p1Actual += person1;
          reality.p2Actual += person2;
        }
      });
    }

    // Force reality effort to be the sum of individual contributions (Nominal Truth)
    reality.effort = reality.p1Actual + reality.p2Actual;

    // Mathematical Surplus: (Total Funding) - (Expenses already in that funding) - (Expenses to pool) = Surplus
    // Since Effort = Income + Payments + InvestmentMoves, we must subtract the non-income parts twice:
    // Once to offset their inclusion in Effort, and once to account for the real cost.
    const balanceBeforeInvestments = reality.effort - reality.expenses * 2;
    const finalBalance = balanceBeforeInvestments - reality.investments * 2;

    return {
      forecast,
      reality,
      yearlyLivingExpenses: reality.expenses,
      yearlyInvestments: reality.investments,
      p1YearlyEffort: reality.p1Actual,
      p2YearlyEffort: reality.p2Actual,
      totalEffort: reality.effort,
      finalBalance
    };
  };

  const settlement = calculateYearlySettlement();

  //--- MONTHLY SETTLEMENT LOGIC (For the grid rows) ---
  const calculateMonthlySettlement = (month: number) => {
    let livingExpenses = 0;
    let investments = 0;
    let p1Effort = 0;
    let p2Effort = 0;
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
            (sum: number, t) => sum + getAmount(t.amount),
            0
          ) || 0;
      } else {
        amount = sub.amount || 0;
      }

      if (isIncome) {
        credits += amount;
        if (status !== 'FUTURE') {
          p1Effort += (sub.transactions || [])
            .filter((tx) => tx.source === 'PERSON1')
            .reduce((tsum: number, tx) => tsum + getAmount(tx.amount), 0);
          p2Effort += (sub.transactions || [])
            .filter((tx) => tx.source === 'PERSON2')
            .reduce((tsum: number, tx) => tsum + getAmount(tx.amount), 0);
        }
      } else if (isSavings) {
        investments += amount;
        if (status !== 'FUTURE') {
          p1Effort += (sub.transactions || [])
            .filter((tx) => tx.source === 'PERSON1')
            .reduce((tsum: number, tx) => tsum + getAmount(tx.amount), 0);
          p2Effort += (sub.transactions || [])
            .filter((tx) => tx.source === 'PERSON2')
            .reduce((tsum: number, tx) => tsum + getAmount(tx.amount), 0);
        }
      } else {
        livingExpenses += amount;
        if (status !== 'FUTURE') {
          p1Effort += (sub.transactions || [])
            .filter((tx) => tx.source === 'PERSON1')
            .reduce((tsum: number, tx) => tsum + getAmount(tx.amount), 0);
          p2Effort += (sub.transactions || [])
            .filter((tx) => tx.source === 'PERSON2')
            .reduce((tsum: number, tx) => tsum + getAmount(tx.amount), 0);
        }
      }
    });

    // The contribution includes money already paid out for expenses AND investments.
    // To find the net cash surplus, we must subtract the living expenses and investments twice:
    // Once to offset the "transaction contribution" and once to account for the "pool cost".
    const balanceBeforeInvestments = p1Effort + p2Effort - livingExpenses * 2;
    const finalBalance = balanceBeforeInvestments - investments * 2;

    return {
      p1Effort,
      p2Effort,
      credits,
      totalEffort: p1Effort + p2Effort,
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
          <div className="flex items-center gap-4">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              variant="outline"
            >
              {isExporting ? (
                <Loader2 className="animate-spin mr-2" size={14} />
              ) : (
                <FileText size={14} className="mr-2" />
              )}
              <span>{isExporting ? 'Preparing...' : 'Export PDF'}</span>
            </Button>
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

        <div
          ref={tableRef}
          id="yearly-table-capture"
          className="overflow-x-auto border bg-background shadow-sm no-scrollbar p-1 bg-white"
        >
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
                <th className="p-4 text-center text-[10px] font-black uppercase bg-slate-50 border-r w-[110px]">
                  Actual YTD
                </th>
                <th className="p-4 text-center text-[10px] font-black uppercase bg-primary/5 w-[110px]">
                  Annual Total
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

                      <td className="bg-slate-50 border-r border-secondary/20" />
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
                                      transactions: data?.transactions || []
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
                                      {data?.transactions?.length ?? 0} tx
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-3 text-center font-bold bg-slate-50 border-r font-mono">
                            $
                            {formatCurrency(
                              months.reduce((acc, _, i) => {
                                if (getMonthStatus(i + 1) === 'FUTURE')
                                  return acc;
                                return acc + getDisplayValue(name, i + 1);
                              }, 0)
                            )}
                          </td>
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
                                  (tsum: number, t) =>
                                    tsum + getAmount(t.amount),
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
                      <td className="p-3 text-center bg-slate-100/60 border-r font-mono font-black">
                        $
                        {formatCurrency(
                          months.reduce((msum, _, i) => {
                            if (getMonthStatus(i + 1) === 'FUTURE') return msum;
                            return (
                              msum +
                              subcategories
                                .filter(
                                  (s) =>
                                    s.categoryId === category.id &&
                                    s.month === i + 1
                                )
                                .reduce((tsum, s) => {
                                  return (
                                    tsum +
                                    (s.transactions?.reduce(
                                      (innerSum, t) =>
                                        innerSum + getAmount(t.amount),
                                      0
                                    ) || 0)
                                  );
                                }, 0)
                            );
                          }, 0)
                        )}
                      </td>
                      <td className="p-3 text-center bg-primary/10 font-mono text-primary font-black">
                        $
                        {formatCurrency(
                          months.reduce((msum, _, i) => {
                            const status = getMonthStatus(i + 1);
                            const monthSum = subcategories
                              .filter(
                                (s) =>
                                  s.categoryId === category.id &&
                                  s.month === i + 1
                              )
                              .reduce((tsum, s) => {
                                if (status !== 'FUTURE') {
                                  return (
                                    tsum +
                                    (s.transactions?.reduce(
                                      (innerSum, t) =>
                                        innerSum + getAmount(t.amount),
                                      0
                                    ) || 0)
                                  );
                                }
                                return tsum + (s.amount || 0);
                              }, 0);
                            return msum + monthSum;
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
                <td colSpan={15} className="border-y border-secondary/20" />
              </tr>

              {/* NEW SETTLEMENT GRID ROWS */}
              {[
                {
                  label: `${person1Name} Contribution`,
                  key: 'p1Effort',
                  color: getSourceColor('PERSON1')
                },
                {
                  label: `${person2Name} Contribution`,
                  key: 'p2Effort',
                  color: getSourceColor('PERSON2')
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
                    className="sticky left-0 z-10 p-3 border-r pl-8 uppercase tracking-widest text-[11px] font-black shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                  >
                    {row.label}
                  </td>
                  {months.map((_, i) => {
                    const monthlyData = calculateMonthlySettlement(i + 1);
                    const val =
                      monthlyData[row.key as keyof typeof monthlyData];
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
                    className="p-3 text-center font-mono font-black border-l bg-slate-50 border-r"
                    style={{
                      color: row.color
                    }}
                  >
                    $
                    {formatCurrency(
                      months.reduce((acc, _, i) => {
                        if (getMonthStatus(i + 1) === 'FUTURE') return acc;
                        return (
                          acc +
                          calculateMonthlySettlement(i + 1)[
                            row.key as keyof ReturnType<
                              typeof calculateMonthlySettlement
                            >
                          ]
                        );
                      }, 0)
                    )}
                  </td>
                  <td
                    className="p-3 text-center font-mono font-black"
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
                          calculateMonthlySettlement(i + 1)[
                            row.key as keyof ReturnType<
                              typeof calculateMonthlySettlement
                            >
                          ],
                        0
                      )
                    )}
                  </td>
                </tr>
              ))}
              <tr className="h-2 bg-gray-200">
                <td colSpan={15} className="border-y border-secondary/20" />
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
                <td className="p-4 text-center bg-slate-800 font-mono text-sm border-r">
                  $
                  {formatCurrency(
                    months.reduce((acc, _, i) => {
                      if (getMonthStatus(i + 1) === 'FUTURE') return acc;
                      return (
                        acc + calculateMonthlySettlement(i + 1).finalBalance
                      );
                    }, 0)
                  )}
                </td>
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
                <td className="p-3 text-center bg-emerald-800 font-mono text-xs border-r">
                  {(() => {
                    const monthsData = months
                      .filter((_, i) => getMonthStatus(i + 1) !== 'FUTURE')
                      .map((_, i) => calculateMonthlySettlement(i + 1));
                    const totalIncome = monthsData.reduce(
                      (msum, d) => msum + d.totalEffort,
                      0
                    );
                    const totalSaved = monthsData.reduce(
                      (msum, d) => msum + d.finalBalance + d.investments,
                      0
                    );
                    const avgPercentage =
                      totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;
                    return `${avgPercentage.toFixed(1)}%`;
                  })()}
                </td>
                <td className="p-3 text-center bg-emerald-700 font-mono text-xs">
                  {(() => {
                    const monthsData = months.map((_, i) =>
                      calculateMonthlySettlement(i + 1)
                    );
                    const totalIncome = monthsData.reduce(
                      (msum, d) => msum + d.totalEffort,
                      0
                    );
                    const totalSaved = monthsData.reduce(
                      (msum, d) => msum + d.finalBalance + d.investments,
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Logic Rows */}
            <div className="lg:col-span-9 space-y-20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 rounded-none">
                  <ChessKing size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Yearly Settlement
                  </h3>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest">
                    Aggregated Financial Logic (YTD + Forecast)
                  </p>
                </div>
              </div>

              <div className="space-y-12">
                {/* 1 - FORECAST */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-4 h-4 rounded-none bg-slate-400 border-2 border-slate-400 flex items-center justify-center font-mono font-black text-white text-[11px]">
                      1
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      Forecast / Annual Plan
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-white border-2 border-slate-100 flex flex-col gap-1 shadow-[4px_4px_0px_rgba(241,245,249,1)]">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        Total Effort
                      </span>
                      <span className="text-xl font-mono font-black text-slate-900">
                        ${formatCurrency(settlement.forecast.effort)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 h-full">
                      <div
                        className={`p-6 border-2 flex flex-col gap-1 flex-1 transition-colors duration-500 shadow-[4px_4px_0px_rgba(241,245,249,1)] ${
                          settlement.forecast.expenses >
                          settlement.forecast.effort
                            ? 'bg-rose-50 border-rose-200 shadow-[4px_4px_0px_rgba(251,113,133,0.1)]'
                            : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[11px] font-black uppercase tracking-widest ${settlement.forecast.expenses > settlement.forecast.effort ? 'text-rose-600' : 'text-slate-400'}`}
                          >
                            Total Expenses
                          </span>
                          {settlement.forecast.expenses >
                            settlement.forecast.effort && (
                            <AlertCircle size={12} className="text-rose-500" />
                          )}
                        </div>
                        <span
                          className={`text-xl font-mono font-black ${settlement.forecast.expenses > settlement.forecast.effort ? 'text-rose-900' : 'text-slate-900'}`}
                        >
                          ${formatCurrency(settlement.forecast.expenses)}
                        </span>
                      </div>
                      {settlement.forecast.expenses >
                        settlement.forecast.effort && (
                        <div className="flex items-center justify-center gap-2 py-1.5 bg-rose-500 border-2 border-rose-500 shadow-[4px_4px_0px_rgba(251,113,133,0.2)]">
                          <AlertCircle size={10} className="text-white" />
                          <span className="text-xs font-black uppercase tracking-widest text-white">
                            Plan Deficit Warning
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 bg-white border-2 border-slate-100 flex flex-col gap-1 shadow-[4px_4px_0px_rgba(241,245,249,1)]">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        Total Investments
                      </span>
                      <span className="text-xl font-mono font-black text-slate-900">
                        ${formatCurrency(settlement.forecast.investments)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* 2 - REALITY */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-4 h-4 rounded-none bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center font-mono font-black text-white text-[11px]">
                      2
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                      Reality / Year-To-Date
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-6 bg-cyan-50/30 border-2 border-cyan-100 flex justify-between items-center group shadow-[4px_4px_0px_rgba(165,243,252,0.4)]">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-cyan-600 block mb-1">
                          {person1Name} Contribution
                        </span>
                        <span className="text-2xl font-mono font-black text-cyan-900">
                          ${formatCurrency(settlement.reality.p1Actual)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-cyan-600 font-black">
                          {Math.round(
                            (settlement.reality.p1Actual /
                              (settlement.reality.effort || 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="p-6 bg-orange-50/30 border-2 border-orange-100 flex justify-between items-center group shadow-[4px_4px_0px_rgba(254,215,170,0.4)]">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-orange-600 block mb-1">
                          {person2Name} Contribution
                        </span>
                        <span className="text-2xl font-mono font-black text-orange-900">
                          ${formatCurrency(settlement.reality.p2Actual)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-orange-600 font-semibold">
                          {Math.round(
                            (settlement.reality.p2Actual /
                              (settlement.reality.effort || 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-emerald-50 border-2 border-emerald-100 flex flex-col gap-1 shadow-[4px_4px_0px_rgba(209,250,229,1)]">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
                          Total Effort
                        </span>
                      </div>
                      <span className="text-xl font-mono font-black text-emerald-900">
                        ${formatCurrency(settlement.reality.effort)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 h-full">
                      <div
                        className={`p-6 border-2 flex flex-col gap-1 flex-1 transition-colors duration-500 shadow-[4px_4px_0px_rgba(241,245,249,1)] ${
                          settlement.reality.expenses >
                          settlement.reality.effort
                            ? 'bg-rose-50 border-rose-200 shadow-[4px_4px_0px_rgba(251,113,133,0.1)]'
                            : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-1.5 h-1.5 ${settlement.reality.expenses > settlement.reality.effort ? 'bg-rose-400' : 'bg-slate-300'}`}
                            />
                            <span
                              className={`text-[11px] font-black uppercase tracking-widest ${settlement.reality.expenses > settlement.reality.effort ? 'text-rose-700' : 'text-slate-400'}`}
                            >
                              Total Expenses
                            </span>
                          </div>
                          {settlement.reality.expenses >
                            settlement.reality.effort && (
                            <AlertCircle size={12} className="text-rose-500" />
                          )}
                        </div>
                        <span
                          className={`text-xl font-mono font-black ${settlement.reality.expenses > settlement.reality.effort ? 'text-rose-900' : 'text-slate-900'}`}
                        >
                          ${formatCurrency(settlement.reality.expenses)}
                        </span>
                      </div>
                      {settlement.reality.expenses >
                        settlement.reality.effort && (
                        <div className="flex items-center justify-center gap-2 py-1.5 bg-rose-500 border-2 border-rose-500 shadow-[4px_4px_0px_rgba(251,113,133,0.2)]">
                          <AlertCircle size={10} className="text-white" />
                          <span className="text-xs font-black uppercase tracking-widest text-white">
                            Reality Deficit Warning
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 bg-blue-50 border-2 border-blue-100 flex flex-col gap-1 shadow-[4px_4px_0px_rgba(239,246,255,1)]">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-blue-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-blue-700">
                          Total Investments
                        </span>
                      </div>
                      <span className="text-xl font-mono font-black text-blue-900">
                        ${formatCurrency(settlement.reality.investments)}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Final Balance Sidebar */}
            <div className="lg:col-span-3 h-full">
              <div className="bg-slate-900 rounded-none p-8 text-white border-2 border-slate-800 h-full flex flex-col justify-between shadow-[6px_6px_0px_rgba(15,23,42,0.3)] min-h-[600px]">
                <div className="space-y-12">
                  {/* Yearly Header */}
                  <div className="border-b-2 border-slate-700 pb-8 -mx-2">
                    <span className="text-[10px] uppercase font-black tracking-[0.4em] text-emerald-500 block mb-1">
                      Annual Settlement
                    </span>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
                      {currentYear}
                    </h2>
                  </div>

                  {/* 1. Score: Yearly Effort */}
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 block mb-4">
                      Yearly Effort
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-mono font-black text-emerald-400">
                          ${formatCurrency(settlement.reality.effort)}
                        </span>
                        <span className="text-xs font-bold text-slate-500 mb-1.5 underline decoration-emerald-500/30 font-mono">
                          YTD
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed uppercase font-bold tracking-widest">
                        Total Year-To-Date Reality
                      </p>
                    </div>
                  </div>

                  {/* 2. Annual Funding Split Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">
                      <span>
                        {person1Name}{' '}
                        {Math.round(
                          (settlement.reality.p1Actual /
                            (settlement.reality.effort || 1)) *
                            100
                        )}
                        %
                      </span>
                      <span>
                        {person2Name}{' '}
                        {Math.round(
                          (settlement.reality.p2Actual /
                            (settlement.reality.effort || 1)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 flex rounded-none overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-1000"
                        style={{
                          width: `${(settlement.reality.p1Actual / (settlement.reality.effort || 1)) * 100}%`
                        }}
                      />
                      <div
                        className="h-full bg-orange-500 transition-all duration-1000"
                        style={{
                          width: `${(settlement.reality.p2Actual / (settlement.reality.effort || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* 3. Annual Performance Index Table */}
                  <div className="space-y-4 pt-4 border-t border-slate-800/50">
                    <span className="text-[11px] uppercase font-black tracking-widest text-slate-600">
                      Performance Index
                    </span>
                    <div className="space-y-4">
                      <div
                        onClick={() =>
                          setActiveMetric(
                            activeMetric === 'savingsRate'
                              ? null
                              : 'savingsRate'
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
                          {settlement.reality.effort > 0
                            ? (
                                (settlement.reality.investments /
                                  settlement.reality.effort) *
                                100
                              ).toFixed(1)
                            : '0.0'}
                          %
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
                          {settlement.reality.effort > 0
                            ? (
                                (1 -
                                  settlement.reality.expenses /
                                    settlement.reality.effort) *
                                100
                              ).toFixed(1)
                            : '0.0'}
                          %
                        </span>
                      </div>
                      <MetricTooltip metric="efficiency" />

                      <div
                        onClick={() =>
                          setActiveMetric(
                            activeMetric === 'burn' ? null : 'burn'
                          )
                        }
                        className={`flex justify-between items-center group cursor-help transition-all p-1.5 -mx-1.5 border border-transparent hover:border-slate-800 ${activeMetric === 'burn' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-100 transition-colors">
                          <div
                            className={`w-1 h-1 transition-all ${activeMetric === 'burn' ? 'bg-slate-100 scale-150' : 'bg-slate-500'}`}
                          />
                          <span className="text-[10px] font-bold uppercase transition-all">
                            YTD Burn
                          </span>
                        </div>
                        <span className="font-mono text-sm font-black text-slate-300">
                          ${formatCurrency(settlement.reality.expenses)}
                        </span>
                      </div>
                      <MetricTooltip metric="burn" />
                    </div>
                  </div>

                  {/* 4. Final Balance Anchor */}
                  <div
                    onClick={() =>
                      setActiveMetric(
                        activeMetric === 'settlement' ? null : 'settlement'
                      )
                    }
                    className={`p-6 rounded-none border-2 transition-all duration-1000 cursor-help ${
                      settlement.finalBalance < 0
                        ? 'bg-rose-500/5 border-rose-500/50'
                        : 'bg-emerald-500/5 border-emerald-500/50'
                    } ${activeMetric === 'settlement' ? 'ring-2 ring-slate-400 border-slate-400' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                        Final Settlement
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-3xl font-mono font-black ${
                          settlement.finalBalance < 0
                            ? 'text-rose-500'
                            : 'text-emerald-400'
                        }`}
                      >
                        ${formatCurrency(settlement.finalBalance)}
                      </span>
                      <p className="text-[11px] uppercase font-bold text-slate-500 mt-2 leading-relaxed tracking-tight underline decoration-slate-500/20">
                        {settlement.finalBalance < 0
                          ? 'Deficit Year Projection'
                          : 'Positive Year Projection'}
                      </p>
                    </div>
                  </div>
                  <MetricTooltip metric="settlement" />
                </div>

                {/* 5. Annual Status Badge */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <div
                    onClick={() =>
                      setActiveMetric(
                        activeMetric === 'status' ? null : 'status'
                      )
                    }
                    className={`p-3 border-2 flex items-center justify-center gap-3 group transition-all cursor-help ${activeMetric === 'status' ? 'bg-slate-800 border-slate-600' : 'bg-white/5 border-slate-800 hover:bg-slate-800'}`}
                  >
                    {settlement.reality.investments /
                      (settlement.reality.effort || 1) >
                    0.3 ? (
                      <ChessKing
                        size={14}
                        className="text-emerald-400 group-hover:scale-125 transition-transform"
                      />
                    ) : (
                      <TrendingUp size={14} className="text-slate-500" />
                    )}
                    <span className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em]">
                      {settlement.reality.investments /
                        (settlement.reality.effort || 1) >
                      0.3
                        ? 'Master Efficiency'
                        : 'Consistency Build'}
                    </span>
                  </div>
                  <MetricTooltip metric="status" />
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
                {selectedDetails ? months[selectedDetails.month - 1] : ''}{' '}
                {currentYear}
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
                      <span className="text-[11px] text-primary font-bold uppercase tracking-tighter">
                        {tx.source === 'PERSON1'
                          ? person1Name
                          : tx.source === 'PERSON2'
                            ? person2Name
                            : tx.source}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {tx.date ? formatDate(tx.date) : ''}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm ${
                      getAmount(tx.amount) < 0
                        ? 'text-emerald-600'
                        : 'text-slate-900'
                    }`}
                  >
                    {getAmount(tx.amount) < 0 ? '+' : ''}$
                    {formatCurrency(Math.abs(getAmount(tx.amount)))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
              Monthly Total
            </span>
            <span className="text-xl font-black font-mono text-slate-900">
              $
              {formatCurrency(
                selectedDetails?.transactions.reduce(
                  (sum, tx) => sum + getAmount(tx.amount),
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
