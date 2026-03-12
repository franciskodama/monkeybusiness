import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as fs from 'fs';
import * as path from 'path';
import { decrypt } from './utils/encryption';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function restoreHousehold(filePath: string, targetHouseholdId: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  
  let backup;
  try {
    // Try to decrypt first
    const decryptedData = decrypt(rawData);
    backup = JSON.parse(decryptedData);
  } catch (error) {
    console.log('⚠️ Failed to parse as encrypted data, trying raw JSON...');
    try {
      backup = JSON.parse(rawData);
    } catch (innerError) {
      console.error('❌ Failed to parse backup file. It might be corrupted or using a different encryption key.');
      return;
    }
  }

  const household = backup.households.find((h: any) => h.id === targetHouseholdId);


  if (!household) {
    console.error(`❌ Household with ID ${targetHouseholdId} not found in backup.`);
    return;
  }

  console.log(`✨ Restoring household: ${household.name} (${household.id})`);

  try {
    // 1. Clean up existing data for this household to avoid conflicts
    // We do this in a specific order to respect foreign keys
    console.log('🧹 Cleaning old data...');
    
    await prisma.transaction.deleteMany({ where: { householdId: targetHouseholdId } });
    await prisma.reminder.deleteMany({ where: { householdId: targetHouseholdId } });
    await prisma.financialCommitment.deleteMany({ where: { householdId: targetHouseholdId } });
    await prisma.transactionRule.deleteMany({ where: { householdId: targetHouseholdId } });
    await prisma.subcategory.deleteMany({ where: { householdId: targetHouseholdId } });
    await prisma.category.deleteMany({ where: { householdId: targetHouseholdId } });
    
    // We don't delete the household or users generally, just update/reconnect
    // but the script could be expanded to recreate them if missing.

    // 2. Restore Categories and Subcategories
    console.log('📂 Restoring categories and subcategories...');
    for (const cat of household.categories) {
      const { subcategories, ...catData } = cat;
      await prisma.category.create({
        data: {
          ...catData,
          subcategories: {
            create: subcategories.map((sub: any) => {
              const { transactionRules, ...subData } = sub;
              return {
                ...subData,
                transactionRules: {
                  create: transactionRules
                }
              };
            })
          }
        }
      });
    }

    // 3. Restore Transactions
    console.log('💸 Restoring transactions...');
    if (household.transactions.length > 0) {
      await prisma.transaction.createMany({
        data: household.transactions
      });
    }

    // 4. Restore Reminders
    console.log('🔔 Restoring reminders...');
    if (household.reminders.length > 0) {
      await prisma.reminder.createMany({
        data: household.reminders
      });
    }

    // 5. Restore Commitments
    console.log('📅 Restoring financial commitments...');
    if (household.commitments.length > 0) {
      await prisma.financialCommitment.createMany({
        data: household.commitments
      });
    }

    console.log('✅ Restoration complete!');
  } catch (error) {
    console.error('❌ Restoration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Simple CLI handling
const args = process.argv.slice(2);
const fileArg = args.find(a => a.startsWith('--file='))?.split('=')[1];
const idArg = args.find(a => a.startsWith('--id='))?.split('=')[1];

if (!fileArg || !idArg) {
  console.log('Usage: npx ts-node scripts/restore-user.ts --file=backups/backup_xyz.json.enc --id=household-uuid-here');
} else {
  restoreHousehold(path.resolve(fileArg), idArg);
}
