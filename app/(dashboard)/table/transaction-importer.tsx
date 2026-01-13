'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
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
import { processStatementWithAI } from '@/lib/actions';

export function TransactionImporter({
  householdId,
  budgetItemsForCurrentMonth,
  setReviewDataAction
}: {
  householdId: string;
  categories: any[];
  budgetItemsForCurrentMonth: any[];
  setCurrentBudgetItemsAction: React.Dispatch<React.SetStateAction<any[]>>;
  setReviewDataAction: React.Dispatch<React.SetStateAction<any[] | null>>;
}) {
  const [source, setSource] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);

  const handleUpload = async () => {
    if (!file || !source) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      if (!reader.result) return;

      try {
        // Convert ArrayBuffer to Base64 manually
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
          // Pass the data to the parent state to trigger the shared Review Modal
          setReviewDataAction(res.transactions);
          setOpen(false); // Close this upload dialog
          setFile(null); // Reset file input
        } else {
          toast.error(res.error || 'Something went wrong on the server.');
        }
      } catch (error) {
        toast.error('An error occurred during processing.');
      } finally {
        setIsProcessing(false);
      }
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Upload size={16} />
          Import Bank Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Transaction Importer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Select onValueChange={setSource}>
            <SelectTrigger>
              <SelectValue placeholder="Select Bank Source..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Family">Family</SelectItem>
              <SelectItem value="FK">FK</SelectItem>
              <SelectItem value="MZ">MZ</SelectItem>
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
      </DialogContent>
    </Dialog>
  );
}
