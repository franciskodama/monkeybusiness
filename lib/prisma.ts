// import { PrismaClient } from '@prisma/client';
// import { PrismaNeon } from '@prisma/adapter-neon';

// const connectionString = process.env.DATABASE_URL as string;

// declare global {
//   var prisma: PrismaClient | undefined;
// }

// const createPrismaClient = () => {
//   // Prisma 7 requires an adapter or accelerateUrl in the constructor.
//   // We pass a configuration object directly to PrismaNeon to satisfy its types.
//   const adapter = new PrismaNeon({ connectionString });

//   return new PrismaClient({ adapter });
// };

// export const prisma = global.prisma || createPrismaClient();

// if (process.env.NODE_ENV !== 'production') {
//   global.prisma = prisma;
// }

// export default prisma;

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL as string;

const adapter = new PrismaNeon({ connectionString });

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

console.log(
  '--- 🛡️ DEBUG: Database URL is:',
  process.env.DATABASE_URL ? 'FOUND' : 'MISSING'
);

export default prisma;
