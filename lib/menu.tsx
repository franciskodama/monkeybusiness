import {
  BookA,
  Grid3x3,
  Home,
  ExternalLink,
  ListMinus,
  MessageCircleQuestion,
  RefreshCw,
  Trophy,
  HandHeart
} from 'lucide-react';

export const menuItems = [
  { label: 'Dashboard', href: '/in', icon: <Home className="h-5 w-5" /> },
  {
    label: 'Vision Board',
    href: '/vision-board',
    icon: <Grid3x3 className="h-5 w-5" />
  },
  {
    label: 'Shortcuts',
    href: '/shortcuts',
    icon: <ExternalLink className="h-5 w-5" />
  },
  {
    label: 'Bucket List',
    href: '/bucket-list',
    icon: <ListMinus className="h-5 w-5" />
  },
  {
    label: 'Weekly Wins',
    href: '/weekly-wins',
    icon: <Trophy className="h-5 w-5" />
  },
  {
    label: 'Decision Helper',
    href: '/decision-helper',
    icon: <RefreshCw className="h-5 w-5" />
  },
  {
    label: 'Stoic Support',
    href: '/stoic-support',
    icon: <HandHeart className="h-5 w-5" />
  },
  {
    label: 'Random Questions',
    href: '/random-question',
    icon: <MessageCircleQuestion className="h-5 w-5" />
  },
  {
    label: 'Letter Leap',
    href: '/letter-leap',
    icon: <BookA className="h-5 w-5" />
  }
];
