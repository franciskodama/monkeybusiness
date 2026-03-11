import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Starting system-wide backup...');

  try {
    const households = await prisma.household.findMany({
      include: {
        users: true,
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

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      households
    };

    const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const backupsDir = path.join(process.cwd(), 'backups');

    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir);
    }

    const filePath = path.join(backupsDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    console.log(`✅ Backup successfully saved to: ${filePath}`);
    console.log(`📊 Exported ${households.length} households.`);
  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
