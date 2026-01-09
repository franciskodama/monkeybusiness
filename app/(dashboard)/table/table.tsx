'use client';

import { useState } from 'react';
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Bomb,
  Ghost,
  MessageCircleX,
  Trash2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import Help from '@/components/Help';
import { AddCategory } from './add-category';
import { Button } from '@/components/ui/button';
import { getColorCode } from '@/lib/utils';
import { BudgetItem, Category, User } from '@prisma/client';
import { barlow, kumbh_sans } from '@/lib/fonts';
import { AddBudgetItem } from './add-budget-item';
import { deleteBudgetItem } from '@/lib/actions';
import { toast } from 'sonner';

export type CategoryInput = {
  category: string;
  color: string;
};

export default function Table({
  user,
  householdId,
  categories,
  budgetItems
}: {
  user: User;
  householdId: string;
  categories: Category[];
  budgetItems: BudgetItem[];
}) {
  const [openAction, setOpenAction] = useState(false);
  const [currentBudgetItems, setCurrentBudgetItemsAction] =
    useState<BudgetItem[]>(budgetItems);
  const [currentCategories, setCurrentCategoriesAction] =
    useState<Category[]>(categories);

  const handleDeleteItem = async (itemId: string) => {
    const result = await deleteBudgetItem(itemId, householdId);

    if (result.success) {
      // Update local state to remove the item from the UI immediately
      setCurrentBudgetItemsAction((prev) =>
        prev.filter((item) => item.id !== itemId)
      );
      toast.success('Item removed');
    } else {
      toast.error('Could not delete item');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between items-start mb-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <p>Table</p>
              <div className="block sm:hidden">
                {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />}
              </div>
            </div>
            <p
              className={`${barlow.className} text-sm font-normal lowercase mt-2`}
            >
              <span className="uppercase">Y</span>our go-to place for money!
            </p>
          </div>
          <div
            className={`${barlow.className} flex gap-4 capitalize mt-8 sm:mt-0 w-full sm:w-[18ch]`}
          >
            <div className="flex gap-4 w-full">
              <AddCategory
                user={user}
                householdId={householdId}
                currentCategories={currentCategories}
                setCurrentCategoriesAction={setCurrentCategoriesAction}
              />
            </div>
          </div>
          <div className="hidden sm:block">
            {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative p-6">
        <AnimatePresence>
          {openAction ? (
            <motion.div
              layout
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            >
              {/* <div className="mb-12">
                <ExplanationbudgetItems setOpenAction={setOpenAction} />
              </div> */}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* {board.length < 1 && (
          <div className="mt-8">
            <MessageEmpty
              image={'/budgetItem-empty.webp'}
              objectPosition={'50% 10%'}
              alt={'Looking for something'}
              icon={<Ghost size={32} strokeWidth={1.6} />}
              titleOne={'Oops...'}
              titleTwo={'budgetItem Not Found'}
              subtitle={
                'Start by adding a category for easy organization, then save your first budgetItem here. Get ready to access your favorites in a click!'
              }
              setOpenAction={setOpenAction}
              buttonCopy={'Learn More'}
              hasButton={true}
            />
          </div>
        )} */}

        <div className="flex flex-col w-full gap-8 mt-4">
          {currentCategories.map((category) => {
            // Filter items belonging to this specific category
            const itemsInThisCategory = currentBudgetItems.filter(
              (item) => item.categoryId === category.id
            );

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col border rounded-xl overflow-hidden shadow-sm"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between p-4 bg-secondary/30 border-b">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-inner"
                      // Spread the object so both color and backgroundColor are applied
                      style={getColorCode(category.color)}
                    />
                    <h3
                      className={`font-bold uppercase text-sm ${kumbh_sans.className}`}
                    >
                      {category.name}
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {itemsInThisCategory.length} Items
                  </span>
                </div>

                {/* Items List */}
                <div className="flex flex-col divide-y divide-secondary/50">
                  {itemsInThisCategory.length > 0 ? (
                    itemsInThisCategory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-secondary/10 transition-colors"
                      >
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-4">
                          {/* Amount placeholder - we'll make this editable later */}
                          <span className="text-sm font-mono text-muted-foreground">
                            $ 0.00
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive/50 hover:text-destructive"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive/50 hover:text-destructive"
                              onClick={() => handleDeleteItem(item.id)} // Trigger deletion
                            >
                              <Trash2 size={14} />
                            </Button>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-xs text-muted-foreground italic">
                      No items in this category yet.
                    </div>
                  )}

                  <div>
                    <AddBudgetItem
                      user={user}
                      householdId={householdId}
                      currentCategories={currentCategories}
                      setCurrentBudgetItemsAction={setCurrentBudgetItemsAction}
                    />
                  </div>
                  <div className="p-2 bg-secondary/10 flex justify-center">
                    <AddBudgetItem
                      user={user}
                      householdId={householdId}
                      // Important: Pass the specific category context
                      currentCategories={[category]}
                      setCurrentBudgetItemsAction={setCurrentBudgetItemsAction}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
