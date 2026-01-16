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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function AddTransactionModal({
  subcategoryId,
  householdId,
  itemName,
  onSuccess
}: {
  subcategoryId: string;
  householdId: string;
  itemName: string;
  onSuccess: (updatedItems: any[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(itemName);
  const [source, setSource] = useState('');

  const handleSubmit = async () => {
    const res = await addTransaction({
      description,
      amount: parseFloat(amount),
      date: new Date(),
      householdId,
      subcategoryId,
      source
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
          <div className="space-y-">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Source</label>
            <Select onValueChange={setSource} value={source}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select the Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Family">Family Card</SelectItem>
                <SelectItem value="His">His Card</SelectItem>
                <SelectItem value="Her">Her Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-4" />
          <Button className="w-full" onClick={handleSubmit}>
            Save Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
