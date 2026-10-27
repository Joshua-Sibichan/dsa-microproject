import React from 'react';
import { CheckCircle2, Award, BookOpen, Layers, ShieldCheck, GraduationCap, Check } from 'lucide-react';

export const CourseOutcomeMatrix: React.FC = () => {
  const outcomes = [
    {
      code: "CO1",
      title: "Stacks and Queues",
      description: "Implement and analyze linear data structures for scheduling, buffering, and backtracking systems.",
      feature: "Waitlist FIFO Queue & Reservation LIFO Undo Stack",
      complexity: "Enqueue/Dequeue O(1) • Push/Pop O(1)",
      status: "VERIFIED & BENCHMARKED"
    },
    {
      code: "CO2",
      title: "Data Structure Selection",
      description: "Evaluate trade-offs between memory footprint, hardware cache locality, and retrieval speed.",
      feature: "Contiguous Array Cabin Inventory vs Hash Table PNR Lookup",
      complexity: "Array Spatial Locality O(1) index vs Hash Table O(1) lookup",
      status: "VERIFIED & BENCHMARKED"
    },
    {
      code: "CO3",
      title: "Searching and Sorting",
      description: "Implement, profile, and compare fundamental search and sorting algorithms against empirical datasets.",
      feature: "Multi-Factor Seat Ranking via MergeSort vs InsertionSort; Binary vs Linear Search",
      complexity: "MergeSort O(N log N) Stable • Binary Search O(log N)",
      status: "VERIFIED & BENCHMARKED"
    },
    {
      code: "CO4",
      title: "Trees & Hierarchical Structures",
      description: "Apply binary search trees for ordered storage, rapid retrieval, and recursive traversals.",
      feature: "Booking Reference (PNR) BST Directory (Insert, Search with path, Delete, Inorder/Preorder/Postorder)",
      complexity: "Search/Insert O(log N) average • Traversal O(N)",
      status: "VERIFIED & BENCHMARKED"
    },
    {
      code: "CO5",
      title: "Graphs & Shortest Path",
      description: "Model relational network systems and apply BFS to compute reachability and minimal path segments.",
      feature: "Global Airport Hub Route Network & Fewest Flight Segments BFS Explorer",
      complexity: "Graph BFS Traversal O(V + E) • Shortest Segments Guarantee",
      status: "VERIFIED & BENCHMARKED"
    }
  ];

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-border-subtle space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border-subtle gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary-container/20 text-slate-navy border border-secondary-container/40">
              ACADEMIC ALIGNMENT
            </span>
            <span className="text-xs text-on-surface-variant font-mono">100% Practical Implementation</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-navy">
            College DSA Course Outcome Coverage
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            Every course outcome corresponds to an actively executing, unit-tested module within the X Airways Intelligence platform.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold font-mono self-start sm:self-auto shadow-sm">
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>5 of 5 Outcomes Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {outcomes.map((item) => (
          <div
            key={item.code}
            className="p-5 sm:p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-navy text-gold-metallic rounded-lg shadow-xs">
                  {item.code}
                </span>
                <h4 className="font-serif font-bold text-base text-slate-navy">{item.title}</h4>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">{item.description}</p>
              <div className="text-xs font-mono text-slate-navy pt-1 flex items-start gap-1.5">
                <span className="font-bold text-primary-container uppercase text-[11px] tracking-wider">Concrete Feature:</span>
                <span className="text-on-surface">{item.feature}</span>
              </div>
            </div>

            <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle gap-2 text-right">
              <span className="font-mono text-xs font-semibold text-on-surface-variant bg-surface-container-lowest px-3 py-1 rounded-lg border border-border-subtle">
                {item.complexity}
              </span>
              <span className="inline-flex items-center text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
