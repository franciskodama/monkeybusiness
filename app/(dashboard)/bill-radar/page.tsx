import { auth } from '@/lib/auth';
import { getUser, getFinancialCommitments } from '@/lib/actions';
import BillRadarClient from './bill-radar-client';

export default async function BillRadarPage() {
  const session = await auth();
  const user = await getUser(session?.user?.email ?? '');
  const householdId = user?.householdId;

  if (!householdId) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border-2 border-rose-500 p-6 text-rose-900 font-bold uppercase tracking-tighter shadow-[8px_8px_0px_rgba(244,63,94,0.1)]">
          Account Error: Household not found. Please contact support.
        </div>
      </div>
    );
  }

  const commitments = await getFinancialCommitments(householdId);

  return (
    <BillRadarClient 
      householdId={householdId} 
      initialCommitments={commitments} 
    />
  );
}
