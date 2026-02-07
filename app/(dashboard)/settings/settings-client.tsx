'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { RulesManager } from './rules-manager';
import { BackupRestore } from './backup-restore';
import { HouseholdManager } from './household-manager';
import { ShieldCheck, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tagClass } from '@/lib/classes';
import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Help from '@/components/Help';
import ExplanationSettings from './explanation-settings';

interface SettingsClientProps {
  user: any;
  rules: any[];
  subcategories: any[];
  automationCoverage: number;
  householdId: string;
}

export default function SettingsClient({
  user,
  rules,
  subcategories,
  automationCoverage,
  householdId
}: SettingsClientProps) {
  const [openAction, setOpenAction] = useState(false);

  return (
    <Card className="relative border-none shadow-none bg-transparent mb-8">
      <CardHeader className="sm:mb-12">
        <CardTitle className="flex justify-between items-start gap-2">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">Settings</p>
            <CardDescription className="text-sm mt-1">
              Optimize your financial engine.
            </CardDescription>
          </div>
          <div className="hidden sm:block">
            {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {openAction && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              >
                <div className="mb-12 border border-slate-200">
                  <ExplanationSettings setOpenAction={setOpenAction} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- TOP ROW --- */}
          <div className="hidden sm:flex flex-col sm:flex-row w-full justify-between gap-8 mb-12 text-primary">
            {/* Account Profile Card */}
            <div className="relative sm:w-1/3 p-6 pt-10 border border-slate-300 border-dashed flex items-center justify-center gap-4">
              <div className="h-12 w-12 flex items-center justify-center shrink-0 ">
                <Image
                  src={user?.image || '/avatar.png'}
                  width={100}
                  height={100}
                  alt="Avatar"
                  className="overflow-hidden rounded-full z-0"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-xl font-bold">{user?.name || 'User'}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 uppercase font-bold">
                  <ShieldCheck size={10} />
                  Household Member
                </div>
              </div>
              <div className={tagClass}>
                <span className="mr-2">👤</span>Identity
              </div>
            </div>

            {/* Automation Health Card */}
            <div className="relative sm:w-1/3 p-6 pt-10 border border-slate-300 border-dashed flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-none bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 border border-emerald-200">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xl font-bold">{automationCoverage}%</p>
                <p className="text-sm text-muted-foreground uppercase font-bold">
                  Smart Coverage
                </p>
              </div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 p-1 px-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
                <span className="mr-2">⚡️</span>System Health Status
              </div>
            </div>

            {/* System Version Card */}
            <div className="relative sm:w-1/3 p-6 pt-10 border border-slate-300 border-dashed flex flex-col justify-center text-center">
              <p className="text-sm mb-2 text-muted-foreground italic">
                System engine is healthy.
              </p>
              <p className="text-lg font-bold uppercase tracking-tighter">
                v2.0.26 Online
              </p>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 p-1 px-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
                <span className="mr-2">⚙️</span>System
              </div>
            </div>
          </div>

          <Tabs defaultValue="household" className="w-full space-y-6">
            <TabsList className="flex w-full sm:w-[600px] bg-muted border border-slate-300 border-dashed p-1 h-12 rounded-none">
              <TabsTrigger
                value="household"
                className="flex-1 uppercase text-sm font-bold tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white rounded-none h-full"
              >
                Household
              </TabsTrigger>
              <TabsTrigger
                value="rules"
                className="flex-1 uppercase text-sm font-bold tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white rounded-none h-full"
              >
                Rules
              </TabsTrigger>
              <TabsTrigger
                value="backup"
                className="flex-1 uppercase text-sm font-bold tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white rounded-none h-full"
              >
                Backup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="household" className="outline-none">
              <div className="stripe-border w-full min-h-[30em] p-1 border border-slate-300 border-dashed">
                <div className="bg-white w-full h-full min-h-[30em] p-8">
                  <HouseholdManager
                    household={user.household}
                    currentUserId={user.uid}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="outline-none">
              <div className="stripe-border w-full min-h-[30em] p-1 border border-slate-300 border-dashed">
                <div className="bg-white w-full h-full min-h-[30em] overflow-hidden">
                  <RulesManager rules={rules} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="backup" className="outline-none">
              <div className="stripe-border w-full min-h-[30em] p-1 border border-slate-300 border-dashed">
                <div className="bg-white w-full h-full min-h-[30em] p-8">
                  <BackupRestore
                    householdId={householdId}
                    currentSubcategories={subcategories}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
