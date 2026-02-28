'use client';

import { useActionState, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Subcategory, Category, User } from '@prisma/client';
import { addSubcategory } from '@/lib/actions';
import { getColorCode, months } from '@/lib/utils';

type FormErrors = {
  name?: string;
  category?: string;
};

export function AddSubcategory({
  householdId,
  user,
  currentCategories,
  setCurrentSubcategoriesAction,
  defaultCategoryId,
  selectedMonth
}: {
  householdId: string;
  user: User;
  currentCategories: Category[];
  setCurrentSubcategoriesAction: React.Dispatch<
    React.SetStateAction<Subcategory[]>
  >;
  defaultCategoryId?: string;
  selectedMonth: number;
}) {
  const [open, setOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [applyToFuture, setApplyToFuture] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    defaultCategoryId || ''
  );

  useEffect(() => {
    if (open && defaultCategoryId) {
      setSelectedCategory(defaultCategoryId);
    }
  }, [open, defaultCategoryId]);

  const handleSubmit = useCallback(
    async (previousState: unknown, formData: FormData) => {
      setFormErrors({});

      const name = formData.get('name') as string;
      const categoryId = formData.get('category') as string;
      const rawAmount = formData.get('amount') as string;

      // Sanitizing the amount: remove commas and convert to float
      const amount = parseFloat(rawAmount.replace(/,/g, '')) || 0;

      const errors: FormErrors = {};
      if (!name) errors.name = 'Enter a name for your Item.';
      else if (name.length > 20) errors.name = 'Maximum 20 characters.';

      if (!categoryId) errors.category = 'Select a category.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const result = await addSubcategory({
        householdId,
        name,
        categoryId,
        amount,
        month: selectedMonth,
        year: 2026,
        applyToFuture: applyToFuture
      });

      if (!result || !result.success) {
        toast.error(result?.error || 'Something went wrong. 🚨');
        return;
      }

      setOpen(false);
      setApplyToFuture(false);

      const categoryName =
        currentCategories.find((c) => c.id === categoryId)?.name || 'Budget';
      const startMonthName = months[selectedMonth - 1];

      toast.success(`${name} added to ${categoryName}! 🎉`, {
        description: applyToFuture
          ? `Created from ${startMonthName} to December 2026.`
          : `Created for ${startMonthName} 2026.`
      });

      return result;
    },
    [selectedMonth, applyToFuture, householdId]
  );

  const [data, action, isPending] = useActionState(handleSubmit, undefined);

  useEffect(() => {
    if (
      data?._currentSubcategories &&
      Array.isArray(data._currentSubcategories)
    ) {
      setCurrentSubcategoriesAction(data._currentSubcategories);
    }
  }, [data, setCurrentSubcategoriesAction]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="xs" variant="outline">
          Add Subcategory
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="sm:max-w-xs flex flex-col h-full overflow-hidden"
      >
        <SheetHeader>
          <div className="flex flex-col gap-2 mt-4 mb-2">
            <SheetTitle className="text-lg uppercase font-bold text-left">
              Add Your Subcategory
            </SheetTitle>
            <SheetDescription className="text-sm font-normal lowercase text-left">
              Set your budget and recurrence.
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* This container allows the form to scroll if the screen is small */}
        <div className="flex-1 overflow-y-auto px-1">
          <form
            action={action}
            className="flex flex-col items-start gap-5 py-4 font-normal"
          >
            {/* Name Field */}
            <div className="flex flex-col gap-1 w-full">
              <Input
                className={formErrors.name ? 'border-2 border-red-500' : ''}
                placeholder="Name"
                id="name"
                name="name"
              />
              {formErrors.name && (
                <p className="text-[10px] font-bold text-red-500 ml-2 mt-1 uppercase italic">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Amount Field */}
            <div className="flex flex-col gap-1 w-full">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                id="amount"
                name="amount"
                required
              />
            </div>
            {/* RECURRENCE BOX - Added background to make it stand out */}
            <div className="flex items-start space-x-3 bg-yellow-300 p-4 w-full border border-secondary">
              <Checkbox
                className="border border-primary"
                id="future"
                checked={applyToFuture}
                onCheckedChange={(checked) => setApplyToFuture(!!checked)}
              />
              <div className="grid gap-1 leading-none">
                <label
                  htmlFor="future"
                  className="text-xs font-bold uppercase cursor-pointer select-none"
                >
                  Repeat for 2026
                </label>
                <p className="text-sm">Apply to all remaining months.</p>
              </div>
            </div>
            <Input
              id="householdId"
              name="householdId"
              value={householdId}
              readOnly
              className="hidden"
            />

            {/* Category Field */}
            <div className="flex flex-col gap-1 w-full">
              <Select
                name="category"
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger
                  className={
                    formErrors.category ? 'border-2 border-red-500' : ''
                  }
                >
                  <SelectValue placeholder="Category" id="category" />
                </SelectTrigger>
                <SelectContent>
                  {currentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getColorCode(category.color)
                              .backgroundColor
                          }}
                        />
                        <p className="capitalize text-sm">{category.name}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isPending} className="w-full mt-2">
              {isPending ? 'Processing...' : 'Add to Budget'}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
