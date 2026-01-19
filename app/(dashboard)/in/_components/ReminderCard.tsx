'use client';

import { useState } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  Trash2,
  User as UserIcon,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { addReminder, deleteReminder } from '@/lib/actions';
import { tagClass } from '@/lib/classes';
import { User, Reminder } from '@prisma/client';

export function ReminderCard({
  householdId,
  currentUser,
  householdUsers,
  initialReminders
}: {
  householdId: string;
  currentUser: User;
  householdUsers: User[];
  initialReminders: Reminder[];
}) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [text, setText] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>(currentUser.uid);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return;

    setIsAdding(true);
    const res = await addReminder({
      text,
      targetUserId,
      creatorId: currentUser.uid,
      householdId
    });

    if (res.success && res.reminder) {
      setReminders([res.reminder, ...reminders]);
      setText('');
      toast.success('Reminder sent! 📧');
    } else {
      toast.error('Failed to add reminder.');
    }
    setIsAdding(false);
  };

  const handleDelete = async (id: string, targetId: string) => {
    // Only the assignee can mark it as done (per user request)
    if (targetId !== currentUser.uid) {
      toast.error("Only the person responsible can mark this as 'Done'.");
      return;
    }

    const res = await deleteReminder(id);
    if (res.success) {
      setReminders(reminders.filter((r) => r.id !== id));
      toast.success('Task completed! Notification sent. ✅');
    } else {
      toast.error('Failed to complete task.');
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Household Signals
        </h4>
        <Bell size={12} className="text-slate-400" />
      </div>

      {/* Add Reminder Form */}
      <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200">
        <Input
          placeholder="New reminder..."
          className="h-8 text-[11px] rounded-none bg-white font-medium"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-2">
          <Select value={targetUserId} onValueChange={setTargetUserId}>
            <SelectTrigger className="grow h-8 text-[10px] uppercase font-bold rounded-none bg-white">
              <SelectValue placeholder="Assign To" />
            </SelectTrigger>
            <SelectContent>
              {householdUsers.map((u) => (
                <SelectItem
                  key={u.uid}
                  value={u.uid}
                  className="uppercase text-[10px] font-bold"
                >
                  {u.name.split(' ')[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="xs"
            onClick={handleAdd}
            disabled={isAdding || !text}
            className="rounded-none h-8 px-4"
          >
            <Plus size={14} className="mr-1" /> Send
          </Button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[16em] pr-1 scrollbar-hide">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-slate-400 opacity-50">
            <CheckCircle2 size={24} strokeWidth={1} className="mb-1" />
            <p className="text-[10px] font-black uppercase tracking-widest italic">
              All Signals Clear
            </p>
          </div>
        ) : (
          reminders.map((r) => {
            const isForMe = r.targetUserId === currentUser.uid;
            const targetName =
              householdUsers
                .find((u) => u.uid === r.targetUserId)
                ?.name.split(' ')[0] || 'User';

            return (
              <div
                key={r.id}
                className={`group relative p-3 border transition-all ${
                  isForMe
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 grow">
                    <p className="text-[11px] font-bold leading-tight uppercase">
                      {r.text}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[8px] font-black uppercase px-1.5 py-0.5 ${
                          isForMe
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {targetName}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold italic">
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {isForMe ? (
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-6 px-2 text-[9px] font-black uppercase tracking-tighter hover:bg-emerald-600 hover:text-white border border-emerald-200"
                      onClick={() => handleDelete(r.id, r.targetUserId)}
                    >
                      Done!
                    </Button>
                  ) : (
                    <div className="h-6 flex items-center px-2">
                      <CheckCircle2 size={14} className="text-slate-200" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={tagClass}>
        <span className="mr-2">📡</span>Signals
      </div>
    </div>
  );
}
