import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub]
});

// import NextAuth from 'next-auth';
// import { authConfig } from './auth.config';
// import Credentials from 'next-auth/providers/credentials';
// import { ZodError } from 'zod';
// import { signInSchema } from './zod';
// import { saltAndHashPassword } from './passwords';
// import { getUser } from './actions';

// export const { auth, handlers, signIn, signOut } = NextAuth({
//   ...authConfig,
//   providers: [
//     ...authConfig.providers,

//     Credentials({
//       credentials: {
//         email: {},
//         password: {}
//       },
//       authorize: async (credentials) => {
//         try {
//           if (!credentials) {
//             return null;
//           }
//           const { email, password } =
//             await signInSchema.parseAsync(credentials);
//           const hashedPassword = await saltAndHashPassword(password);
//           const user = await getUser(email, hashedPassword);
//           if (!user) {
//             return null;
//           }
//           return {};
//         } catch (error) {
//           if (error instanceof ZodError) {
//             console.error('Validation error:', error.errors);
//           } else {
//             console.error('Error in authorize:', error);
//           }
//           return null;
//         }
//       }
//     })
//   ]
// });
