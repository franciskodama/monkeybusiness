'use client';

import { useState, useEffect } from 'react';
import { getTransactionRules, deleteTransactionRule } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function RulesManager({ householdId }: { householdId: string }) {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRules() {
      const data = await getTransactionRules(householdId);
      setRules(data);
      setLoading(false);
    }
    loadRules();
  }, [householdId]);

  const handleDelete = async (id: string) => {
    const res = await deleteTransactionRule(id);
    if (res.success) {
      setRules(rules.filter((r) => r.id !== id));
      toast.success('Rule deleted');
    }
  };

  if (loading) return <p className="text-xs italic">Loading rules...</p>;

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {rules.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No patterns saved yet.
          </p>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono text-primary uppercase">
                  "{rule.pattern}"
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  Links to: {rule.subcategory?.name || 'Loading...'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(rule.id)}
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
