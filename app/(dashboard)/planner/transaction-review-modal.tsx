'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { bulkAddTransactions, addTransactionRule } from '@/lib/actions';
import { formatCurrency } from '@/lib/utils';

export function TransactionReviewModal({
  reviewData,
  setReviewData,
  householdId,
  allAvailableSubcategories,
  setCurrentSubcategoriesAction // Ensure this is added here
}: {
  reviewData: any[];
  setReviewData: (data: any[] | null) => void;
  householdId: string;
  allAvailableSubcategories: any[];
  setCurrentSubcategoriesAction: (items: any[]) => void; // Add this line
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rulesToSave, setRulesToSave] = useState<Record<number, boolean>>({});

  const handleSaveAll = async () => {
    setIsProcessing(true);
    try {
      const transactionsToSave = reviewData.filter((tx) => !tx.ignored);

      // 1. Save Rules for checked items (only if not ignored)
      const rulePromises = Object.entries(rulesToSave)
        .filter(
          ([index, shouldSave]) =>
            shouldSave && !reviewData[Number(index)].ignored
        )
        .map(([index]) => {
          const tx = reviewData[Number(index)];
          if (tx.subcategoryId) {
            return addTransactionRule({
              pattern: tx.pattern || tx.description,
              subcategoryId: tx.subcategoryId,
              householdId
            });
          }
          return null;
        })
        .filter(Boolean);

      if (rulePromises.length > 0) await Promise.all(rulePromises);

      // 2. Save Transactions to Database
      const res = await bulkAddTransactions(transactionsToSave, householdId);

      if (res.success) {
        toast.success(
          `System synced ${transactionsToSave.length} transactions successfully.`
        );
        if (res.updatedItems) {
          setCurrentSubcategoriesAction(res.updatedItems);
        }
        setReviewData(null);
        setRulesToSave({});
      }
    } catch (error) {
      toast.error('Error saving rules or transactions.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeTransactions = reviewData.filter((tx) => !tx.ignored);

  const totalSpent = activeTransactions.reduce(
    (sum, tx) => sum + (tx.amount > 0 ? tx.amount : 0),
    0
  );
  const totalPayments = activeTransactions.reduce(
    (sum, tx) => sum + (tx.amount < 0 ? Math.abs(tx.amount) : 0),
    0
  );

  return (
    <Dialog
      open={!!reviewData}
      onOpenChange={(open) => !open && setReviewData(null)}
    >
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto rounded-none border-slate-300 shadow-none">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest font-black text-xl">
            Review {reviewData.length} Transactions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-[50vh] overflow-y-auto divide-y border border-slate-300 rounded-none px-4 no-scrollbar">
            {reviewData.map((tx, index) => {
              const isCredit = tx.amount < 0;

              // --- DYNAMIC MONTH DETECTION ---
              // Parse manually to avoid timezone shifting (e.g. 2026-01-01 becoming 2025-12-31)
              const dateParts = tx.date.split('-');
              const txYear = parseInt(dateParts[0], 10);
              const txMonth = parseInt(dateParts[1], 10);

              // Filter subcategories to match the specific transaction's month
              const filteredSubcategories = allAvailableSubcategories.filter(
                (s) => s.month === txMonth && s.year === txYear
              );

              return (
                <div
                  key={index}
                  className={`py-6 flex flex-col gap-4 transition-opacity ${tx.ignored ? 'opacity-40' : 'opacity-100'}`}
                >
                  <div className="flex items-center justify-end gap-2">
                    <Checkbox
                      id={`skip-${index}`}
                      className="h-3 w-3 rounded-none border-slate-400 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                      checked={tx.ignored || false}
                      onCheckedChange={(checked) => {
                        const updatedData = [...reviewData];
                        updatedData[index].ignored = !!checked;
                        setReviewData(updatedData);
                      }}
                    />
                    <label
                      htmlFor={`skip-${index}`}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-rose-600 transition-colors"
                    >
                      Don't import this
                    </label>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm leading-none uppercase tracking-widest">
                          {tx.description}
                        </p>
                        {isCredit && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-none font-bold uppercase tracking-widest">
                            Credit
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tight">
                        {tx.date} •{' '}
                        <span className="text-primary font-bold">
                          {tx.source}
                        </span>{' '}
                        • ${formatCurrency(Math.abs(tx.amount))}
                      </p>
                    </div>
                    <p
                      className={`font-mono font-bold text-sm ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}
                    >
                      {isCredit ? '+' : ''}$
                      {formatCurrency(Math.abs(tx.amount))}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div
                      className={`flex items-center gap-2 p-2 rounded-none border ${
                        !tx.subcategoryId
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-black text-slate-500 w-20">
                        {tx.subcategoryId
                          ? 'Linked'
                          : `⚠️ Target (${txMonth}/${txYear})`}
                      </span>
                      <Select
                        disabled={tx.ignored}
                        value={tx.subcategoryId || ''}
                        onValueChange={(value) => {
                          const updatedData = [...reviewData];
                          updatedData[index].subcategoryId = value;
                          setReviewData(updatedData);
                        }}
                      >
                        <SelectTrigger className="h-9 text-[10px] flex-1 bg-white rounded-none border-slate-300 uppercase font-bold tracking-wider">
                          <SelectValue placeholder="SELECT CATEGORY..." />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          className="rounded-none border-slate-300 z-[100] max-h-72"
                        >
                          {filteredSubcategories.length > 0 ? (
                            filteredSubcategories
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((item) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.id}
                                  className="rounded-none text-[10px] uppercase font-black"
                                >
                                  {item.name}
                                </SelectItem>
                              ))
                          ) : (
                            <div className="p-3 text-[9px] text-rose-500 font-bold uppercase tracking-tighter">
                              No Budget set for {txMonth}/{txYear}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {!tx.ignored && (
                      <div
                        className={`flex flex-col gap-3 p-4 border rounded-none transition-colors ${
                          tx.ruleMatched
                            ? 'bg-emerald-50/30 border-emerald-100'
                            : !tx.subcategoryId
                              ? 'bg-amber-50/50 border-amber-200'
                              : 'bg-blue-50/30 border-blue-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`rule-${index}`}
                              className={`rounded-none border-blue-400 data-[state=checked]:bg-blue-600 ${tx.ruleMatched ? 'border-emerald-400 data-[state=checked]:bg-emerald-600' : ''}`}
                              checked={rulesToSave[index] || false}
                              onCheckedChange={(checked) => {
                                setRulesToSave((prev) => ({
                                  ...prev,
                                  [index]: !!checked
                                }));
                              }}
                            />
                            <label
                              htmlFor={`rule-${index}`}
                              className={`text-[10px] uppercase font-black cursor-pointer tracking-widest ${tx.ruleMatched ? 'text-emerald-800' : 'text-blue-900'}`}
                            >
                              {tx.ruleMatched
                                ? 'Update existing rule'
                                : 'Automate future occurrences'}
                            </label>
                          </div>
                          {tx.ruleMatched && (
                            <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 font-bold uppercase tracking-widest">
                              Matched by Rule
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 ml-6">
                          <span
                            className={`text-[9px] uppercase font-bold ${tx.ruleMatched ? 'text-emerald-700/70' : 'text-blue-700/70'}`}
                          >
                            Match Pattern:
                          </span>
                          <input
                            type="text"
                            className={`text-xs bg-white border rounded-none px-3 py-2 outline-none font-mono uppercase transition-colors ${
                              tx.ruleMatched
                                ? 'border-emerald-200 focus:ring-emerald-500'
                                : 'border-blue-200 focus:ring-blue-500'
                            } focus:ring-1`}
                            value={
                              tx.pattern !== undefined
                                ? tx.pattern
                                : tx.description
                            }
                            onChange={(e) => {
                              const updatedData = [...reviewData];
                              updatedData[index].pattern = e.target.value;
                              setReviewData(updatedData);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-900 p-6 rounded-none space-y-3">
            <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>Total Spending</span>
              <span className="text-white font-mono">
                ${formatCurrency(totalSpent)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>Total Credits</span>
              <span className="text-emerald-400 font-mono">
                -${formatCurrency(totalPayments)}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-700 flex justify-between text-sm font-black uppercase tracking-[0.2em] text-white">
              <span>Net Impact</span>
              <span
                className={
                  totalSpent - totalPayments > 0
                    ? 'text-rose-500'
                    : 'text-emerald-400'
                }
              >
                ${formatCurrency(totalSpent - totalPayments)}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              size="xl"
              className="flex-1 tracking-widest"
              onClick={() => setReviewData(null)}
            >
              Discard Batch
            </Button>
            <Button
              variant="default"
              size="xl"
              className="flex-1 tracking-widest"
              onClick={handleSaveAll}
              disabled={isProcessing}
            >
              {isProcessing ? 'WRITING TO DATABASE...' : 'CONFIRM & SYNC'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
