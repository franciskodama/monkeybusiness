import { LayoutDashboard, Zap, Activity } from 'lucide-react';
import ExplanationBox from '@/components/ExplanationBox';

export default function ExplanationIn({
  setOpenAction
}: {
  setOpenAction: (value: boolean) => void;
}) {
  const contentOne = (
    <div className="space-y-4 text-primary">
      <p>
        The <b>Command Center</b> is your high-level financial summary. It
        transforms raw data from your Planner and automated imports into{' '}
        <b>Strategic Intelligence</b>, giving you a real-time health check of
        your household's annual trajectory.
      </p>
      <p>
        Use this page to monitor your <b>Strategic Velocity</b>, see the "Big
        Picture" of your yearly flow, and spot trends before they become
        problems.
      </p>
    </div>
  );

  const contentTwo = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - The Strategic Puls:
        <span className="font-normal block normal-case tracking-normal mt-1">
          <b>Efficiency Index</b> shows your income-to-expense health.{' '}
          <b>Wealth Velocity</b> tracks your investment speed.{' '}
          <b>Monthly Burn</b> compares current spending against your YTD
          average.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Annual Performance Path:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The central map shows your 12-month mission. It tracks Income,
          Expenses, and Savings trends from January to December, allowing you to
          see the "shape" of your year.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Live Signals:
        <span className="font-normal block normal-case tracking-normal mt-1">
          A dynamic alert system for your household mission control. Clear
          signals from family members and auto-generated system reminders.
        </span>
      </p>
    </div>
  );

  const contentThree = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - Strategic Drill-Down:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Deep analytics into <b>Outliers</b> (unusual spend),{' '}
          <b>Source Burn</b> (who is spending), and <b>Structure</b> (Fixed vs
          Variable costs).
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Behavioral Alignment:
        <span className="font-normal block normal-case tracking-normal mt-1">
          By seeing the year-to-date trends, you can adjust your monthly
          behavior to ensure you land the year in a "Master Efficiency" state.
        </span>
      </p>
    </div>
  );

  return (
    <ExplanationBox
      setOpenAction={setOpenAction}
      iconOne={
        <LayoutDashboard size={24} strokeWidth={1.6} className="text-primary" />
      }
      iconTwo={<Zap size={24} strokeWidth={1.6} className="text-primary" />}
      iconThree={
        <Activity size={24} strokeWidth={1.6} className="text-primary" />
      }
      titleOne="At a Glance"
      titleTwo="The Workflow"
      titleThree="Deeper Insights"
      contentOne={contentOne}
      contentTwo={contentTwo}
      contentThree={contentThree}
      callToAction="Take control of your burn!"
    />
  );
}
