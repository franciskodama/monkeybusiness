import { auth } from '@/lib/auth';
import { GreetingMessage } from './Greeting-Message';

export default async function Greeting() {
  const session = await auth();
  const user = session?.user;
  const firstName = user?.name?.split(' ')[0];

  if (!firstName) return null;
  return <GreetingMessage firstName={firstName} />;
}
