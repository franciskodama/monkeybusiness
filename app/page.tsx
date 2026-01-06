import { addUser } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  if (user) {
    const email = user.email ?? '';
    const name = user.name ?? '';
    const image = user.image ?? '';
    await addUser(email, name, image);
  }

  return <div>{user ? redirect('/in') : redirect('/login')}</div>;
}

// import Image from 'next/image';
// import { auth } from '@/lib/auth';
// import { SignIn, SignOut } from '@/components/auth-components';

// export default async function Home() {
//   const session = await auth();

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />

//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mt-8">
//           {session?.user ? (
//             <div className="flex flex-col gap-4">
//               <p className="text-lg text-zinc-600 dark:text-zinc-400">
//                 Welcome back,{' '}
//                 <span className="font-bold text-black dark:text-white">
//                   {session.user.name}
//                 </span>
//                 !
//               </p>
//               <SignOut className="flex h-10 items-center justify-center rounded-full bg-red-600 px-4 text-white hover:bg-red-700 transition-colors" />
//             </div>
//           ) : (
//             <div className="flex flex-col gap-4">
//               <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//                 Securely log in to get started.
//               </h1>
//               <SignIn className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]" />
//             </div>
//           )}
//         </div>

//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-12">
//           {/* ... existing links ... */}
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid px-5 transition-colors hover:border-transparent  dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
