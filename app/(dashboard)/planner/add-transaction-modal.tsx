import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addTransaction } from '@/lib/actions';
import { months } from '@/lib/utils';
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
  selectedMonth,
  onSuccess
}: {
  subcategoryId: string;
  householdId: string;
  itemName: string;
  selectedMonth: number;
  onSuccess: (updatedItems: any[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(itemName);
  const [source, setSource] = useState('Family');

  // Initialize date based on selected month
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const initialDate =
    selectedMonth === currentMonth
      ? today.toISOString().split('T')[0]
      : `2026-${selectedMonth.toString().padStart(2, '0')}-01`;

  const [date, setDate] = useState(initialDate);

  // Sync date when selectedMonth changes or modal opens
  useEffect(() => {
    if (open) {
      const today = new Date();
      if (selectedMonth === today.getMonth() + 1) {
        setDate(today.toISOString().split('T')[0]);
      } else {
        setDate(`2026-${selectedMonth.toString().padStart(2, '0')}-01`);
      }
      setDescription(itemName);
    }
  }, [open, selectedMonth, itemName]);

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    const res = await addTransaction({
      description,
      amount: parseFloat(amount),
      date: new Date(date + 'T12:00:00'), // Use noon to avoid timezone shifts
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
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-none border border-transparent hover:border-green-200"
        >
          <Plus size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-slate-300 rounded-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Add Expense
            </DialogTitle>
            <div className="flex items-center gap-2 text-primary bg-accent border border-primary/30 px-3 py-1 mr-6">
              <span className="text-[10px] uppercase tracking-widest font-bold">
                Month:
              </span>
              <span className="text-sm font-black uppercase">
                {months[selectedMonth - 1]}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Recording for <span className="text-white">{itemName}</span>
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  autoFocus
                  className="pl-7 font-mono text-lg font-bold border-slate-200 focus:border-primary focus:ring-0 rounded-none h-12"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Date
              </label>
              <div className="relative">
                <CalendarIcon
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="date"
                  className="pl-9 font-mono text-sm border-slate-200 focus:border-primary focus:ring-0 rounded-none h-12"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Description
            </label>
            <Input
              className="border-slate-200 focus:border-primary focus:ring-0 rounded-none h-12 font-medium"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Source
            </label>
            <Select onValueChange={setSource} value={source}>
              <SelectTrigger className="h-12 border-slate-200 focus:ring-0 rounded-none text-sm font-bold bg-slate-50">
                <SelectValue placeholder="Select the Source" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-slate-300">
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="His">His</SelectItem>
                <SelectItem value="Her">Her</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            onClick={handleSubmit}
          >
            Save Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
