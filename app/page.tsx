import { addUser } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  if (user) {
    const email = user.email ?? '';
    const name = user.name ?? '';
    const image = user.image ?? '';
    await addUser(email, name, image);
  }

  return <div>{user ? redirect('/in') : redirect('/login')}</div>;
}
