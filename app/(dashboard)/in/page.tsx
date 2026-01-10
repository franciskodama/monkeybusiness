export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

import In from './in';
import { auth } from '@/lib/auth';
import { getUser } from '@/lib/actions';
import { Spinner } from '@/lib/icons';

export default async function InPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const dbUser = await getUser(session.user.email ?? '');

  if (!dbUser) {
    redirect('/');
  }

  return (
    <>
      <div>{dbUser ? <In user={dbUser} /> : <Spinner />} </div>
    </>
  );
}
