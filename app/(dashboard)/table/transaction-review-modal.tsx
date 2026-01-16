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

export function TransactionReviewModal({
  reviewData,
  setReviewData,
  householdId,
  subcategoriesForCurrentMonth,
  setCurrentSubcategoriesAction
}: {
  reviewData: any[];
  setReviewData: (data: any[] | null) => void;
  householdId: string;
  subcategoriesForCurrentMonth: any[];
  setCurrentSubcategoriesAction: (items: any[]) => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rulesToSave, setRulesToSave] = useState<Record<number, boolean>>({});

  const handleSaveAll = async () => {
    setIsProcessing(true);
    try {
      // 1. Save Rules for checked items
      const rulePromises = Object.entries(rulesToSave)
        .filter(([_, shouldSave]) => shouldSave)
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
      const res = await bulkAddTransactions(reviewData, householdId);

      if (res.success) {
        toast.success('System synced successfully.');
        setReviewData(null); // Close modal
        setRulesToSave({});
      }
    } catch (error) {
      toast.error('Error saving rules or transactions.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSpent = reviewData.reduce(
    (sum, tx) => sum + (tx.amount > 0 ? tx.amount : 0),
    0
  );
  const totalPayments = reviewData.reduce(
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
          <DialogTitle className="uppercase tracking-tighter font-black text-xl">
            Review {reviewData.length} Transactions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-[50vh] overflow-y-auto divide-y border border-slate-300 rounded-none px-4 no-scrollbar">
            {reviewData.map((tx, index) => {
              const isCredit = tx.amount < 0;

              return (
                <div key={index} className="py-6 flex flex-col gap-4">
                  {/* Top Row: Description & Amount */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm leading-none uppercase tracking-tighter">
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
                        • ${Math.abs(tx.amount).toFixed(2)}
                      </p>
                    </div>
                    <p
                      className={`font-mono font-bold text-sm ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}
                    >
                      {isCredit ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </div>

                  {/* Selection Area */}
                  <div className="flex flex-col gap-3">
                    <div
                      className={`flex items-center gap-2 p-2 rounded-none border ${
                        !tx.subcategoryId
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-black text-slate-500 w-16">
                        {tx.subcategoryId ? 'Linked' : '⚠️ Target'}
                      </span>
                      <Select
                        defaultValue={tx.subcategoryId || ''}
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
                          className="rounded-none border-slate-300 z-[100]"
                          onPointerDownOutside={(e) => e.preventDefault()} // Fixes Select-in-Dialog issue
                        >
                          {subcategoriesForCurrentMonth
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id}
                                className="rounded-none text-[10px] uppercase font-black"
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* SMART RULE UI (Only shows if uncategorized) */}
                    {!tx.subcategoryId && (
                      <div className="flex flex-col gap-3 p-4 bg-blue-50/30 border border-blue-100 rounded-none">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`rule-${index}`}
                            className="rounded-none border-blue-400 data-[state=checked]:bg-blue-600"
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
                            className="text-[10px] text-blue-900 uppercase font-black cursor-pointer tracking-widest"
                          >
                            Automate future {tx.description}
                          </label>
                        </div>

                        <div className="flex flex-col gap-1.5 ml-6">
                          <span className="text-[9px] text-blue-700/70 uppercase font-bold">
                            Match Pattern:
                          </span>
                          <input
                            type="text"
                            className="text-xs bg-white border border-blue-200 rounded-none px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono uppercase"
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
                            placeholder="AMAZON"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="bg-slate-900 p-6 rounded-none border-none space-y-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Total Spending</span>
              <span className="text-white font-mono">
                ${totalSpent.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Total Credits</span>
              <span className="text-emerald-400 font-mono">
                -${totalPayments.toFixed(2)}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-700 flex justify-between text-xs font-black uppercase tracking-[0.2em] text-white">
              <span>Net Impact</span>
              <span
                className={
                  totalSpent - totalPayments > 0
                    ? 'text-rose-500'
                    : 'text-emerald-400'
                }
              >
                ${(totalSpent - totalPayments).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-none border-slate-300 uppercase font-black text-[10px] tracking-widest h-14 hover:bg-slate-50"
              onClick={() => setReviewData(null)}
            >
              Discard Batch
            </Button>
            <Button
              className="flex-1 rounded-none bg-primary uppercase font-black text-[10px] tracking-widest h-14"
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
