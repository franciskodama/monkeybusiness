'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from './ui/alert';

export default function ExplanationBox({
  iconOne,
  titleOne,
  contentOne,
  iconTwo,
  titleTwo,
  contentTwo,
  iconThree,
  titleThree,
  contentThree,
  callToAction,
  setOpenAction
}: {
  iconOne: React.ReactElement;
  titleOne: string;
  contentOne: React.ReactNode;
  iconTwo: React.ReactElement;
  titleTwo: string;
  contentTwo: React.ReactNode;
  iconThree: React.ReactElement;
  titleThree: string;
  contentThree: React.ReactNode;
  callToAction: string;
  setOpenAction: (value: boolean) => void;
}) {
  return (
    <div className="relative text-primary">
      <Alert className="stripe-border">
        <AlertDescription className="relative text-sm flex flex-col sm:flex-row items-start justify-between p-1 mt-4">
          <div className="flex flex-col mb-6 sm:w-1/3 py-2 sm:px-12 text-primary">
            <div className="flex items-center gap-2 mb-4">
              {iconOne}
              <p className="text-lg font-bold">{titleOne}</p>
            </div>
            <div className="flex flex-col gap-4 mb-4">{contentOne}</div>
          </div>

          <div className="flex flex-col mb-6 sm:w-1/3 py-2 sm:px-12 text-primary">
            <div className="flex items-center gap-2 mb-4">
              {iconTwo}
              <p className="text-lg font-bold">{titleTwo}</p>
            </div>

            <div className="flex flex-col gap-4 mb-4">{contentTwo}</div>
          </div>

          <div className="flex flex-col justify-between sm:w-1/3 py-2 sm:px-12 text-primary">
            <div className="flex items-center gap-2 mb-4">
              {iconThree}
              <p className="text-lg font-bold">{titleThree}</p>
            </div>
            <div className="flex flex-wrap gap-4">{contentThree}</div>
            <Button
              variant={'outline'}
              className="mt-12 mb-6 w-fit text-primary"
              onClick={() => setOpenAction(false)}
            >
              {callToAction}
            </Button>
          </div>
          <button
            className="absolute -right-10 -top-10 sm:right-0 sm:top-0 sm:border-0 border border-primary bg-white p-1"
            onClick={() => setOpenAction(false)}
          >
            <X size={24} color="black" strokeWidth={1.8} />
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
