'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addTransaction } from '@/lib/actions';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

export function AddTransactionModal({
  budgetItemId,
  householdId,
  itemName,
  onSuccess
}: {
  budgetItemId: string;
  householdId: string;
  itemName: string;
  onSuccess: (updatedItems: any[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(itemName);

  const handleSubmit = async () => {
    const res = await addTransaction({
      description,
      amount: parseFloat(amount),
      date: new Date(),
      householdId,
      budgetItemId
    });

    if (res.success) {
      toast.success('Transaction added!');
      onSuccess(res.updatedItems || []);
      setOpen(false);
      setAmount('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Plus size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense for {itemName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            Save Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
