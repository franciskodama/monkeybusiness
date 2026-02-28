import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, HelpCircle, X } from 'lucide-react';

interface DashboardMetricProps {
  label: string;
  value: string | number;
  subValue?: string;
  explanation?: string;
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
  explanation,
  icon: Icon,
  color,
  trend
}: DashboardMetricProps) {
  const [showInfo, setShowInfo] = useState(false);
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
      onClick={() => explanation && setShowInfo(!showInfo)}
      className={`p-6 border-2 flex flex-col justify-between h-full bg-white ${style.border} ${style.shadow} group transition-all hover:bg-slate-50 relative overflow-hidden ${explanation ? 'cursor-help' : ''}`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Icon size={18} className={style.icon} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <div
              className={`text-md font-black px-1.5 py-0.5 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </div>
          )}
          {explanation && (
            <HelpCircle
              size={14}
              className={`text-slate-300 group-hover:text-primary transition-colors ${showInfo ? 'text-primary' : ''}`}
            />
          )}
        </div>
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

      <div className="mt-4 pt-4 border-t border-slate-100 mb-2">
        <div className={`h-1 w-full ${style.bg} relative overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '60%' }}
            className={`h-full ${style.accent}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {showInfo && explanation && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div
              className={`p-3 border-2 ${style.border} ${style.bg} relative`}
            >
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={10} className={style.icon} />
                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${style.text}`}
                >
                  Definition
                </span>
              </div>
              <p
                className={`text-sm font-semibold leading-relaxed ${style.text} opacity-80`}
              >
                {explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
