'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { UserNameEmailImage } from '@/lib/types';
import ExplanationIn from './explanation-in';
import { CardMessage } from './_components/CardMessage';
import CardUser from './_components/CardUser';
import CardEmpty from './_components/CardEmpty';

export default function In({ user }: { user: UserNameEmailImage | undefined }) {
  const [openAction, setOpenAction] = useState(false);

  return (
    <Card className="relative">
      <CardHeader className="sm:mb-12">
        <CardTitle className="flex justify-between items-center gap-2">
          <p>Dashboard</p>
          {/* {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />} */}
        </CardTitle>
        <CardDescription>Let's Budget it!</CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {openAction ? (
            <motion.div
              layout
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            >
              <div className="mb-12">
                <ExplanationIn setOpenAction={setOpenAction} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-col gap-4">
          {/* -----------------------  First Row ----------------------- */}

          <>
            <div className="hidden sm:flex flex-col sm:flex-row w-full justify-between gap-8 mb-12">
              <div className="sm:w-1/3">{user && <CardUser user={user} />}</div>
              <div className="sm:w-1/3">
                <CardMessage />
              </div>
              <div className="sm:w-1/3">
                <CardEmpty
                  title={`🚨 Alerts`}
                  description="Ops...  Data is out of reach. 👻 Check back soon!"
                />
              </div>
            </div>
          </>

          {/* ----------------------- Spreadsheet ----------------------- */}

          <div className="flex w-full h-[30em]">Spreadsheet</div>
        </div>
      </CardContent>
    </Card>
  );
}
