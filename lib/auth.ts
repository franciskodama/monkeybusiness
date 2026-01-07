import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { addUser } from './actions';
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        await addUser(
          user.email.toLowerCase().trim(),
          user.name ?? '',
          user.image ?? ''
        );
      }
      return true;
    }
  }
});
