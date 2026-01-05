'use client';

import { kumbh_sans } from 'app/ui/fonts';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className='p-4 md:p-6'>
      <div className='mb-8 space-y-4'>
        <h1 className={`${kumbh_sans.className} font-bold text-3xl mb-2`}>
          Ops...
        </h1>
        {error && (
          <pre className='my-4 px-3 py-6 bg-black text-white max-w-2xl overflow-scroll flex text-wrap'>
            {`${error} `}{' '}
            <p>
              <br />
              ¯\_(ツ)_/¯
            </p>
          </pre>
        )}
        <p>We still working on it. Please try again later.</p>
        <Image src='/error.webp' alt='error ghost' width={500} height={500} />
      </div>
    </main>
  );
}
