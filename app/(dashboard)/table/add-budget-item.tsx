'use client';

import { useActionState, useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Category, User } from '@prisma/client';
import { addBudgetItem, getBudgetItems } from '@/lib/actions';

type FormErrors = {
  name?: string;
  amount?: string;
  month?: string;
  year?: string;
  category?: string;
};

export function AddBudgetItem({
  householdId,
  user,
  currentCategories
  // setCurrentbudgetItemsAction
}: {
  householdId: string;
  user: User;
  currentCategories: Category[];
  // setCurrentbudgetItemsAction: React.Dispatch<React.SetStateAction<Category[]>>;
}) {
  const [open, setOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      setFormErrors({});
    }
  }, [open]);

  const handleSubmit = useCallback(
    async (previousState: unknown, formData: FormData) => {
      setFormErrors({});

      const budgetItem = formData.get('budgetItem') as string;
      const url = formData.get('url') as string;
      const categoryId = formData.get('category') as string;
      const description = (formData.get('description') || '') as string;
      const householdId = formData.get('householdId') as string;

      const errors: FormErrors = {};

      if (!budgetItem) {
        errors.budgetItem = 'Enter a name for your Item.';
      } else if (budgetItem.length > 20) {
        errors.category = 'Item name should be 20 characters or fewer';
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
        budgetItem,
        url,
        description,
        categoryId
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
      setCurrentbudgetItemsAction(data._currentbudgetItems);
    }
  }, [data]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="w-full">
        <Button>Add new item</Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-xs mt-8 gap-8">
        <div className="flex flex-col gap-2 my-8">
          <h2 className="text-lg uppercase font-bold">Add Your Item</h2>
          <p className="text-sm font-normal lowercase">
            Store your go-to websites and categorize them with a personal touch.
          </p>
        </div>
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
                Give your budgetItem a memorable name.
              </p>
            )}
          </div>

          {/* <div className="flex flex-col gap-1 w-full">
            <Input
              className={
                formErrors.name ? 'border-2 border-red-500' : ''
              }
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
                Add a quick reminder for this site.
              </p>
            )}
          </div> */}

          <div className="flex flex-col gap-1 w-full">
            <Select name="category">
              <SelectTrigger
                className={
                  formErrors.category ? 'w-full border-2 border-red-500' : ''
                }
              >
                <SelectValue placeholder="Category" id="category" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((category: Category) => (
                  <div key={category.id}>
                    {category && (
                      <SelectItem value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <p className="capitalize">{category.name}</p>
                        </div>
                      </SelectItem>
                    )}
                  </div>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs ml-4 mt-1">Choose a Category</p>
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
