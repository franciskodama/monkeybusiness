import { getUser, getSubcategories } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { CardMessage } from './_components/CardMessage';
import CardEmpty from './_components/CardEmpty';
import CardUser from './_components/CardUser';
import { User } from '@prisma/client';
import { BurnDownChart } from '@/components/BurnDownChart';

export default async function In({ user }: { user: User }) {
  const session = await auth();
  const householdId = user?.householdId!;

  const subcategories = await getSubcategories(householdId);
  const currentMonth = new Date().getMonth() + 1;

  // Logic for the Alerts Card
  const pendingTransactions = subcategories
    .filter((s) => s.month === currentMonth)
    .flatMap((s) => s.transactions || [])
    .filter((t) => !t.subcategoryId).length;

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* SECTION 1: TOP ROW (33/33/33) */}
      <div className="hidden sm:flex flex-row w-full justify-between gap-8">
        <div className="sm:w-1/3">
          <CardUser user={user} />
        </div>
        <div className="sm:w-1/3">
          <CardMessage />
        </div>
        <div className="sm:w-1/3">
          <CardEmpty
            title={`🚨 Status`}
            description={
              pendingCount > 0
                ? `${pendingCount} transactions need a home.`
                : 'All clear! Your budget is fully mapped.'
            }
            buttonText="Manage Rules"
            url="settings"
          />
        </div>
      </div>

      {/* SECTION 2: MAIN CHART ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[30em]">
        {/* Burn-Down Chart (Left 2/3) */}
        <div className="md:col-span-2 border border-slate-300 border-dashed p-1 bg-slate-50">
          <div className="bg-white w-full h-full p-6 border border-slate-200">
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
            <BurnDownChart subcategories={subcategories} />
          </div>
        </div>

        {/* Breakdown (Right 1/3) */}
        <div className="md:col-span-1 border border-slate-300 border-dashed p-1 bg-slate-50">
          <div className="bg-white w-full h-full p-6 border border-slate-200">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">
              Top Burn Sources
            </h4>
            {/* We can put the SourceBreakdown component here later */}
          </div>
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import ExplanationIn from './explanation-in';
// import { CardMessage } from './_components/CardMessage';
// import CardUser from './_components/CardUser';
// import CardEmpty from './_components/CardEmpty';
// import { User } from '@prisma/client';

// export default function In({ user }: { user: User }) {
//   const [openAction, setOpenAction] = useState(false);

//   return (
//     <Card className="relative">
//       <CardHeader className="sm:mb-12">
//         <CardTitle className="flex justify-between items-center gap-2">
//           <p>Dashboard</p>
//           {/* {!openAction ? <Help setOpenAction={setOpenAction} /> : <div />} */}
//         </CardTitle>
//         <CardDescription>Let's Budget it!</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <AnimatePresence>
//           {openAction ? (
//             <motion.div
//               layout
//               initial={{ opacity: 0, y: 50, scale: 0.3 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
//             >
//               <div className="mb-12">
//                 <ExplanationIn setOpenAction={setOpenAction} />
//               </div>
//             </motion.div>
//           ) : null}
//         </AnimatePresence>

//         <div className="flex flex-col gap-4">
//           {/* -----------------------  First Row ----------------------- */}

//           <>
//             <div className="hidden sm:flex flex-col sm:flex-row w-full justify-between gap-8 mb-12">
//               <div className="sm:w-1/3">{user && <CardUser user={user} />}</div>
//               <div className="sm:w-1/3">
//                 <CardMessage />
//               </div>
//               <div className="sm:w-1/3">
//                 <CardEmpty
//                   title={`🚨 Alerts`}
//                   description="Ops...  Data is out of reach. 👻 Check back soon!"
//                 />
//               </div>
//             </div>
//           </>

//           {/* ----------------------- Spreadsheet ----------------------- */}

//           <div className="flex w-full h-[30em]">Charts here in this row</div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
