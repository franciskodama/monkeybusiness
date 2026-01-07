export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import In from './in';
import { auth } from '@/lib/auth';
import { getFk, getUser } from '@/lib/actions';

export default async function InPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const user = session?.user;
  const userName = await getUser(user?.email || '');
  console.log('---  🚀 ---> | userName:', userName);

  const fk = await getFk();
  console.log('---  🚀 ---> | fk:', fk);

  return <In user={user} />;
}
