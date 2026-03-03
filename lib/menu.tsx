import {
  Home,
  BarChart,
  Table,
  PiggyBank,
  CalendarDays,
  Scissors
} from 'lucide-react';

export const menuItems = [
  {
    label: 'Command Center',
    href: '/command-center',
    icon: <Home className="h-5 w-5" />
  },

  {
    label: 'Planner',
    href: '/planner',
    icon: <CalendarDays className="h-5 w-5" />
  },
  {
    label: 'Yearly Table',
    href: '/yearly',
    icon: <Table className="h-5 w-5" />
  },
  {
    label: 'Waste Cutter',
    href: '/waste-cutter',
    icon: <Scissors className="h-5 w-5" />
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: <BarChart className="h-5 w-5" />
  }
];
