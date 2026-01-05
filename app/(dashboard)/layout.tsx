import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { User } from './header/user';
import Providers from './providers';
import PencilBanner from './header/pencil-banner';
import { DashboardBreadcrumb } from './header/breadcrumb';
import Greeting from './header/greeting';
import { Toaster } from '@/components/ui/toaster';
import { NavItem } from '@/components/NavItem';
import { SearchInput } from './header/search';
import CardDivulgationHelp from './in/card-divulgation-help';
import Footer from '@/components/Footer';
import { menuItems } from '@/lib/menu';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className='flex min-h-screen w-full flex-col bg-muted/40'>
        <PencilBanner />
        <DesktopNav />
        <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
          <div>
            <header className='sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
              <MobileNav />
              <DashboardBreadcrumb />
              {/* <SearchInput /> */}
              <div className='flex items-center gap-4 sm:gap-8'>
                <Greeting />
                <User />
              </div>
            </header>
          </div>
          <main className='grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40'>
            {children}
            <Toaster />
            <Footer />
          </main>
        </div>
      </main>
    </Providers>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size='icon' variant='outline' className='sm:hidden'>
          <Menu className='h-5 w-5' />
          <span className='sr-only'>Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='sm:max-w-xs'>
        <nav className='grid gap-6 text-lg font-medium'>
          <Link
            href='/'
            className='group flex h-10 w-10 shrink-0 items-center justify-center gap-2 text-lg font-semibold text-primary-foreground md:text-base'
          >
            <Image
              src='/logos/HandyForMe_Cog200x200.png'
              alt='HandyFor.Me Logo'
              width={200}
              height={200}
            />
            <span className='sr-only'>HandyFor.me</span>
          </Link>
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <SheetClose asChild>
                <button className='flex items-center gap-4 px-2.5 truncate text-left text-muted-foreground hover:text-foreground'>
                  {item.icon}
                  {item.label}
                </button>
              </SheetClose>
            </Link>
          ))}
          {/* <Link
            href="#"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link> */}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function DesktopNav() {
  return (
    <aside className='fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex'>
      <nav className='flex flex-col items-center gap-4 px-2 sm:py-5'>
        <Link
          href='/'
          className='group flex h-9 w-9 shrink-0 items-center justify-center gap-2 text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base'
        >
          <Image
            src='/logos/HandyForMe_Cog200x200.png'
            alt='HandyFor.Me Logo'
            width={200}
            height={200}
          />
        </Link>

        {menuItems.map((item) => (
          <NavItem key={item.href} href={item.href} label={item.label}>
            {item.icon}
          </NavItem>
        ))}
      </nav>
      <nav className='mt-auto flex flex-col items-center gap-4 px-2 sm:py-5'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href='#'
              className='flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'
            >
              <CardDivulgationHelp />
              <span className='sr-only'>Need a hand?</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='right'>Need a hand?</TooltipContent>
        </Tooltip>
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip> */}
      </nav>
    </aside>
  );
}
