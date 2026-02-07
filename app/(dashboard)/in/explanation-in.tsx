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
        The <b>Dashboard</b> is your high-level financial summary. It pulls data
        from your Planner and automated imports to give you a real-time health
        check of your household's economy.
      </p>
      <p>
        Use this page to monitor your trajectory, see where your money is
        leaking, and celebrate your savings progress without diving into
        individual spreadsheets.
      </p>
    </div>
  );

  const contentTwo = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - The Top Pulse:
        <span className="font-normal block normal-case tracking-normal mt-1">
          <b>Projection</b> shows where you'll end the month based on current
          burn. <b>Savings</b> tracks your pool growth. <b>Status</b> alerts you
          if any transactions need manual categorization.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Burn-Down Velocity:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The main chart shows your spending pace. If the line stays below the
          blue plan, you're winning. If it spikes above, you're tapping into
          your safety net.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Signals Ribbon:
        <span className="font-normal block normal-case tracking-normal mt-1">
          A dynamic alert system for your household. It highlights upcoming
          reminders, pending actions, and important signals from other members.
        </span>
      </p>
    </div>
  );

  const contentThree = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - Top Burn Sources:
        <span className="font-normal block normal-case tracking-normal mt-1">
          See exactly who is driving the most spend this month. Toggle between
          family members to understand individual versus shared burn.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Fixed vs. Variable:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The <b>Structure</b> cards break down your "Needs" (Fixed) vs "Wants"
          (Variable). This is the key to identifying where you can actually cut
          back.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Outlier Alerts:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The system flags unusual transactions that don't fit your normal
          patterns, helping you spot forgotten subscriptions or errors
          instantly.
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
