'use client';

import React, { useState } from 'react';
import { Category } from '@prisma/client';
import { getColorCode, months, formatCurrency } from '@/lib/utils';

interface YearlyTableProps {
  categories: Category[];
  initialSubcategories: any[];
}

export function YearlyTable({
  categories,
  initialSubcategories
}: YearlyTableProps) {
  const [subcategories] = useState(initialSubcategories);

  const getSubData = (subName: string, month: number) => {
    return subcategories.find(
      (s) => s.name === subName && s.month === month && s.year === 2026
    );
  };

  // Helper to get total income for a specific month
  const getMonthlyIncome = (month: number) => {
    return subcategories
      .filter(
        (s) => s.category?.name.toLowerCase() === 'income' && s.month === month
      )
      .reduce((sum, s) => sum + (s.amount || 0), 0);
  };

  // Helper to get net cash flow (Income - Expenses)
  const getMonthlyNet = (month: number) => {
    return subcategories
      .filter((s) => s.month === month && s.year === 2026)
      .reduce((acc, s) => {
        const isIncome = s.category?.name.toLowerCase() === 'income';
        const amount = s.amount || 0;
        return isIncome ? acc + amount : acc - amount;
      }, 0);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto border bg-background shadow-sm no-scrollbar">
        <table className="w-full border-collapse min-w-[1600px]">
          <thead>
            <tr className="bg-secondary/30">
              <th className="sticky left-0 z-20 bg-secondary/30 p-4 text-left text-xs font-bold uppercase border-r w-[220px]">
                Category / Subcategory
              </th>
              {months.map((m) => (
                <th
                  key={m}
                  className="p-4 text-center text-xs font-bold uppercase border-r min-w-[110px]"
                >
                  {m}
                </th>
              ))}
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
                      backgroundColor: `${getColorCode(category.color).backgroundColor}20`, // Adding '20' for 12% opacity
                      borderTop: `2px solid ${getColorCode(category.color).backgroundColor}`
                    }}
                    className="border-b"
                  >
                    <td className="sticky left-0 z-10 p-3 font-bold text-sm border-r flex items-center gap-3">
                      {/* The Dot Indicator */}
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{
                          backgroundColor: getColorCode(category.color)
                            .backgroundColor
                        }}
                      />
                      <span className="uppercase tracking-wider">
                        {category.name}
                      </span>
                    </td>

                    {/* Empty cells for the months, tinted with the category color */}
                    {months.map((_, i) => (
                      <td key={i} className="border-r border-secondary/20" />
                    ))}

                    {/* Total YTD column for the header row */}
                    <td className="bg-primary/5 border-l border-secondary/20" />
                  </tr>

                  {uniqueSubNames.map((name) => {
                    let subYtd = 0;
                    return (
                      <tr
                        key={name}
                        className="hover:bg-secondary/5 border-b transition-colors text-xs text-muted-foreground"
                      >
                        <td className="sticky left-0 z-10 bg-background p-3 border-r pl-8">
                          {name}
                        </td>
                        {months.map((_, i) => {
                          const data = getSubData(name, i + 1);
                          const val = data?.amount || 0;
                          subYtd += val;
                          return (
                            <td
                              key={i}
                              className="p-3 text-center border-r font-mono"
                            >
                              ${formatCurrency(val)}
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
                      const catMonthTotal = subcategories
                        .filter(
                          (s) =>
                            s.categoryId === category.id && s.month === i + 1
                        )
                        .reduce((sum, s) => sum + (s.amount || 0), 0);
                      return (
                        <td
                          key={i}
                          className="p-3 text-center border-r font-mono"
                        >
                          ${formatCurrency(catMonthTotal)}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center bg-primary/10 font-mono text-primary">
                      $
                      {formatCurrency(
                        subcategories
                          .filter((s) => s.categoryId === category.id)
                          .reduce((sum, s) => sum + (s.amount || 0), 0)
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
                return (
                  <td
                    key={i}
                    className="p-4 text-center border-r font-mono text-sm"
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

                return (
                  <td
                    key={i}
                    className="p-3 text-center border-r font-mono text-xs"
                  >
                    {percentage > 0 ? percentage.toFixed(1) : '0.0'}%
                  </td>
                );
              })}
              <td className="p-3 text-center bg-emerald-700 font-mono text-xs">
                {(() => {
                  const totalIncome = subcategories
                    .filter((s) => s.category?.name.toLowerCase() === 'income')
                    .reduce((sum, s) => sum + (s.amount || 0), 0);
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
          </tfoot>
        </table>
      </div>
    </div>
  );
}
