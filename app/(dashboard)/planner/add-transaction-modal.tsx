'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addTransaction } from '@/lib/actions';
import { months, getSourceColor } from '@/lib/utils';
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
  allAvailableSubcategories,
  isIncome = false,
  onSuccess
}: {
  subcategoryId: string;
  householdId: string;
  itemName: string;
  selectedMonth: number;
  allAvailableSubcategories: any[];
  isIncome?: boolean;
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
  const [isMonthMismatch, setIsMonthMismatch] = useState(false);
  const [targetMonthName, setTargetMonthName] = useState('');

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

  // Handle month mismatch detection
  useEffect(() => {
    const dateParts = date.split('-');
    if (dateParts.length === 3) {
      const monthFromDate = parseInt(dateParts[1], 10);
      if (monthFromDate !== selectedMonth) {
        setIsMonthMismatch(true);
        setTargetMonthName(months[monthFromDate - 1]);
      } else {
        setIsMonthMismatch(false);
      }
    }
  }, [date, selectedMonth]);

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    let finalSubcategoryId = subcategoryId;

    // Smart Pivot: If there's a mismatch, find the ID for the same subcategory in the target month
    if (isMonthMismatch) {
      const dateParts = date.split('-');
      const monthFromDate = parseInt(dateParts[1], 10);
      const yearFromDate = parseInt(dateParts[0], 10);

      const targetSub = allAvailableSubcategories.find(
        (s) =>
          s.name === itemName &&
          s.month === monthFromDate &&
          s.year === yearFromDate
      );

      if (targetSub) {
        finalSubcategoryId = targetSub.id;
      } else {
        toast.error(
          `Could not find "${itemName}" in ${targetMonthName}. Please create it first.`
        );
        return;
      }
    }

    const res = await addTransaction({
      description,
      amount: parseFloat(amount),
      date: new Date(date + 'T12:00:00'), // Use noon to avoid timezone shifts
      householdId,
      subcategoryId: finalSubcategoryId,
      source
    });

    if (res.success) {
      toast.success(
        isMonthMismatch
          ? `Added to ${targetMonthName} successfully!`
          : isIncome
            ? 'Income recorded!'
            : 'Expense recorded!'
      );
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
          className={`h-8 w-8 rounded-none border border-transparent transition-colors ${
            isIncome
              ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200'
              : 'text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-200'
          }`}
        >
          <Plus size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-slate-300 shadow-2xl">
        <DialogHeader
          className={`flex flex-col items-start p-6 text-white space-y-1 ${
            isIncome ? 'bg-emerald-700' : 'bg-slate-900'
          }`}
        >
          <DialogTitle className="text-xl font-black uppercase tracking-tight">
            {isIncome ? 'Add Income' : 'Add Expense'}
          </DialogTitle>
          <div className="flex justify-between items-center w-full">
            <p className="text-xs text-slate-400 font-medium">
              Recording for <span className="text-white ml-1">{itemName}</span>
            </p>
            <div className="flex items-center gap-2 text-primary bg-accent px-3 py-1">
              <span className="text-[10px] uppercase tracking-widest font-bold">
                Month:
              </span>
              <span className="text-sm font-black uppercase">
                {months[selectedMonth - 1]}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 bg-white">
          {isMonthMismatch && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-tight text-amber-800">
                    Month Mismatch Detected
                  </p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    You are currently in{' '}
                    <strong>{months[selectedMonth - 1]}</strong>, but the date
                    is in <strong>{targetMonthName}</strong>. This expense will
                    be automatically "teleported" to your{' '}
                    <strong>{targetMonthName}</strong> budget.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              <SelectTrigger
                className="h-12 border-slate-200 focus:ring-0 rounded-none text-sm font-black uppercase tracking-widest transition-all"
                style={{
                  backgroundColor: getSourceColor(source),
                  color: source === 'His' ? 'black' : 'white'
                }}
              >
                <SelectValue placeholder="Select the Source" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-slate-300 p-1 bg-slate-900">
                <SelectItem
                  value="Family"
                  className="rounded-none mb-1 py-3 font-black uppercase tracking-widest text-white focus:bg-red-600 focus:text-white data-[state=checked]:bg-[#EF4444] data-[state=checked]:text-white transition-colors"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  Family
                </SelectItem>
                <SelectItem
                  value="His"
                  className="rounded-none mb-1 py-3 font-black uppercase tracking-widest text-black focus:bg-cyan-300 focus:text-black data-[state=checked]:bg-[#00FFFF] data-[state=checked]:text-black transition-colors"
                  style={{ backgroundColor: '#00FFFF' }}
                >
                  His
                </SelectItem>
                <SelectItem
                  value="Her"
                  className="rounded-none py-3 font-black uppercase tracking-widest text-white focus:bg-orange-600 focus:text-white data-[state=checked]:bg-[#F97316] data-[state=checked]:text-white transition-colors"
                  style={{ backgroundColor: '#F97316' }}
                >
                  Her
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full h-14 text-sm font-black uppercase tracking-widest"
            onClick={handleSubmit}
          >
            {isIncome ? 'Record Income' : 'Record Expense'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
