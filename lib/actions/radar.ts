'use server';

import prisma from '@/lib/prisma';
import { Responsibility } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { resend } from '@/lib/resend';

// REMINDERS --------------------------------------------------------------------

export async function getReminders(householdId: string) {
  try {
    return await prisma.reminder.findMany({
      where: { householdId, isDone: false },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('❌ Error fetching reminders:', error);
    return [];
  }
}

export async function addReminder(data: {
  text: string;
  targetUserId: string;
  creatorId: string;
  householdId: string;
}) {
  try {
    const reminder = await prisma.reminder.create({
      data: {
        text: data.text,
        targetUserId: data.targetUserId,
        creatorId: data.creatorId,
        householdId: data.householdId
      }
    });

    const targetUser = await prisma.user.findUnique({
      where: { uid: data.targetUserId }
    });

    if (targetUser?.name) {
      const targetLabel = targetUser.name.split(' ')[0].toUpperCase();
      const logoUrl = 'https://monkeybusiness-olive.vercel.app/logo/logo-monkeybusiness-150x124-shaved.png';

      await resend.emails.send({
        from: 'Monkey Business <onboarding@resend.dev>',
        to: process.env.RESEND_EMAIL_SERVER!,
        subject: `[MONKEY BUSINESS: ${targetLabel}] New Signal Received 📡`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; color: #0f172a;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="Monkey Business" width="80" />
            </div>
            <h1 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; text-align: center;">
              Incoming Signal 📡
            </h1>
            <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 30px; margin-bottom: 30px;">
              <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 10px; margin-top: 0;">
                Message for ${targetUser.name.split(' ')[0]}
              </p>
              <p style="font-size: 20px; font-weight: 600; line-height: 1.4; margin: 0; color: #0f172a;">
                "${data.text}"
              </p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
              A new reminder has been added to your household dashboard. <br/>
              Let's keep the engine running smoothly!
            </p>
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://monkeybusiness-olive.vercel.app/command-center" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">
                Open Dashboard
              </a>
            </div>
            <div style="margin-top: 60px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center;">
              <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">
                Monkey Business • Synergy Intelligence
              </p>
            </div>
          </div>
        `
      });
    }

    revalidatePath('/command-center');
    return { success: true, reminder };
  } catch (error) {
    console.error('❌ Error adding reminder:', error);
    return { success: false };
  }
}

export async function deleteReminder(id: string) {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id }
    });

    if (!reminder) return { success: false };

    const creatorUser = await prisma.user.findUnique({
      where: { uid: reminder.creatorId }
    });

    if (creatorUser?.name) {
      const session = await auth();
      const finisherName = session?.user?.name || 'Someone';
      const logoUrl = 'https://monkeybusiness-olive.vercel.app/logo/logo-monkeybusiness-150x124-shaved.png';

      await resend.emails.send({
        from: 'Monkey Business <onboarding@resend.dev>',
        to: process.env.RESEND_EMAIL_SERVER!,
        subject: `[MONKEY BUSINESS: HOUSEHOLD] Mission Accomplished! ✅`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; color: #0f172a;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="Monkey Business" width="80" />
            </div>
            <h1 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; text-align: center; color: #10b981;">
              Task Completed ✅
            </h1>
            <div style="text-align: center; padding: 30px; border: 1px dashed #cbd5e1; margin-bottom: 30px;">
               <p style="font-size: 14px; color: #475569; margin-bottom: 10px;">
                Good news, <strong>${creatorUser.name.split(' ')[0]}</strong>!
              </p>
              <p style="font-size: 18px; font-weight: 600; line-height: 1.4; margin: 0; color: #0f172a;">
                <strong>${finisherName}</strong> has finished the task:
              </p>
              <p style="font-size: 18px; font-weight: 400; font-style: italic; color: #10b981; margin-top: 10px;">
                "${reminder.text}"
              </p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
              Your household just got a little lighter. <br/>
              Everything is in sync! 🚀
            </p>
            <div style="margin-top: 60px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center;">
              <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">
                Monkey Business • Synergy Intelligence
              </p>
            </div>
          </div>
        `
      });
    }

    await prisma.reminder.delete({ where: { id } });
    revalidatePath('/command-center');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting reminder:', error);
    return { success: false };
  }
}

// RADAR --------------------------------------------------------------------

export async function getFinancialCommitments(householdId: string) {
  try {
    return await prisma.financialCommitment.findMany({
      where: { householdId },
      orderBy: { dayOfMonth: 'asc' }
    });
  } catch (error) {
    console.error('❌ Error fetching commitments:', error);
    return [];
  }
}

export async function addFinancialCommitment(data: {
  title: string;
  description?: string;
  responsibility: Responsibility;
  amount?: number;
  dayOfMonth: number;
  sendEmailAlert: boolean;
  daysBeforeAlert: number;
  householdId: string;
  creatorId: string;
}) {
  try {
    const commitment = await prisma.financialCommitment.create({
      data: {
        title: data.title,
        description: data.description,
        responsibility: data.responsibility,
        amount: data.amount,
        dayOfMonth: data.dayOfMonth,
        sendEmailAlert: data.sendEmailAlert,
        daysBeforeAlert: data.daysBeforeAlert,
        householdId: data.householdId,
        creatorId: data.creatorId
      }
    });
    revalidatePath('/radar');
    return { success: true, commitment };
  } catch (error) {
    console.error('❌ Error adding commitment:', error);
    return { success: false };
  }
}

export async function deleteFinancialCommitment(id: string) {
  try {
    await prisma.financialCommitment.delete({ where: { id } });
    revalidatePath('/radar');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting commitment:', error);
    return { success: false };
  }
}

export async function updateFinancialCommitment(data: {
  id: string;
  title: string;
  description?: string;
  responsibility: Responsibility;
  amount?: number;
  dayOfMonth: number;
  sendEmailAlert: boolean;
  daysBeforeAlert: number;
}) {
  try {
    const updated = await prisma.financialCommitment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        responsibility: data.responsibility,
        amount: data.amount,
        dayOfMonth: data.dayOfMonth,
        sendEmailAlert: data.sendEmailAlert,
        daysBeforeAlert: data.daysBeforeAlert
      }
    });
    revalidatePath('/radar');
    return { success: true, commitment: updated };
  } catch (error) {
    console.error('❌ Error updating commitment:', error);
    return { success: false };
  }
}

