'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { updateBudgetItemAmount } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function EditableAmount({
  id,
  initialAmount,
  onUpdateSuccess
}: {
  id: string;
  initialAmount: number;
  onUpdateSuccess: (amount: number, updateFuture: boolean) => void;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(initialAmount);

  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const handleBlur = async () => {
    setIsEditing(false);
    if (amount !== initialAmount) {
      const updateFuture = window.confirm('Apply to future months?');
      const result = await updateBudgetItemAmount(id, amount, updateFuture);

      if (result.success) {
        // CALL THE PARENT UPDATE HERE
        onUpdateSuccess(amount, updateFuture);
        toast.success('Updated!');
      }
    }
  };

  if (isEditing) {
    return (
      <Input
        type="number"
        autoFocus
        className="w-24 h-8 font-mono text-right"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
      />
    );
  }

  return (
    <span
      className="text-sm font-mono font-bold cursor-pointer hover:bg-secondary/20 px-2 py-1 rounded"
      onClick={() => setIsEditing(true)}
    >
      {new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)}
    </span>
  );
}
