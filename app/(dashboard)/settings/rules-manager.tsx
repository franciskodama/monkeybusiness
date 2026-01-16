'use client';

import { ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteTransactionRule } from '@/lib/actions';
import { toast } from 'sonner';

export function RulesManager({ rules }: { rules: any[] }) {
  const handleDelete = async (id: string) => {
    const res = await deleteTransactionRule(id);
    if (res.success) {
      toast.success('Rule deleted permanently');
    } else {
      toast.error('Failed to delete rule');
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground italic text-xs">
          No automation rules found.
        </div>
      ) : (
        rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-4 border-b border-slate-200 hover:bg-slate-50 transition-none"
          >
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm font-black uppercase tracking-tighter text-primary">
                " {rule.pattern} "
              </p>
              <span className="text-[10px] font-bold uppercase text-slate-400 pr-2">
                <ArrowRight size={16} />
              </span>
              <span className="text-sm font-bold uppercase text-slate-900 bg-slate-100 px-1 py-0.5 border border-slate-200">
                {rule.subcategory.category.name}
              </span>
              <span className="text-primary text-sm px-1">/</span>
              <span className="text-sm font-bold uppercase text-emerald-600">
                {rule.subcategory.name}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(rule.id)}
              className="rounded-none h-10 w-10 text-slate-300 hover:text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/20"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
