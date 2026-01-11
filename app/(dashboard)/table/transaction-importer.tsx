'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { bulkAddTransactions, processStatementWithAI } from '@/lib/actions';

export function TransactionImporter({
  householdId,
  categories,
  budgetItemsForCurrentMonth,
  setCurrentBudgetItemsAction
}: {
  householdId: string;
  categories: any[];
  budgetItemsForCurrentMonth: any[];
  setCurrentBudgetItemsAction: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [source, setSource] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewData, setReviewData] = useState<any[] | null>(null);

  const handleUpload = async () => {
    if (!file || !source) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file); // Change to readAsArrayBuffer for cleaner conversion

    reader.onload = async () => {
      if (!reader.result) return;

      // Convert ArrayBuffer to Base64 manually to ensure no "data:application/pdf" prefix
      const base64 = Buffer.from(reader.result as ArrayBuffer).toString(
        'base64'
      );

      // Send to AI
      const res = await processStatementWithAI(
        base64,
        householdId,
        budgetItemsForCurrentMonth
      );

      if (res.success) {
        setReviewData(res.transactions);
        toast.success(`AI found ${res.transactions.length} transactions!`);
      } else {
        // res.error will now contain the "Wait 60 seconds" message
        toast.error(res.error || 'Failed to process statement');
      }
      setIsProcessing(false);
    };
  };

  const handleSaveAll = async () => {
    if (!reviewData) return;

    setIsProcessing(true);
    try {
      const res = await bulkAddTransactions(reviewData, householdId);

      if (res.success) {
        toast.success(`Saved ${reviewData.length} transactions!`);

        // Update the main table state with the new totals
        if (res.updatedItems) {
          setCurrentBudgetItemsAction(res.updatedItems);
        }

        setReviewData(null); // Close the review view
        setFile(null); // Reset file
      } else {
        toast.error('Failed to save transactions.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload size={16} />
          Import Bank Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reviewData
              ? `Review ${reviewData.length} Transactions`
              : 'AI Transaction Importer'}
          </DialogTitle>
        </DialogHeader>

        {!reviewData ? (
          /* --- UPLOAD VIEW --- */
          <div className="space-y-6 py-4">
            <Select onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select Bank Source..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chase">Chase</SelectItem>
                <SelectItem value="Amex">Amex</SelectItem>
              </SelectContent>
            </Select>

            <div
              className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-secondary/10"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm">
                {file ? file.name : 'Click to upload Bank PDF'}
              </p>
            </div>

            <Button
              className="w-full"
              disabled={!file || !source || isProcessing}
              onClick={handleUpload}
            >
              {isProcessing
                ? 'Gemini is reading your PDF...'
                : 'Start AI Process'}
            </Button>
          </div>
        ) : (
          /* --- REVIEW VIEW --- */
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

                  {/* Category Selector for this specific transaction */}
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${!tx.budgetItemId ? 'bg-yellow-50 border border-yellow-200' : ''}`}
                  >
                    <span className="text-[10px] uppercase font-bold text-muted-foreground w-16">
                      {tx.budgetItemId ? 'Linked:' : '⚠️ Link to:'}
                    </span>
                    <Select
                      defaultValue={tx.budgetItemId || ''}
                      onValueChange={(value) => {
                        const updatedData = [...reviewData];
                        updatedData[index].budgetItemId = value;
                        setReviewData(updatedData);
                      }}
                    >
                      <SelectTrigger
                        className={`h-8 text-xs flex-1 ${!tx.budgetItemId ? 'border-yellow-500' : ''}`}
                      >
                        <SelectValue placeholder="Uncategorized - Select Item..." />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetItemsForCurrentMonth.map((item) => (
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

            <div className="flex gap-2 pt-2">
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
                {isProcessing
                  ? 'Saving...'
                  : `Confirm & Save ${reviewData.length} Items`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
