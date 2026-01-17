'use client';

import { useState } from 'react';
import { Users, UserPlus, Clipboard, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { joinHousehold } from '@/lib/actions';
import Image from 'next/image';

export function HouseholdManager({
  household,
  currentUserId
}: {
  household: any;
  currentUserId: string;
}) {
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    if (!household.inviteCode) return;
    navigator.clipboard.writeText(household.inviteCode);
    setHasCopied(true);
    toast.success('Invite code copied to clipboard');
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;

    setIsJoining(true);
    try {
      const res = await joinHousehold(inviteCode);
      if (res.success) {
        toast.success('Joined household successfully!');
        window.location.reload();
      } else {
        toast.error(res.error || 'Failed to join household');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="grid gap-12 max-w-4xl mx-auto">
      {/* 1. Current Household Members */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
            Household Members
          </h3>
        </div>

        <div className="grid gap-4">
          {household.users.map((user: any) => (
            <div
              key={user.uid}
              className="flex items-center justify-between p-4 border border-slate-200 bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-10 w-10 shrink-0">
                  <Image
                    src={user.image || '/avatar.png'}
                    alt={user.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-tight text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                    {user.email}
                  </p>
                </div>
              </div>
              {user.uid === currentUserId ? (
                <span className="text-[9px] font-black uppercase tracking-widest bg-primary text-white px-2 py-0.5">
                  You
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-0.5 border border-slate-200">
                  Member
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* 2. Invite Someone */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-900">
              Invite to Budget
            </h3>
          </div>
          <div className="p-6 border border-emerald-100 bg-emerald-50/30 space-y-4">
            <p className="text-xs text-emerald-800 leading-relaxed font-medium italic">
              Share this unique code with your partner or family member. When
              they join, they'll have full access to manage this budget together
              with you.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-emerald-200 px-4 py-2 font-mono text-lg font-black tracking-[0.2em] text-center text-emerald-600">
                {household.inviteCode || 'GENERATING...'}
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="rounded-none border-emerald-200 hover:bg-emerald-50 text-emerald-600"
              >
                {hasCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Clipboard className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Join Another Household */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Users className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-rose-900">
              Join a Household
            </h3>
          </div>
          <form
            onSubmit={handleJoin}
            className="p-6 border border-rose-100 bg-rose-50/30 space-y-4"
          >
            <p className="text-xs text-rose-800 leading-relaxed font-bold italic">
              Wait! Joining another household will disconnect you from your
              current budget permanently.
            </p>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="PASTE INVITE CODE"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="rounded-none border-rose-200 bg-white font-mono text-center tracking-widest h-11"
              />
              <Button
                type="submit"
                disabled={isJoining || !inviteCode}
                className="w-full rounded-none bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest h-11"
              >
                {isJoining ? 'JOINING...' : 'JOIN NOW'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
