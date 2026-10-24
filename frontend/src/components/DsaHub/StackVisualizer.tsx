import React, { useState, useEffect } from 'react';
import { fetchUndoHistory, triggerUndo } from '../../api';
import { UndoAction } from '../../types';
import { RotateCcw, Layers, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export const StackVisualizer: React.FC = () => {
  const [history, setHistory] = useState<{
    current_size: number;
    max_capacity: number;
    stack_contents: UndoAction[];
    recent_logs: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchUndoHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUndo = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await triggerUndo();
      setMessage(res.message);
      await loadData();
    } catch (err: any) {
      setMessage(`Undo Error: ${err.message}`);
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
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                CO1 — STACK IMPLEMENTATION
              </span>
              <span className="text-xs text-slate-500 font-mono">Time: O(1) Push / Pop</span>
            </div>
            <h2 className="text-2xl font-bold text-[#10243A] mt-1">Reversible Operations — LIFO Undo Stack</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks reversible reservation state changes. Pops topmost action to safely revert database & BST state without corruption.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleUndo}
              disabled={loading || !history || history.current_size === 0}
              className="px-5 py-2.5 bg-[#C7A66A] hover:bg-[#d8b97c] disabled:bg-slate-200 text-[#10243A] disabled:text-slate-400 text-xs font-bold uppercase rounded-xl transition-all shadow-md flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Pop & Undo (Top of Stack)</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-4 text-xs text-slate-700 bg-slate-100 p-3 rounded-xl border border-slate-200 font-mono">
            {message}
          </div>
        )}
      </div>

      {/* Visual Stack Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Stack Column Visualizer */}
        <div className="lg:col-span-2 bg-[#10243A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-navy-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#C7A66A]" />
              <h3 className="font-bold text-base text-white">Stack Memory Layout (Top to Bottom)</h3>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Depth: <span className="text-[#C7A66A] font-bold">{history?.current_size || 0}</span> / {history?.max_capacity || 30}
            </span>
          </div>

          {history && history.stack_contents.length > 0 ? (
            <div className="space-y-3">
              {history.stack_contents.map((action, idx) => {
                const isTop = idx === 0;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 transition-all relative ${
                      isTop
                        ? 'bg-amber-950/40 border-[#C7A66A] shadow-lg ring-2 ring-amber-500/20'
                        : 'bg-navy-900 border-navy-700 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-slate-400">STACK DEPTH: #{idx}</span>
                      {isTop && (
                        <span className="px-2 py-0.5 bg-[#C7A66A] text-slate-950 font-bold rounded">
                          TOP OF STACK (Next to Pop)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-white">{action.action_type}</div>
                      {action.pnr && (
                        <span className="font-mono text-xs text-[#C7A66A] font-bold">PNR: {action.pnr}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mt-1">{action.description}</p>
                    {action.seat_number && (
                      <div className="text-[11px] font-mono text-slate-400 mt-2">
                        Seat Affected: <span className="text-white font-bold">{action.seat_number}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Undo stack is currently empty. Make or cancel a seat reservation to push reversible operations.
            </div>
          )}
        </div>

        {/* Right Col: Stack Guardrails & Academic Theory */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-4">
          <div className="flex items-center space-x-2 text-[#10243A] font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base">Undo Rollback Invariants</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-800 block mb-1">1. LIFO Discipline</strong>
              Operations can only be reverted in the exact reverse chronological order in which they were executed.
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-800 block mb-1">2. Concurrency Protection</strong>
              Before undoing a seat cancellation, the engine verifies the released seat hasn't been occupied by another customer. If re-booked, the rollback is rejected to prevent double-booking.
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-800 block mb-1">3. Non-Chronological Query Warning</strong>
              A Stack is explicitly chosen for rollback operations. Ordinary historical flight browsing is decoupled and handled via chronological database indexes, preventing misuse of the stack abstraction.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
