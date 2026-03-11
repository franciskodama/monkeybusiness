import { ColorEnum, Household, User } from '@prisma/client';

export interface HouseholdWithUsers extends Household {
  users: User[];
}

export type UserWithHousehold = User & {
  household?: Household | null;
};

export interface TransactionInput {
  id?: string;
  date: Date | string;
  description: string;
  amount: number | string;
  subcategoryId?: string | null;
  ruleMatched?: boolean;
  pattern?: string;
  source?: string | null;
  createdAt?: Date;
}

export interface SubcategoryWithCategory {
  id: string;
  name: string;
  amount: number | null;
  month: number;
  year: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: ColorEnum;
    isIncome: boolean;
    isSavings: boolean;
    isFixed: boolean;
    order: number;
    householdId: string;
  };
  householdId: string;
  transactions?: TransactionInput[];
}

export interface BudgetTemplateCategory {
  name: string;
  color?: ColorEnum;
  isIncome?: boolean;
  isSavings?: boolean;
  isFixed?: boolean;
  order?: number;
  subcategories: {
    name: string;
    amount: number;
  }[];
}

export interface TransactionRuleWithSubcategory {
  id: string;
  pattern: string;
  householdId: string;
  subcategoryId: string;
  subcategory: SubcategoryWithCategory;
}
