import { auth } from '@/lib/auth';
import { getUser, getFinancialCommitments, getHouseholdUsers } from '@/lib/actions';
import RadarClient from './radar-client';

export default async function RadarPage() {
  const session = await auth();
  const currentUser = await getUser(session?.user?.email ?? '');
  const householdId = currentUser?.householdId;

  if (!householdId || !currentUser) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border-2 border-rose-500 p-6 text-rose-900 font-bold uppercase tracking-tighter shadow-[8px_8px_0px_rgba(244,63,94,0.1)]">
          Account Error: User or Household not found. Please contact support.
        </div>
      </div>
    );
  }

  const [commitments, householdUsers] = await Promise.all([
    getFinancialCommitments(householdId),
    getHouseholdUsers(householdId)
  ]);

  return (
    <RadarClient 
      householdId={householdId} 
      initialCommitments={commitments} 
      currentUser={currentUser}
      householdUsers={householdUsers}
    />
  );
}
