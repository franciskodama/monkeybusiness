import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { CircleHelp } from 'lucide-react';

export default function Help({
  setOpenAction
}: {
  setOpenAction: (value: boolean) => void;
}) {
  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className="text-sm"
            onClick={() => {
              setOpenAction(true);
            }}
          >
            <CircleHelp size={32} strokeWidth={1} />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-primary ml-2 capitalize font-light">
              Learn more
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
