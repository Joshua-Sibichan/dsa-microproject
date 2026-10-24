import React, { useState } from 'react';
import { runArenaBenchmark } from '../api';
import { ShieldCheck, Zap, Trophy, TrendingUp, Cpu, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AlgorithmArena: React.FC = () => {
  const [arenaData, setArenaData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunArena = async () => {
    setLoading(true);
    try {
      const data = await runArenaBenchmark();
      setArenaData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-[#10243A] text-white rounded-3xl p-8 shadow-xl border border-navy-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C7A66A]/20 text-[#C7A66A] border border-[#C7A66A]/30">
                PHASE 4 BENCHMARK
              </span>
              <span className="text-xs text-slate-400 font-mono">30 Concurrent Passenger Requests</span>
            </div>
            <h1 className="text-3xl font-bold font-serif mt-2">Algorithm Arena: Strategy Comparison</h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">
              Head-to-head empirical competition between <strong>First-Available (Greedy Sequential)</strong> assignment and <strong>AeroSeat Intelligence (Multi-Factor MergeSort)</strong> on identical seat inventories.
            </p>
          </div>

          <button
            onClick={handleRunArena}
            disabled={loading}
            className="px-6 py-4 rounded-2xl bg-[#C7A66A] hover:bg-[#d8b97c] text-[#10243A] font-bold text-sm tracking-wide uppercase transition-all shadow-lg flex items-center justify-center space-x-2 self-start md:self-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Executing Battle...' : 'Run Arena Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* Arena Results */}
      {arenaData ? (
        <div className="space-y-6">
          
          {/* Winner Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Superior Satisfaction</span>
                <h3 className="text-xl font-bold">AeroSeat Intelligence Outperforms First-Available</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Delivers a <strong className="text-emerald-400">+{arenaData.comparative_delta.score_improvement_pct}% higher average satisfaction score</strong> through stable multi-factor preference ranking.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-right font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">SCORE DELTA</span>
                <span className="text-2xl font-bold text-emerald-400">+{arenaData.comparative_delta.score_improvement_pct}%</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strategy 1: First-Available */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">Baseline Strategy</span>
                  <h3 className="text-lg font-bold text-[#10243A] mt-0.5">{arenaData.first_available_strategy.name}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  {arenaData.first_available_strategy.algorithmic_complexity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Avg Satisfaction</span>
                  <span className="font-mono text-2xl font-bold text-slate-800">
                    {arenaData.first_available_strategy.average_preference_score}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Allocation Rate</span>
                  <span className="font-mono text-2xl font-bold text-slate-800">
                    {arenaData.first_available_strategy.success_rate_pct}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 col-span-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Execution Latency</span>
                  <span className="font-mono text-xl font-bold text-slate-800">
                    {arenaData.first_available_strategy.execution_time_us} μs
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Greedy first-match; ultra-low compute but random passenger satisfaction.</span>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                {arenaData.first_available_strategy.description}
              </p>
            </div>

            {/* Strategy 2: AeroSeat Intelligence */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-[#2563EB]/40 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#2563EB] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                RECOMMENDED
              </div>

              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">AeroSeat Engine</span>
                  <h3 className="text-lg font-bold text-[#10243A] mt-0.5">{arenaData.preference_scored_strategy.name}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB] font-mono text-xs font-bold border border-blue-200">
                  {arenaData.preference_scored_strategy.algorithmic_complexity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[10px] text-blue-700 uppercase font-bold block">Avg Satisfaction</span>
                  <span className="font-mono text-2xl font-bold text-[#2563EB]">
                    {arenaData.preference_scored_strategy.average_preference_score}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[10px] text-blue-700 uppercase font-bold block">Allocation Rate</span>
                  <span className="font-mono text-2xl font-bold text-[#2563EB]">
                    {arenaData.preference_scored_strategy.success_rate_pct}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 col-span-2">
                  <span className="text-[10px] text-blue-700 uppercase font-bold block">Execution Latency</span>
                  <span className="font-mono text-xl font-bold text-[#2563EB]">
                    {arenaData.preference_scored_strategy.execution_time_us} μs
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Slightly higher compute pass, paying off with optimal seating harmony.</span>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                {arenaData.preference_scored_strategy.description}
              </p>
            </div>

          </div>

          {/* Academic Trade-off Conclusion */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 text-xs text-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#10243A]">
              <Cpu className="w-4 h-4 text-[#C7A66A]" />
              <span>Scientific Trade-off Analysis & Algorithmic Rigor</span>
            </div>
            <p className="leading-relaxed">
              {arenaData.comparative_delta.trade_off_analysis}
            </p>
            <p className="text-slate-500 text-[11px]">
              Note: Both strategies are evaluated against the exact same test dataset seed (30 passengers, identical flight inventory) under real-time microsecond clock instrumentation.
            </p>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200/90 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-3xl">
            ⚔️
          </div>
          <h3 className="text-lg font-bold text-[#10243A]">Ready to Battle Algorithms</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "Run Arena Benchmark" to execute the live head-to-head competition between First-Available sequential allocation and AeroSeat MergeSort preference ranking.
          </p>
        </div>
      )}

    </div>
  );
};
