import { Activity, Target, Zap, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExplanationStabilityIndex({
  setOpenAction
}: {
  setOpenAction: (value: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden mb-10"
    >
      <div className="bg-slate-900 border-2 border-slate-750 p-8 relative shadow-2xl">
        <button
          onClick={() => setOpenAction(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* WHAT IS IT */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-rose-400">
              <Activity size={18} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                What is it?
              </span>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                The <b className="text-white">Stability Index</b> measures the
                consistency of your financial behavior. It identifies which
                subcategories are predictable and which are &quot;chaotic&quot;
                earners of your attention.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                Stability is the foundation of a successful strategy. The more
                predictable your costs are, the more accurately you can project
                your future wealth.
              </p>
            </div>
          </div>

          {/* HOW TO READ IT */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-emerald-400">
              <Target size={18} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                How to read it
              </span>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                <b className="text-white uppercase text-[10px] block mb-1 font-black tracking-widest ">
                  - The Vertical Axis:
                </b>
                Higher bubbles represent high volatility. These are behaviors
                that change wildly from month to month. Lower bubbles are your
                most stable habits.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                <b className="text-white uppercase text-[10px] block mb-1 font-black tracking-widest ">
                  - Bubble Size:
                </b>
                The size of the bubble represents your{' '}
                <b className="text-white">Average Monthly Spend</b>. Big bubbles
                at the top of the chart are your biggest strategic risks.
              </p>
            </div>
          </div>

          {/* THE STRATEGY */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-blue-400">
              <Zap size={18} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                The Strategy
              </span>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Your{' '}
                <b className="text-white uppercase text-[10px] font-black tracking-widest mr-1">
                  mission
                </b>{' '}
                is to &quot;pull&quot; your largest bubbles toward the bottom of
                the map. Stabilizing your biggest costs makes your entire
                financial plan more resilient and accurate.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Target the{' '}
                <b className="text-white italic">Big Volatile Bubbles</b>{' '}
                (top-right). Bringing them down means turning chaos into a
                predictable pattern.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed font-medium border-t border-slate-800 pt-4 mt-4">
                <b className="text-rose-400 uppercase text-[10px] block mb-1 font-black tracking-widest">
                  Closed Behavior Only:
                </b>
                To keep the data honest, we only look at{' '}
                <b className="text-white">completed months</b>. This avoids
                skews from the current month&apos;s partial data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
