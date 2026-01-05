'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { TooltipProvider } from '@/components/ui/tooltip';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
  });
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CSPostHogProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </CSPostHogProvider>
  );
}
