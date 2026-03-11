export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

import CommandCenterServer from './command-center-server';
import { auth } from '@/lib/auth';
import { getUser } from '@/lib/actions/auth';
import { Spinner } from '@/lib/icons';

export default async function CommandCenterPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();
  const year = parseInt(searchParams.year?.toString() || currentYear.toString(), 10);
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
      <div>{dbUser ? <CommandCenterServer user={dbUser} year={year} /> : <Spinner />} </div>
    </>
  );
}
