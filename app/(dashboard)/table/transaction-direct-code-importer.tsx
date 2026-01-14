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
  const handleProcessCode = async () => {
    try {
      const sanitizedCode = code.trim().replace(/^`{3}(json)?|`{3}$/g, '');
      const parsedData = JSON.parse(sanitizedCode);

      if (Array.isArray(parsedData)) {
        // 1. Fetch user-defined rules from the database
        const rules = await getTransactionRules(householdId);

        const autoLinkedData = parsedData.map((tx) => {
          // Check if ANY of our saved patterns exist inside the long bank description
          const match = rules.find((rule) =>
            tx.description.toUpperCase().includes(rule.pattern.toUpperCase())
          );

          return {
            ...tx,
            subcategoryId: tx.subcategoryId || match?.subcategoryId || null
          };
        });

        onDataLoaded(autoLinkedData);
        setOpen(false);
        toast.success('Data processed with auto-matching!');
      }
    } catch (e) {
      toast.error('Invalid JSON format.');
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
