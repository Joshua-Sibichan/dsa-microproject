import React, { useState } from 'react';
import { runDataStructuresBenchmark } from '../../api';
import { Database, Cpu, Zap, HardDrive, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export const StructureComparison: React.FC = () => {
  const [dataSize, setDataSize] = useState<number>(500);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunComparison = async () => {
    setLoading(true);
    try {
      const data = await runDataStructuresBenchmark(dataSize);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-border-subtle gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary-container/20 text-slate-navy border border-secondary-container/40">
                CO2 — DATA STRUCTURE SELECTION
              </span>
              <span className="text-xs text-on-surface-variant font-mono">Hardware Cache Locality &amp; Asymptotic Trade-offs</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-navy">
              Contiguous Array vs Hash Table Matrix
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
              Empirical profiling comparing linear contiguous memory layouts against hash tables for seat lookups and passenger manifest indexing.
            </p>
          </div>

          <button
            onClick={handleRunComparison}
            disabled={loading}
            className="px-6 py-3.5 bg-primary-container hover:bg-[#B3141B] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all self-start lg:self-center"
          >
            <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Executing Benchmarks...' : 'Profile Lookups (N = 500)'}</span>
          </button>
        </div>

        {/* Trade-off Matrix Table */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border-subtle">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-navy text-surface-container-lowest uppercase tracking-wider text-[11px] font-mono">
              <tr>
                <th className="py-3.5 px-4 font-bold">Architectural Metric</th>
                <th className="py-3.5 px-4 font-bold text-gold-metallic">Contiguous Dynamic Array</th>
                <th className="py-3.5 px-4 font-bold text-emerald-400">Hash Table / Dictionary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-surface-container-lowest text-slate-navy">
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-navy flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-secondary-container" />
                  Random Access by Index
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    O(1) [Direct Pointer Math]
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-on-surface-variant">
                  Not Applicable (Unordered Keys)
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-navy flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-secondary-container" />
                  Lookup by PNR / Key
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-primary-container">
                  <span className="px-2 py-0.5 rounded bg-primary-container/10 border border-primary-container/20">
                    O(N) [Linear Scan]
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    O(1) [Hash Bucket Index]
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-navy flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-secondary-container" />
                  Spatial Cache Locality
                </td>
                <td className="py-3.5 px-4 font-semibold text-emerald-700">
                  Excellent (Sequential L1/L2 Cache Lines)
                </td>
                <td className="py-3.5 px-4 font-semibold text-amber-700">
                  Poor (Pointer chasing across heap)
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-navy flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-secondary-container" />
                  2D Spatial Group Seating
                </td>
                <td className="py-3.5 px-4 font-semibold text-emerald-700">
                  Trivial (Row/Col Stride Calculations)
                </td>
                <td className="py-3.5 px-4 font-semibold text-on-surface-variant">
                  Difficult (No contiguous neighbor awareness)
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-navy flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-secondary-container" />
                  X Airways Architectural Role
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-navy">
                  Fuselage 2D Seat Matrix &amp; Group Scanner
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-navy">
                  PNR Directory, Active Locks, &amp; O(1) Cache
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Profiler Benchmark Card */}
      {result && (
        <div className="bg-slate-navy text-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-gold-metallic" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">
                  Live Benchmark: 100 Random PNR Lookups
                </h3>
                <span className="text-xs text-surface-container-highest/70 font-mono">
                  Collection Size: N = {result.collection_size} elements
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
              Real Measured Microseconds (μs)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Array Result */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-serif font-bold text-base text-surface-container-highest block">
                    {result.array_list.structure}
                  </span>
                  <span className="text-[11px] text-surface-container-highest/70">Linear Contiguous Scan</span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-primary-container/20 text-rose-300 font-bold border border-primary-container/40">
                  O(N)
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-surface-container-highest/90 pt-3 border-t border-white/10">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Total Lookups:</span>
                  <span className="font-bold text-white">{result.operations_count}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Total Comparisons:</span>
                  <span className="font-bold text-primary-container">{result.array_list.total_comparisons.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Avg Comparisons / Query:</span>
                  <span className="font-bold text-white">{result.array_list.average_comparisons_per_lookup}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-surface-container-highest/70">Total Lookups Time:</span>
                  <span className="font-bold text-white text-sm">{result.array_list.lookup_time_us} μs</span>
                </div>
              </div>
            </div>

            {/* Hash Map Result */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-serif font-bold text-base text-emerald-400 block">
                    {result.hash_map.structure}
                  </span>
                  <span className="text-[11px] text-surface-container-highest/70">Direct Bucket Hashing</span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  O(1)
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-surface-container-highest/90 pt-3 border-t border-white/10">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Total Lookups:</span>
                  <span className="font-bold text-white">{result.operations_count}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Total Comparisons:</span>
                  <span className="font-bold text-emerald-400">{result.hash_map.total_lookups}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Avg Comparisons / Query:</span>
                  <span className="font-bold text-emerald-400">1.0 (Direct Bucket)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-surface-container-highest/70">Total Lookups Time:</span>
                  <span className="font-bold text-emerald-400 text-sm">{result.hash_map.lookup_time_us} μs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-xs text-surface-container-highest/90">
            <span className="text-gold-metallic font-mono font-bold tracking-wider text-[11px] uppercase block mb-1">
              Architectural Takeaway:
            </span>
            {result.trade_off_summary}
          </div>
        </div>
      )}
    </div>
  );
};
