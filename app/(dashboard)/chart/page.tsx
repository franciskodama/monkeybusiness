import SignIn from '@/components/SignIn';
import { auth } from '@/lib/auth';

export default async function BucketListPage() {
  const session = await auth();
  const uid = session?.user?.email;
  const firstName = session?.user?.name?.split(' ')[0];

  if (!uid || !firstName) {
    return <SignIn />;
  }

  return (
    <div className="flex h-[32em] items-center justify-center">
      Nothing her yet! Xúuupa...
    </div>
  );
}
