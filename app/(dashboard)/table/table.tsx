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
import { toast } from 'sonner';
import { barlow, kumbh_sans } from '@/lib/fonts';
import { AddBudgetItem } from './add-budget-item';
import { deleteBudgetItem } from '@/lib/actions';

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
              <div>
                <AddCategory
                  user={user}
                  householdId={householdId}
                  currentCategories={currentCategories}
                  setCurrentCategoriesAction={setCurrentCategoriesAction}
                />
              </div>
              <div>
                <AddBudgetItem
                  user={user}
                  householdId={householdId}
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

        <div className="flex flex-col w-full h-[32em]"></div>
      </CardContent>
    </Card>
  );
}
