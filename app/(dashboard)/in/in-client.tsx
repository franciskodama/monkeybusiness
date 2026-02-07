'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import Help from '@/components/Help';
import ExplanationIn from './explanation-in';
import CardUser from './_components/CardUser';
import { ProjectionCard } from './_components/ProjectionCard';
import { SavingsTracker } from './_components/SavingsTracker';
import CardStatus from './_components/CardStatus';
import { SignalsRibbon } from './_components/SignalsRibbon';
import { BurnDownChart } from '@/components/BurnDownChart';
import { SourceBurnChart } from '@/components/SourceBurnChart';
import { FixedVariableTracker } from './_components/FixedVariableTracker';
import { OutlierAlerts } from './_components/OutlierAlerts';
import { tagClass } from '@/lib/classes';
import { User } from '@prisma/client';

interface InClientProps {
  user: any;
  subcategories: any[];
  pendingCount: number;
  reminders: any[];
  householdUsers: User[];
  householdId: string;
}

export default function InClient({
  user,
  subcategories,
  pendingCount,
  reminders,
  householdUsers,
  householdId
}: InClientProps) {
  const [openAction, setOpenAction] = useState(false);

  return (
    <div className="flex flex-col gap-8 p-6 mb-8 mt-2">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight uppercase">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm lowercase mt-1">
            <span className="uppercase">Y</span>our financial health at a
            glance.
          </p>
        </div>
        <div className="hidden sm:block">
          {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />}
        </div>
      </div>

      <AnimatePresence>
        {openAction && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          >
            <div className="mb-4 border border-slate-200">
              <ExplanationIn setOpenAction={setOpenAction} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: TOP ROW (4 Column Grid) */}
      <div className="hidden sm:grid grid-cols-4 w-full gap-8">
        <div className="border border-slate-300 border-dashed p-1 bg-slate-50">
          <div className="bg-white w-full h-full p-6 border border-slate-200 relative">
            <CardUser user={user} />
          </div>
        </div>

        <div className="border border-slate-300 border-dashed p-1 bg-slate-50">
          <div className="bg-white w-full h-full p-6 border border-slate-200 relative">
            <ProjectionCard subcategories={subcategories} />
          </div>
        </div>

        <div className="border border-slate-300 border-dashed p-1 bg-slate-50">
          <div className="bg-white w-full h-full p-6 border border-slate-200 relative text-center">
            <SavingsTracker subcategories={subcategories} />
          </div>
        </div>

        <div className="border border-slate-300 border-dashed p-1 bg-slate-50">
          <div className="bg-white w-full h-full p-6 border border-slate-200 relative flex flex-col justify-center items-center">
            <CardStatus
              title={`🚔 Status`}
              description={
                pendingCount > 0
                  ? `${pendingCount} tasks need mapping.`
                  : 'All clear! Systems optimal.'
              }
              buttonText="Manage Rules"
              url="settings"
            />
          </div>
        </div>
      </div>

      {/* SIGNALS RIBBON */}
      <div className="w-full">
        <SignalsRibbon
          householdId={householdId}
          currentUser={user}
          householdUsers={householdUsers}
          initialReminders={reminders}
        />
      </div>

      {/* SECTION 2: MAIN CHART ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 border border-slate-300 border-dashed p-1 bg-slate-50 min-h-[32em]">
          <div className="bg-white w-full h-full p-6 border border-slate-200 relative flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest">
                  Monthly Burn-Down
                </h4>
                <p className="text-[9px] text-muted-foreground uppercase italic leading-none">
                  Actual vs. Target Plan
                </p>
              </div>
            </div>
            <div className="flex-1 min-h-[300px]">
              <BurnDownChart subcategories={subcategories} />
            </div>
            <div className={tagClass}>
              <span className="mr-2">🔥</span>Burn
            </div>
          </div>
        </div>

        <div className="md:col-span-1 flex flex-col gap-8">
          <div className="border border-slate-300 border-dashed p-1 bg-slate-50 min-h-[20em]">
            <div className="bg-white w-full h-full p-6 border border-slate-200 relative">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">
                Top Burn Sources
              </h4>
              <div className="h-[250px]">
                <SourceBurnChart subcategories={subcategories} />
              </div>
              <div className={tagClass}>
                <span className="mr-2">💳</span>Sources
              </div>
            </div>
          </div>

          <div className="border border-slate-300 border-dashed p-1 bg-slate-50 min-h-[20em]">
            <div className="bg-white w-full h-full p-6 border border-slate-200 relative flex flex-col gap-4">
              <FixedVariableTracker subcategories={subcategories} />
              <div className="flex-1">
                <OutlierAlerts subcategories={subcategories} />
              </div>
              <div className={tagClass}>
                <span className="mr-2">🧩</span>Structure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
