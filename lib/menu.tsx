import {
  CalendarDays,
  Scissors,
  NotebookPen,
  ChartScatter,
  Flag
} from 'lucide-react';

export const menuItems = [
  {
    label: 'Command Center',
    href: '/command-center',
    icon: <Flag className="h-5 w-5" />
  },

  {
    label: 'Planner',
    href: '/planner',
    icon: <NotebookPen className="h-5 w-5" />
  },
  {
    label: 'Yearly Table',
    href: '/yearly',
    icon: <CalendarDays className="h-5 w-5" />
  },
  {
    label: 'Waste Cutter',
    href: '/waste-cutter',
    icon: <Scissors className="h-5 w-5" />
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: <ChartScatter className="h-5 w-5" />
  }
];
