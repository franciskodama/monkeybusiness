import { Home, BarChart, Table, PiggyBank, CalendarDays } from 'lucide-react';

export const menuItems = [
  { label: 'Dashboard', href: '/in', icon: <Home className="h-5 w-5" /> },
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
    label: 'Chart',
    href: '/chart',
    icon: <BarChart className="h-5 w-5" />
  }
];
