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
import { toast } from 'sonner';
import { bulkAddTransactions } from '@/lib/actions';

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

  const handleSaveAll = async () => {
    setIsProcessing(true);
    try {
      const res = await bulkAddTransactions(reviewData, householdId);
      if (res.success) {
        toast.success(`Saved ${reviewData.length} transactions!`);
        if (res.updatedItems) setCurrentSubcategoriesAction(res.updatedItems);
        setReviewData(null);
      } else {
        toast.error('Failed to save transactions.');
      }
    } catch (error) {
      toast.error('An error occurred.');
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
  const unlinkedCount = reviewData.filter((tx) => !tx.subcategoryId).length;

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
          <div className="max-h-[50vh] overflow-y-auto divide-y border rounded-lg px-4">
            {reviewData.map((tx, index) => (
              <div key={index} className="py-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-none mb-1">
                      {tx.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">
                      {tx.date} • ${tx.amount}
                    </p>
                  </div>
                  <p className="font-mono font-bold text-sm text-green-600">
                    ${parseFloat(tx.amount).toFixed(2)}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 p-2 rounded-lg ${!tx.subcategoryId ? 'bg-yellow-50 border border-yellow-200' : ''}`}
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
                      className={`h-8 text-xs flex-1 ${!tx.subcategoryId ? 'border-yellow-500' : ''}`}
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
              </div>
            ))}
          </div>

          <div className="bg-secondary/20 p-4 rounded-xl border border-secondary/50 space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Total Spent:</span>
              <span className="text-red-600">${totalSpent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span>Total Payments:</span>
              <span className="text-green-600">
                ${totalPayments.toFixed(2)}
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
