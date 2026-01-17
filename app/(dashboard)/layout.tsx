import Footer from '@/components/Footer';
import { DashboardBreadcrumb } from './in/_components/Breadcrumb';
import Greeting from './in/_components/Greeting';
import PencilBanner from './in/_components/Pencil-Banner';
import { User } from './in/_components/User';
import Providers from './providers';
import Image from 'next/image';
import Link from 'next/link';
import { menuItems } from '@/lib/menu';
import { NavItem } from '@/components/NavItem';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Settings } from 'lucide-react';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <PencilBanner />
        <DesktopNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <div>
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <DashboardBreadcrumb />
              {/* <SearchInput /> */}
              <div className="flex items-center gap-4 sm:gap-8">
                <Greeting />
                <User />
              </div>
            </header>
          </div>
          <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 bg-muted/40">
            <div className="flex-1">{children}</div>
            <Footer />
          </main>
        </div>
      </main>
    </Providers>
  );
}

export function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Image
            src="/logo/logo-monkeybusiness-150x124.png"
            alt="Monkey Business Logo"
            width={150}
            height={124}
            className="w-[5em]"
          />
        </Link>

        {menuItems.map((item) => (
          <NavItem key={item.label} href={item.href} label={item.label}>
            {item.icon}
          </NavItem>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              {/* <CardDivulgationHelp /> */}
              <span className="sr-only">Need a hand?</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Need a hand?</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}
