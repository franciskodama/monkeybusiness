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
        2. Sync Transactions:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Use the <b>Direct Code</b> or <b>PDF Importer</b> to bring in bank
          data. The AI will try to match them to our categories automatically.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        3. Review & Save:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Confirm the AI's matches. Once saved, the "Actual" column updates
          instantly to show our progress.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        4. Watch the Burn:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Check the status pill (e.g., "$50 left") to see if we are staying
          under budget.
        </span>
      </p>
    </div>
  );

  const contentThree = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - Total Awareness:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Stop wondering "where did the money go?" by seeing real-time tracking
          against your goals.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Smart Automation:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The more we use it, the smarter it gets. Create "Smart Rules" during
          import to never categorize the same store twice.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Multi-Month Flex:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Switch between months easily. Your budget stays organized even if a
          bank statement spans two different months.
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
