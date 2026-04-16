'use client';

import { useState } from 'react';
import {
  Plus,
  Calendar as CalendarIcon,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addTransaction } from '@/lib/actions/transactions';
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
import { SubcategoryWithCategory } from '@/lib/types';

export function AddTransactionModal({
  subcategoryId,
  householdId,
  itemName,
  selectedMonth,
  allAvailableSubcategories,
  isIncome = false,
  person1Name = 'Partner 1',
  person2Name = 'Partner 2',
  onSuccess,
  year
}: {
  subcategoryId: string;
  householdId: string;
  itemName: string;
  selectedMonth: number;
  allAvailableSubcategories: SubcategoryWithCategory[];
  isIncome?: boolean;
  person1Name?: string;
  person2Name?: string;
  onSuccess: (updatedItems: SubcategoryWithCategory[]) => void;
  year: number;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(itemName);
  const [source, setSource] = useState('FAMILY');
  const [isAutoSelected, setIsAutoSelected] = useState(false);

  // Initialize date based on selected month
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const initialDate =
    selectedMonth === currentMonth && year === today.getFullYear()
      ? today.toISOString().split('T')[0]
      : `${year}-${selectedMonth.toString().padStart(2, '0')}-01`;

  const [date, setDate] = useState(initialDate);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      const today = new Date();
      const initialDate =
        selectedMonth === today.getMonth() + 1 && year === today.getFullYear()
          ? today.toISOString().split('T')[0]
          : `${year}-${selectedMonth.toString().padStart(2, '0')}-01`;
      setDate(initialDate);
      setDescription(itemName);

      // Proactive Auto-selection
      const usual = getUsualSource();
      if (usual) {
        setSource(usual);
        setIsAutoSelected(true);
      } else {
        setSource('FAMILY');
        setIsAutoSelected(false);
      }
    }
  };

  // Month mismatch detection during render
  const dateParts = date.split('-');
  const monthFromDate =
    dateParts.length === 3 ? parseInt(dateParts[1], 10) : selectedMonth;
  const isMonthMismatch =
    dateParts.length === 3 && monthFromDate !== selectedMonth;
  const targetMonthName = isMonthMismatch ? months[monthFromDate - 1] : '';

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

  // Intelligent source detection
  const getUsualSource = () => {
    // Find all transactions across the year for this specific item name
    const history = allAvailableSubcategories
      .filter((s) => s.name === itemName)
      .flatMap((s) => s.transactions || []);

    if (history.length < 2) return null;

    const counts: Record<string, number> = {};
    history.forEach((tx) => {
      counts[tx.source] = (counts[tx.source] || 0) + 1;
    });

    const sortedByCount = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const [mostFrequentSource, count] = sortedByCount[0];

    // If a source is used > 70% of the time, consider it the "usual" source
    if (count / history.length > 0.7) {
      return mostFrequentSource;
    }
    return null;
  };

  const usualSource = getUsualSource();

  // Duplicate detection
  // If month mismatch, we're looking at a different subcategory ID potentially
  const getSubToCheck = () => {
    if (!isMonthMismatch)
      return allAvailableSubcategories.find((s) => s.id === subcategoryId);
    const dateParts = date.split('-');
    const m = parseInt(dateParts[1], 10);
    const y = parseInt(dateParts[0], 10);
    return allAvailableSubcategories.find(
      (s) => s.name === itemName && s.month === m && s.year === y
    );
  };

  const subToCheck = getSubToCheck();
  const isDuplicate =
    amount &&
    !isNaN(parseFloat(amount)) &&
    subToCheck?.transactions?.some(
      (tx) => Math.abs(Number(tx.amount)) === Math.abs(parseFloat(amount))
    );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-slate-300 shadow-2xl [&>button:last-child]:text-white">
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
                    is in <strong>{targetMonthName}</strong>. This expense will
                    be automatically &quot;teleported&quot; to your{' '}
                    <strong>{targetMonthName}</strong> budget.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isDuplicate && (
            <div
              className="bg-red-50 border-l-4 border-red-500 p-4 animate-pulse"
              style={{ animationDuration: '1s' }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 shrink-0" size={18} />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-tight text-red-800">
                    Potential Duplicate
                  </p>
                  <p className="text-[11px] text-red-700 leading-relaxed font-bold">
                    You already have a transaction with the same amount in this
                    category.
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
            <Select
              onValueChange={(val) => {
                setSource(val);
                setIsAutoSelected(false);
              }}
              value={source}
            >
              <SelectTrigger
                className="h-12 border-slate-200 focus:ring-0 rounded-none text-sm font-black uppercase tracking-widest transition-all"
                style={{
                  backgroundColor: getSourceColor(source),
                  color: source === 'PERSON1' ? 'black' : 'white'
                }}
              >
                <SelectValue placeholder="Select the Source" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-slate-300 p-1 bg-slate-900">
                <SelectItem
                  value="FAMILY"
                  className="rounded-none mb-1 py-3 font-black uppercase tracking-widest text-white focus:bg-red-600 focus:text-white data-[state=checked]:bg-[#EF4444] data-[state=checked]:text-white transition-colors"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  Family
                </SelectItem>
                <SelectItem
                  value="PERSON1"
                  className="rounded-none mb-1 py-3 font-black uppercase tracking-widest text-black focus:bg-cyan-300 focus:text-black data-[state=checked]:bg-[#00FFFF] data-[state=checked]:text-black transition-colors"
                  style={{ backgroundColor: '#00FFFF' }}
                >
                  {person1Name}
                </SelectItem>
                <SelectItem
                  value="PERSON2"
                  className="rounded-none py-3 font-black uppercase tracking-widest text-white focus:bg-orange-600 focus:text-white data-[state=checked]:bg-[#F97316] data-[state=checked]:text-white transition-colors"
                  style={{ backgroundColor: '#F97316' }}
                >
                  {person2Name}
                </SelectItem>
              </SelectContent>
            </Select>

            {isAutoSelected && usualSource === source && (
              <div className="bg-cyan-50 border-l-4 border-cyan-500 p-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-cyan-600 shrink-0" size={14} />
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-tight text-cyan-800">
                      Smart Selection
                    </p>
                    <p className="text-[10px] text-cyan-700 leading-tight">
                      Source selected based on your spending habits.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {usualSource && !isAutoSelected && usualSource !== source && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start gap-3">
                  <Lightbulb className="text-amber-600 shrink-0" size={14} />
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-tight text-amber-800">
                      Different Source
                    </p>
                    <p className="text-[10px] text-amber-700 leading-tight">
                      This is usually paid by{' '}
                      <span className="uppercase font-bold">
                        {usualSource === 'PERSON1'
                          ? person1Name
                          : usualSource === 'PERSON2'
                            ? person2Name
                            : 'Family'}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}
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
