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

export function DirectCodeImporter({
  onDataLoaded
}: {
  onDataLoaded: (data: any[]) => void;
}) {
  const [code, setCode] = useState('');
  const [open, setOpen] = useState(false);

  const handleProcessCode = () => {
    try {
      // 1. Clean the string (handle cases where people paste with backticks or comments)
      const sanitizedCode = code.trim().replace(/^`{3}(json)?|`{3}$/g, '');

      // 2. Parse the JSON
      // Note: If you paste standard JS objects (without quotes on keys),
      // standard JSON.parse might fail. We use a simple regex fix or expect valid JSON.
      const parsedData = JSON.parse(sanitizedCode);

      if (Array.isArray(parsedData)) {
        onDataLoaded(parsedData);
        setOpen(false);
        setCode('');
        toast.success('Code data loaded successfully!');
      } else {
        toast.error('Data must be an array of objects.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Invalid JSON format. Check your brackets and quotes.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
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
