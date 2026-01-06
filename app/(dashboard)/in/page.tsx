import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import In from './in';

export default async function InPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const user = session?.user;

  return <In user={user} />;
}
