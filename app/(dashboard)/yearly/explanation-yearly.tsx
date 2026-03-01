import { BarChart3, Layers, Lightbulb } from 'lucide-react';
import ExplanationBox from '@/components/ExplanationBox';

export default function ExplanationYearly({
  setOpenAction
}: {
  setOpenAction: (value: boolean) => void;
}) {
  const contentOne = (
    <div className="space-y-4 text-primary">
      <p>
        This is your <b>Financial Bird's Eye View</b>. Here you can see the
        entire year consolidated into one single table, making it easy to spot
        trends, identifying seasonal spikes, and monitor your long-term
        progress.
      </p>
      <p>
        Every category and subcategory you've created in the Planner is
        automatically synced here, month by month.
      </p>
    </div>
  );

  const contentTwo = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        1. Performance Index:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The sidebar summarizes your <b>Savings Rate</b> (YTD speed) and{' '}
          <b>Living Efficiency</b> (capacity to stay in budget) for all months
          so far.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        2. Yearly Settlement:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The <b>Final Balance</b> calculates your Forecast vs Reality. Watch
          for the "Plan Deficit" warning if your annual target expenses exceed
          your income.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        3. Master Efficiency:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Maintain a 30%+ annual savings rate to unlock the <b>Chess King 👑</b>{' '}
          status—the mark of world-class long-term financial management.
        </span>
      </p>
    </div>
  );

  const contentThree = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - Total YTD:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The rightmost column gives you the <b>Total sum</b> for every single
          item across the whole year—perfect for tax season or annual reviews.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Interactive Details:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Click any cell with a value to see the transactions.{' '}
          <b>Need a definition?</b> Click any metric label on the sidebar for a
          deep dive.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Annual Status Badge:
        <span className="font-normal block normal-case tracking-normal mt-1">
          As you fix the past or adjust future forecasts, your{' '}
          <b>Status Badge</b> and <b>Final Settlement</b> update to reflect your
          new annual trajectory.
        </span>
      </p>
    </div>
  );

  return (
    <ExplanationBox
      setOpenAction={setOpenAction}
      iconOne={
        <BarChart3 size={24} strokeWidth={1.6} className="text-primary" />
      }
      iconTwo={<Layers size={24} strokeWidth={1.6} className="text-primary" />}
      iconThree={
        <Lightbulb size={24} strokeWidth={1.6} className="text-primary" />
      }
      titleOne="The Big Picture"
      titleTwo="Mastering the Rows"
      titleThree="Power Tips"
      contentOne={contentOne}
      contentTwo={contentTwo}
      contentThree={contentThree}
      callToAction="Keep the momentum going!"
    />
  );
}
