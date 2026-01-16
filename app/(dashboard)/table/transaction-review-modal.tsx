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
      // 1. Save Rules
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

      // 2. Save Transactions
      const res = await bulkAddTransactions(reviewData, householdId);

      if (res.success) {
        toast.success('System synced successfully.');

        // --- THE CLOSURE FIX ---
        setReviewData(null); // This closes the modal because open is !!reviewData
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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto rounded-none border-slate-300">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-tighter font-black">
            Review {reviewData.length} Transactions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-[50vh] overflow-y-auto divide-y border border-slate-300 rounded-none px-4 no-scrollbar">
            {reviewData.map((tx, index) => {
              const isCredit = tx.amount < 0;

              // Logic to flag potential duplicates (Simplified for UI feedback)
              const isPotentialDuplicate = false; // You can pass existingTransactions as a prop to check this

              return (
                <div
                  key={index}
                  className={`py-4 flex flex-col gap-3 transition-none border-b border-slate-200 last:border-0 ${
                    isPotentialDuplicate ? 'bg-red-50/50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm leading-none uppercase tracking-tighter">
                          {tx.description}
                        </p>
                        {isPotentialDuplicate && (
                          <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-none font-bold uppercase tracking-widest">
                            Potential Duplicate
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono">
                        {tx.date} •{' '}
                        <span className="text-primary font-bold">
                          {tx.source}
                        </span>{' '}
                        • ${Math.abs(tx.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Linking Area - SHARP EDGES */}
                  <div
                    className={`flex items-center gap-2 p-2 rounded-none border ${
                      !tx.subcategoryId
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-secondary/10 border-slate-200'
                    }`}
                  >
                    <Select
                      defaultValue={tx.subcategoryId || ''}
                      onValueChange={(value) => {
                        const updatedData = [...reviewData];
                        updatedData[index].subcategoryId = value;
                        setReviewData(updatedData);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1 bg-white rounded-none border-slate-300">
                        <SelectValue placeholder="UNCATEGORIZED..." />
                      </SelectTrigger>
                      {/* ... SelectContent already has your alphabetical sort ... */}
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="bg-secondary/20 p-4 border border-secondary/50 space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Total Spent:</span>
              <span className="text-red-600 font-mono">
                ${totalSpent.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Total Payments:</span>
              <span className="text-green-600 font-mono">
                ${totalPayments.toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t border-secondary/50 flex justify-between text-xs font-bold uppercase">
              <span>Net Impact:</span>
              <span
                className={
                  totalSpent - totalPayments > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }
              >
                ${(totalSpent - totalPayments).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-none border-slate-300 uppercase font-black text-[10px] tracking-widest h-12"
              onClick={() => setReviewData(null)}
            >
              Discard
            </Button>
            <Button
              className="flex-1 rounded-none bg-primary uppercase font-black text-[10px] tracking-widest h-12"
              onClick={handleSaveAll}
              disabled={isProcessing}
            >
              {isProcessing ? 'PROCESSING...' : 'SYNC TO DATABASE'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
