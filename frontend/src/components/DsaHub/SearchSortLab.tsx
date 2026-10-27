import React, { useState } from 'react';
import { runSortingBenchmark, runSearchingBenchmark } from '../../api';
import { ArrowUpDown, Search, Zap, BarChart2, ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react';

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
      {/* Control & Overview Header */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-border-subtle gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary-container/10 text-primary-container border border-primary-container/20">
                CO3 — SEARCHING &amp; SORTING
              </span>
              <span className="text-xs text-on-surface-variant font-mono">Empirical Profiling &amp; Asymptotic Verification</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-navy">
              Algorithm Benchmark Laboratory
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
              Profile empirical execution timings, comparison counts, and data movement operations across varying dataset sizes.
            </p>
          </div>

          {/* Dataset Scale Slider */}
          <div className="bg-surface-container-low p-4 rounded-2xl border border-border-subtle flex flex-col justify-center min-w-[260px]">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-navy mb-2">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-secondary-container" />
                <span>Dataset Scale (N)</span>
              </span>
              <span className="font-mono px-2 py-0.5 rounded-md bg-slate-navy text-gold-metallic text-xs font-bold">
                {datasetSize} elements
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="800"
              step="20"
              value={datasetSize}
              onChange={(e) => setDatasetSize(Number(e.target.value))}
              className="w-full accent-primary-container cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/70 mt-1.5">
              <span>20 (Minimal)</span>
              <span>400</span>
              <span>800 (Stress)</span>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={handleBenchmarkSorting}
            disabled={loadingSort}
            className="px-5 py-3 bg-primary-container hover:bg-[#B3141B] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all"
          >
            <ArrowUpDown className="w-4 h-4 text-white" />
            <span>{loadingSort ? 'Executing Sorting Benchmark...' : 'Run MergeSort vs InsertionSort'}</span>
          </button>

          <button
            onClick={handleBenchmarkSearching}
            disabled={loadingSearch}
            className="px-5 py-3 bg-slate-navy hover:bg-[#1a2334] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all"
          >
            <Search className="w-4 h-4 text-gold-metallic" />
            <span>{loadingSearch ? 'Executing Search Benchmark...' : 'Run LinearSearch vs BinarySearch'}</span>
          </button>
        </div>
      </div>

      {/* Sorting Benchmark Results Card */}
      {sortResult && (
        <div className="bg-slate-navy text-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary-container/40 flex items-center justify-center">
                <ArrowUpDown className="w-4 h-4 text-gold-metallic" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">
                  Merge Sort vs Insertion Sort Results
                </h3>
                <span className="text-xs text-surface-container-highest/70 font-mono">
                  Input Size: N = {sortResult.dataset_size} seats
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
              Real Wall-Clock Microseconds (μs)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Merge Sort Box */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-serif font-bold text-base text-emerald-400 block">Merge Sort</span>
                  <span className="text-[11px] text-surface-container-highest/70">Divide-and-Conquer Paradigm</span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  {sortResult.merge_sort.time_complexity}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-surface-container-highest/90 pt-3 border-t border-white/10">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Comparisons:</span>
                  <span className="font-bold text-white">{sortResult.merge_sort.comparisons.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Swaps / Copies:</span>
                  <span className="font-bold text-white">{sortResult.merge_sort.swaps_or_copies.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Execution Time:</span>
                  <span className="font-bold text-emerald-400 text-sm">{sortResult.merge_sort.execution_time_us} μs</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-surface-container-highest/70">Algorithmic Stability:</span>
                  <span className="font-bold text-gold-metallic">STABLE (Preserves Row Order)</span>
                </div>
              </div>
            </div>

            {/* Insertion Sort Box */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-serif font-bold text-base text-amber-400 block">Insertion Sort</span>
                  <span className="text-[11px] text-surface-container-highest/70">In-Place Adaptive Paradigm</span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  {sortResult.insertion_sort.time_complexity}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-surface-container-highest/90 pt-3 border-t border-white/10">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Comparisons:</span>
                  <span className="font-bold text-white">{sortResult.insertion_sort.comparisons.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Shifts / Copies:</span>
                  <span className="font-bold text-white">{sortResult.insertion_sort.swaps_or_copies.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Execution Time:</span>
                  <span className="font-bold text-amber-400 text-sm">{sortResult.insertion_sort.execution_time_us} μs</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-surface-container-highest/70">Auxiliary Space:</span>
                  <span className="font-bold text-surface-container-highest">O(1) In-Place Memory</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-xs text-surface-container-highest/90">
            <span className="text-gold-metallic font-mono font-bold tracking-wider text-[11px] uppercase block mb-1">
              Empirical Observation &amp; Practical Application:
            </span>
            MergeSort exhibits steady O(N log N) scaling regardless of initial element permutations. For airline seat recommendation matrices, MergeSort's strict stability ensures that whenever two candidate seats achieve identical preference utility scores, their natural forward-cabin sequential order is consistently preserved.
          </div>
        </div>
      )}

      {/* Searching Benchmark Results Card */}
      {searchResult && (
        <div className="bg-slate-navy text-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center">
                <Search className="w-4 h-4 text-gold-metallic" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">
                  Linear Search vs Binary Search Results
                </h3>
                <span className="text-xs text-surface-container-highest/70 font-mono">
                  Input Size: N = {searchResult.dataset_size} items
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-gold-metallic bg-white/5 border border-white/10 px-3 py-1 rounded-full self-start sm:self-auto">
              Searched Target: <strong className="text-white">{searchResult.searched_target}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Linear Search */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-serif font-bold text-base text-surface-container-highest block">Linear Search</span>
                  <span className="text-[11px] text-surface-container-highest/70">Sequential Linear Scan</span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/10 text-surface-container-highest font-bold">
                  O(N)
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-surface-container-highest/90 pt-3 border-t border-white/10">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Comparisons Required:</span>
                  <span className="font-bold text-white">{searchResult.linear_search.comparisons}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-surface-container-highest/70">Execution Time:</span>
                  <span className="font-bold text-surface-container-highest text-sm">{searchResult.linear_search.execution_time_us} μs</span>
                </div>
              </div>
            </div>

            {/* Binary Search */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-serif font-bold text-base text-gold-metallic block">Binary Search</span>
                  <span className="text-[11px] text-surface-container-highest/70">Divide-and-Halve Interval</span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-secondary-container/20 text-gold-metallic font-bold border border-secondary-container/40">
                  O(log N)
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-surface-container-highest/90 pt-3 border-t border-white/10">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-surface-container-highest/70">Comparisons Required:</span>
                  <span className="font-bold text-gold-metallic">{searchResult.binary_search.comparisons}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-surface-container-highest/70">Execution Time:</span>
                  <span className="font-bold text-gold-metallic text-sm">{searchResult.binary_search.execution_time_us} μs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-xs text-surface-container-highest/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-emerald-400 font-mono font-bold tracking-wider text-[11px] uppercase block mb-1">
                Theoretical &amp; Empirical Speedup:
              </span>
              <span>
                Binary Search located the target in <strong className="text-white">{searchResult.theoretical_comparison.comparison_reduction_factor}× fewer comparisons</strong> than sequential scanning.
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-400 self-start sm:self-auto">
              <span className="text-xs font-mono">Factor:</span>
              <span className="font-mono text-2xl font-bold">{searchResult.theoretical_comparison.comparison_reduction_factor}×</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
