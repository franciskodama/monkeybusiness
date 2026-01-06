import { auth } from '@/lib/auth';

import Login from '@/app/login/page';
import In from './in';

export default async function InPage() {
  const session = await auth();
  console.log('---  🚀 ---> | session:', session);
  // const user = session?.user;
  // console.log('---  🚀 ---> | user:', user);

  // if (!session) {
  //   return <Login />;
  // }

  return (
    <>
      {/* <In user={user} />; */}
      <div className="text-8xl font-bold">Hello World!</div>
    </>
  );
}
