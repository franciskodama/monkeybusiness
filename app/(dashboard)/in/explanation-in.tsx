import { Compass, Heart, Plus } from 'lucide-react';
import ExplanationBox from '@/components/ExplanationBox';

export default function ExplanationIn({
  setOpenAction
}: {
  setOpenAction: (value: boolean) => void;
}) {
  const contentOne = (
    <>
      <p>
        The Dashboard is your personalized snapshot of everything important! It
        offers quick access to highlights from your Bucket List, Vision Board,
        and Shortcuts, helping you stay inspired and organized.
      </p>
    </>
  );

  const contentTwo = (
    <>
      <p>
        Plus, enjoy daily weather updates, inspirational quotes, and fun facts
        to keep things light and entertaining.
      </p>
      <p>
        We’ve even added feature highlight cards to remind you how handy the app
        can be!
      </p>
    </>
  );

  const contentThree = (
    <>
      <p className="font-semibold">
        - At a Glance:
        <span className="font-normal ml-1">
          Quickly scan your Dashboard for a summary of your personal content,
          like your goals, ideas, and saved links.
        </span>
      </p>
      <p className="font-semibold">
        - Daily Perks:
        <span className="font-normal ml-1">
          Check the weather or read a fun fact and a motivational quote to stay
          engaged.
        </span>
      </p>
      <p className="font-semibold">
        - Feature Spotlight:
        <span className="font-normal ml-1">
          Explore feature highlight cards to discover something new or revisit
          handy tools.
        </span>
      </p>
    </>
  );

  return (
    <ExplanationBox
      setOpenAction={setOpenAction}
      iconOne={<Heart size={24} strokeWidth={1.6} />}
      iconTwo={<Plus size={24} strokeWidth={1.6} />}
      iconThree={<Compass size={24} strokeWidth={1.6} />}
      titleOne="The Heart of Your Journey"
      contentOne={contentOne}
      contentTwo={contentTwo}
      contentThree={contentThree}
      titleTwo=""
      titleThree="Navigate Like a Pro"
      callToAction=" Start Your Journey!"
    />
  );
}
