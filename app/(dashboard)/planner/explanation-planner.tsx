import { Target, Zap, Microscope } from 'lucide-react';
import ExplanationBox from '@/components/ExplanationBox';

export default function ExplanationPlanner({
  setOpenAction
}: {
  setOpenAction: (value: boolean) => void;
}) {
  const contentOne = (
    <div className="space-y-4 text-primary">
      <p>
        This is your <b>Financial Command Center</b>. It’s designed to help us
        see exactly where our money is going each month before it even leaves
        our account.
      </p>
      <p>
        The page is split into <b>Categories</b> (like Housing or Food) and{' '}
        <b>Subcategories</b> (like Rent or Groceries).
        <br />
        <br />
        For every Subcategories of the month, we track two numbers: what we{' '}
        <b>Targeted</b> to spend and what <b>Actually</b> happened.
      </p>
    </div>
  );

  const contentTwo = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        1. Set the Target:
        <span className="font-normal block normal-case tracking-normal mt-1">
          At the start of the month, enter how much we plan to spend on each
          item.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        2. Sync & Review:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Import transactions via PDF or Direct Code. Review matches—if a
          "Deficit Warning" appears, you're planning for more than you've
          funded.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        3. 4-Step Settlement:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Follow the <b>"clinical" 4-step logic</b> in the sidebar: tracking
          Payments, Deposits, Effort, and your Final Surplus.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        4. Interactive Knowledge:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Can't remember what "Savings Rate" means? <b>Click on any label</b> in
          the sidebar to reveal a deep definition and its goal.
        </span>
      </p>
    </div>
  );

  const contentThree = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - Total Zero-Balance:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Our goal is to reach a <b>Perfect Balance</b> ($0.00 unassigned). It
          ensures every dollar is doing a job—spending or saving.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Wealth Velocity:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Hitting 30%+ in your Savings Rate unlocks the{' '}
          <b>"High Wealth Velocity"</b> status. Aim for the rocket icon!
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Course Correction:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Click any <b>Actual</b> cell to see and manage individual transactions
          instantly.
        </span>
      </p>
    </div>
  );

  return (
    <ExplanationBox
      setOpenAction={setOpenAction}
      iconOne={<Target size={24} strokeWidth={1.6} className="text-primary" />}
      iconTwo={<Zap size={24} strokeWidth={1.6} className="text-primary" />}
      iconThree={
        <Microscope size={24} strokeWidth={1.6} className="text-primary" />
      }
      titleOne="The Blueprint"
      titleTwo="The Workflow"
      titleThree="Why it Matters"
      contentOne={contentOne}
      contentTwo={contentTwo}
      contentThree={contentThree}
      callToAction="Let's get organized!"
    />
  );
}
