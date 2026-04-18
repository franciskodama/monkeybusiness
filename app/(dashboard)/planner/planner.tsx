'use client';

import { useState } from 'react';
import {
  Download,
  Trash2,
  Award,
  History,
  Info,
  Calendar,
  Tag,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AddCategory } from './add-category';
import { Button } from '@/components/ui/button';
import {
  getColorCode,
  months,
  formatCurrency,
  formatCurrencyRounded,
  formatDate
} from '@/lib/utils';
import { Category } from '@prisma/client';
import { barlow, kumbh_sans } from '@/lib/fonts';
import { EditableAmount } from './edit-amount-subcategory';
import { EditableSubcategoryName } from './edit-name-subcategory';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import Help from '@/components/Help';
import ExplanationPlanner from './explanation-planner';
import { AddTransactionModal } from './add-transaction-modal';
import { TransactionImporter } from './transaction-importer';
import { DirectCodeImporter } from './transaction-direct-code-importer';
import { TransactionReviewModal } from './transaction-review-modal';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  TransactionWithSubcategory,
  SubcategoryWithCategory,
  TransactionInput
} from '@/lib/types';
import { deleteSubcategory } from '@/lib/actions/budget';
import { deleteTransaction } from '@/lib/actions/transactions';
import { AddSubcategory } from './add-subcategory';
import { MonthSettlement } from '@/components/MonthSettlement';

