'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface DashboardMetricProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color: 'emerald' | 'blue' | 'rose' | 'amber' | 'slate';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function DashboardMetric({
  label,
  value,
  subValue,
  icon: Icon,
  color,
  trend
}: DashboardMetricProps) {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      accent: 'bg-emerald-500',
      icon: 'text-emerald-600',
      shadow: 'shadow-[4px_4px_0px_rgba(16,185,129,0.1)]'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      accent: 'bg-blue-500',
      icon: 'text-blue-600',
      shadow: 'shadow-[4px_4px_0px_rgba(59,130,246,0.1)]'
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-900',
      accent: 'bg-rose-500',
      icon: 'text-rose-600',
      shadow: 'shadow-[4px_4px_0px_rgba(244,63,94,0.1)]'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      accent: 'bg-amber-500',
      icon: 'text-amber-600',
      shadow: 'shadow-[4px_4px_0px_rgba(245,158,11,0.1)]'
    },
    slate: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-900',
      accent: 'bg-slate-500',
      icon: 'text-slate-600',
      shadow: 'shadow-[4px_4px_0px_rgba(15,23,42,0.1)]'
    }
  };

  const style = colorStyles[color];

  return (
    <div
      className={`p-6 border-2 flex flex-col justify-between h-full bg-white ${style.border} ${style.shadow} group transition-all hover:bg-slate-50`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Icon size={18} className={style.icon} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {label}
          </span>
        </div>
        {trend && (
          <div
            className={`text-md font-black px-1.5 py-0.5 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-mono font-black tracking-tighter text-slate-900">
            {value}
          </span>
        </div>
        {subValue && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {subValue}
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className={`h-1 flex-1 ${style.bg} relative overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '60%' }}
            className={`h-full ${style.accent}`}
          />
        </div>
      </div>
    </div>
  );
}
