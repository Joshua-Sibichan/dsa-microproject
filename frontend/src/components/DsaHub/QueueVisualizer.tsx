import React, { useState, useEffect } from 'react';
import { fetchWaitlist, enqueueWaitlist, dequeueWaitlist } from '../../api';
import { WaitlistState } from '../../types';
import { ArrowRight, Clock, Users, RefreshCw } from 'lucide-react';

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
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-border-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border-subtle gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary-container/20 text-secondary border border-secondary-container/40 uppercase tracking-wider">
                CO1 — Queue Implementation
              </span>
              <span className="text-xs text-charcoal-muted font-mono">Time: O(1) Enqueue / Dequeue</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-navy mt-1">
              Waitlist Management — FIFO Queue
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5 max-w-2xl">
              Strict First-In, First-Out queue policy guarantees fair, deterministic seat reallocation when reservations are cancelled.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDequeue}
              disabled={loading || !waitlist || waitlist.current_size === 0}
              className="px-5 py-2.5 bg-primary-container hover:bg-crimson-deep disabled:bg-surface-container text-white disabled:text-charcoal-muted text-xs font-serif font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
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
            className="flex-1 w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border-subtle text-xs text-slate-navy bg-surface-container-low focus:outline-none focus:border-slate-navy"
          />

          <select
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border-subtle text-xs text-slate-navy bg-surface-container-low focus:outline-none focus:border-slate-navy font-semibold cursor-pointer"
          >
            <option value="REGULAR">Regular Seat</option>
            <option value="PREFERRED">Preferred Seat</option>
            <option value="EXTRA_LEGROOM">Extra Legroom</option>
            <option value="TWIN">Twin Seat</option>
          </select>

          <button
            type="submit"
            disabled={loading || !nameInput.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-navy hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95"
          >
            {loading ? 'Processing...' : 'Enqueue to Waitlist'}
          </button>
        </form>

        {message && (
          <div className="mt-4 text-xs text-slate-navy bg-gold-light/40 p-3 rounded-xl border border-gold-metallic/30 font-mono">
            {message}
          </div>
        )}
      </div>

      {/* Visual Queue Pipeline */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-border-subtle space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">queue</span>
            <h3 className="font-serif text-base font-bold text-slate-navy">
              Active Waitlist Pipeline (Head-to-Tail)
            </h3>
          </div>
          <span className="font-mono text-xs text-charcoal-muted">
            Queue Depth: <strong className="text-primary font-bold">{waitlist?.current_size || 0}</strong> / {waitlist?.max_capacity || 30}
          </span>
        </div>

        {waitlist && waitlist.queue.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitlist.queue.map((entry, idx) => {
              const isHead = idx === 0;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all relative ${
                    isHead
                      ? 'bg-gold-light/40 border-gold-metallic/50 shadow-md ring-1 ring-gold-metallic/40'
                      : 'bg-surface-container-low border-border-subtle'
                  }`}
                >
                  {isHead && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-primary-container text-white uppercase tracking-wider">
                      Head of Queue
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-6 h-6 rounded-full bg-slate-navy text-white text-[10px] font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <span className="font-serif font-bold text-sm text-slate-navy truncate max-w-[150px]">
                      {entry.passenger_name}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-charcoal-muted">
                    <div className="truncate">{entry.passenger_email}</div>
                    <div className="flex justify-between items-center pt-1 border-t border-border-subtle">
                      <span className="font-mono font-bold text-secondary">{entry.preferred_category}</span>
                      <span className="text-[10px] text-charcoal-muted font-mono">Position: {idx + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-charcoal-muted text-xs border border-dashed border-border-subtle rounded-2xl">
            No passengers currently waiting in the FIFO queue.
          </div>
        )}
      </div>
    </div>
  );
};
