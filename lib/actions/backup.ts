'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function exportHouseholdData() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { householdId: true }
  });

  if (!user?.householdId) {
    throw new Error('No household found for this user.');
  }

  try {
    const household = await prisma.household.findUnique({
      where: { id: user.householdId },
      include: {
        categories: {
          include: {
            subcategories: {
              include: {
                transactionRules: true
              }
            }
          }
        },
        transactions: true,
        reminders: true,
        commitments: true
      }
    });

    if (!household) {
      throw new Error('Household data not found.');
    }

    // Return the data to the client for download
    return JSON.parse(JSON.stringify(household));
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw new Error('Failed to export data.');
  }
}
