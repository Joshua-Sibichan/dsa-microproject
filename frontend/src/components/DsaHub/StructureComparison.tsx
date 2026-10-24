import React, { useState } from 'react';
import { runDataStructuresBenchmark } from '../../api';
import { Database, Cpu, Zap, HardDrive, RefreshCw } from 'lucide-react';

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
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                CO2 — DATA STRUCTURE SELECTION
              </span>
              <span className="text-xs text-slate-500 font-mono">Trade-offs & Hardware Cache Locality</span>
            </div>
            <h2 className="text-2xl font-bold text-[#10243A] mt-1">Array/List Inventory vs Hash Table Lookups</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical profiling comparing linear contiguous arrays against hash tables for seat lookups and manifest indexing.
            </p>
          </div>

          <button
            onClick={handleRunComparison}
            disabled={loading}
            className="px-5 py-2.5 bg-[#10243A] hover:bg-[#1A3654] text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-[#C7A66A] ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Executing Lookups...' : 'Profile Lookups (N = 500)'}</span>
          </button>
        </div>

        {/* Trade-off Matrix Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Architectural Metric</th>
                <th className="py-3 px-4">Contiguous Dynamic Array</th>
                <th className="py-3 px-4 rounded-r-xl">Hash Table / Dictionary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Random Access by Index</td>
                <td className="py-3 px-4 font-mono text-emerald-700 font-bold">O(1) [Direct Pointer Offset]</td>
                <td className="py-3 px-4 font-mono text-slate-500">Not Applicable (Unordered)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Lookup by PNR / Seat Key</td>
                <td className="py-3 px-4 font-mono text-red-600 font-bold">O(N) [Linear Search Scan]</td>
                <td className="py-3 px-4 font-mono text-emerald-700 font-bold">O(1) [Key Hash Calculation]</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Spatial Cache Locality</td>
                <td className="py-3 px-4 font-semibold text-emerald-700">Excellent (L1/L2 Cache Lines)</td>
                <td className="py-3 px-4 font-semibold text-amber-700">Poor (Pointer chasing across heap)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">2D Spatial Group Seating</td>
                <td className="py-3 px-4 font-semibold text-emerald-700">Trivial (Row/Col Index Math)</td>
                <td className="py-3 px-4 font-semibold text-slate-500">Difficult (No adjacent spatial awareness)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">AeroSeat Role</td>
                <td className="py-3 px-4 font-medium text-slate-900">Cabin Map Grid & Group Window Scanner</td>
                <td className="py-3 px-4 font-medium text-slate-900">PNR Instant Retrieval & In-Memory Lock</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Profiler Benchmark Card */}
      {result && (
        <div className="bg-[#10243A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-navy-800">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#C7A66A]" />
              <h3 className="font-bold text-base text-white">Live Benchmark: 100 Random PNR Lookups over N = {result.collection_size}</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400">Real Measured Nanosecond Timings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Array Result */}
            <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 space-y-3">
              <span className="font-bold text-sm text-slate-300 block">{result.array_list.structure}</span>
              <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-2 border-t border-navy-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Lookups:</span>
                  <span className="font-bold text-white">{result.operations_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Element Comparisons:</span>
                  <span className="font-bold text-red-400">{result.array_list.total_comparisons.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Comparisons / Query:</span>
                  <span className="font-bold text-white">{result.array_list.average_comparisons_per_lookup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Time:</span>
                  <span className="font-bold text-slate-300">{result.array_list.lookup_time_us} μs</span>
                </div>
              </div>
            </div>

            {/* Hash Map Result */}
            <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 space-y-3">
              <span className="font-bold text-sm text-emerald-400 block">{result.hash_map.structure}</span>
              <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-2 border-t border-navy-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Lookups:</span>
                  <span className="font-bold text-white">{result.operations_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Element Comparisons:</span>
                  <span className="font-bold text-emerald-400">{result.hash_map.total_lookups}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Comparisons / Query:</span>
                  <span className="font-bold text-emerald-400">1.0 (Direct Bucket)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Time:</span>
                  <span className="font-bold text-emerald-400">{result.hash_map.lookup_time_us} μs</span>
                </div>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-navy-950/70 border border-navy-800 text-xs text-slate-300">
            <strong className="text-[#C7A66A] block text-[11px] uppercase mb-1">Architectural Takeaway:</strong>
            {result.trade_off_summary}
          </div>
        </div>
      )}

    </div>
  );
};
