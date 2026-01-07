export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import In from './in';
import { auth } from '@/lib/auth';

export default async function InPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <In user={session?.user} />;
}
