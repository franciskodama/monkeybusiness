import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  return <div>{user ? redirect('/in') : redirect('/login')}</div>;
}
