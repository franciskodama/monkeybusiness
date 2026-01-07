'use server';

import prisma from './prisma';

export async function getTotalUsersAndTest() {
  try {
    const allUsers = await prisma.user.findMany({ take: 1 });
    console.log('--- 🕵️ TOTAL USERS FOUND:', allUsers.length);
    console.log('--- 🕵️ FIRST USER IN DB:', allUsers[0]?.email);
    return allUsers[0];
  } catch (error) {
    console.error('Database is empty or unreachable:', error);
    return null;
  }
}

// --------------------------------------------------------------------

export async function addUser(email: string, name: string, image: string) {
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        image
      },
      create: {
        email,
        name,
        image,
        createdAt: new Date()
      }
    });

    return user;
  } catch (error) {
    console.error('Error in addUser action:', error);
    throw new Error('Failed to sync user data');
  }
}

// export async function createUser({
//   email,
//   password,
//   name
// }: {
//   email: string;
//   password: string;
//   name: string;
// }) {
//   const hashedPassword = await saltAndHashPassword(password);
//   const user = await prisma.user.create({
//     data: {
//       uid: email,
//       name,
//       hashedPassword
//     }
//   });

//   return user;
// }

export async function getUser(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    return user;
  } catch (error: any) {
    console.error('--- ❌ DATABASE ERROR:', error.message || error);
    return null;
  }
}

// export async function getUser(email: string) {
//   const cleanEmail = email.toLowerCase().trim(); // Clean it up
//   try {
//     const user = await prisma.user.findFirst({
//       where: {
//         email: {
//           equals: cleanEmail,
//           mode: 'insensitive' // This ignores capitalization!
//         }
//       }
//     });

//     return user;
//   } catch (error: any) {
//     console.error('Error retrieving user:', error.message || error);
//     return null;
//   }
// }
