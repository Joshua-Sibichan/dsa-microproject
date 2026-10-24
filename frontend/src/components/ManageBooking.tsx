import React, { useState } from 'react';
import { retrieveReservation, cancelReservation } from '../api';
import { Reservation } from '../types';
import { Search, Compass, AlertCircle, CheckCircle2, Trash2, GitFork, Plane, Clock } from 'lucide-react';

interface ManageBookingProps {
  onReservationCancelled: () => void;
}

export const ManageBooking: React.FC<ManageBookingProps> = ({ onReservationCancelled }) => {
  const [pnrInput, setPnrInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);
  const [waitlistPromotedMsg, setWaitlistPromotedMsg] = useState<string | null>(null);

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput.trim()) {
      setError('Please provide a 6-character booking reference (e.g. EK9X2B)');
      return;
    }

    setLoading(true);
    setError(null);
    setCancelFeedback(null);
    setWaitlistPromotedMsg(null);

    try {
      const data = await retrieveReservation(pnrInput.trim(), lastNameInput.trim() || undefined);
      setReservation(data);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve reservation');
      setReservation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;
    const confirmCancel = window.confirm(`Are you sure you want to cancel booking ${reservation.pnr}? Assigned seat ${reservation.seat_number} will be released back to inventory.`);
    if (!confirmCancel) return;

    setLoading(true);
    setError(null);

    try {
      const res = await cancelReservation(reservation.pnr);
      setCancelFeedback(res.message);
      if (res.waitlist_promoted) {
        setWaitlistPromotedMsg(res.waitlist_promoted.message);
      }
      setReservation({
        ...reservation,
        status: 'CANCELLED'
      });
      onReservationCancelled();
    } catch (err: any) {
      setError(err.message || 'Cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Manage Header Card */}
      <div className="bg-[#10243A] text-white rounded-3xl p-8 shadow-xl border border-navy-800">
        <span className="text-xs font-mono font-bold tracking-widest text-[#C7A66A] uppercase">Self-Service Portal</span>
        <h1 className="text-3xl font-bold font-serif mt-1">Manage Your Reservation</h1>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl">
          Enter your 6-character booking reference (PNR) and passenger last name to view your flight itinerary, seat allocation, or cancel your reservation.
        </p>

        {/* Dual-Field Retrieval Form */}
        <form onSubmit={handleRetrieve} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Booking Reference (PNR)</label>
            <input
              type="text"
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
              placeholder="e.g. EK9X2B"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-navy-700 text-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-[#C7A66A] uppercase placeholder:normal-case placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Passenger Last Name</label>
            <input
              type="text"
              value={lastNameInput}
              onChange={(e) => setLastNameInput(e.target.value)}
              placeholder="e.g. Sterling"
              className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-navy-700 text-white text-base focus:outline-none focus:ring-2 focus:ring-[#C7A66A] placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#C7A66A] hover:bg-[#d8b97c] text-[#10243A] font-bold text-sm tracking-wide uppercase transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching BST...' : 'Retrieve Booking'}</span>
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Retrieved Reservation Details */}
      {reservation && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/90 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-[#C7A66A] uppercase">Reservation Confirmed</span>
              <h2 className="text-2xl font-bold text-[#10243A]">PNR: {reservation.pnr}</h2>
              <p className="text-xs text-slate-500">Booked on {reservation.created_at}</p>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                reservation.status === 'CONFIRMED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {reservation.status}
              </span>

              {reservation.status === 'CONFIRMED' && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Booking</span>
                </button>
              )}
            </div>
          </div>

          {/* Cancellation Feedback & Waitlist Notification */}
          {cancelFeedback && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>{cancelFeedback}</span>
              </div>
              {waitlistPromotedMsg && (
                <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-900 font-semibold flex items-center space-x-2">
                  <span className="text-base">🎉</span>
                  <span>{waitlistPromotedMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Flight & Passenger Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Flight Details Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Flight Route</span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-[#10243A]">{reservation.origin || 'DXB'}</div>
                  <div className="text-xs text-slate-500">{reservation.origin_city || 'Dubai'}</div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-xs font-bold text-[#C7A66A]">{reservation.flight_number || 'EK-201'}</span>
                  <Plane className="w-4 h-4 text-slate-400 transform rotate-90 my-1" />
                  <div className="w-16 h-px bg-slate-300"></div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[#10243A]">{reservation.destination || 'JFK'}</div>
                  <div className="text-xs text-slate-500">{reservation.destination_city || 'New York'}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/70 flex justify-between text-xs text-slate-600">
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> Dep: {reservation.departure_time || '08:30'}</span>
                <span>Aircraft: {reservation.aircraft_type || 'Boeing 777-300ER'}</span>
              </div>
            </div>

            {/* Passenger & Seat Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Assigned Seat & Passenger</span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-[#10243A]">{reservation.passenger_name}</div>
                  <div className="text-xs font-mono text-slate-500">{reservation.passenger_email}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-bold text-[#2563EB]">{reservation.seat_number}</div>
                  <div className="text-xs text-slate-500">{reservation.cabin_class || 'ECONOMY'} Class</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/70 flex justify-between text-xs text-slate-600">
                <span>Category: {reservation.category || 'REGULAR'}</span>
                <span>Seat Pitch: {reservation.pitch_inches || 32}"</span>
              </div>
            </div>

          </div>

          {/* Academic BST Path Explainer (CO4) */}
          {reservation.bst_lookup_path && reservation.bst_lookup_path.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center">
                  <GitFork className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" />
                  <span>Binary Search Tree (CO4) Lookup Path</span>
                </span>
                <span className="text-emerald-400">Time: O(log N) • {reservation.bst_lookup_path.length} node comparisons</span>
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto py-1">
                {reservation.bst_lookup_path.map((nodeKey, idx) => (
                  <React.Fragment key={nodeKey}>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      nodeKey === reservation.pnr
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {nodeKey}
                    </span>
                    {idx < reservation.bst_lookup_path!.length - 1 && (
                      <span className="text-slate-600">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
