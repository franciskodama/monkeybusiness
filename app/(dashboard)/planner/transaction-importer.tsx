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
  subcategoriesForCurrentMonth,
  setReviewDataAction
}: {
  householdId: string;
  categories: any[];
  subcategoriesForCurrentMonth: any[];
  setCurrentSubcategoriesAction: React.Dispatch<React.SetStateAction<any[]>>;
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
        const result = await processStatementWithAI(
          base64,
          householdId,
          subcategoriesForCurrentMonth
        );

        if (result.success && result.transactions) {
          // Use the transactions array from the result
          setReviewDataAction(result.transactions);
          toast.success(`Statement processed for ${source}`);
        } else {
          // If failed or undefined, explicitly set to null to avoid the type error
          setReviewDataAction(null);
          toast.error(
            result.error || `Failed to process statement for ${source}`
          );
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
              <SelectValue placeholder="Select the Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Family">Family</SelectItem>
              <SelectItem value="His">His</SelectItem>
              <SelectItem value="Her">Her</SelectItem>
            </SelectContent>
          </Select>

          <div
            className="border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer bg-secondary/10"
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
