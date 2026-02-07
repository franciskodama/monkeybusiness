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
          Use the <b>PDF Importer</b> or paste JSON/Text with the{' '}
          <b>Direct Code</b> tool.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        3. Review & Automate:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Confirm matches. Set "Smart Rules" to automate future entries—even
          after picking a category, the rule settings stay open for your final
          check.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        4. Course Correct:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Noticed a mistake? Click on any <b>Actual</b> value to see the full
          list and delete individual transactions in one click.
        </span>
      </p>
    </div>
  );

  const contentThree = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - Total Awareness:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The <b>Sticky Command Center</b> keeps your Income, Burn, and Net
          Result always in view as you scroll.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Smarter Matching:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The system uses "Match Patterns" to recognize merchants. Check for the
          green <b>Matched by Rule</b> badge during import to see automation in
          action.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Precise Control:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Whether importing a batch or fixing a single entry, you have full
          control over what hits your budget.
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
