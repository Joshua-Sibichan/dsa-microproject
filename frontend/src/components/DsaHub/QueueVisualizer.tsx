import React, { useState, useEffect } from 'react';
import { fetchWaitlist, enqueueWaitlist, dequeueWaitlist } from '../../api';
import { WaitlistState } from '../../types';
import { Users, Plus, ArrowRight, Clock, AlertTriangle, Layers, CheckCircle } from 'lucide-react';

export const QueueVisualizer: React.FC = () => {
  const [waitlist, setWaitlist] = useState<WaitlistState | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('EXTRA_LEGROOM');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchWaitlist();
      setWaitlist(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnqueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await enqueueWaitlist({
        flight_id: 'FL-201',
        passenger_name: nameInput.trim(),
        passenger_email: `${nameInput.toLowerCase().replace(/\s+/g, '')}@waitlist.org`,
        preferred_category: categoryInput
      });
      setMessage(res.message);
      setNameInput('');
      await loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDequeue = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await dequeueWaitlist();
      setMessage(res.message);
      await loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Overview Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                CO1 — QUEUE IMPLEMENTATION
              </span>
              <span className="text-xs text-slate-500 font-mono">Time: O(1) Enqueue / Dequeue</span>
            </div>
            <h2 className="text-2xl font-bold text-[#10243A] mt-1">Waitlist Management — FIFO Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict First-In, First-Out queue policy guarantees fair, deterministic seat reallocation when reservations are cancelled.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDequeue}
              disabled={loading || !waitlist || waitlist.current_size === 0}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
            >
              <span>Dequeue Next (Head)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Enqueue Form */}
        <form onSubmit={handleEnqueue} className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Passenger Name (e.g. Maya Lin)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
          <select
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none"
          >
            <option value="EXTRA_LEGROOM">Extra Legroom Exit Row</option>
            <option value="PREFERRED">Preferred Front Cabin</option>
            <option value="REGULAR">Regular Economy</option>
          </select>
          <button
            type="submit"
            disabled={loading || !nameInput.trim()}
            className="px-5 py-2.5 bg-[#10243A] hover:bg-[#1A3654] disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#C7A66A]" />
            <span>Enqueue (Tail)</span>
          </button>
        </form>

        {message && (
          <div className="mt-3 text-xs text-slate-700 bg-slate-100 p-2.5 rounded-xl border border-slate-200 font-mono">
            {message}
          </div>
        )}
      </div>

      {/* Visual Pipeline of Queue */}
      <div className="bg-[#10243A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#C7A66A]" />
            <h3 className="font-bold text-base text-white">Live Queue Pipeline (Front to Rear)</h3>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Capacity: <span className="text-[#C7A66A] font-bold">{waitlist?.current_size || 0}</span> / {waitlist?.max_capacity || 50}
          </span>
        </div>

        {waitlist && waitlist.queue.length > 0 ? (
          <div className="overflow-x-auto py-4">
            <div className="flex items-center space-x-4 min-w-max">
              {waitlist.queue.map((item, idx) => {
                const isHead = idx === 0;
                const isTail = idx === waitlist.queue.length - 1;

                return (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className={`p-4 rounded-2xl border-2 transition-all w-48 relative ${
                      isHead
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-lg ring-2 ring-emerald-500/20'
                        : isTail
                        ? 'bg-navy-900 border-[#C7A66A]'
                        : 'bg-navy-900 border-navy-700'
                    }`}>
                      <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                        <span className="text-slate-400">POS #{idx + 1}</span>
                        {isHead && <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-bold rounded">HEAD</span>}
                        {isTail && <span className="px-1.5 py-0.2 bg-[#C7A66A] text-slate-950 font-bold rounded">TAIL</span>}
                      </div>

                      <div className="font-bold text-sm text-white truncate">{item.passenger_name}</div>
                      <div className="text-[11px] text-slate-300 mt-1 truncate">{item.preferred_category}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-2 truncate">Flight: {item.flight_id}</div>
                    </div>

                    {idx < waitlist.queue.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            Queue is currently empty. Enqueue passenger requests above to visualize FIFO buffering.
          </div>
        )}

        {/* Theoretical Rationale Alert */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700 text-xs text-slate-300 space-y-1">
          <span className="font-bold text-[#C7A66A] block uppercase text-[10px]">Academic FIFO Policy Rationale:</span>
          <p>
            An unweighted FIFO queue eliminates allocation starvation. Every passenger is guaranteed service proportional to their arrival order.
            Upon seat cancellation or release, the head node is popped in strict O(1) time complexity without array shifting overhead.
          </p>
        </div>
      </div>

    </div>
  );
};
