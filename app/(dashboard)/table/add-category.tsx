'use client';

import { useActionState, useEffect, useState } from 'react';
import { Bomb, Inbox, Trash2 } from 'lucide-react';

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

import { addCategory, deleteCategory, getCategories } from '@/lib/actions';
import { colors, getColorCode } from '@/lib/utils';
import { Category, ColorEnum, User } from '@prisma/client';

type Color = {
  name: string;
  code: string;
  foreground?: string;
};

type FormErrors = {
  category?: string;
  color?: string;
};

export function AddCategory({
  user,
  householdId,
  currentCategories,
  setCurrentCategoriesAction
}: {
  user: User;
  householdId: string;
  currentCategories: Category[];
  setCurrentCategoriesAction: React.Dispatch<React.SetStateAction<Category[]>>;
}) {
  const [open, setOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Reset errors when sheet closes
  useEffect(() => {
    if (!open) {
      setFormErrors({});
    }
  }, [open]);

  const handleSubmit = async (previousState: any, formData: FormData) => {
    const categoryName = formData.get('category') as string;
    const color = formData.get('color') as string;
    const householdId = formData.get('householdId') as string;

    const errors: FormErrors = {};
    if (!categoryName) errors.category = 'Category name is required';
    if (!color) errors.color = 'Please pick a color';

    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    const colorEnum = color.toUpperCase() as ColorEnum;

    const result = await addCategory({
      householdId,
      name: categoryName,
      color: colorEnum
    });

    if (!result) {
      return { serverError: 'Failed to create category in database.' };
    }

    // Fetch fresh list
    const _currentCategories = await getCategories(householdId);

    return {
      success: true,
      _currentCategories,
      newCategoryName: categoryName
    };
  };

  const [data, action, isPending] = useActionState(handleSubmit, null);

  // 2. Handle UI Side-Effects (Toast/Close) after action completes
  useEffect(() => {
    if (data?.success && data._currentCategories) {
      setCurrentCategoriesAction(data._currentCategories);
      setOpen(false); // Close sheet
      toast.success(`Category "${data.newCategoryName}" added! 🎉`);
    }

    if (data?.errors) {
      setFormErrors(data.errors);
    }

    if (data?.serverError) {
      toast.error(data.serverError);
    }
  }, [data, setCurrentCategoriesAction]);

  const handleDeleteCategory = async (category: Category) => {
    try {
      const success = await deleteCategory(category.id);
      if (success) {
        setCurrentCategoriesAction((prev) =>
          prev.filter((el) => el.id !== category.id)
        );
        toast.success(`The ${category.name} has been deleted.`);
      }
    } catch (error) {
      toast.error('Error deleting Category! Ensure it is empty first.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          Add Category
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="sm:max-w-xs mt-8 gap-8 overflow-y-auto"
      >
        <SheetHeader>
          <div className="flex flex-col gap-2 my-8">
            <SheetTitle className="text-lg uppercase font-bold text-left">
              Add Category
            </SheetTitle>
            <SheetDescription className="text-sm font-normal text-left italic">
              Create a new bucket for your budget.
            </SheetDescription>
          </div>
        </SheetHeader>

        <form action={action} className="flex flex-col items-start gap-8">
          <div className="flex flex-col gap-1 w-full">
            <Input
              placeholder="Category Name (e.g. Housing)"
              id="category"
              name="category"
              className={formErrors.category ? 'border-2 border-red-500' : ''}
            />
            {formErrors.category && (
              <p className="text-xs font-bold text-red-500 ml-1 mt-1">
                {formErrors.category}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Select name="color">
              <SelectTrigger
                className={formErrors.color ? 'border-2 border-red-500' : ''}
              >
                <SelectValue placeholder="Pick a Color" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color: Color) => (
                  <SelectItem key={color.code} value={color.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color.code }}
                      />
                      <p className="capitalize">{color.name.toLowerCase()}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.color && (
              <p className="text-xs font-bold text-red-500 ml-1 mt-1">
                {formErrors.color}
              </p>
            )}
          </div>

          <input type="hidden" name="householdId" value={householdId} />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Saving...' : 'Create Category'}
          </Button>
        </form>

        <div className="flex flex-col gap-2 my-12">
          <p className="text-sm font-semibold mb-4">Current Categories:</p>
          {currentCategories.length > 0 ? (
            currentCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between border p-3 rounded-md mb-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: getColorCode(category.color)
                        .backgroundColor
                    }}
                  />
                  <p className="text-sm font-medium capitalize">
                    {category.name.toLowerCase()}
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <Bomb size={20} /> Are you sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Deleting{' '}
                        <span className="font-bold">{category.name}</span> will
                        remove it from your budget view.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteCategory(category)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 opacity-50 italic">
              <Inbox size={18} />{' '}
              <p className="text-xs">No categories added yet.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
