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
import { toast } from 'sonner';
import { BudgetItem, Category, User } from '@prisma/client';
import { addBudgetItem, getBudgetItems } from '@/lib/actions';
import { getColorCode } from '@/lib/utils';

type FormErrors = {
  name?: string;
  category?: string;
};

export function AddBudgetItem({
  householdId,
  user,
  currentCategories,
  setCurrentBudgetItemsAction,
  defaultCategoryId // New prop
}: {
  householdId: string;
  user: User;
  currentCategories: Category[];
  setCurrentBudgetItemsAction: React.Dispatch<
    React.SetStateAction<BudgetItem[]>
  >;
  defaultCategoryId?: string; // Make it optional
}) {
  const [open, setOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Set the initial selected category
  const [selectedCategory, setSelectedCategory] = useState(
    defaultCategoryId || ''
  );

  // Update selection if the prop changes or sheet opens
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
      const householdId = formData.get('householdId') as string;
      const amount = Number(formData.get('amount')) || 0;

      const errors: FormErrors = {};

      if (!name) {
        errors.name = 'Enter a name for your Item.';
      } else if (name.length > 20) {
        errors.name = 'Item name should be 20 characters or fewer';
      }

      if (!categoryId) {
        errors.category = 'Select a category for your budgetItem.';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const newbudgetItem = await addBudgetItem({
        householdId,
        name,
        categoryId,
        amount
      });

      if (!newbudgetItem) {
        toast('Ops...', {
          description: 'Something got wrong. 🚨 Try again.'
        });
        return;
      }

      setOpen(false);
      toast('Added successfully! 🎉', {
        description: 'Your new budgetItem is ready to use!'
      });

      const _currentbudgetItems = await getBudgetItems(householdId);

      return {
        _currentbudgetItems
      };
    },
    []
  );

  const [data, action, isPending] = useActionState(handleSubmit, undefined);

  useEffect(() => {
    if (data?._currentbudgetItems && Array.isArray(data._currentbudgetItems)) {
      setCurrentBudgetItemsAction(data._currentbudgetItems);
    }
  }, [data, setCurrentBudgetItemsAction]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="w-full">
        <Button>Add Item</Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-xs mt-8 gap-8">
        <SheetHeader>
          <div className="flex flex-col gap-2 my-8">
            <SheetTitle className="text-lg uppercase font-bold text-left">
              Add Your Item
            </SheetTitle>
            <SheetDescription className="text-sm font-normal lowercase text-left">
              Store your go-to websites and categorize them with a personal
              touch.
            </SheetDescription>
          </div>
        </SheetHeader>
        <form
          action={action}
          className="flex flex-col items-start gap-8 font-normal"
        >
          <div className="flex flex-col gap-1 w-full">
            <Input
              className={formErrors.name ? 'border-2 border-red-500' : ''}
              placeholder="Name"
              id="name"
              name="name"
            />
            {formErrors.name ? (
              <p className="text-xs font-bold text-red-500 ml-4 mt-1">
                {formErrors.name}
              </p>
            ) : (
              <p className="text-xs ml-4 mt-1">
                Give your Budget Item a memorable name.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Select
              name="category"
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger
                className={formErrors.category ? 'border-2 border-red-500' : ''}
              >
                <SelectValue placeholder="Category" id="category" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: getColorCode(category.color)
                            .backgroundColor
                        }}
                      />
                      <p className="capitalize">{category.name}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Input
              type="number"
              step="0.01" // Allows for cents like $341.32
              placeholder="Monthly Amount (e.g. 150.00)"
              id="amount"
              name="amount"
              required
            />
            <p className="text-xs ml-4 mt-1">
              This amount will be applied to all months in 2026.
            </p>
          </div>

          <Input
            id="householdId"
            name="householdId"
            value={householdId}
            readOnly
            className="hidden"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
