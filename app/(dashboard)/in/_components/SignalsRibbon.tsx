'use client';

import { useState, useRef } from 'react';
import { CheckCircle2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { addReminder, deleteReminder } from '@/lib/actions';
import { User, Reminder } from '@prisma/client';
import { getSourceColor } from '@/lib/utils';

export function SignalsRibbon({
  householdId,
  currentUser,
  householdUsers,
  initialReminders
}: {
  householdId: string;
  currentUser: any;
  householdUsers: User[];
  initialReminders: Reminder[];
}) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [text, setText] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>(currentUser.uid);
  const [isAdding, setIsAdding] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      setIsOpen(false);
      toast.success('Signal broadcasted! 📡');
    } else {
      toast.error('Failed to send signal.');
    }
    setIsAdding(false);
  };

  const handleDelete = async (id: string, targetId: string) => {
    if (targetId !== currentUser.uid) {
      toast.error('Only the assignee can clear this signal.');
      return;
    }

    const res = await deleteReminder(id);
    if (res.success) {
      setReminders(reminders.filter((r) => r.id !== id));
      toast.success('Mission accomplished! ✅');
    } else {
      toast.error('Failed to clear signal.');
    }
  };

  return (
    <div className="w-full flex items-center gap-4 bg-slate-50 border-y border-slate-200 py-3 px-6 relative overflow-hidden group">
      <div className="flex items-center gap-3 shrink-0 pr-4 border-r border-slate-200">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="h-7 w-7 rounded-none bg-primary text-white hover:bg-primary/90"
            >
              <Plus size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-4 rounded-none border-slate-300 shadow-xl"
            align="start"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  New Signal
                </h5>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={14} />
                </Button>
              </div>
              <Input
                placeholder="What's the mission?"
                className="h-9 text-xs rounded-none border-slate-200"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Select value={targetUserId} onValueChange={setTargetUserId}>
                  <SelectTrigger className="grow h-9 text-[10px] uppercase font-bold rounded-none">
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
                  onClick={handleAdd}
                  disabled={isAdding || !text}
                  className="h-9 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase px-4"
                >
                  {isAdding ? 'SND...' : 'Send'}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* The Scrollable Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto flex gap-3 no-scrollbar py-1 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {reminders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-slate-400 italic"
            >
              <CheckCircle2 size={12} />
              <p className="text-[10px] uppercase font-bold tracking-tight">
                All systems go. No active signals.
              </p>
            </motion.div>
          ) : (
            reminders.map((r) => {
              const isForMe = r.targetUserId === currentUser.uid;
              const targetUser = householdUsers.find(
                (u) => u.uid === r.targetUserId
              );
              const targetName = targetUser?.name.split(' ')[0] || 'User';
              const userColor = getSourceColor(targetName);

              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="shrink-0 flex items-center gap-3 bg-white border border-slate-200 p-2 pl-3 shadow-sm transition-all"
                  style={{
                    borderLeft: `3px solid ${userColor}`,
                    backgroundColor: isForMe ? `${userColor}05` : '#ffffff'
                  }}
                >
                  <div className="flex flex-col max-w-[250px]">
                    <p className="text-[11px] font-bold uppercase truncate leading-tight">
                      {r.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-[2px]"
                        style={{
                          backgroundColor: userColor,
                          color: userColor === '#00FFFF' ? '#000000' : '#ffffff'
                        }}
                      >
                        {targetName}
                      </span>
                      <span className="text-[7px] text-slate-400 font-bold italic">
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {isForMe && (
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-7 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-100 rounded-none text-[9px] font-black uppercase tracking-tighter transition-all"
                      onClick={() => handleDelete(r.id, r.targetUserId)}
                    >
                      Clear
                    </Button>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Visual Indicator of more items (fade) */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity" />
    </div>
  );
}
