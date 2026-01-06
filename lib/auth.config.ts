import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const authConfig = {
  session: { strategy: 'jwt' },

  providers: [GitHub, Google]
} satisfies NextAuthConfig;
