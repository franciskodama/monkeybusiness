// import { kumbh_sans } from 'app/ui/fonts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signIn } from '@/lib/auth';
import Image from 'next/image';
import { LogoGitHub, LogoGoogle } from '@/lib/svgs';
import SignUp from './sign-up';
import Link from 'next/link';

export default async function SignUpPage() {
  return (
    <div
      className='min-h-screen flex flex-col sm:flex-row justify-center items-start md:items-center p-8 bg-[#ffffff] opacity-80'
      style={{
        backgroundSize: '10px 10px',
        backgroundImage:
          'repeating-linear-gradient(45deg, #000000 0, #030303 1px, #ffffff 0, #ffffff 50%)',
      }}
    >
      <div className='flex flex-col sm:flex-row items-center'>
        <div className='flex flex-col py-8 px-4 sm:p-12 border-red-500bg bg-white sm:mr-12 mb-8 sm:mb-0 sm:w-[90ch] border border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
          <Image
            className='mb-6 sm:mb-12 w-20 h-20 sm:w-32 sm:h-32'
            src='/logos/HandyForMe_Cog200x200.png'
            alt='HandyFor.Me Logo'
            width={150}
            height={150}
          />
          <div className='flex flex-col'>
            <p
              className={`${kumbh_sans.className} uppercase text-2xl sm:text-8xl font-extrabold sm:leading-[5.5rem]`}
            >
              Welcome aboard! 🥳
            </p>
            <div className='flex w-full sm:justify-end sm:text-2xl sm:text-right sm:leading-10 my-2'>
              <p>
                We’re glad you’ve made it this far! Let’s take the next step
                together!
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className='flex flex-col justify-center w-full max-w-sm border border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
        <CardHeader>
          <CardTitle className='text-4xl text-black'>Sign Up</CardTitle>
          <CardDescription>
            Join a platform designed to help you organize, achieve, and grow.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center my-2 sm:my-[3em]'>
          <SignUp />
        </CardContent>

        <CardFooter className='text-sm'>
          <div className='flex'>
            <p className='font-semibold'>Already have an account?</p>
            <span>
              <Link href='/login' className='underline underline-offset-4 ml-2'>
                Sign in here
              </Link>
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
