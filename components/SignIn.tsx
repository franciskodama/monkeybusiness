import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Lock, Heart, Focus, Archive } from 'lucide-react';

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-2xl p-8 border-2 border-primary shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <Lock className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl sm:text-4xl font-bold">
              Nothing Happens <br />
              Logged Out 😅
            </CardTitle>
          </div>
          <div className="text-lg sm:text-xl pt-2 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="text-muted-foreground w-[44ch]">
                Household chores are enough of a full-time job. You’re already
                juggling a thousand things—don't let your budget be another
                burden. "Monkey Business" automates your forecasting and
                batch-syncs your data in seconds. Sign in to reclaim your time
                and get a clear, effortless view of your family's future.
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 my-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
              <Heart className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold text-sm">Data Batches Automation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Import your bank statements and go have a walk!
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
              <Archive className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold text-sm">Get Organized</p>
              <p className="text-xs text-muted-foreground mt-1">
                Life made simple
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
              <Focus className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold text-sm">Stay Focused</p>
              <p className="text-xs text-muted-foreground mt-1">
                Turn intentions into action
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col justify-center">
          <Link href="/login">
            <Button size="lg" variant="default">
              Get Started <span className="ml-2">🚀</span>
            </Button>
          </Link>
          <div className="font-semibold text-foreground w-[30ch] text-center mt-8">
            Your dreams, goals, and wins are waiting for you outside!
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
