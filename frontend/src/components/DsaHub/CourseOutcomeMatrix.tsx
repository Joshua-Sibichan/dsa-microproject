import React from 'react';
import { CheckCircle2, Award, BookOpen, Layers, ShieldCheck } from 'lucide-react';

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
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ACADEMIC ALIGNMENT
            </span>
            <span className="text-xs text-slate-500 font-mono">100% Practical Implementation</span>
          </div>
          <h2 className="text-2xl font-bold text-[#10243A] mt-1">College DSA Course Outcome Coverage</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every course outcome corresponds to an actively executing, unit-tested module within the AeroSeat Intelligence platform.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>5 of 5 Outcomes Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {outcomes.map((item) => (
          <div
            key={item.code}
            className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-all border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#10243A] text-[#C7A66A] rounded">
                  {item.code}
                </span>
                <h4 className="font-bold text-sm text-[#10243A]">{item.title}</h4>
              </div>
              <p className="text-xs text-slate-600">{item.description}</p>
              <div className="text-xs font-mono text-slate-700 pt-1">
                <span className="font-bold text-[#C7A66A]">Concrete Feature:</span> {item.feature}
              </div>
            </div>

            <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 gap-1 text-right">
              <span className="font-mono text-[11px] font-bold text-slate-600">{item.complexity}</span>
              <span className="inline-flex items-center text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
