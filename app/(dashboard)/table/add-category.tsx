'use client';

import { useActionState, useCallback, useEffect, useState } from 'react';
import { Bomb, Inbox, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
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
import { colors } from '@/lib/utils';
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
  currentCategories,
  setCurrentCategoriesAction
}: {
  user: User;
  currentCategories: Category[];
  setCurrentCategoriesAction: React.Dispatch<React.SetStateAction<Category[]>>;
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

      const category = formData.get('category') as string;
      const color = formData.get('color');
      const colorUppperCase =
        (typeof color === 'string' && (color.toUpperCase() as ColorEnum)) ||
        ('GREY' as ColorEnum);
      const uid = formData.get('uid') as string;

      const errors: FormErrors = {};

      if (!category) {
        errors.category = 'Category name is required';
      } else if (category.length > 20) {
        errors.category = 'Category name should be 20 characters or fewer';
      }

      if (!color) {
        errors.color = 'Please pick a color';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const shortcutCategory = await addCategory({
        householdId: user.householdId,
        category,
        colorUppperCase
      });

      if (!shortcutCategory) {
        toast('Ops...', {
          description: 'Something got wrong. 🚨 Try again.'
        });
        return;
      }

      setOpen(false);
      toast('URL added successfully! 🎉', {
        description: 'You have one more Category to manage your shortcuts.'
      });

      const _currentCategories = await getCategories(uid);

      return {
        _currentCategories
      };
    },
    []
  );

  const [data, action, isPending] = useActionState(handleSubmit, undefined);

  useEffect(() => {
    if (data?._currentCategories && Array.isArray(data._currentCategories)) {
      setCurrentCategoriesAction(data._currentCategories);
    }
  }, [data]);

  const handleDeleteCategory = async (category: Category) => {
    try {
      const success = await deleteCategory(category.id);
      if (success) {
        setCurrentCategoriesAction(
          currentCategories.filter((el) => el.id !== category.id)
        );
      }
      toast('Category gone!', {
        description: `The ${category.name} has been successfully deleted.`
      });
    } catch (error) {
      console.error(error);
      toast('Error deleting Category! 🚨', {
        description:
          'Please remove all items from this Category first, then try again.'
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="w-full">
        <Button variant="outline">Add Category</Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-xs mt-8 gap-8">
        <div className="flex flex-col gap-2 my-8">
          <h2 className="text-lg uppercase font-bold">Add Category</h2>
          <p className="text-sm font-normal lowercase">
            Organize your content with categories.
          </p>
        </div>
        <form
          action={action}
          className="flex flex-col items-start gap-8 font-normal"
        >
          <div className="flex flex-col gap-1 w-full">
            <Input
              placeholder="Category Name"
              id="category"
              name="category"
              className={formErrors.category ? 'border-2 border-red-500' : ''}
            />
            {formErrors.category ? (
              <p className="text-xs font-bold text-red-500 ml-4 mt-1">
                {formErrors.category}
              </p>
            ) : (
              <p className="text-xs ml-4 mt-1">
                Name your category in one word
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Select name="color">
              <SelectTrigger
                className={
                  formErrors.color ? 'w-full border-2 border-red-500' : ''
                }
              >
                <SelectValue placeholder="Category Color" id="color" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color: Color) => (
                  <div key={color.code}>
                    {color && (
                      <SelectItem value={color.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color.code }}
                          />
                          <p className="capitalize">{color.name}</p>
                        </div>
                      </SelectItem>
                    )}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {formErrors.color ? (
              <p className="text-xs font-bold text-red-500 ml-4 mt-1">
                {formErrors.color}
              </p>
            ) : (
              <p className="text-xs ml-4 mt-1">
                Name your category in one word
              </p>
            )}
          </div>

          <Input
            id="uid"
            name="uid"
            value={user?.householdId}
            readOnly
            className="hidden"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add'}
          </Button>
        </form>

        <div className="flex flex-col gap-2 my-12">
          <p className="text-sm font-semibold capitalize mb-2">
            Current Categories:
          </p>
          {currentCategories.length > 0 ? (
            currentCategories.map((category: Category) => (
              <div
                key={category.id}
                className="flex items-center justify-between border border-primary px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: category.color,
                      border:
                        category.color === 'YELLOW'
                          ? `1px solid lightgrey`
                          : `1px solid ${category.color}`
                    }}
                  />
                  <p className="text-center text-sm capitalize">
                    {category.name}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Trash2 size={18} strokeWidth={1.8} color="black" />
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[calc(100%-35px)]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <Bomb size={24} strokeWidth={1.8} />
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="py-4">
                        This will permanently delete this Category
                        <span className="font-bold mx-1">{category.name}</span>
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          toast('Operation Cancelled! ❌', {
                            description: `Phew! 😮‍💨 Crisis averted. You successfully cancelled the operation.`
                          });
                        }}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteCategory(category)}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <Inbox size={24} strokeWidth={1.8} />
              <p className="text-sm capitalize">No categories yet</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
