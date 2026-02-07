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
        1. Net Cash Flow:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The <b>Slate Row</b> shows your monthly survivability (Income -
          Expenses). A positive number means you added to your pool that month.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        2. Savings Rate:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The <b>Emerald Row</b> is your efficiency score. It shows what
          percentage of your total income was actually saved after all burn.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        3. Source Breakdown:
        <span className="font-normal block normal-case tracking-normal mt-1">
          At the bottom, we break down total spending by <b>His</b>, <b>Her</b>,
          and <b>Family</b>. Perfect for seeing who is driving the burn in
          specific periods.
        </span>
      </p>
    </div>
  );

  const contentThree = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - Interactive Details:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Click any cell with a value to see the specific transactions that make
          up that amount for that specific month.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Year-To-Date (YTD):
        <span className="font-normal block normal-case tracking-normal mt-1">
          The rightmost column gives you the <b>Total sum</b> for every single
          item across the whole year—perfect for tax season or annual reviews.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Consistent Logic:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The colors and names match your Planner exactly. Any change you make
          there (like renaming a category) updates here instantly.
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
