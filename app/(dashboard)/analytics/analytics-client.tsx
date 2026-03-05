'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Box,
  LayoutDashboard,
  ChartSpline
} from 'lucide-react';
import { CategoryShareChart } from '@/components/CategoryShareChart';
import { VolatilityAnalysisChart } from '@/components/VolatilityAnalysisChart';
import { AnnualStrategicChart } from '@/components/AnnualStrategicChart';
import { CategoryTrendChart } from '@/components/CategoryTrendChart';
import Help from '@/components/Help';
import ExplanationStabilityIndex from './explanation-stability-index';

import Link from 'next/link';
import { SubcategoryWithCategory } from '@/lib/types';

interface AnalyticsClientProps {
  subcategories: SubcategoryWithCategory[];
}

export default function AnalyticsClient({
  subcategories
}: AnalyticsClientProps) {
  const [openAction, setOpenAction] = React.useState(false);

  return (
    <div className="flex flex-col gap-10 p-8 mb-12 max-w-[1600px] mx-auto">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end pb-4 border-b-2 border-slate-100">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 p-4 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
            <BarChart3 className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900">
              Analytics Suite
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
              Advanced Behavioral Insights & Financial Topology
            </p>
          </div>
        </div>
      </div>

      {/* TOP ROW: DISTRIBUTION & BEHAVIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LARGE PIE CHART SECTION */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border-2 border-slate-200 p-8 shadow-[10px_10px_0px_rgba(15,23,42,0.05)] h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-slate-100">
                <PieChartIcon size={20} className="text-slate-900" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                Capital Allocation
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">
              Category Distribution YTD
            </p>
            <div className="scale-110 origin-center py-4">
              <CategoryShareChart
                subcategories={subcategories}
                showList={true}
              />
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                * Includes all expense and savings allocations. Income
                categories are excluded from this view to focus on deployment.
              </p>
            </div>
          </div>
        </div>

        {/* SOURCE BREAKDOWN & TRENDS */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <div className="bg-slate-900 p-8 text-white shadow-[10px_10px_0px_rgba(15,23,42,0.1)]">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-rose-500/20">
                  <Activity size={20} className="text-rose-400" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                  Stability Index
                </h2>
                <Help setOpenAction={setOpenAction} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800 px-3 py-1">
                Behavioral Audit
              </span>
            </div>

            <AnimatePresence>
              {openAction && (
                <ExplanationStabilityIndex setOpenAction={setOpenAction} />
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="h-[350px]">
                <VolatilityAnalysisChart subcategories={subcategories} />
              </div>
              <div className="space-y-8">
                <div className="p-6 border-2 border-slate-800 bg-slate-800/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2">
                    Stability Diagnostic
                  </p>
                  <p className="text-sm font-medium leading-relaxed italic text-slate-300">
                    &quot;This index measures how consistent your spending
                    habits are. Bubbles at the top represent higher
                    volatility—behaviors that are unpredictable and harder to
                    budget for. Stable systems keep their largest bubbles at the
                    bottom.&quot;
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/40 border border-slate-800">
                    <p className="text-[9px] font-black uppercase text-slate-500 mb-1">
                      System Volatility
                    </p>
                    <p className="text-lg font-mono font-black text-rose-400">
                      MEDIUM
                    </p>
                  </div>
                  <div className="p-4 bg-slate-800/40 border border-slate-800">
                    <p className="text-[9px] font-black uppercase text-slate-500 mb-1">
                      Predictability
                    </p>
                    <p className="text-lg font-mono font-black text-emerald-400">
                      HIGH
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">
                Lower vertical position = Higher behavioral stability
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 p-8 shadow-[10px_10px_0px_rgba(15,23,42,0.05)]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100">
                  <TrendingUp size={20} className="text-slate-900" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Yearly Trajectory
                </h2>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500" />
                  <span className="text-[9px] font-black uppercase text-slate-500">
                    Contribution
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500" />
                  <span className="text-[9px] font-black uppercase text-slate-500">
                    Expenses
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500" />
                  <span className="text-[9px] font-black uppercase text-slate-500">
                    Savings
                  </span>
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              <AnnualStrategicChart subcategories={subcategories} />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: ALLOCATION TRENDS */}
      <div className="bg-white border-2 border-slate-200 p-8 shadow-[10px_10px_0px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-slate-100">
            <ChartSpline size={20} className="text-slate-900" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
              Allocation Trend Architecture
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Monthly Behavioral Shifts by Category
            </p>
          </div>
        </div>
        <div className="h-[450px]">
          <CategoryTrendChart subcategories={subcategories} />
        </div>
      </div>

      {/* FOOTER / CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link
          href="/yearly"
          className="p-6 border-2 border-slate-200 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
        >
          <div className="p-3 bg-slate-900 group-hover:scale-110 transition-transform">
            <Box className="text-white" size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight text-slate-900">
              View Raw Data
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Yearly Audit Table
            </p>
          </div>
        </Link>
        <Link
          href="/command-center"
          className="p-6 border-2 border-slate-200 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
        >
          <div className="p-3 bg-slate-900 group-hover:scale-110 transition-transform">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight text-slate-900">
              Back to Base
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Command Center
            </p>
          </div>
        </Link>
        <Link
          href="#"
          className="p-6 bg-slate-900 text-white flex items-center justify-between group cursor-pointer overflow-hidden relative"
        >
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-tight">
              Export Intelligence
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              PDF Strategy Report
            </p>
          </div>
          <ArrowUpRight
            className="relative z-10 text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            size={24}
          />
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        </Link>
      </div>
    </div>
  );
}
