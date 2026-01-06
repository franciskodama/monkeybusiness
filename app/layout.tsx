import { barlow } from '@/lib/fonts';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  icons: {
    icon: '/icon.png'
  },
  title: 'Monkey Business',
  description:
    'Your personal hub for your Family Budget! Configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${barlow.className} antialiased flex min-h-screen w-full flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
