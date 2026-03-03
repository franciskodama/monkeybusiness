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
              size={14}
              strokeWidth={2}
              className="text-slate-400 hover:text-white transition-colors"
            />
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
