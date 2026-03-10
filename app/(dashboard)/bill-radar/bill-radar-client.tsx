'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Settings2,
  Mail,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  addFinancialCommitment,
  deleteFinancialCommitment,
  updateFinancialCommitment
} from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { FinancialCommitment } from '@prisma/client';

interface BillRadarClientProps {
  householdId: string;
  initialCommitments: FinancialCommitment[];
}

export default function BillRadarClient({
  householdId,
  initialCommitments
}: BillRadarClientProps) {
  const [commitments, setCommitments] =
    useState<FinancialCommitment[]>(initialCommitments);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] =
    useState<FinancialCommitment | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [sendEmailAlert, setSendEmailAlert] = useState(true);
  const [daysBeforeAlert, setDaysBeforeAlert] = useState('2');

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthName = today.toLocaleString('default', { month: 'long' });

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDayOfMonth('1');
    setSendEmailAlert(true);
    setDaysBeforeAlert('2');
    setEditingCommitment(null);
  };

  const handleAddOrUpdate = async () => {
    if (!title || !dayOfMonth) {
      toast.error('Title and Day are required');
      return;
    }

    const data = {
      title,
      amount: amount ? parseFloat(amount) : undefined,
      dayOfMonth: parseInt(dayOfMonth),
      sendEmailAlert,
      daysBeforeAlert: parseInt(daysBeforeAlert),
      householdId
    };

    if (editingCommitment) {
      const res = await updateFinancialCommitment({
        ...data,
        id: editingCommitment.id
      });
      if (res.success && res.commitment) {
        setCommitments((prev) =>
          prev.map((c) => (c.id === editingCommitment.id ? res.commitment! : c))
        );
        toast.success('Commitment updated');
        setIsAddModalOpen(false);
        resetForm();
      }
    } else {
      const res = await addFinancialCommitment(data);
      if (res.success && res.commitment) {
        setCommitments((prev) =>
          [...prev, res.commitment!].sort((a, b) => a.dayOfMonth - b.dayOfMonth)
        );
        toast.success('Commitment added');
        setIsAddModalOpen(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteFinancialCommitment(id);
    if (res.success) {
      setCommitments((prev) => prev.filter((c) => c.id !== id));
      toast.success('Commitment removed');
    }
  };

  const openEditModal = (commitment: FinancialCommitment) => {
    setEditingCommitment(commitment);
    setTitle(commitment.title);
    setAmount(commitment.amount?.toString() || '');
    setDayOfMonth(commitment.dayOfMonth.toString());
    setSendEmailAlert(commitment.sendEmailAlert);
    setDaysBeforeAlert(commitment.daysBeforeAlert.toString());
    setIsAddModalOpen(true);
  };

  // Grouped by day for the timeline
  const commitmentsByDay = useMemo(() => {
    const map: Record<number, FinancialCommitment[]> = {};
    commitments.forEach((c) => {
      if (!map[c.dayOfMonth]) map[c.dayOfMonth] = [];
      map[c.dayOfMonth].push(c);
    });
    return map;
  }, [commitments]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-10 p-8 mb-12 max-w-[1600px] mx-auto min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-end pb-4 border-b-2 border-slate-100">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 p-4 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
            <Bell className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900">
              Bill Radar
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">
              Financial Commitment Pulse • {currentMonthName}{' '}
              {today.getFullYear()}
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={16} className="mr-2" /> New Commitment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* TIMELINE COLUMN */}
        <div className="lg:col-span-5 flex flex-col gap-6 relative">
          <div className="bg-white border-2 border-slate-200 p-8 shadow-[10px_10px_0px_rgba(15,23,42,0.05)] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-slate-100">
                <Clock size={20} className="text-slate-900" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                Monthly Pulse
              </h2>
            </div>

            {/* THE TIMELINE CONTAINER */}
            <div className="relative pl-12 pr-4 py-4 space-y-0">
              {/* Vertical Line */}
              <div className="absolute left-16 top-0 bottom-0 w-1 bg-slate-100" />

              {/* TODAY MARKER (Floating) */}
              <div
                className="absolute left-0 right-0 h-1 bg-rose-500 z-10 flex items-center transition-all duration-1000 ease-in-out"
                style={{ top: `${(currentDay / 31) * 100}%` }}
              >
                <div className="bg-rose-500 text-white text-xs font-black px-2 py-1 uppercase tracking-tighter absolute -left-2 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                  Today
                </div>
              </div>

              {/* Days 1 to 31 */}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const dayCommitments = commitmentsByDay[day] || [];
                const isPast = day < currentDay;
                const isToday = day === currentDay;
                const isVerySoon = day > currentDay && day <= currentDay + 2;

                return (
                  <div
                    key={day}
                    className="relative h-12 flex items-center group"
                  >
                    {/* Day Number */}
                    <div
                      className={`absolute left-0 w-12 text-center text-xs font-black tracking-tighter ${isToday ? 'text-rose-500 text-sm' : isPast ? 'text-slate-300' : 'text-slate-500'}`}
                    >
                      {day.toString().padStart(2, '0')}
                    </div>

                    {/* Interaction Dot */}
                    <div
                      className={`w-3 h-3 rounded-full border-2 absolute left-[3.85rem] z-20 transition-transform group-hover:scale-150 ${isToday ? 'bg-rose-500 border-rose-200' : dayCommitments.length > 0 ? 'bg-slate-900 border-slate-300' : 'bg-white border-slate-100'}`}
                    />

                    {/* Commitments on this day */}
                    <div className="ml-12 flex-1 flex gap-2 overflow-x-auto no-scrollbar py-2">
                      {dayCommitments.map((c) => (
                        <motion.div
                          key={c.id}
                          whileHover={{ x: 4 }}
                          onClick={() => openEditModal(c)}
                          className={`flex items-center gap-3 px-3 py-1 border-2 cursor-pointer whitespace-nowrap ${isToday ? 'bg-rose-50 border-rose-500' : isVerySoon ? 'bg-amber-50 border-amber-500' : 'bg-white border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,0.1)]'}`}
                        >
                          <span className="text-xs font-black uppercase text-slate-900">
                            {c.title}
                          </span>
                          {c.amount && (
                            <span className="font-mono text-xs text-slate-500">
                              ${formatCurrency(c.amount)}
                            </span>
                          )}
                          {c.sendEmailAlert && (
                            <Mail
                              size={10}
                              className={
                                isVerySoon ? 'text-amber-600' : 'text-slate-400'
                              }
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DETAILS COLUMN */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          {/* UPCOMING FOCUS */}
          <div className="bg-slate-900 p-8 text-white shadow-[10px_10px_0px_rgba(15,23,42,0.1)]">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-rose-500/20">
                  <AlertCircle size={20} className="text-rose-400" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                  Next Up
                </h2>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-800 px-3 py-1">
                Priority Sync
              </span>
            </div>

            <div className="space-y-6">
              {commitments
                .filter(
                  (c) =>
                    c.dayOfMonth >= currentDay ||
                    (currentDay > 25 && c.dayOfMonth < 5)
                ) // Show upcoming or near-next-month
                .sort((a, b) => {
                  // Complex sort to handle month wrapping
                  const adjA =
                    a.dayOfMonth < currentDay
                      ? a.dayOfMonth + 31
                      : a.dayOfMonth;
                  const adjB =
                    b.dayOfMonth < currentDay
                      ? b.dayOfMonth + 31
                      : b.dayOfMonth;
                  return adjA - adjB;
                })
                .slice(0, 3)
                .map((c) => {
                  const daysLeft =
                    c.dayOfMonth >= currentDay
                      ? c.dayOfMonth - currentDay
                      : 31 - currentDay + c.dayOfMonth;

                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-6 border-2 border-slate-800 bg-slate-800/20 group hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        <div
                          className={`p-4 font-black text-2xl tracking-tighter ${daysLeft === 0 ? 'text-rose-400' : 'text-white'}`}
                        >
                          {c.dayOfMonth.toString().padStart(2, '0')}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs font-black uppercase text-white tracking-widest mb-1">
                            {c.title}
                          </p>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase">
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />{' '}
                              {daysLeft === 0
                                ? 'TODAY'
                                : daysLeft === 1
                                  ? 'TOMORROW'
                                  : `${daysLeft} DAYS AWAY`}
                            </span>
                            {c.amount && (
                              <span className="text-emerald-400">
                                ${formatCurrency(c.amount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {c.sendEmailAlert && (
                          <div
                            className={`p-2 ${daysLeft <= c.daysBeforeAlert ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'}`}
                          >
                            <Mail size={16} />
                          </div>
                        )}
                        <Button
                          onClick={() => openEditModal(c)}
                          variant="ghost"
                          className="text-slate-500 hover:text-white hover:bg-slate-700 rounded-none h-12 w-12"
                        >
                          <Settings2 size={18} />
                        </Button>
                      </div>
                    </div>
                  );
                })}

              {commitments.filter((c) => c.dayOfMonth >= currentDay).length ===
                0 && (
                <div className="p-12 border-2 border-dashed border-slate-800 text-center">
                  <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
                    No more commitments for this month
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FULL REGISTRY */}
          <div className="bg-white border-2 border-slate-200 p-8 shadow-[10px_10px_0px_rgba(15,23,42,0.05)]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100">
                  <Settings2 size={20} className="text-slate-900" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Full Registry
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commitments.map((c) => (
                <div
                  key={c.id}
                  className="p-4 border border-slate-200 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                      {c.dayOfMonth}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-slate-900">
                        {c.title}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {c.sendEmailAlert
                          ? `Alert -${c.daysBeforeAlert}d`
                          : 'No Alert'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:text-slate-900"
                      onClick={() => openEditModal(c)}
                    >
                      <Settings2 size={14} />
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ADD/EDIT DIALOG */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md rounded-none border-4 border-slate-900 p-0 shadow-[15px_15px_0px_rgba(0,0,0,0.1)] overflow-hidden">
          <DialogHeader className="bg-slate-900 p-6 border-b border-slate-800">
            <DialogTitle className="text-white text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Plus className="text-emerald-400" />
              {editingCommitment ? 'Modify Commitment' : 'Add Commitment'}
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-8 bg-white">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Commitment Name
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CREDIT CARD BILL"
                className="rounded-none border-2 border-slate-900 font-bold uppercase text-xs h-12 focus-visible:ring-0 focus-visible:translate-x-1 focus-visible:-translate-y-1 transition-transform"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Day of Month
                </label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="rounded-none border-2 border-slate-900 font-black text-sm h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Amount (Optional)
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="rounded-none border-2 border-slate-900 font-mono text-sm h-12"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-2 border-slate-200 space-y-6">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="sendAlert"
                  checked={sendEmailAlert}
                  onCheckedChange={(checked) =>
                    setSendEmailAlert(checked as boolean)
                  }
                  className="rounded-none border-2 border-slate-900 w-5 h-5 data-[state=checked]:bg-slate-900"
                />
                <label
                  htmlFor="sendAlert"
                  className="text-xs font-black uppercase cursor-pointer select-none"
                >
                  Enable Email Notification
                </label>
              </div>

              {sendEmailAlert && (
                <div className="flex items-center gap-4 pl-8">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Send alert
                  </div>
                  <select
                    value={daysBeforeAlert}
                    onChange={(e) => setDaysBeforeAlert(e.target.value)}
                    className="bg-white border-2 border-slate-900 text-xs font-black uppercase p-1 rounded-none outline-none"
                  >
                    <option value="1">1 Day Before</option>
                    <option value="2">2 Days Before</option>
                    <option value="3">3 Days Before</option>
                    <option value="5">5 Days Before</option>
                    <option value="7">1 Week Before</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t-2 border-slate-200">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-none border-2 border-slate-400 font-black uppercase px-8 h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddOrUpdate}
              className="bg-slate-900 text-white rounded-none font-black uppercase px-8 h-12 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:translate-x-1 hover:-translate-y-1 transition-transform"
            >
              {editingCommitment ? 'Save Changes' : 'Create Commitment'}{' '}
              <ArrowRight size={14} className="ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
