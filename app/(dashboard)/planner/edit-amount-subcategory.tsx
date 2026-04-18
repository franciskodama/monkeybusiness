'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { updateSubcategoryAmount } from '@/lib/actions/budget';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { CalendarDays, CalendarRange, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EditableAmount({
  id,
  initialAmount,
  onUpdateSuccess
}: {
  id: string;
  initialAmount: number;
  onUpdateSuccess: (amount: number, mode: 'SINGLE' | 'FUTURE' | 'ALL') => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState<number | string>(initialAmount);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const handleBlur = () => {
    if (showConfirm) return;
    if (amount !== '' && Number(amount) !== initialAmount) {
      setShowConfirm(true);
    } else {
      setIsEditing(false);
      setAmount(initialAmount);
    }
  };

  const handleUpdate = async (mode: 'SINGLE' | 'FUTURE' | 'ALL') => {
    const numericAmount = Number(amount);
    const result = await updateSubcategoryAmount(id, numericAmount, mode);

    if (result.success) {
      onUpdateSuccess(numericAmount, mode);
      toast.success('Updated successfully!');
    } else {
      toast.error('Failed to update amount');
      setAmount(initialAmount);
    }
    setShowConfirm(false);
    setIsEditing(false);
  };

  const handleCancelChange = () => {
    setAmount(initialAmount);
    setShowConfirm(false);
    setIsEditing(false);
  };

  return (
    <div className="relative flex items-center">
      {isEditing ? (
        <Input
          type="number"
          autoFocus
          className="w-24 h-8 font-mono text-right"
          value={amount}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
            if (e.key === 'Escape') {
              handleCancelChange();
            }
          }}
        />
      ) : (
        <span
          className="text-sm text-muted-foreground font-mono font-regular cursor-pointer hover:bg-secondary/20 px-2 py-1 rounded"
          onClick={() => setIsEditing(true)}
        >
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(Number(amount))}
        </span>
      )}

      <AlertDialog
        open={showConfirm}
        onOpenChange={(open) => {
          if (!open) handleCancelChange();
        }}
      >
        <AlertDialogContent
          className="max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-primary" />
              Apply changes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve changed the amount to{' '}
              <span className="font-bold text-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(Number(amount))}
              </span>
              . How would you like to apply this budget adjustment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-3 py-4">
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 flex gap-4"
              onClick={() => handleUpdate('SINGLE')}
            >
              <div className="bg-secondary p-2 rounded-full">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">This month only</p>
                <p className="text-xs text-muted-foreground font-normal">
                  Change only affects the current selected month.
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 flex gap-4"
              onClick={() => handleUpdate('FUTURE')}
            >
              <div className="bg-secondary p-2 rounded-full">
                <CalendarRange className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Apply to future</p>
                <p className="text-xs text-muted-foreground font-normal">
                  Update this month and all coming months in the year.
                </p>
              </div>
            </Button>

            <Button
              variant="default"
              className="justify-start h-auto py-3 px-4 flex gap-4"
              onClick={() => handleUpdate('ALL')}
            >
              <div className="bg-primary-foreground/20 p-2 rounded-full">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">The Whole Year</p>
                <p className="text-xs text-primary-foreground/80 font-normal">
                  Apply retroactively and to future. Update all 12 months.
                </p>
              </div>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="w-full sm:w-auto border-none hover:bg-accent outline"
              onClick={handleCancelChange}
            >
              <X className="w-4 h-4 mr-2" />
              Discard changes
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
