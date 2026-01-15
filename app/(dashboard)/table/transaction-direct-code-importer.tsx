'use client';

import { useState } from 'react';
import { Code2, ChevronRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getTransactionRules } from '@/lib/actions';

export function DirectCodeImporter({
  onDataLoaded,
  householdId
}: {
  onDataLoaded: (data: any[]) => void;
  householdId: string;
}) {
  const [code, setCode] = useState('');
  const [open, setOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  const handleProcessCode = async () => {
    try {
      const sanitizedCode = code.trim().replace(/^`{3}(json)?|`{3}$/g, '');
      const parsedData = JSON.parse(sanitizedCode);

      if (Array.isArray(parsedData)) {
        // 1. Fetch the patterns you've "learned"
        const rules = await getTransactionRules(householdId);

        // 2. Map through and apply partial matching
        const autoMatchedData = parsedData.map((tx) => {
          // If the pasted data already has an ID, keep it;
          // otherwise, search our rules for a keyword match
          const foundRule = rules.find((rule) =>
            tx.description.toUpperCase().includes(rule.pattern.toUpperCase())
          );

          return {
            ...tx,
            subcategoryId: tx.subcategoryId || foundRule?.subcategoryId || null
          };
        });

        // 3. Send the "smart" data to the Review Modal
        onDataLoaded(autoMatchedData);
        setOpen(false);
        setInstructionsOpen(false);
        toast.success('Code processed! Patterns applied.');
      }
    } catch (e) {
      toast.error('Invalid JSON. Check the format.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Code2 size={16} />
          Direct Code Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Paste Transaction Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-xs text-muted-foreground">
            Paste a valid JSON array of transactions here to bypass AI
            processing.
          </p>
          <Textarea
            placeholder='[{"date": "2026-01-01", "description": "Example", "amount": 10.00}]'
            className="font-mono text-[10px] min-h-[300px] bg-slate-950 text-slate-50"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            className="w-full gap-2"
            disabled={!code.trim()}
            onClick={handleProcessCode}
          >
            Process Data <ChevronRight size={16} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
