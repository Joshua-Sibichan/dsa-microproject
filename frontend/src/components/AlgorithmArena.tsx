import React, { useState } from 'react';
import { runArenaBenchmark } from '../api';
import { RefreshCw, Trophy, Cpu, Zap, ShieldCheck } from 'lucide-react';

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
      <div className="bg-slate-navy text-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-gold-metallic/10 blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary-container/20 text-secondary-container border border-secondary-container/40 uppercase tracking-wider">
                Phase 4 Benchmark Arena
              </span>
              <span className="text-xs text-surface-container-highest/60 font-mono">
                30 Concurrent Passenger Requests
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-2 text-white">
              Algorithm Arena: Strategy Comparison
            </h1>
            <p className="text-xs sm:text-sm text-surface-container-highest/80 mt-2 max-w-2xl leading-relaxed">
              Head-to-head empirical battle between <strong>First-Available (Greedy Sequential)</strong> assignment and <strong>X Airways Intelligence (Multi-Factor MergeSort)</strong> on identical seat inventories under microsecond clock instrumentation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunArena}
            disabled={loading}
            className="px-7 py-3.5 rounded-xl bg-primary-container hover:bg-crimson-deep text-white font-serif font-bold text-xs sm:text-sm tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 self-start md:self-center active:scale-95 disabled:opacity-60 shrink-0"
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
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-navy to-tertiary-container border border-gold-metallic/40 text-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gold-light/20 border border-gold-metallic/40 flex items-center justify-center text-3xl shrink-0">
                🏆
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-secondary-container uppercase tracking-widest block">
                  Superior Passenger Satisfaction
                </span>
                <h3 className="font-serif text-xl font-bold text-white">
                  X Airways Intelligence Outperforms First-Available
                </h3>
                <p className="text-xs text-surface-container-highest/80 mt-0.5">
                  Delivers a <strong className="text-secondary-container">+{arenaData.comparative_delta.score_improvement_pct}% higher average satisfaction score</strong> through stable multi-factor preference ranking.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-right font-mono self-end sm:self-auto">
              <div className="bg-surface-container-lowest/10 px-4 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-surface-container-highest/70 block uppercase">Satisfaction Delta</span>
                <span className="text-2xl font-bold text-secondary-container">
                  +{arenaData.comparative_delta.score_improvement_pct}%
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strategy 1: First-Available (Baseline) */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm border border-border-subtle space-y-6">
              <div className="flex justify-between items-start pb-4 border-b border-border-subtle">
                <div>
                  <span className="text-[10px] font-mono font-bold text-charcoal-muted uppercase tracking-wider block">
                    Baseline Strategy
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-navy mt-0.5">
                    {arenaData.first_available_strategy.name}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-surface-container text-slate-navy font-mono text-xs font-bold border border-border-subtle">
                  {arenaData.first_available_strategy.algorithmic_complexity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle">
                  <span className="text-[10px] text-charcoal-muted uppercase font-bold tracking-wider block">
                    Avg Satisfaction
                  </span>
                  <span className="font-serif text-2xl font-bold text-slate-navy">
                    {arenaData.first_available_strategy.average_preference_score}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle">
                  <span className="text-[10px] text-charcoal-muted uppercase font-bold tracking-wider block">
                    Allocation Rate
                  </span>
                  <span className="font-serif text-2xl font-bold text-slate-navy">
                    {arenaData.first_available_strategy.success_rate_pct}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle col-span-2">
                  <span className="text-[10px] text-charcoal-muted uppercase font-bold tracking-wider block">
                    Execution Latency
                  </span>
                  <span className="font-mono text-xl font-bold text-slate-navy">
                    {arenaData.first_available_strategy.execution_time_us} μs
                  </span>
                  <span className="text-[11px] text-charcoal-muted block mt-1">
                    Greedy first-match; ultra-low compute but random passenger satisfaction.
                  </span>
                </div>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                {arenaData.first_available_strategy.description}
              </p>
            </div>

            {/* Strategy 2: X Airways Intelligence (MergeSort Ranked) */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm border border-primary relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary"></div>
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-mono font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                OPTIMAL
              </div>

              <div className="flex justify-between items-start pb-4 border-b border-border-subtle">
                <div>
                  <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider block">
                    X Airways Engine
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-navy mt-0.5">
                    {arenaData.preference_scored_strategy.name}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-crimson-light text-primary font-mono text-xs font-bold border border-primary/20">
                  {arenaData.preference_scored_strategy.algorithmic_complexity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-gold-light/40 border border-gold-metallic/30">
                  <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">
                    Avg Satisfaction
                  </span>
                  <span className="font-serif text-2xl font-bold text-secondary">
                    {arenaData.preference_scored_strategy.average_preference_score}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gold-light/40 border border-gold-metallic/30">
                  <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">
                    Allocation Rate
                  </span>
                  <span className="font-serif text-2xl font-bold text-secondary">
                    {arenaData.preference_scored_strategy.success_rate_pct}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gold-light/40 border border-gold-metallic/30 col-span-2">
                  <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">
                    Execution Latency
                  </span>
                  <span className="font-mono text-xl font-bold text-slate-navy">
                    {arenaData.preference_scored_strategy.execution_time_us} μs
                  </span>
                  <span className="text-[11px] text-charcoal-muted block mt-1">
                    Slightly higher compute pass, paying off with optimal seating harmony.
                  </span>
                </div>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                {arenaData.preference_scored_strategy.description}
              </p>
            </div>
          </div>

          {/* Academic Trade-off Conclusion */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-border-subtle text-xs text-slate-navy space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-serif font-bold text-slate-navy">
              <span className="material-symbols-outlined text-[18px] text-secondary">psychology</span>
              <span>Scientific Trade-off Analysis &amp; Algorithmic Rigor</span>
            </div>
            <p className="leading-relaxed text-charcoal-muted">
              {arenaData.comparative_delta.trade_off_analysis}
            </p>
            <p className="text-charcoal-muted/70 text-[11px] pt-1 border-t border-border-subtle">
              Note: Both strategies are evaluated against the exact same test dataset seed (30 passengers, identical flight inventory) under real-time microsecond clock instrumentation.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl p-16 text-center shadow-sm border border-border-subtle space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gold-light text-secondary border border-gold-metallic/30 flex items-center justify-center mx-auto text-3xl shadow-sm">
            ⚔️
          </div>
          <h3 className="font-serif text-xl font-bold text-slate-navy">
            Ready to Battle Seating Algorithms
          </h3>
          <p className="text-xs text-charcoal-muted max-w-md mx-auto leading-relaxed">
            Click <strong>"Run Arena Benchmark"</strong> to execute the live head-to-head empirical competition between First-Available sequential allocation and X Airways MergeSort preference ranking.
          </p>
        </div>
      )}
    </div>
  );
};
