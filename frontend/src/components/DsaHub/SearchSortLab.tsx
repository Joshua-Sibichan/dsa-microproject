import React, { useState } from 'react';
import { runSortingBenchmark, runSearchingBenchmark } from '../../api';
import { ArrowUpDown, Search, Zap, BarChart2, ShieldCheck } from 'lucide-react';

export const SearchSortLab: React.FC = () => {
  const [datasetSize, setDatasetSize] = useState<number>(200);
  const [sortResult, setSortResult] = useState<any | null>(null);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [loadingSort, setLoadingSort] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const handleBenchmarkSorting = async () => {
    setLoadingSort(true);
    try {
      const data = await runSortingBenchmark(datasetSize);
      setSortResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSort(false);
    }
  };

  const handleBenchmarkSearching = async () => {
    setLoadingSearch(true);
    try {
      const data = await runSearchingBenchmark(datasetSize);
      setSearchResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                CO3 — SEARCHING & SORTING LAB
              </span>
              <span className="text-xs text-slate-500 font-mono">Empirical Profiling & Asymptotic Verification</span>
            </div>
            <h2 className="text-2xl font-bold text-[#10243A] mt-1">Algorithm Performance Benchmark Lab</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Profiles actual measured execution times, comparison operations, and data movements across varying scale.
            </p>
          </div>

          {/* Dataset Scale Slider */}
          <div className="flex flex-col items-end">
            <label className="text-xs font-bold text-slate-700">Dataset Size (N): {datasetSize} Elements</label>
            <input
              type="range"
              min="20"
              max="800"
              step="20"
              value={datasetSize}
              onChange={(e) => setDatasetSize(Number(e.target.value))}
              className="w-48 accent-[#C7A66A] mt-1"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleBenchmarkSorting}
            disabled={loadingSort}
            className="px-5 py-2.5 bg-[#10243A] hover:bg-[#1A3654] text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all"
          >
            <ArrowUpDown className="w-4 h-4 text-[#C7A66A]" />
            <span>{loadingSort ? 'Executing Benchmark...' : 'Run MergeSort vs InsertionSort'}</span>
          </button>

          <button
            onClick={handleBenchmarkSearching}
            disabled={loadingSearch}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all"
          >
            <Search className="w-4 h-4" />
            <span>{loadingSearch ? 'Executing Search...' : 'Run LinearSearch vs BinarySearch'}</span>
          </button>
        </div>
      </div>

      {/* Sorting Benchmark Results Card */}
      {sortResult && (
        <div className="bg-[#10243A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-navy-800">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-[#C7A66A]" />
              <h3 className="font-bold text-base text-white">Merge Sort vs Insertion Sort Results (N = {sortResult.dataset_size})</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400">Measured in Microseconds (μs)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Merge Sort Box */}
            <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-emerald-400">Merge Sort (Divide-and-Conquer)</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {sortResult.merge_sort.time_complexity}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-2 border-t border-navy-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Comparisons:</span>
                  <span className="font-bold text-white">{sortResult.merge_sort.comparisons.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Swaps / Copies:</span>
                  <span className="font-bold text-white">{sortResult.merge_sort.swaps_or_copies.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Time:</span>
                  <span className="font-bold text-emerald-400">{sortResult.merge_sort.execution_time_us} μs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Algorithmic Stability:</span>
                  <span className="font-bold text-[#C7A66A]">STABLE (Preserves Row Order)</span>
                </div>
              </div>
            </div>

            {/* Insertion Sort Box */}
            <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-amber-400">Insertion Sort (In-Place Adaptive)</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {sortResult.insertion_sort.time_complexity}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-2 border-t border-navy-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Comparisons:</span>
                  <span className="font-bold text-white">{sortResult.insertion_sort.comparisons.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shifts / Copies:</span>
                  <span className="font-bold text-white">{sortResult.insertion_sort.swaps_or_copies.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Time:</span>
                  <span className="font-bold text-amber-400">{sortResult.insertion_sort.execution_time_us} μs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auxiliary Space:</span>
                  <span className="font-bold text-slate-300">O(1) In-Place</span>
                </div>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-navy-950/70 border border-navy-800 text-xs text-slate-300">
            <strong className="text-[#C7A66A] block text-[11px] uppercase mb-1">Empirical Observation:</strong>
            MergeSort exhibits steady O(N log N) scaling regardless of input randomness. For seat ranking, MergeSort's strict stability ensures that when two seats achieve equal preference scores, their original forward-cabin sequence is reliably preserved.
          </div>
        </div>
      )}

      {/* Searching Benchmark Results Card */}
      {searchResult && (
        <div className="bg-[#10243A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-navy-800">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-bold text-base text-white">Linear Search vs Binary Search (N = {searchResult.dataset_size})</h3>
            </div>
            <span className="text-xs font-mono text-slate-300">Target: {searchResult.searched_target}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Linear Search */}
            <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-300">Linear Search (Sequential Scan)</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                  O(N)
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-2 border-t border-navy-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Comparisons Required:</span>
                  <span className="font-bold text-white">{searchResult.linear_search.comparisons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Time:</span>
                  <span className="font-bold text-slate-300">{searchResult.linear_search.execution_time_us} μs</span>
                </div>
              </div>
            </div>

            {/* Binary Search */}
            <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-blue-400">Binary Search (Interval Halving)</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  O(log N)
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-2 border-t border-navy-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Comparisons Required:</span>
                  <span className="font-bold text-blue-400">{searchResult.binary_search.comparisons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Time:</span>
                  <span className="font-bold text-blue-400">{searchResult.binary_search.execution_time_us} μs</span>
                </div>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-navy-950/70 border border-navy-800 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <strong className="text-emerald-400 block text-[11px] uppercase">Efficiency Ratio:</strong>
              <span>Binary Search executed in <strong>{searchResult.theoretical_comparison.comparison_reduction_factor}x fewer comparisons</strong> than linear scanning.</span>
            </div>
            <span className="font-mono text-2xl font-bold text-emerald-400">
              {searchResult.theoretical_comparison.comparison_reduction_factor}×
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
