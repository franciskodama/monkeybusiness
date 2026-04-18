'use client';

import { useState } from 'react';
import { Code2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { matchTransactionsWithRules } from '@/lib/actions/ai';
import { TransactionInput } from '@/lib/types';

export function DirectCodeImporter({
  onDataLoaded,
  householdId,
  person1Name = 'Partner 1',
  person2Name = 'Partner 2'
}: {
  onDataLoaded: (data: (TransactionInput & { ignored?: boolean })[]) => void;
  householdId: string;
  person1Name?: string;
  person2Name?: string;
}) {
  const [code, setCode] = useState('');
  const [source, setSource] = useState('');
  const [open, setOpen] = useState(false);

  const handleProcessCode = async () => {
    if (!source) {
      toast.error('Please select a source first');
      return;
    }

    try {
      const sanitizedCode = code.trim().replace(/^`{3}(json)?|`{3}$/g, '');
      const parsedData = JSON.parse(sanitizedCode);

      if (Array.isArray(parsedData)) {
        // Use the centralized matching logic (handles month-pivoting and key aliases)
        const autoMatchedData = await matchTransactionsWithRules(
          parsedData,
          householdId
        );

        // Map the source to each transaction
        const finalData = (
          autoMatchedData as (TransactionInput & { ignored?: boolean })[]
        ).map((tx) => ({
          ...tx,
          source
        }));

        onDataLoaded(finalData);
        setOpen(false);
        toast.success(`Processed for ${source}`);
      }
    } catch {
      toast.error('Invalid JSON format.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Code2 size={16} /> Direct Code Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Paste Transaction Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Select the source:
            </label>
            <Select onValueChange={setSource} value={source}>
              <SelectTrigger>
                <SelectValue placeholder="Who paid this statement?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FAMILY">Family</SelectItem>
                <SelectItem value="PERSON1">{person1Name}</SelectItem>
                <SelectItem value="PERSON2">{person2Name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder='[{"date": "2024-01-27", "description": "Example", "amount": 10.00}]'
            className="font-mono text-[10px] min-h-[250px] bg-slate-950 text-slate-50"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            className="w-full gap-2"
            disabled={!code.trim() || !source}
            onClick={handleProcessCode}
          >
            Process Data <ChevronRight size={16} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
