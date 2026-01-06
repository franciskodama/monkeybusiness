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
        <div className="flex flex-col p-4 sm:p-12 bg-white sm:mr-12 mb-8 sm:mb-0 sm:w-[90ch] border border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Image
            className="mb-6 sm:mb-12 w-20 h-20 sm:w-32 sm:h-32"
            src="/logo/logo-icon-140x140.png"
            alt="Monkey Business Logo"
            width={150}
            height={150}
          />
          <div className="flex flex-col w-full">
            <p className="text-4xl uppercase sm:text-8xl font-extrabold sm:leading-[5.5rem]">
              Family 🤖 Finance on Auto-Pilot.
            </p>
            <div className="flex w-full sm:justify-end uppercase text-base font-semibold sm:text-2xl sm:text-right opacity-50 sm:leading-10 my-8">
              <p className="w-[40%]">
                Stop managing your money. Let me do it for you.
              </p>
            </div>
            <p className="font-thin text-right text-lg w-[60%]">
              <span className="font-semibold text-base mr-2 uppercase w-full bg-yellow-300 p-1">
                Spend minutes, not hours, on your finances.
              </span>
              <br />
              Log in to access a system designed for speed. Our automated
              trackers and one-click batch uploads do the work of a professional
              accountant, right in your pocket.
              <br />
              Get the "real vs. planned" insights you need to make decisions
              fast, so you can get back to what matters.
            </p>
          </div>
        </div>

        <Card className="flex flex-col justify-center w-full max-w-sm border border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-4xl text-black font-bold uppercase">
              Login
            </CardTitle>
            <CardDescription>
              <div className="text-black text-base w-[30ch]">
                Ready to turn financial chaos into automated clarity?
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center my-2 sm:my-[3em]">
            {/* <form
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
            </form> */}
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
          </CardContent>
          <CardFooter className="text-sm">
            <div>
              <p className="font-semibold">
                Stop monkeying around with spreadsheets.
              </p>
              The fastest way to finish your finances is right at the top. 🚀 Go
              on, click it.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
