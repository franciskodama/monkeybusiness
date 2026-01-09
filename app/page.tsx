import { addUser, getUser } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  if (user) {
    const email = user.email ?? '';
    const name = user.name ?? '';
    const image = user.image ?? '';
    const householdId = 'MONKEY_HOUSEHOLD_1';
    await addUser(email, name, image, householdId);
  }

  return <div>{user ? redirect('/in') : redirect('/login')}</div>;
}
