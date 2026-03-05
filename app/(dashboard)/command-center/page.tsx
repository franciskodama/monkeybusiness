export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

import CommandCenterServer from './command-center-server';
import { auth } from '@/lib/auth';
import { getUser } from '@/lib/actions';
import { Spinner } from '@/lib/icons';

export default async function CommandCenterPage() {
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
      <div>{dbUser ? <CommandCenterServer user={dbUser} /> : <Spinner />} </div>
    </>
  );
}
