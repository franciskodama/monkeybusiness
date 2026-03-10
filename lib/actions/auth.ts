'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

export async function addUser(user: {
  uid: string;
  email: string;
  name: string;
  image: string;
}) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ uid: user.uid }, { email: user.email }]
      },
      include: { household: true }
    });

    if (existingUser) return existingUser;

    // Create a new unique household for every new user
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const household = await prisma.household.create({
      data: {
        name: `${user.name.split(' ')[0]}'s Household`,
        inviteCode: inviteCode
      }
    });

    try {
      const newUser = await prisma.user.create({
        data: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          image: user.image,
          householdId: household.id
        },
        include: {
          household: true
        }
      });
      return newUser;
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return await prisma.user.findUnique({
          where: { uid: user.uid },
          include: { household: true }
        });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error in addUser:', error);
    return null;
  }
}

export async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      },
      select: {
        uid: true,
        email: true,
        name: true,
        image: true,
        householdId: true,
        household: {
          include: {
            users: true
          }
        }
      }
    });

    if (user?.household && !user.household.inviteCode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await prisma.household.update({
        where: { id: user.householdId },
        data: { inviteCode: code }
      });
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

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
