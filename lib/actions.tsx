'use server';

import { v4 } from 'uuid';
import prisma from './prisma';
import { saltAndHashPassword } from './passwords';

export async function addUser(uid: string, name: string, avatar: string) {
  try {
    const user = await prisma.user.upsert({
      where: { uid },
      update: {
        name,
        avatar
      },
      create: {
        id: v4(),
        uid,
        name,
        avatar,
        createdAt: new Date()
      }
    });

    return user;
  } catch (error) {
    console.error('Error adding user:', error);
    return null;
  }
}

export async function createUser({
  email,
  password,
  name
}: {
  email: string;
  password: string;
  name: string;
}) {
  const hashedPassword = await saltAndHashPassword(password);
  const user = await prisma.user.create({
    data: {
      uid: email,
      name,
      hashedPassword
    }
  });

  return user;
}

export async function getUser(uid: string, hashedPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { uid }
    });

    return user;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
}
