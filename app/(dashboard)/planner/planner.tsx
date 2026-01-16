'use client';

import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AddCategory } from './add-category';
import { Button } from '@/components/ui/button';
import {
  getColorCode,
  months,
  formatCurrency,
  formatCurrencyRounded
} from '@/lib/utils';
import { Category, User } from '@prisma/client';
import { barlow, kumbh_sans } from '@/lib/fonts';
import { EditableAmount } from './edit-amount-subcategory';
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

import Help from '@/components/Help';
import ExplanationTable from './explanation-table';
import { AddTransactionModal } from './add-transaction-modal';
import { TransactionImporter } from './transaction-importer';
import { DirectCodeImporter } from './transaction-direct-code-importer';
import { TransactionReviewModal } from './transaction-review-modal';
import { deleteSubcategory } from '@/lib/actions';
import { AddSubcategory } from './add-subcategory';
import { SourceBreakdown } from '@/components/SourceBreakdown';

export default function Planner({
  user,
  householdId,
  categories,
  subcategories
}: {
  user: User;
  householdId: string;
  categories: Category[];
  subcategories: any[];
}) {
  const [openAction, setOpenAction] = useState(false);
  const [currentSubcategories, setCurrentSubcategoriesAction] =
    useState<any[]>(subcategories);
  const [currentCategories, setCurrentCategoriesAction] =
    useState<Category[]>(categories);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reviewData, setReviewData] = useState<any[] | null>(null);

  const handleUpdateAmount = (
    itemId: string,
    newAmount: number,
    updateFuture: boolean
  ) => {
    setCurrentSubcategoriesAction((prev) =>
      prev.map((item) => {
        const sourceItem = prev.find((i) => i.id === itemId);
        const isTargetItem = item.id === itemId;
        const isFutureMatch =
          updateFuture &&
          item.name === sourceItem?.name &&
          item.month >= (sourceItem?.month ?? 0);

        if (isTargetItem || isFutureMatch)
          return { ...item, amount: newAmount };
        return item;
      })
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

  // Example logic for planner.tsx
  const totalPlannedIncome = currentSubcategories
    .filter(
      (sub) =>
        sub.category.name.toLowerCase() === 'income' &&
        sub.month === selectedMonth
    )
    .reduce((sum, sub) => sum + sub.amount, 0);

  const totalPlannedExpenses = currentSubcategories
    .filter(
      (sub) =>
        sub.category.name.toLowerCase() !== 'income' &&
        sub.month === selectedMonth
    )
    .reduce((sum, sub) => sum + sub.amount, 0);

  const netBudget = totalPlannedIncome - totalPlannedExpenses;

  // 1. Get only the subcategories for the month the user is looking at
  const currentMonthSubs = currentSubcategories.filter(
    (sub) => sub.month === selectedMonth
  );

  // 2. Flatten all transactions from those subcategories into one list
  const allTransactions = currentMonthSubs.flatMap(
    (sub) => sub.transactions || []
  );

  //--------------------------------------------------
  // Export Budget Data
  //--------------------------------------------------

  const exportBudgetData = () => {
    const categoriesMap: Record<string, any> = {};

    // 1. Map your current state data
    currentSubcategories.forEach((sub) => {
      const catName = sub.category?.name || 'Uncategorized';
      if (!categoriesMap[catName]) {
        categoriesMap[catName] = { name: catName, subcategories: [] };
      }

      const exists = categoriesMap[catName].subcategories.find(
        (s: any) => s.name === sub.name
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between items-start mb-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <p>Planner</p>
              {/* <div className="block sm:hidden">
                {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />}
              </div> */}
            </div>
            <p
              className={`${barlow.className} text-sm font-normal lowercase mt-2`}
            >
              <span className="uppercase">Y</span>our go-to place for money!
            </p>
          </div>
          <div
            className={`${barlow.className} flex gap-4 capitalize mt-8 sm:mt-0 w-full sm:w-[18ch]`}
          >
            <TransactionImporter
              householdId={householdId}
              categories={currentCategories}
              subcategoriesForCurrentMonth={currentSubcategories.filter(
                (i) => i.month === selectedMonth
              )}
              setCurrentSubcategoriesAction={setCurrentSubcategoriesAction}
              setReviewDataAction={setReviewData}
            />
            <DirectCodeImporter
              householdId={householdId}
              onDataLoaded={(data) => setReviewData(data)}
            />
            <AddCategory
              user={user}
              householdId={householdId}
              currentCategories={currentCategories}
              setCurrentCategoriesAction={setCurrentCategoriesAction}
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={exportBudgetData}
            >
              <Download size={16} />
              JSON
            </Button>
          </div>
          <div className="hidden sm:block">
            {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />}
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
                <ExplanationTable setOpenAction={setOpenAction} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between overflow-x-auto pb-4 no-scrollbar border-b mb-6">
          {months.map((monthName, index) => (
            <Button
              key={monthName}
              variant={selectedMonth === index + 1 ? 'default' : 'ghost'}
              className="px-6"
              size="xs"
              onClick={() => setSelectedMonth(index + 1)}
            >
              {monthName}
            </Button>
          ))}
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

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col border overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between p-4 bg-secondary/30 border-b">
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
                  <span className="text-xs text-muted-foreground font-mono">
                    {itemsInThisCategory.length} Items
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-secondary/50">
                  {itemsInThisCategory.length > 0 ? (
                    itemsInThisCategory.map((item) => {
                      // NEW LOGIC: Calculate Actual Spend and Differences
                      const actualAmount =
                        item.transactions?.reduce(
                          (sum: number, t: any) => sum + t.amount,
                          0
                        ) || 0;
                      const targetAmount = item.amount ?? 0;
                      const diff = targetAmount - actualAmount;
                      const isOverBudget = actualAmount > targetAmount;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-6 py-4 hover:bg-secondary/10 transition-colors"
                        >
                          <span className="text-sm font-medium w-[20%]">
                            {item.name}
                          </span>

                          <div className="flex items-center justify-end gap-8 flex-1">
                            {/* Target Column */}
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-muted-foreground uppercase mb-1">
                                Target
                              </span>
                              <EditableAmount
                                key={`${item.id}-${selectedMonth}`}
                                id={item.id}
                                initialAmount={targetAmount}
                                onUpdateSuccess={(amount, updateFuture) =>
                                  handleUpdateAmount(
                                    item.id,
                                    amount,
                                    updateFuture
                                  )
                                }
                              />
                            </div>

                            {/* Actual Column */}
                            <div className="flex flex-col items-end w-24">
                              <span className="text-[10px] text-muted-foreground uppercase mb-1">
                                Actual
                              </span>
                              <span
                                className={`text-sm font-mono ${isOverBudget ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}
                              >
                                ${formatCurrency(actualAmount)}
                              </span>
                            </div>
                            <div className="col-span-3 flex items-center justify-end gap-3">
                              {/* Status Pill */}
                              <div
                                className={`text-[10px] uppercase font-bold px-2 py-1 rounded-none border ${
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
                                onSuccess={(updatedItems) =>
                                  setCurrentSubcategoriesAction(updatedItems)
                                }
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
                                        "{item.name}"
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
                      user={user}
                      householdId={householdId}
                      currentCategories={currentCategories}
                      setCurrentSubcategoriesAction={
                        setCurrentSubcategoriesAction
                      }
                      defaultCategoryId={category.id}
                      selectedMonth={selectedMonth}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <SourceBreakdown transactions={allTransactions} />
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
    </Card>
  );
}
