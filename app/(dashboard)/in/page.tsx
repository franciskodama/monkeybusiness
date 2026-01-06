import { auth } from '@/lib/auth';
import In from './in';

import SignIn from '@/components/SignIn';

export default async function InPage() {
  const session = await auth();
  const user = session?.user;

  if (!session) {
    return <SignIn />;
  }

  return <In user={user} />;
}
