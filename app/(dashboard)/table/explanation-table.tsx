import { Lightbulb, Settings, Snail } from 'lucide-react';
import ExplanationBox from '@/components/ExplanationBox';

export default function ExplanationTable({
  setOpenAction
}: {
  setOpenAction: (value: boolean) => void;
}) {
  const contentOne = (
    <>
      <p>
        This tool is like your own special list of favorite websites that you
        can keep online. It helps you easily find and go to the pages you love!
      </p>
      <p>
        Instead of messy bookmarks, you can create organized, color-coded
        categories for your favorite websites. Whether for work, blogs, or
        everyday sites, your links are neatly sorted and always accessible, no
        matter where you are.
      </p>
    </>
  );

  const contentTwo = (
    <>
      <p className="font-semibold">
        - Create Categories:
        <span className="font-normal">
          Start by creating categories for your shortcuts
        </span>
      </p>
      <p className="font-semibold">
        - Add Shortcuts:
        <span className="font-normal">
          For each shortcut, input the name, URL, and assign it to a category.
        </span>
      </p>
      <p className="font-semibold">
        - Access Your Shortcuts:
        <span className="font-normal">
          All your shortcuts will appear as buttons, organized by category on
          your board.
        </span>
      </p>

      <p className="font-semibold">
        - Quick Actions:
        <span className="font-normal">
          Click to visit the website directly, View the description for a
          reminder of why you saved it, Delete the shortcut if it’s no longer
          needed.
        </span>
      </p>
    </>
  );

  const contentThree = (
    <>
      <p className="font-semibold">
        - Stay Organized:{' '}
        <span className="font-normal">
          Keep all your important URLs in one place, categorized and easy to
          find.
        </span>
      </p>
      <p className="font-semibold">
        - Always Available:{' '}
        <span className="font-normal">
          Unlike browser bookmarks tied to specific devices, this board is
          accessible from anywhere.
        </span>
      </p>
      <p className="font-semibold">
        - Save Time:{' '}
        <span className="font-normal">
          Access your favorite sites instantly without searching through a
          cluttered bookmarks bar.
        </span>
      </p>
      <p className="font-semibold">
        - Enhance Productivity:{' '}
        <span className="font-normal">
          Quickly get to the websites you need for work or leisure, saving you
          valuable time every day.
        </span>
      </p>
    </>
  );

  return (
    <ExplanationBox
      setOpenAction={setOpenAction}
      iconOne={<Snail size={24} strokeWidth={1.6} />}
      iconTwo={<Settings size={24} strokeWidth={1.6} />}
      iconThree={<Lightbulb size={24} strokeWidth={1.6} />}
      titleOne="What’s This?"
      titleTwo="How to use"
      titleThree="Why You Need It"
      contentOne={contentOne}
      contentTwo={contentTwo}
      contentThree={contentThree}
      callToAction="Start adding your Items!"
    />
  );
}
