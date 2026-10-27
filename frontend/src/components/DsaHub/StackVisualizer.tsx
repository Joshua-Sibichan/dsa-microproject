import React, { useState, useEffect } from 'react';
import { fetchUndoHistory, triggerUndo } from '../../api';
import { UndoAction } from '../../types';
import { RotateCcw, Layers } from 'lucide-react';

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
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-border-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border-subtle gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary-container/20 text-secondary border border-secondary-container/40 uppercase tracking-wider">
                CO1 — Stack Implementation
              </span>
              <span className="text-xs text-charcoal-muted font-mono">Time: O(1) Push / Pop</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-navy mt-1">
              Reversible Operations — LIFO Undo Stack
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5 max-w-2xl">
              Tracks reversible reservation state changes. Pops topmost action to safely revert database &amp; BST state without corruption.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleUndo}
              disabled={loading || !history || history.current_size === 0}
              className="px-5 py-2.5 bg-primary-container hover:bg-crimson-deep disabled:bg-surface-container text-white disabled:text-charcoal-muted text-xs font-serif font-bold uppercase rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Pop &amp; Undo (Top of Stack)</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-4 text-xs text-slate-navy bg-gold-light/40 p-3 rounded-xl border border-gold-metallic/30 font-mono">
            {message}
          </div>
        )}
      </div>

      {/* Visual Stack Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Stack Column Visualizer */}
        <div className="lg:col-span-2 bg-slate-navy text-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container text-[20px]">layers</span>
              <h3 className="font-serif font-bold text-base text-white">Stack Memory Layout (Top to Bottom)</h3>
            </div>
            <span className="font-mono text-xs text-surface-container-highest/70">
              Depth: <strong className="text-secondary-container font-bold">{history?.current_size || 0}</strong> / {history?.max_capacity || 30}
            </span>
          </div>

          {history && history.stack_contents.length > 0 ? (
            <div className="space-y-3">
              {history.stack_contents.map((action, idx) => {
                const isTop = idx === 0;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all relative ${
                      isTop
                        ? 'bg-primary-container/20 border-primary shadow-lg ring-1 ring-primary'
                        : 'bg-surface-container-lowest/5 border-white/10'
                    }`}
                  >
                    {isTop && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-primary-container text-white uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        <span>Top of Stack</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary-container/20 text-secondary-container border border-secondary-container/40">
                        {action.action_type}
                      </span>
                      {action.pnr && (
                        <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          PNR: {action.pnr}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-surface-container-highest font-medium">{action.description}</p>

                    <div className="flex items-center gap-3 text-[10px] text-surface-container-highest/60 font-mono mt-2 pt-2 border-t border-white/10">
                      <span>Flight: {action.flight_id || 'N/A'}</span>
                      {action.seat_number && <span>Seat: {action.seat_number}</span>}
                      {action.old_seat && action.new_seat && (
                        <span>Swap: {action.old_seat} → {action.new_seat}</span>
                      )}
                      <span>Depth #{history.current_size - idx}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-surface-container-highest/60 text-xs border border-dashed border-white/20 rounded-2xl">
              Stack is currently empty. Actions like reservations or seat swaps will push frames here.
            </div>
          )}
        </div>

        {/* Right Col: Stack Invariants */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-sm border border-border-subtle space-y-4">
          <h4 className="font-serif text-base font-bold text-slate-navy border-b border-border-subtle pb-3">
            Stack Invariants &amp; Rollback
          </h4>
          <div className="space-y-3 text-xs text-charcoal-muted leading-relaxed">
            <p>
              <strong>LIFO Semantics:</strong> The most recent action is popped first, guaranteeing sequential transaction consistency during unbooking.
            </p>
            <p>
              <strong>Atomic Rollback:</strong> When popped, the reverse mutation executes inside a SQLite transaction to release or restore the seat.
            </p>
            <p>
              <strong>O(1) Time:</strong> Push and Pop operations maintain strict constant-time complexity with a bounded capacity of {history?.max_capacity || 50} entries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
