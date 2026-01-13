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
import { BudgetItem, Category, User } from '@prisma/client';
import { addBudgetItem } from '@/lib/actions';
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
  defaultCategoryId,
  selectedMonth
}: {
  householdId: string;
  user: User;
  currentCategories: Category[];
  setCurrentBudgetItemsAction: React.Dispatch<
    React.SetStateAction<BudgetItem[]>
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

      const result = await addBudgetItem({
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

      toast.success('Added successfully! 🎉', {
        description: applyToFuture
          ? `Recurring item created through December.`
          : 'Budget item created.'
      });

      return result;
    },
    [selectedMonth, applyToFuture, householdId]
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
      <SheetContent
        side="right"
        className="sm:max-w-xs flex flex-col h-full overflow-hidden"
      >
        <SheetHeader>
          <div className="flex flex-col gap-2 mt-4 mb-2">
            <SheetTitle className="text-lg uppercase font-bold text-left">
              Add Your Item
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
            <div className="flex items-start space-x-3 bg-secondary/30 p-4 rounded-xl w-full border border-secondary">
              <Checkbox
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
                <p className="text-[10px] text-muted-foreground">
                  Apply to all remaining months.
                </p>
              </div>
            </div>
            <Input
              id="householdId"
              name="householdId"
              value={householdId}
              readOnly
              className="hidden"
            />
            <Button type="submit" disabled={isPending} className="w-full mt-2">
              {isPending ? 'Processing...' : 'Add to Budget'}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// 'use client';

// import { useActionState, useCallback, useEffect, useState } from 'react';

// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger
// } from '@/components/ui/sheet';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import { toast } from 'sonner';
// import { BudgetItem, Category, User } from '@prisma/client';
// import { addBudgetItem, getBudgetItems } from '@/lib/actions';
// import { getColorCode } from '@/lib/utils';
// import { Checkbox } from '@/components/ui/checkbox';

// type FormErrors = {
//   name?: string;
//   category?: string;
// };

// export function AddBudgetItem({
//   householdId,
//   user,
//   currentCategories,
//   setCurrentBudgetItemsAction,
//   defaultCategoryId,
//   selectedMonth
// }: {
//   householdId: string;
//   user: User;
//   currentCategories: Category[];
//   setCurrentBudgetItemsAction: React.Dispatch<
//     React.SetStateAction<BudgetItem[]>
//   >;
//   defaultCategoryId?: string;
//   selectedMonth: number;
// }) {
//   const [open, setOpen] = useState(false);
//   const [formErrors, setFormErrors] = useState<FormErrors>({});
//   const [applyToFuture, setApplyToFuture] = useState(false);

//   // Set the initial selected category
//   const [selectedCategory, setSelectedCategory] = useState(
//     defaultCategoryId || ''
//   );

//   // Update selection if the prop changes or sheet opens
//   useEffect(() => {
//     if (open && defaultCategoryId) {
//       setSelectedCategory(defaultCategoryId);
//     }
//   }, [open, defaultCategoryId]);

//   const handleSubmit = useCallback(
//     async (previousState: unknown, formData: FormData) => {
//       setFormErrors({});

//       const name = formData.get('name') as string;
//       const categoryId = formData.get('category') as string;
//       const householdId = formData.get('householdId') as string;
//       const amount = Number(formData.get('amount')) || 0;

//       const errors: FormErrors = {};

//       // Validation Logic
//       if (!name) {
//         errors.name = 'Enter a name for your Item.';
//       } else if (name.length > 20) {
//         errors.name = 'Item name should be 20 characters or fewer';
//       }

//       if (!categoryId) {
//         errors.category = 'Select a category for your budgetItem.';
//       }

//       if (Object.keys(errors).length > 0) {
//         setFormErrors(errors);
//         return;
//       }

//       // Call the updated server action with all required parameters
//       const result = await addBudgetItem({
//         householdId,
//         name,
//         categoryId,
//         amount,
//         month: selectedMonth, // Passed from props
//         year: 2026, // Your app's target year
//         applyToFuture: applyToFuture // From local checkbox state
//       });

//       if (!result || !result.success) {
//         toast('Ops...', {
//           description: result?.error || 'Something went wrong. 🚨 Try again.'
//         });
//         return;
//       }

//       // Success flow
//       setOpen(false);
//       setApplyToFuture(false); // Reset checkbox for next time

//       toast('Added successfully! 🎉', {
//         description: applyToFuture
//           ? `Item added for the rest of the year!`
//           : 'Your new budget item is ready to use!'
//       });

//       // We return the whole result so that 'data' in useActionState
//       // gets updated with the new '_currentbudgetItems' list.
//       return result;
//     },
//     [selectedMonth, applyToFuture, householdId] // Dependencies for useCallback
//   );

//   const [data, action, isPending] = useActionState(handleSubmit, undefined);

//   useEffect(() => {
//     if (data?._currentbudgetItems && Array.isArray(data._currentbudgetItems)) {
//       setCurrentBudgetItemsAction(data._currentbudgetItems);
//     }
//   }, [data, setCurrentBudgetItemsAction]);

//   return (
//     <Sheet open={open} onOpenChange={setOpen}>
//       <SheetTrigger asChild className="w-full">
//         <Button>Add Item</Button>
//       </SheetTrigger>
//       <SheetContent side="right" className="sm:max-w-xs mt-8 gap-8">
//         <SheetHeader>
//           <div className="flex flex-col gap-2 my-8">
//             <SheetTitle className="text-lg uppercase font-bold text-left">
//               Add Your Item
//             </SheetTitle>
//             <SheetDescription className="text-sm font-normal lowercase text-left">
//               Store your go-to websites and categorize them with a personal
//               touch.
//             </SheetDescription>
//           </div>
//         </SheetHeader>
//         <form
//           action={action}
//           className="flex flex-col items-start gap-8 font-normal"
//         >
//           <div className="flex flex-col gap-1 w-full">
//             <Input
//               className={formErrors.name ? 'border-2 border-red-500' : ''}
//               placeholder="Name"
//               id="name"
//               name="name"
//             />
//             {formErrors.name ? (
//               <p className="text-xs font-bold text-red-500 ml-4 mt-1">
//                 {formErrors.name}
//               </p>
//             ) : (
//               <p className="text-xs ml-4 mt-1">
//                 Give your Budget Item a memorable name.
//               </p>
//             )}
//           </div>

//           <div className="flex flex-col gap-1 w-full">
//             <Select
//               name="category"
//               value={selectedCategory}
//               onValueChange={setSelectedCategory}
//             >
//               <SelectTrigger
//                 className={formErrors.category ? 'border-2 border-red-500' : ''}
//               >
//                 <SelectValue placeholder="Category" id="category" />
//               </SelectTrigger>
//               <SelectContent>
//                 {currentCategories.map((category) => (
//                   <SelectItem key={category.id} value={category.id}>
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-4 h-4 rounded-full"
//                         style={{
//                           backgroundColor: getColorCode(category.color)
//                             .backgroundColor
//                         }}
//                       />
//                       <p className="capitalize">{category.name}</p>
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex flex-col gap-1 w-full">
//             <Input
//               type="number"
//               step="0.01"
//               placeholder="Monthly Amount (e.g. 150.00)"
//               id="amount"
//               name="amount"
//               required
//             />
//             <p className="text-xs ml-4 mt-1 text-muted-foreground">
//               Enter the planned spending for this item.
//             </p>
//           </div>

//           <div className="flex items-center space-x-2 pt-2 pb-4">
//             <Checkbox
//               id="future"
//               checked={applyToFuture}
//               onCheckedChange={(checked) => setApplyToFuture(!!checked)}
//             />
//             <label
//               htmlFor="future"
//               className="text-sm font-medium leading-none cursor-pointer"
//             >
//               Repeat for the rest of 2026
//             </label>
//           </div>

//           <Input
//             id="householdId"
//             name="householdId"
//             value={householdId}
//             readOnly
//             className="hidden"
//           />
//           <Button type="submit" disabled={isPending}>
//             {isPending ? 'Adding...' : 'Add'}
//           </Button>
//         </form>
//       </SheetContent>
//     </Sheet>
//   );
// }
