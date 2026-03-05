'use client';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function CommandCenterBreadcrumb() {
  const pathname = usePathname();

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {pathname !== '/command-center' ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/command-center">Command Center</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link className="capitalize" href={pathname}>
                  {pathname.slice(1).replace('-', ' ')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