export default function Planner({
  householdId,
  categories,
  subcategories,
  brlRate,
  person1Name,
  person2Name,
  year,
  recentTransactions
}: {
  householdId: string;
  categories: Category[];
  subcategories: SubcategoryWithCategory[];
  brlRate: number;
  person1Name?: string | null;
  person2Name?: string | null;
  year: number;
  recentTransactions: TransactionWithSubcategory[];
}) {
  const p1Name = person1Name || 'Partner 1';
  const p2Name = person2Name || 'Partner 2';

  const [openAction, setOpenAction] = useState(false);
  const [currentSubcategories, setCurrentSubcategoriesAction] =
    useState<SubcategoryWithCategory[]>(subcategories);
  const [currentCategories, setCurrentCategoriesAction] =
    useState<Category[]>(categories);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentYear = year;
  const [reviewData, setReviewData] = useState<
    (TransactionInput & { ignored?: boolean })[] | null
  >(null);
  const [selectedDetails, setSelectedDetails] = useState<{
    name: string;
    month: number;
    transactions: {
      id: string;
      amount: number;
      source: string;
      isIncome: boolean;
      isSavings: boolean;
      description: string;
      subcategoryName?: string;
      date?: Date | string;
    }[];
  } | null>(null);

  const handleUpdateAmount = (
    itemId: string,
    newAmount: number,
    mode: 'SINGLE' | 'FUTURE' | 'ALL'
  ) => {
    setCurrentSubcategoriesAction((prev) => {
      const sourceItem = prev.find((i) => i.id === itemId);
      if (!sourceItem) return prev;

      return prev.map((item) => {
        const isSameSubcategory =
          item.name === sourceItem.name &&
          item.categoryId === sourceItem.categoryId &&
          item.year === sourceItem.year;

        const isTarget =
          (mode === 'SINGLE' && item.id === itemId) ||
          (mode === 'FUTURE' &&
            isSameSubcategory &&
            item.month >= sourceItem.month) ||
          (mode === 'ALL' && isSameSubcategory);

        if (isTarget) return { ...item, amount: newAmount };
        return item;
      });
    });
  };

  const handleRenameSubcategory = (oldName: string, newName: string) => {
    setCurrentSubcategoriesAction((prev) =>
      prev.map((item) =>
        item.name === oldName ? { ...item, name: newName } : item
      )
    );
  };

  const handleDeleteItem = async (
    itemId: string,
    mode: 'SINGLE' | 'FUTURE' | 'ALL'
  ) => {
    const result = await deleteSubcategory(itemId, householdId, mode);
    if (result.success) {
      const itemToDelete = currentSubcategories.find((i) => i.id === itemId);
      if (!itemToDelete) return;
      setCurrentSubcategoriesAction((prev) =>
        prev.filter((item) => {
          if (item.name !== itemToDelete.name) return true;
          if (mode === 'SINGLE') return item.id !== itemId;
          if (mode === 'FUTURE') return item.month < itemToDelete.month;
          if (mode === 'ALL') return false;
          return true;
        })
      );
      toast.success('Item removed');
    } else {
      toast.error('Could not delete item');
    }
  };

  // Helper to safely get numeric amount
  const getAmount = (amount: number | string | null | undefined): number => {
    if (amount === null || amount === undefined) return 0;
    if (typeof amount === 'number') return amount;
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 1. Get only the subcategories for the month the user is looking at
  const currentMonthSubs = currentSubcategories.filter(
    (sub) => sub.month === selectedMonth
  );

  // 2. Flatten all transactions from those subcategories into one list with metadata
  const allTransactions = currentMonthSubs.flatMap(
    (sub) =>
      sub.transactions?.map((tx) => ({
        ...tx,
        isIncome: sub.category.isIncome,
        isSavings: sub.category.isSavings,
        subcategoryName: sub.name
      })) || []
  );

  const [showFundingModal, setShowFundingModal] = useState(false);

  // 3. New Refined Header Logic (Matching User's "Progress vs Target" Request)
  const stats = allTransactions.reduce(
    (acc, tx) => {
      const amount = getAmount(tx.amount);
      // Current Effort = All transactions from PERSON1 & PERSON2 (Contribution Model)
      const s = tx.source?.toUpperCase();
      if (s === 'PERSON1') {
        acc.p1Actual += amount;
        acc.actualContribution += amount;
      }
      if (s === 'PERSON2') {
        acc.p2Actual += amount;
        acc.actualContribution += amount;
      }

      // Actual Living Expenses (excluding Savings and Income)
      if (!tx.isIncome && !tx.isSavings) {
        acc.actualLivingExpenses += amount;
      }

      return acc;
    },
    {
      p1Actual: 0,
      p2Actual: 0,
      actualContribution: 0,
      actualLivingExpenses: 0
    }
  );

  // Targets (Planned Values) - Categorizing by both Subcategory and Parent Category name
  const isP1Identifier = (sub: SubcategoryWithCategory) => {
    const nameStr = (sub.name + ' ' + (sub.category?.name || '')).toUpperCase();
    if (nameStr.includes('PERSON1') || nameStr.includes(p1Name.toUpperCase()))
      return true;
    // Fallback: check if the actual transactions already arrived are from 'PERSON1'
    return sub.transactions?.some((tx) => tx.source === 'PERSON1');
  };

  const isP2Identifier = (sub: SubcategoryWithCategory) => {
    const nameStr = (sub.name + ' ' + (sub.category?.name || '')).toUpperCase();
    if (nameStr.includes('PERSON2') || nameStr.includes(p2Name.toUpperCase()))
      return true;
    // Fallback: check if the actual transactions already arrived are from 'PERSON2'
    return sub.transactions?.some((tx) => tx.source === 'PERSON2');
  };

  // Total Forecast Pool = ALL income items
  const totalPlannedFunding = currentMonthSubs
    .filter((sub) => sub.category.isIncome)
    .reduce((sum, sub) => sum + (sub.amount || 0), 0);

  const p1PlannedIncome = currentMonthSubs
    .filter((sub) => sub.category.isIncome && isP1Identifier(sub))
    .reduce((sum, sub) => sum + (sub.amount || 0), 0);

  const p2PlannedIncome = currentMonthSubs
    .filter((sub) => sub.category.isIncome && isP2Identifier(sub))
    .reduce((sum, sub) => sum + (sub.amount || 0), 0);

  const totalPlannedExpenses = currentMonthSubs
    .filter((sub) => !sub.category.isIncome && !sub.category.isSavings)
    .reduce((sum, sub) => sum + (sub.amount || 0), 0);

  const displayFunding = stats.actualContribution;
  const displayBurn = stats.actualLivingExpenses;
  const displayReadyToInvest = displayFunding - displayBurn;

  const fundingPercentage = Math.round(
    (displayFunding / (totalPlannedFunding || 1)) * 100
  );
  const burnPercentage = Math.round(
    (displayBurn / (totalPlannedExpenses || 1)) * 100
  );

  //--------------------------------------------------
  // Export Budget Data
  //--------------------------------------------------

  const exportBudgetData = () => {
    const categoriesMap: Record<
      string,
      { name: string; subcategories: { name: string; amount: number | null }[] }
    > = {};

    // 1. Map your current state data
    currentSubcategories.forEach((sub) => {
      const catName = sub.category?.name || 'Uncategorized';
      if (!categoriesMap[catName]) {
        categoriesMap[catName] = { name: catName, subcategories: [] };
      }

      const exists = categoriesMap[catName].subcategories.find(
        (s) => s.name === sub.name
      );
      if (!exists) {
        categoriesMap[catName].subcategories.push({
          name: sub.name,
          amount: sub.amount
        });
      }
    });

    // 2. Convert the object to a formatted JSON string
    const dataStr = JSON.stringify(Object.values(categoriesMap), null, 2);

    // 3. Create a Blob and a hidden download link
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'budget-backup.txt'; // The name of your file
    document.body.appendChild(link);
    link.click(); // Trigger the download

    // 4. Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Backup file downloaded!');
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const res = await deleteTransaction(transactionId, householdId);
    if (res.success && res.updatedItems) {
      setCurrentSubcategoriesAction(res.updatedItems);
      if (selectedDetails) {
        const filtered = selectedDetails.transactions.filter(
          (tx) => tx.id !== transactionId
        );
        if (filtered.length === 0) {
          setSelectedDetails(null);
        } else {
          setSelectedDetails({
            ...selectedDetails,
            transactions: filtered
          });
        }
      }
      toast.success('Transaction deleted');
    } else {
      toast.error('Failed to delete transaction');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between items-start mb-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <p>Planner</p>
            </div>
            <p
              className={`${barlow.className} text-sm font-normal lowercase mt-2`}
            >
              <span className="uppercase">Y</span>our roadmap to financial
              clarity!
            </p>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end flex-1 w-full gap-4 mt-8 lg:mt-0">
            <div
              className={`${barlow.className} p-1 flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto overflow-hidden items-center`}
            >
              {recentTransactions.length > 0 && (
                <Popover onOpenChange={(open) => !open && setHistoryIndex(0)}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <History
                        size={14}
                        className="group-hover:text-slate-600 transition-colors"
                      />
                      Last Entry
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 rounded-none border-2 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
                    <div className="bg-slate-900 p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Info size={14} className="text-cyan-400" />
                        <span className="text-white text-xs uppercase font-black tracking-widest">
                          Recent Activity Log
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-mono text-slate-300 mr-2 uppercase tracking-tighter">
                          {historyIndex + 1} / {recentTransactions.length}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:bg-slate-800 disabled:opacity-30 p-0 rounded-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHistoryIndex((prev) =>
                                Math.min(
                                  prev + 1,
                                  recentTransactions.length - 1
                                )
                              );
                            }}
                            disabled={
                              historyIndex === recentTransactions.length - 1
                            }
                          >
                            <ChevronLeft size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:bg-slate-800 disabled:opacity-30 p-0 rounded-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHistoryIndex((prev) => Math.max(prev - 1, 0));
                            }}
                            disabled={historyIndex === 0}
                          >
                            <ChevronRight size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-4 bg-white">
                      <div className="space-y-6">
                        {/* Transaction Content */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 bg-slate-100 rounded-sm">
                            <Calendar size={18} className="text-slate-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                              Transaction Date
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {formatDate(
                                recentTransactions[historyIndex].date
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 bg-emerald-50 rounded-sm">
                            <Tag size={18} className="text-emerald-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                              Details
                            </span>
                            <span className="text-sm font-bold text-slate-900 leading-tight">
                              {recentTransactions[historyIndex].description}
                            </span>
                            <span className="text-xs font-medium text-slate-500 mt-0.5">
                              {
                                recentTransactions[historyIndex].subcategory
                                  ?.category?.name
                              }{' '}
                              &rarr;{' '}
                              {
                                recentTransactions[historyIndex].subcategory
                                  ?.name
                              }
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 bg-cyan-50 rounded-sm">
                            <CreditCard size={18} className="text-cyan-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                              Amount & When
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-mono font-black text-slate-900">
                                $
                                {formatCurrency(
                                  recentTransactions[historyIndex].amount
                                )}
                              </span>
                            </div>
                            <span className="text-xs text-slate-800">
                              Entered on{' '}
                              {new Date(
                                recentTransactions[historyIndex].createdAt
                              ).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <TransactionImporter
                householdId={householdId}
                subcategoriesForCurrentMonth={currentSubcategories.filter(
                  (i) => i.month === selectedMonth
                )}
                setReviewDataAction={setReviewData}
                person1Name={p1Name}
                person2Name={p2Name}
                year={currentYear}
              />
              <DirectCodeImporter
                householdId={householdId}
                onDataLoaded={(data) => setReviewData(data)}
                person1Name={p1Name}
                person2Name={p2Name}
              />
              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 w-full lg:w-auto">
                <AddCategory
                  householdId={householdId}
                  currentCategories={currentCategories}
                  setCurrentCategoriesAction={setCurrentCategoriesAction}
                />
                <Button
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                  onClick={exportBudgetData}
                >
                  <Download size={16} />
                  JSON
                </Button>
              </div>
            </div>
            <div className="hidden sm:block">
              {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative p-6">
        <AnimatePresence>
          {openAction && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            >
              <div className="mb-12">
                <ExplanationPlanner setOpenAction={setOpenAction} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STICKY COMMAND CENTER */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md -mx-6 px-4 sm:px-6 py-4 border-b mb-8 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex justify-start w-full lg:w-auto overflow-x-auto no-scrollbar gap-1 pb-1 lg:pb-0">
            {months.map((monthName, index) => (
              <Button
                key={monthName}
                variant={selectedMonth === index + 1 ? 'default' : 'ghost'}
                className={`px-3 sm:px-4 h-8 text-[11px] sm:text-[12px] font-black uppercase tracking-widest rounded-none whitespace-nowrap ${selectedMonth === index + 1 ? 'shadow-md' : ''}`}
                size="xs"
                onClick={() => setSelectedMonth(index + 1)}
              >
                {monthName}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-3 items-center text-xs font-bold sm:divide-x sm:divide-slate-200 bg-slate-50 lg:bg-transparent rounded-xl lg:rounded-none p-2 lg:p-0">
            {/* Funding Progress Bar (Effort vs Targeted Income) */}
            <div
              className="flex flex-col items-center px-1 sm:px-4 cursor-pointer hover:bg-emerald-50/50 transition-colors rounded-lg py-1 group"
              onClick={() => setShowFundingModal(true)}
            >
              <span className="text-[7px] sm:text-[8px] text-muted-foreground uppercase tracking-widest mb-1.5 px-2 text-center leading-tight group-hover:text-emerald-700">
                Funding Effort
              </span>
              <div className="w-full max-w-[80px] h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                />
              </div>
              <span className="font-mono text-emerald-600 text-[9px] sm:text-[10px]">
                {fundingPercentage}%
              </span>
            </div>

            {/* FUNDING BREAKDOWN MODAL */}
            <Dialog open={showFundingModal} onOpenChange={setShowFundingModal}>
              <DialogContent className="max-w-sm rounded-none border-2 border-slate-900 p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] [&>button:last-child]:text-white">
                <DialogHeader className="bg-slate-900 p-4 border-b border-slate-800">
                  <DialogTitle className="text-white text-[12px] uppercase font-black tracking-widest flex items-center gap-2">
                    <Award size={14} className="text-emerald-400" />
                    Funding Target Breakdown
                  </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6 bg-white">
                  {/* Forecast Targets */}
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 border-b pb-2">
                      Forecast Targets
                    </p>
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                          {p1Name.toUpperCase()} Target
                        </span>
                        <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm group-hover:bg-cyan-50 group-hover:text-cyan-600 group-hover:border-cyan-100 transition-all">
                          {Math.round(
                            (p1PlannedIncome / (totalPlannedFunding || 1)) * 100
                          )}
                          %
                        </span>
                      </div>
                      <span className="font-mono font-black text-slate-900">
                        ${formatCurrency(p1PlannedIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                          {p2Name.toUpperCase()} Target
                        </span>
                        <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-100 transition-all">
                          {Math.round(
                            (p2PlannedIncome / (totalPlannedFunding || 1)) * 100
                          )}
                          %
                        </span>
                      </div>
                      <span className="font-mono font-black text-slate-900">
                        ${formatCurrency(p2PlannedIncome)}
                      </span>
                    </div>
                    {totalPlannedFunding >
                      p1PlannedIncome + p2PlannedIncome && (
                      <div className="flex justify-between items-center group">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors italic">
                            Other / Mutual
                          </span>
                          <span className="text-[9px] font-mono font-black text-slate-300 bg-slate-50/50 border border-slate-100/50 px-1.5 py-0.5 rounded-sm">
                            {Math.round(
                              ((totalPlannedFunding -
                                (p1PlannedIncome + p2PlannedIncome)) /
                                (totalPlannedFunding || 1)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <span className="font-mono font-black text-slate-400">
                          $
                          {formatCurrency(
                            totalPlannedFunding -
                              (p1PlannedIncome + p2PlannedIncome)
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200 font-black">
                      <span className="text-[10px] uppercase tracking-widest text-slate-900">
                        Total Forecast Pool
                      </span>
                      <span className="font-mono text-base text-slate-900">
                        ${formatCurrency(totalPlannedFunding)}
                      </span>
                    </div>
                  </div>

                  {/* Realized Funding */}
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-100/50">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-800">
                        Realized Funding
                      </p>
                      <div className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 font-black uppercase rounded-sm">
                        Captured
                      </div>
                    </div>

                    <div className="space-y-2 mb-6 border-b border-emerald-100 pb-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span className="text-[10px] font-bold text-emerald-900/60 uppercase tracking-widest">
                            {p1Name.toUpperCase()} Contribution
                          </span>
                          <span className="text-[8px] font-mono font-black text-white bg-cyan-500 px-1 py-0.5 rounded-sm">
                            {Math.round(
                              (stats.p1Actual / (displayFunding || 1)) * 100
                            )}
                            %
                          </span>
                        </div>
                        <span className="font-mono font-black text-emerald-900 text-xs">
                          ${formatCurrency(stats.p1Actual)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                          <span className="text-[10px] font-bold text-emerald-900/60 uppercase tracking-widest">
                            {p2Name.toUpperCase()} Contribution
                          </span>
                          <span className="text-[8px] font-mono font-black text-white bg-orange-500 px-1 py-0.5 rounded-sm">
                            {Math.round(
                              (stats.p2Actual / (displayFunding || 1)) * 100
                            )}
                            %
                          </span>
                        </div>
                        <span className="font-mono font-black text-emerald-900 text-xs">
                          ${formatCurrency(stats.p2Actual)}
                        </span>
                      </div>
                    </div>

                    <p className="text-2xl font-mono font-black text-emerald-600 mb-1">
                      ${formatCurrency(displayFunding)}
                    </p>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-800/60 mb-1">
                      Total Arrived to the pool
                    </p>
                    <p className="text-[10px] font-bold text-emerald-600/70 mt-2 italic leading-relaxed">
                      Combined effort from &quot;{p1Name}&quot; and &quot;
                      {p2Name}&quot; already registered in current transactions.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {/* Burn Progress Bar (Actual vs Planned) */}
            <div className="flex flex-col items-center px-1 sm:px-4 border-x lg:border-none border-slate-200">
              <span className="text-[7px] sm:text-[8px] text-muted-foreground uppercase tracking-widest mb-1.5 px-2 text-center leading-tight">
                Burn Progress
              </span>
              <div className="w-full max-w-[80px] h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full transition-all duration-500 ${displayBurn > totalPlannedExpenses ? 'bg-rose-500' : 'bg-slate-900'}`}
                  style={{ width: `${Math.min(burnPercentage, 100)}%` }}
                />
              </div>
              <span
                className={`font-mono text-[9px] sm:text-[10px] ${displayBurn > totalPlannedExpenses ? 'text-rose-600' : 'text-slate-900'}`}
              >
                {burnPercentage}%
              </span>
            </div>

            {/* Ready to Invest Result + Progress Bar (Suplus vs Funding) */}
            <div className="flex flex-col items-center px-1 sm:px-4 text-center">
              <span className="text-[7px] sm:text-[8px] text-muted-foreground uppercase tracking-widest mb-1.5 px-2 leading-tight">
                Ready to Invest
              </span>
              <div className="w-full max-w-[80px] h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min((displayReadyToInvest / (displayFunding || 1)) * 100, 100))}%`
                  }}
                />
              </div>
              <span
                className={`font-mono text-[9px] sm:text-[10px] py-0.5 font-black ${
                  displayReadyToInvest >= 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                ${formatCurrency(displayReadyToInvest)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full gap-8 mt-4">
          {currentCategories.map((category) => {
            const itemsInThisCategory = (currentSubcategories || []).filter(
              (item) =>
                item.categoryId === category.id &&
                item.month === selectedMonth &&
                item.year ===
                  new Date(allTransactions[0]?.date || new Date()).getFullYear()
            );

            const categoryTargetTotal = itemsInThisCategory.reduce(
              (sum, item) => sum + (item.amount || 0),
              0
            );
            const categoryActualTotal = itemsInThisCategory.reduce(
              (sum, item) =>
                sum +
                (item.transactions?.reduce((s: number, t) => {
                  const amount =
                    typeof t.amount === 'string'
                      ? parseFloat(t.amount)
                      : t.amount || 0;
                  return s + amount;
                }, 0) || 0),
              0
            );

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col border overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between px-6 py-4 bg-secondary/30 border-b">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-none shadow-inner"
                        style={getColorCode(category.color)}
                      />
                      <h3
                        className={`font-bold uppercase text-sm ${kumbh_sans.className}`}
                      >
                        {category.name}
                      </h3>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono hidden sm:inline lowercase">
                      {itemsInThisCategory.length} Items
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-10 flex-1">
                    <div className="flex flex-col items-end w-32">
                      <span className="text-[9px] text-slate-400 uppercase mb-1 font-semibold">
                        Total Target
                      </span>
                      <span className="text-[12px] font-mono font-regular text-slate-400 px-2 py-1">
                        ${formatCurrency(categoryTargetTotal)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end w-32">
                      <span className="text-[9px] text-slate-400 uppercase mb-1 font-semibold">
                        Total Actual
                      </span>
                      <span
                        className={`text-[12px] font-mono font-regular px-2 py-1 ${
                          categoryActualTotal > categoryTargetTotal
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        ${formatCurrency(categoryActualTotal)}
                      </span>
                    </div>

                    {/* Precise invisible clone of the actions column to ensure alignment */}
                    <div className="flex items-center justify-end gap-3 min-w-[7em] invisible pointer-events-none">
                      <div className="w-24 h-8" />
                      <div className="w-8 h-8" />
                      <div className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col divide-y divide-secondary/50">
                  {itemsInThisCategory.length > 0 ? (
                    itemsInThisCategory.map((item) => {
                      // NEW LOGIC: Calculate Actual Spend and Differences
                      const actualAmount =
                        item.transactions?.reduce((sum: number, t) => {
                          const amount =
                            typeof t.amount === 'string'
                              ? parseFloat(t.amount)
                              : t.amount || 0;
                          return sum + amount;
                        }, 0) || 0;
                      const targetAmount = item.amount ?? 0;
                      const diff = targetAmount - actualAmount;
                      const isOverBudget = actualAmount > targetAmount;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-6 py-4 hover:bg-secondary/10 transition-colors"
                        >
                          <EditableSubcategoryName
                            initialName={item.name}
                            householdId={householdId}
                            year={currentYear}
                            categoryId={item.categoryId}
                            onUpdateSuccess={(newName) =>
                              handleRenameSubcategory(item.name, newName)
                            }
                          />

                          <div className="flex items-center justify-end gap-10 flex-1">
                            {/* Target Column */}
                            <div className="flex flex-col items-end w-32">
                              <span className="text-[10px] text-muted-foreground uppercase mb-1">
                                Target
                              </span>
                              <EditableAmount
                                key={`${item.id}-${selectedMonth}`}
                                id={item.id}
                                initialAmount={targetAmount}
                                onUpdateSuccess={(amount, mode) =>
                                  handleUpdateAmount(item.id, amount, mode)
                                }
                              />
                            </div>

                            {/* Actual Column */}
                            <div
                              className={`flex flex-col items-end w-32 group relative ${
                                (item.transactions?.length ?? 0) > 0
                                  ? 'cursor-pointer'
                                  : ''
                              }`}
                              onClick={() => {
                                if ((item.transactions?.length ?? 0) > 0) {
                                  setSelectedDetails({
                                    name: item.name,
                                    month: selectedMonth,
                                    transactions:
                                      item.transactions?.map((tx) => ({
                                        id: tx.id as string,
                                        amount: getAmount(tx.amount),
                                        source: tx.source || 'Unknown',
                                        isIncome: item.category.isIncome,
                                        isSavings: item.category.isSavings,
                                        description: tx.description,
                                        subcategoryName: item.name,
                                        date: tx.date
                                      })) || []
                                  });
                                }
                              }}
                            >
                              <span className="text-[10px] text-muted-foreground uppercase mb-1 flex items-center gap-1">
                                Actual
                                {(item.transactions?.length ?? 0) > 0 && (
                                  <span className="text-[8px] bg-primary text-white px-1 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.transactions?.length ?? 0}
                                  </span>
                                )}
                              </span>
                              <span
                                className={`text-sm font-mono transition-colors px-2 py-1 ${
                                  isOverBudget
                                    ? 'text-red-500 font-bold'
                                    : (item.transactions?.length ?? 0) > 0
                                      ? 'text-slate-900 font-bold group-hover:text-primary'
                                      : 'text-muted-foreground'
                                }`}
                              >
                                ${formatCurrency(actualAmount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-3 min-w-[7em]">
                              {/* Status Pill */}
                              <div
                                className={`text-[10px] uppercase font-bold px-2 py-1 rounded-none border w-24 text-center ${
                                  isOverBudget
                                    ? 'bg-red-50 border-red-200 text-red-700'
                                    : 'bg-green-50 border-green-200 text-green-700'
                                }`}
                              >
                                {diff >= 0
                                  ? `${formatCurrencyRounded(diff)} left`
                                  : `${formatCurrencyRounded(Math.abs(diff))} over`}
                              </div>
                              {/* Add Transaction Action */}
                              <AddTransactionModal
                                subcategoryId={item.id}
                                householdId={householdId}
                                itemName={item.name}
                                selectedMonth={selectedMonth}
                                allAvailableSubcategories={currentSubcategories}
                                isIncome={item.category.isIncome}
                                person1Name={p1Name}
                                person2Name={p2Name}
                                onSuccess={(updatedItems) =>
                                  setCurrentSubcategoriesAction(updatedItems)
                                }
                                year={currentYear}
                              />
                              {/* Delete Action */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive/50 hover:text-destructive"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Budget Item
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      How would you like to delete{' '}
                                      <span className="font-bold text-foreground">
                                        &quot;{item.name}&quot;
                                      </span>
                                      ?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-col gap-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          handleDeleteItem(item.id, 'SINGLE')
                                        }
                                      >
                                        Only {months[selectedMonth - 1]}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          handleDeleteItem(item.id, 'FUTURE')
                                        }
                                      >
                                        From {months[selectedMonth - 1]} onwards
                                      </Button>
                                      <AlertDialogAction
                                        className="bg-destructive"
                                        onClick={() =>
                                          handleDeleteItem(item.id, 'ALL')
                                        }
                                      >
                                        The Whole Year
                                      </AlertDialogAction>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                    </div>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-6 py-8 text-center text-xs text-muted-foreground italic">
                      No items yet.
                    </div>
                  )}

                  <div className="p-4 bg-secondary/5">
                    <AddSubcategory
                      householdId={householdId}
                      currentCategories={currentCategories}
                      setCurrentSubcategoriesAction={
                        setCurrentSubcategoriesAction
                      }
                      defaultCategoryId={category.id}
                      selectedMonth={selectedMonth}
                      year={currentYear}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-12">
          <MonthSettlement
            transactions={allTransactions.map((tx, index) => ({
              id: (tx.id as string) || `tx-${index}`,
              amount: getAmount(tx.amount),
              source: tx.source || 'Unknown',
              isIncome: tx.isIncome,
              isSavings: tx.isSavings,
              description: tx.description,
              subcategoryName: tx.subcategoryName
            }))}
            brlRate={brlRate}
            month={selectedMonth}
            person1Name={p1Name}
            person2Name={p2Name}
            onSourceClick={(source, txs) =>
              setSelectedDetails({
                name: `${source === 'PERSON1' ? p1Name : source === 'PERSON2' ? p2Name : source} Activity`,
                month: selectedMonth,
                transactions: txs
              })
            }
          />
        </div>
        {reviewData && (
          <TransactionReviewModal
            reviewData={reviewData}
            setReviewData={setReviewData}
            householdId={householdId}
            // Pass everything so Feb transactions can find Feb budget items
            allAvailableSubcategories={currentSubcategories}
            setCurrentSubcategoriesAction={setCurrentSubcategoriesAction}
          />
        )}
      </CardContent>

      <Dialog
        open={!!selectedDetails}
        onOpenChange={(open) => !open && setSelectedDetails(null)}
      >
        <DialogContent className="rounded-none border-slate-300 sm:max-w-md max-h-[70vh] flex flex-col p-0 overflow-hidden [&_[data-slot=dialog-close]]:text-white shadow-2xl">
          <DialogHeader className="p-6 bg-slate-900 text-white rounded-none">
            <DialogTitle className="uppercase tracking-widest font-black text-xl flex items-center justify-between pr-8">
              <span>{selectedDetails?.name}</span>
              <span className="text-sm font-mono leading-none bg-accent text-primary py-2 px-4">
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
                  className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black uppercase tracking-widest">
                      {tx.description}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-tighter">
                        {tx.subcategoryName || tx.source}
                      </span>
                      {tx.subcategoryName && (
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                          • {tx.source}
                        </span>
                      )}
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {tx.date ? formatDate(tx.date) : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-none"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-none border-slate-300">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="uppercase font-black text-xl tracking-wide">
                            Delete Transaction?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-500">
                            This will permanently remove the record for{' '}
                            <strong className="text-slate-900 uppercase">
                              &quot;{tx.description}&quot;
                            </strong>{' '}
                            (${formatCurrency(Math.abs(getAmount(tx.amount)))})
                            . This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-none uppercase font-bold text-xs tracking-widest">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteTransaction(tx.id as string)
                            }
                            className="bg-destructive hover:bg-destructive/90 rounded-none uppercase font-bold text-xs tracking-widest"
                          >
                            Confirm Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t space-y-2">
            {/* Split Breakdown */}
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
              <span>1st - 15th</span>
              <span className="font-mono">
                $
                {formatCurrency(
                  selectedDetails?.transactions
                    .filter((tx) => {
                      if (!tx.date) return true;
                      const date =
                        tx.date instanceof Date ? tx.date : new Date(tx.date);
                      return date.getDate() <= 15;
                    })
                    .reduce((sum: number, tx) => {
                      return sum + getAmount(tx.amount);
                    }, 0) || 0
                )}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
              <span>16th - End</span>
              <span className="font-mono">
                $
                {formatCurrency(
                  selectedDetails?.transactions
                    .filter((tx) => {
                      if (!tx.date) return true;
                      const date =
                        tx.date instanceof Date ? tx.date : new Date(tx.date);
                      return date.getDate() > 15;
                    })
                    .reduce((sum: number, tx) => {
                      return sum + getAmount(tx.amount);
                    }, 0) || 0
                )}
              </span>
            </div>

            {/* Total Row */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-600">
                Total Actual
              </span>
              <span className="font-mono font-black text-lg text-slate-900">
                $
                {formatCurrency(
                  selectedDetails?.transactions.reduce((sum: number, tx) => {
                    return sum + getAmount(tx.amount);
                  }, 0) || 0
                )}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
