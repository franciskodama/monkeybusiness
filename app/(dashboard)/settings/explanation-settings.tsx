import { Shield, Zap, Database } from 'lucide-react';
import ExplanationBox from '@/components/ExplanationBox';

export default function ExplanationSettings({
  setOpenAction
}: {
  setOpenAction: (value: boolean) => void;
}) {
  const contentOne = (
    <div className="space-y-4 text-primary">
      <p>
        Welcome to the <b>Engine Room</b>. This is where you configure the core
        logic of your financial system, manage your household connectivity, and
        ensure your data is safely backed up.
      </p>
      <p>
        Think of this as the "Admin Panel" for your budget—once configured, your
        daily workflow in the Planner becomes much smoother.
      </p>
    </div>
  );

  const contentTwo = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - Smart Rules:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Manage the automated patterns the system uses to recognize your
          expenses. You can edit, delete, or manually add rules here to improve
          your
          <b>Smart Coverage</b>.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Household sync:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Invite members to your household so you can track shared expenses and
          income together in real-time.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Backup & Recovery:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Export your entire budget as a JSON file for safe keeping, or restore
          your data if you're starting fresh.
        </span>
      </p>
    </div>
  );

  const contentThree = (
    <div className="space-y-3 text-primary">
      <p className="font-bold uppercase tracking-wider">
        - Smart Coverage %:
        <span className="font-normal block normal-case tracking-normal mt-1">
          The <b>System Health Status</b> shows how many of your subcategories
          are covered by automation rules. Aim for 80%+ for a true "auto-pilot"
          experience.
        </span>
      </p>
      <p className="font-bold uppercase tracking-wider">
        - Data Privacy:
        <span className="font-normal block normal-case tracking-normal mt-1">
          Your financial data belongs to your household only. We use
          industry-standard encryption to keep your balance sheets private.
        </span>
      </p>
    </div>
  );

  return (
    <ExplanationBox
      setOpenAction={setOpenAction}
      iconOne={<Shield size={24} strokeWidth={1.6} className="text-primary" />}
      iconTwo={<Zap size={24} strokeWidth={1.6} className="text-primary" />}
      iconThree={
        <Database size={24} strokeWidth={1.6} className="text-primary" />
      }
      titleOne="The Engine Room"
      titleTwo="Control Points"
      titleThree="System Health"
      contentOne={contentOne}
      contentTwo={contentTwo}
      contentThree={contentThree}
      callToAction="Keep the gears turning!"
    />
  );
}
