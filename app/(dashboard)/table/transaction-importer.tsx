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

export function TransactionImporter({ householdId }: { householdId: string }) {
  const [source, setSource] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async () => {
    if (!file || !source) {
      toast.error('Please select a source and a file');
      return;
    }

    setIsProcessing(true);
    toast.info('Sending to AI for processing...');

    // This is where we will call our AI Server Action soon!
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('AI has categorized 42 transactions!');
    }, 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload size={16} />
          Import Bank Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Transaction Importer</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Bank Source
            </label>
            <Select onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Account..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Family Card">Family Card</SelectItem>
                <SelectItem value="FK Card">FK Card</SelectItem>
                <SelectItem value="MZ Card">MZ Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Drop Zone */}
          <div
            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-secondary/10 hover:bg-secondary/20 transition-all cursor-pointer"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle2 size={24} />
                <span className="text-sm">{file.name}</span>
              </div>
            ) : (
              <>
                <FileText className="text-muted-foreground" size={32} />
                <p className="text-sm text-muted-foreground text-center">
                  Click to upload <br /> <b>CSV or PDF</b> bank statement
                </p>
              </>
            )}
          </div>

          <Button
            className="w-full"
            disabled={!file || !source || isProcessing}
            onClick={handleUpload}
          >
            {isProcessing ? 'AI is thinking...' : 'Start AI Categorization'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
