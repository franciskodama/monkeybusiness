'use client';

import Link from 'next/link';
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
// import ExplanationbudgetItems from './explanation-budgetItems';
import { AddCategory } from './add-category';
import { Button } from '@/components/ui/button';
import { getColorCode } from '@/lib/utils';
import { BudgetItem, Category } from '@prisma/client';
import { toast } from 'sonner';
import { barlow, kumbh_sans } from '@/lib/fonts';
import { AddBudgetItem } from './add-budget-item';
// import MessageEmpty from '@/components/MessageEmpty';

export type CategoryInput = {
  category: string;
  color: string;
};

export default function Table({
  uid,
  householdId,
  categories,
  budgetItems
}: {
  uid: string;
  householdId: string;
  categories: Category[];
  budgetItems: BudgetItem[];
}) {
  const [openAction, setOpenAction] = useState(false);
  const [currentBudgetItems, setCurrentBudgetItemsAction] =
    useState<BudgetItem[]>(budgetItems);
  const [currentCategories, setCurrentCategoriesAction] =
    useState<Category[]>(categories);
  const [openDescriptions, setOpenDescriptions] = useState<Set<string>>(
    new Set()
  );

  const board: BudgetItem[][] = Object.values(
    currentBudgetItems.reduce(
      (acc: Record<string, BudgetItem[]>, curr: BudgetItem) => {
        if (acc[curr.categoryId]) {
          acc[curr.categoryId].push(curr);
        } else {
          acc[curr.categoryId] = [curr];
        }
        return acc;
      },
      {}
    )
  );

  const handleDeleteItem = async (budgetItem: BudgetItem) => {
    try {
      const success = await deleteBudgetItem(budgetItem.id);
      if (success) {
        setCurrentBudgetItemsAction(
          currentBudgetItems.filter((el) => el.id !== budgetItem.id)
        );
      }
      toast('budgetItem gone!', {
        description: `The ${budgetItem.budgetItem} has been successfully deleted.`
      });
    } catch (error) {
      console.error(error);
      toast('Error deleting budgetItem! 🚨', {
        description: 'Something went wrong while deleting the budgetItem.'
      });
    }
  };

  const toggleDescription = (budgetItemId: string) => {
    setOpenDescriptions((prevOpen) => {
      const newOpen = new Set(prevOpen);
      if (newOpen.has(budgetItemId)) {
        newOpen.delete(budgetItemId);
      } else {
        newOpen.add(budgetItemId);
      }
      return newOpen;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between items-start mb-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <p>budgetItems</p>
              <div className="block sm:hidden">
                {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />}
              </div>
            </div>
            <p
              className={`${barlow.className} text-sm font-normal lowercase mt-2`}
            >
              <span className="uppercase">Y</span>our go-to place for quick
              access to your favorite sites.
            </p>
          </div>
          <div
            className={`${barlow.className} flex gap-4 capitalize mt-8 sm:mt-0 w-full sm:w-[18ch]`}
          >
            <div className="flex gap-4 w-full">
              <div className="w-1/2">
                <AddCategory
                  uid={uid}
                  currentCategories={currentCategories}
                  setCurrentCategoriesAction={setCurrentCategoriesAction}
                />
              </div>
              <div className="w-1/2">
                <AddBudgetItem
                  uid={uid}
                  currentCategories={currentCategories}
                  setCurrentBudgetItemsAction={setCurrentBudgetItemsAction}
                />
              </div>
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
        <div className="flex flex-col sm:flex-row w-full gap-8 mb-12">
          {board.map((groupOfbudgetItems: BudgetItem[]) => (
            <div key={groupOfbudgetItems[0].categoryId} className="sm:w-1/5">
              <h3
                className={`${kumbh_sans.className} text-left text-sm font-semibold text-primary px-4 py-3 my-2 uppercase leading-none`}
                style={getColorCode(
                  groupOfbudgetItems[0].category?.color ?? 'grey'
                )}
              >
                {groupOfbudgetItems[0].category?.category}
              </h3>

              {groupOfbudgetItems.map((budgetItem: BudgetItem) => (
                <>
                  <div
                    key={budgetItem.id}
                    className="flex border border-primary mt-2"
                  >
                    {/* <div className="w-full px-4 py-3">
                      <Link
                        href={budgetItem.url}
                        target="_blank"
                        className="w-full"
                      >
                        <p className="text-left uppercase text-sm leading-none">
                          {budgetItem.budgetItem}
                        </p>
                      </Link>
                    </div> */}

                    <Button
                      variant="ghost"
                      onClick={() => {
                        toggleDescription(budgetItem.id);
                      }}
                    >
                      {openDescriptions.has(budgetItem.id) ? (
                        <ArrowUpWideNarrow
                          size={18}
                          strokeWidth={1.8}
                          color="#000"
                        />
                      ) : (
                        <ArrowDownWideNarrow
                          size={18}
                          strokeWidth={1.8}
                          color="#000"
                        />
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger className="px-2 py-1 mr-4">
                        <Trash2 size={18} strokeWidth={1.8} color="#000" />
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[calc(100%-35px)]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <Bomb size={24} strokeWidth={1.8} />
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="py-4">
                            This will permanently delete the vision
                            <span className="font-bold mx-1">
                              {budgetItem.budgetItem}
                            </span>
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
                            onClick={() => handleDeleteItem(budgetItem)}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <AnimatePresence>
                    {openDescriptions.has(budgetItem.id) ? (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 0, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: 0.5,
                          transition: { duration: 0.1 }
                        }}
                      >
                        <div className="px-4 py-2 bg-primary text-white text-xs font-semibold">
                          {budgetItem.name ? (
                            budgetItem.name
                          ) : (
                            <div className="flex items-center ml-1">
                              <MessageCircleX
                                size={18}
                                strokeWidth={1.8}
                                color="#fff"
                              />
                              <p className="ml-2">No description available.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
