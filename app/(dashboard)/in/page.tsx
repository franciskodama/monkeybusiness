export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import In from './in';
import { auth } from '@/lib/auth';

export default async function InPage() {
  const session = await auth();
  const user = session?.user;

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <div>{user ? <In user={user} /> : <div>loading...</div>}</div>
    </>
  );
}
