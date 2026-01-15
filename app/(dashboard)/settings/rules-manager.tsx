'use client';

import { useState, useEffect } from 'react';
import {
  getTransactionRules,
  deleteTransactionRule,
  addTransactionRule,
  getSubcategories
} from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function RulesManager({ householdId }: { householdId: string }) {
  const [rules, setRules] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [rulesData, subData] = await Promise.all([
        getTransactionRules(householdId),
        getSubcategories(householdId)
      ]);
      setRules(rulesData);
      setSubcategories(subData);
      setLoading(false);
    }
    loadData();
  }, [householdId]);

  const handleUpdateRule = async (rule: any, newSubcategoryId: string) => {
    const res = await addTransactionRule({
      pattern: rule.pattern,
      subcategoryId: newSubcategoryId,
      householdId
    });

    if (res.success) {
      setRules(
        rules.map((r) =>
          r.id === rule.id
            ? {
                ...r,
                subcategoryId: newSubcategoryId,
                subcategory: subcategories.find(
                  (s) => s.id === newSubcategoryId
                )
              }
            : r
        )
      );
      setEditingId(null);
      toast.success('Rule updated!');
    }
  };

  if (loading) return <p className="text-xs italic">Loading rules...</p>;

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-3 border rounded-lg bg-secondary/5"
          >
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-xs font-bold font-mono text-primary uppercase">
                "{rule.pattern}"
              </span>

              {editingId === rule.id ? (
                <div className="flex items-center gap-2 mt-1">
                  <Select
                    defaultValue={rule.subcategoryId}
                    onValueChange={(value) => handleUpdateRule(rule, value)}
                  >
                    <SelectTrigger className="h-7 text-[10px] w-[200px]">
                      <SelectValue placeholder="Change subcategory..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={s.id}
                          className="text-[10px]"
                        >
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingId(null)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                  Links to:{' '}
                  <span className="font-semibold text-foreground">
                    {rule.subcategory?.name}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingId(rule.id)}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <Edit2 size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTransactionRule(rule.id)}
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
