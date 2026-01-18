import { tagClass } from '@/lib/classes';
import { User } from '@prisma/client';
import Image from 'next/image';

export default function CardUser({ user }: { user: User | undefined }) {
  return (
    <>
      <div className={tagClass}>
        <span className="mr-2">👤</span>Profile
      </div>
      <div className="flex flex-col items-center justify-center h-full gap-2">
        {user?.image ? (
          <>
            <Image
              src={user.image || '/avatar.png'}
              width={100}
              height={100}
              alt="Avatar"
              className="overflow-hidden rounded-full z-0"
            />
            <p className="text-2xl font-bold">
              Hi,
              <span className="text-yellow-500 text-4xl mx-2">
                {user.name?.split(' ')[0]}
              </span>
              {`:)`}
            </p>
            <p className="text-sm font-normal">
              Welcome to Precision Budgeting!
            </p>
          </>
        ) : (
          <Image
            src="/avatar.webp"
            width={150}
            height={150}
            alt="Avatar"
            className="overflow-hidden rounded-full"
          />
        )}
      </div>
    </>
  );
}
