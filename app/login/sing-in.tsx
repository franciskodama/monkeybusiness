'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';

export function SignIn() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await signIn('credentials', {
      email,
      password,
      redirect: true
    });
    if (result) redirect('/in');
  };

  return (
    <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
      <Input
        name="email"
        type="email"
        placeholder="Name"
        className="border-primary"
      />
      <Input
        name="password"
        type="password"
        placeholder="Password"
        className="border-primary"
      />
      <Button type="submit">Sign In</Button>
    </form>
  );
}
