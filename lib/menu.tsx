import { Home, BarChart } from 'lucide-react';

export const menuItems = [
  { label: 'Dashboard', href: '/in', icon: <Home className="h-5 w-5" /> },
  {
    label: 'Chart',
    href: '/chart',
    icon: <BarChart className="h-5 w-5" />
  }
];
