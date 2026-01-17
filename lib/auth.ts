import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { addUser } from './actions';
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub, Google],
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        await addUser({
          uid: user.email.toLowerCase().trim(),
          email: user.email.toLowerCase().trim(),
          name: user.name ?? '',
          image: user.image ?? ''
        });
      }
      return true;
    }
  }
});
