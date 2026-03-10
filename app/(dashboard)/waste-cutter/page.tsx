export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { getUser } from '@/lib/actions/auth';
import { Spinner } from '@/lib/icons';
import WasteCutter from './waste-cutter';

export default async function WasteCutterPage() {
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
      <div>{dbUser ? <WasteCutter user={dbUser} /> : <Spinner />} </div>
    </>
  );
}