export async function sendRadarAlertEmail(commitmentId: string) {
  try {
    const commitment = await prisma.financialCommitment.findUnique({
      where: { id: commitmentId },
      include: { household: { include: { users: true } } }
    });

    if (!commitment || !commitment.sendEmailAlert) return { success: false };

    const users = commitment.household.users;
    let targetUsers: typeof users = [];

    if (commitment.responsibility === 'FAMILY') {
      targetUsers = users;
    } else {
      const p1Name = commitment.household.person1Name || 'Francis';
      const p2Name = commitment.household.person2Name || 'Mariana';
      const search =
        commitment.responsibility === Responsibility.PERSON1
          ? p1Name.toUpperCase()
          : p2Name.toUpperCase();
      targetUsers = users.filter((u) => u.name.toUpperCase().includes(search));
    }

    if (targetUsers.length === 0) targetUsers = users; // Fallback

    for (const user of targetUsers) {
      const logoUrl = 'https://monkeybusiness-olive.vercel.app/logo/logo-monkeybusiness-150x124-shaved.png';

      const isFamily = commitment.responsibility === 'FAMILY';
      const avatarSection = isFamily
        ? users
            .map(
              (u) =>
                `<img src="${u.image}" alt="${u.name}" width="40" height="40" style="border-radius: 50%; border: 2px solid #0f172a; margin: 0 5px;" />`
            )
            .join('')
        : `<img src="${user.image}" alt="${user.name}" width="60" height="60" style="border-radius: 50%; border: 2px solid #0f172a;" />`;

      await resend.emails.send({
        from: 'Monkey Business <onboarding@resend.dev>',
        to: process.env.RESEND_EMAIL_SERVER!,
        subject: `[RADAR] Incoming Commitment: ${commitment.title.toUpperCase()} 📡`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; color: #0f172a;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="Monkey Business" width="80" />
            </div>
            <h1 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 30px; text-align: center;">
              Radar Intelligence 📡
            </h1>
            <div style="text-align: center; margin-bottom: 30px;">
              ${avatarSection}
              <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-top: 10px;">
                Responsibility: ${commitment.responsibility === Responsibility.PERSON1 
                  ? (commitment.household.person1Name || 'Francis') 
                  : commitment.responsibility === Responsibility.PERSON2 
                    ? (commitment.household.person2Name || 'Mariana') 
                    : 'FAMILY'}
              </p>
            </div>
            <div style="background-color: #f8fafc; border-left: 4px solid #0f172a; padding: 30px; margin-bottom: 30px;">
              <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 5px; margin-top: 0;">
                Scheduled Commitment
              </p>
              <h2 style="font-size: 24px; font-weight: 900; line-height: 1.2; margin: 0 0 10px 0; color: #0f172a; text-transform: uppercase;">
                ${commitment.title}
              </h2>
              ${commitment.description ? `<p style="font-size: 14px; font-style: italic; color: #475569; margin: 0;">"${commitment.description}"</p>` : ''}
              ${commitment.amount ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin: 0;">Amount Due</p>
                  <p style="font-size: 20px; font-weight: 900; color: #10b981; margin: 5px 0 0 0;">$${commitment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              ` : ''}
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
              This commitment is due on day <strong>${commitment.dayOfMonth}</strong>. <br/>
              The Radar keeps you ahead of the curve.
            </p>
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://monkeybusiness-olive.vercel.app/radar" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">
                View Radar
              </a>
            </div>
            <div style="margin-top: 60px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center;">
              <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">
                Monkey Business • Synergy Intelligence
              </p>
            </div>
          </div>
        `
      });
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending Radar email:', error);
    return { success: false };
  }
}
