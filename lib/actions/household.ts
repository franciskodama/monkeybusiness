'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

export async function joinHousehold(inviteCode: string) {
  const session = await auth();
  if (!session?.user?.email) return { success: false, error: 'Unauthorized' };

  try {
    const household = await prisma.household.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() }
    });

    if (!household) return { success: false, error: 'Invalid invite code' };

    await prisma.user.update({
      where: { email: session.user.email },
      data: { householdId: household.id }
    });

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Error joining household:', error);
    return { success: false, error: 'Server error' };
  }
}

export async function updateHouseholdNames(
  householdId: string,
  person1Name: string,
  person2Name: string
) {
  const session = await auth();
  if (!session?.user?.email) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.household.update({
      where: { id: householdId },
      data: {
        person1Name,
        person2Name
      }
    });

    revalidatePath('/settings');
    revalidatePath('/command-center');
    revalidatePath('/yearly');
    return { success: true };
  } catch (error) {
    console.error('Error updating household names:', error);
    return { success: false, error: 'Server error' };
  }
}

export async function getHouseholdUsers(householdId: string) {
  try {
    return await prisma.user.findMany({
      where: { householdId }
    });
  } catch (error) {
    console.error('❌ Error fetching household users:', error);
    return [];
  }
}

