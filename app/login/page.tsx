import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { signIn } from '@/lib/auth';
import { LogoGitHub, LogoGoogle } from '@/lib/svgs';
import Image from 'next/image';

export default async function Login() {
  return (
    <div
      className="min-h-screen flex flex-col sm:flex-row justify-center items-start md:items-center p-8 bg-[#ffffff] opacity-80"
      style={{
        backgroundSize: '10px 10px',
        backgroundImage:
          'repeating-linear-gradient(45deg, #000000 0, #030303 1px, #ffffff 0, #ffffff 50%)'
      }}
    >
      <div className="flex flex-col sm:flex-row items-center">
        <div className="flex flex-col p-4 sm:p-12 border-red-500bg bg-white sm:mr-12 mb-8 sm:mb-0 sm:w-[90ch] border border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Image
            className="mb-6 sm:mb-12 w-20 h-20 sm:w-32 sm:h-32"
            src="/logos/HandyForMe_Cog200x200.png"
            alt="HandyFor.Me Logo"
            width={150}
            height={150}
          />
          <div className="flex flex-col uppercase w-full">
            <p className="text-4xl sm:text-8xl font-extrabold sm:leading-[5.5rem]">
              Goodbye 👋 overwhelm!
            </p>
            <div className="flex w-full sm:justify-end text-base font-semibold sm:text-2xl sm:text-right opacity-50 sm:leading-10 mt-6">
              <p className="w-[20ch]">
                Your personal hub for organizing daily tasks is just one click
                away!
              </p>
            </div>
          </div>
        </div>

        <Card className="flex flex-col justify-center w-full max-w-sm border border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-4xl text-black">Login</CardTitle>
            <CardDescription>
              Life’s better when it’s handy – Let’s sign in!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center my-2 sm:my-[3em]">
            <form
              action={async () => {
                'use server';
                await signIn('google', {
                  redirectTo: '/'
                });
              }}
              className="w-full"
            >
              <Button
                size={'lg'}
                type="submit"
                className="flex items-center gap-4 w-full text-base font-normal mb-4"
              >
                <LogoGoogle />
                <p>Sign in with Google</p>
              </Button>
            </form>
            <form
              action={async () => {
                'use server';
                await signIn('github', {
                  redirectTo: '/'
                });
              }}
              className="w-full"
            >
              <Button
                size={'lg'}
                type="submit"
                className="flex items-center gap-4 w-full text-base font-normal"
              >
                <LogoGitHub />
                <p>Sign in with GitHub</p>
              </Button>
            </form>
            {/* <p className="my-4 text-sm">or</p>
            <div className="w-full">
              <SignIn />
            </div> */}
          </CardContent>

          {/* <CardFooter className="text-sm">
            <div>
              <p className="font-semibold">Not a member yet?</p>
              Don’t worry, life gets better from here!
              <span>
                <Link
                  href="/login/signup"
                  className="underline underline-offset-4 ml-2"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </CardFooter> */}
        </Card>
      </div>
    </div>
  );
}
