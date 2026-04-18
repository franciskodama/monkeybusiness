import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

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
            <HelpCircle
              size={26}
              strokeWidth={1.2}
              className="text-slate-800"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-white capitalize">Learn more</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
