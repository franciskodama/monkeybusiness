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
  // Track which indices the user wants to save as a persistent rule
  const [rulesToSave, setRulesToSave] = useState<Record<number, boolean>>({});

  const handleSaveAll = async () => {
    setIsProcessing(true);
    try {
      // 1. Save new rules first
      const rulePromises = Object.entries(rulesToSave)
        .filter(([_, shouldSave]) => shouldSave)
        .map(([index]) => {
          const tx = reviewData[Number(index)];
          if (tx.subcategoryId) {
            return addTransactionRule({
              pattern: tx.description,
              subcategoryId: tx.subcategoryId,
              householdId
            });
          }
          return null;
        })
        .filter(Boolean);

      if (rulePromises.length > 0) {
        await Promise.all(rulePromises);
      }

      // 2. Standard bulk save logic for the transactions themselves
      const res = await bulkAddTransactions(reviewData, householdId);

      if (res.success) {
        toast.success(`Saved transactions and rules!`);
        if (res.updatedItems) setCurrentSubcategoriesAction(res.updatedItems);
        setReviewData(null);
      } else {
        toast.error('Failed to save transactions.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during save.');
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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review {reviewData.length} Transactions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-[50vh] overflow-y-auto divide-y border rounded-lg px-4 no-scrollbar">
            {reviewData.map((tx, index) => {
              const isCredit = tx.amount < 0;

              return (
                <div key={index} className="py-4 flex flex-col gap-3">
                  {/* Top: Description and Amount */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm leading-none">
                          {tx.description}
                        </p>
                        {isCredit && (
                          <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">
                            Income/Credit
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-muted-foreground uppercase font-mono">
                        {tx.date} • ${Math.abs(tx.amount).toFixed(2)}
                      </p>
                    </div>
                    <p
                      className={`font-mono font-bold text-sm ${isCredit ? 'text-green-600' : 'text-foreground'}`}
                    >
                      {isCredit ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </div>

                  {/* Bottom: Linking and Rules */}
                  <div className="flex flex-col gap-2">
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        !tx.subcategoryId
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-secondary/20'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-muted-foreground w-16">
                        {tx.subcategoryId ? 'Linked:' : '⚠️ Link to:'}
                      </span>
                      <Select
                        defaultValue={tx.subcategoryId || ''}
                        onValueChange={(value) => {
                          const updatedData = [...reviewData];
                          updatedData[index].subcategoryId = value;
                          setReviewData(updatedData);
                        }}
                      >
                        <SelectTrigger
                          className={`h-8 text-xs flex-1 bg-background ${
                            !tx.subcategoryId ? 'border-yellow-500' : ''
                          }`}
                        >
                          <SelectValue placeholder="Uncategorized..." />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategoriesForCurrentMonth.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Checkbox to "Learn" this description for the future */}
                    {!tx.subcategoryId && (
                      <div className="flex items-start gap-2 px-1 py-1 bg-blue-50/50 rounded-md border border-blue-100">
                        <Checkbox
                          id={`rule-${index}`}
                          checked={rulesToSave[index] || false}
                          onCheckedChange={(checked) => {
                            setRulesToSave((prev) => ({
                              ...prev,
                              [index]: !!checked
                            }));
                          }}
                        />
                        <div className="flex flex-col gap-1 w-full">
                          <label
                            htmlFor={`rule-${index}`}
                            className="text-[9px] text-blue-800 uppercase font-bold cursor-pointer"
                          >
                            Remember this pattern:
                          </label>
                          {/* NEW: Editable Input for the Pattern */}
                          <input
                            type="text"
                            className="text-xs bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none pb-1 font-mono italic"
                            value={tx.pattern || tx.description} // Use tx.pattern if user edited it
                            onChange={(e) => {
                              const updatedData = [...reviewData];
                              updatedData[index].pattern = e.target.value; // Store the custom pattern
                              setReviewData(updatedData);
                            }}
                          />
                          <p className="text-[8px] text-muted-foreground italic">
                            Tip: Delete random numbers/cities to make it more
                            generic (e.g., "AMAZON")
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="bg-secondary/20 p-4 rounded-xl border border-secondary/50 space-y-2">
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
              className="flex-1"
              onClick={() => setReviewData(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveAll}
              disabled={isProcessing}
            >
              {isProcessing ? 'Saving...' : 'Confirm & Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
