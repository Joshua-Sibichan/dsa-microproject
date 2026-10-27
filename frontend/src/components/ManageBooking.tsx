import React, { useState, useEffect } from 'react';
import { retrieveReservation, cancelReservation, modifyReservationSeat, fetchWaitlist, enqueueWaitlist } from '../api';
import { Reservation, WaitlistState } from '../types';
import { Search, AlertCircle, CheckCircle2, Trash2, GitFork, Plane, Clock, Ticket, RefreshCw, Users, ShieldCheck, QrCode } from 'lucide-react';

interface ManageBookingProps {
  onReservationCancelled: () => void;
}

export const ManageBooking: React.FC<ManageBookingProps> = ({ onReservationCancelled }) => {
  const [pnrInput, setPnrInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [waitlistPromotedMsg, setWaitlistPromotedMsg] = useState<string | null>(null);

  // Seat modification state
  const [isModifyingSeat, setIsModifyingSeat] = useState(false);
  const [newSeatInput, setNewSeatInput] = useState('');
  const [modifyLoading, setModifyLoading] = useState(false);

  // Waitlist management state
  const [waitlistState, setWaitlistState] = useState<WaitlistState | null>(null);
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistCat, setWaitlistCat] = useState('REGULAR');
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  useEffect(() => {
    loadWaitlistData();
  }, []);

  const loadWaitlistData = async () => {
    try {
      const data = await fetchWaitlist();
      setWaitlistState(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput.trim()) {
      setError('Please provide a 6-character booking reference (e.g. EK9X2B)');
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback(null);
    setWaitlistPromotedMsg(null);
    setIsModifyingSeat(false);

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
      setFeedback(res.message);
      if (res.waitlist_promoted) {
        setWaitlistPromotedMsg(res.waitlist_promoted.message);
      }
      setReservation({
        ...reservation,
        status: 'CANCELLED'
      });
      onReservationCancelled();
      loadWaitlistData();
    } catch (err: any) {
      setError(err.message || 'Cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleModifySeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation || !newSeatInput.trim()) return;

    setModifyLoading(true);
    setError(null);

    try {
      const res = await modifyReservationSeat(reservation.pnr, newSeatInput.trim().toUpperCase());
      setFeedback(res.message);
      setReservation({
        ...reservation,
        seat_number: res.new_seat,
        ...res.reservation
      });
      setIsModifyingSeat(false);
      setNewSeatInput('');
      onReservationCancelled(); // Refresh seat state in App
    } catch (err: any) {
      setError(err.message || 'Failed to modify seat');
    } finally {
      setModifyLoading(false);
    }
  };

  const handleEnqueueWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistName.trim() || !waitlistEmail.trim()) return;

    setWaitlistLoading(true);
    try {
      await enqueueWaitlist({
        flight_id: reservation?.flight_id || 'FL-201',
        passenger_name: waitlistName.trim(),
        passenger_email: waitlistEmail.trim(),
        preferred_category: waitlistCat
      });
      setWaitlistName('');
      setWaitlistEmail('');
      await loadWaitlistData();
      setFeedback('Successfully added to waitlist queue!');
    } catch (err: any) {
      setError(err.message || 'Waitlist enqueue failed');
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Manage Header Card */}
      <div className="bg-[#10243A] text-white rounded-3xl p-8 shadow-xl border border-navy-800">
        <span className="text-xs font-mono font-bold tracking-widest text-[#C7A66A] uppercase flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5" /> AeroSeat Manage Booking Portal
        </span>
        <h1 className="text-3xl font-bold font-serif mt-1">Manage Your Reservation</h1>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl">
          Enter your 6-character booking reference (PNR) and passenger last name to view your itinerary, change your seat, download your boarding pass, or manage waitlists.
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

        {/* Feedback message */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {feedback && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedback}</span>
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
                <>
                  <button
                    type="button"
                    onClick={() => setIsModifyingSeat(!isModifyingSeat)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 flex items-center space-x-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isModifyingSeat ? 'Cancel Change' : 'Change Seat'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center space-x-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel Booking</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Seat Modification Bar */}
          {isModifyingSeat && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-blue-900">
                Modify Seat Assignment for {reservation.passenger_name} (Current: {reservation.seat_number})
              </div>
              <form onSubmit={handleModifySeat} className="flex gap-2">
                <input
                  type="text"
                  value={newSeatInput}
                  onChange={(e) => setNewSeatInput(e.target.value.toUpperCase())}
                  placeholder="Enter new seat (e.g. 15C, 16A)"
                  className="px-3 py-2 rounded-xl border border-blue-300 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={modifyLoading || !newSeatInput.trim()}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  {modifyLoading ? 'Validating...' : 'Confirm Seat Swap'}
                </button>
              </form>
            </div>
          )}

          {/* Cancellation Feedback & Waitlist Notification */}
          {waitlistPromotedMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>🎉 FIFO Waitlist Promotion Triggered:</span>
              </div>
              <p>{waitlistPromotedMsg}</p>
            </div>
          )}

          {/* Flight & Passenger Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Flight Details Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Flight Route</span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-black text-[#10243A]">{reservation.origin || 'DXB'}</div>
                  <div className="text-xs text-slate-500">{reservation.origin_city || 'Dubai'}</div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-xs font-bold text-[#C7A66A]">{reservation.flight_number || 'EK-201'}</span>
                  <Plane className="w-4 h-4 text-slate-400 transform rotate-90 my-1" />
                  <div className="w-16 h-px bg-slate-300"></div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-[#10243A]">{reservation.destination || 'JFK'}</div>
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

          {/* Emirates-Inspired Boarding Pass Presentation */}
          <div className="p-6 bg-gradient-to-r from-slate-900 to-[#10243A] rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-700/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#C7A66A] text-[#10243A] flex items-center justify-center font-bold font-serif text-lg">
                  EK
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#C7A66A] uppercase">AeroSeat Boarding Pass</span>
                  <div className="text-lg font-bold">{reservation.passenger_name}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono">ELECTRONIC TICKET</span>
                <div className="text-xs font-mono font-bold text-[#C7A66A]">PNR: {reservation.pnr}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Flight</span>
                <span className="font-mono font-bold text-base text-white">{reservation.flight_number || 'EK-201'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Seat</span>
                <span className="font-mono font-bold text-base text-[#C7A66A]">{reservation.seat_number}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Class</span>
                <span className="font-semibold text-white">{reservation.cabin_class || 'ECONOMY'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Boarding Time</span>
                <span className="font-mono font-bold text-emerald-400">45 MIN PRIOR</span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
              <div className="font-mono text-[9px] text-slate-500 tracking-wider">
                |||||| | |||||||| ||| ||||||| |||||| |||||||| ||||| ||||||||
              </div>
              <span className="text-[10px] text-slate-400 font-mono">STATUS: {reservation.status}</span>
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

      {/* Waitlist Management Panel (Feature 4 Requirement) */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/90 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-[#C7A66A] uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> FIFO Queue Engine (CO1)
            </span>
            <h2 className="text-xl font-bold text-[#10243A]">Flight Waitlist Manager</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enqueued passengers are automatically dequeued and offered seats in strict O(1) FIFO order when reservations are cancelled.</p>
          </div>
          <button
            onClick={loadWaitlistData}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh Waitlist"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Join Waitlist Form */}
        <form onSubmit={handleEnqueueWaitlist} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passenger Name</label>
            <input
              type="text"
              value={waitlistName}
              onChange={(e) => setWaitlistName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C7A66A]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              placeholder="maya@lin.org"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C7A66A]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Preferred Seat</label>
            <select
              value={waitlistCat}
              onChange={(e) => setWaitlistCat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C7A66A]"
            >
              <option value="REGULAR">Regular Seat</option>
              <option value="PREFERRED">Preferred Front</option>
              <option value="EXTRA_LEGROOM">Extra Legroom</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={waitlistLoading || !waitlistName.trim() || !waitlistEmail.trim()}
              className="w-full py-2 px-4 bg-[#10243A] hover:bg-navy-900 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              {waitlistLoading ? 'Enqueuing...' : 'Enqueue to Waitlist'}
            </button>
          </div>
        </form>

        {/* Current Waitlist Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Current Queue Pipeline ({waitlistState?.current_size || 0} Waiting)</span>
            <span className="font-mono text-[11px] text-emerald-600 font-bold">FIFO Head-to-Tail</span>
          </div>

          {!waitlistState || waitlistState.queue.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              No passengers currently waiting in the queue.
            </div>
          ) : (
            <div className="space-y-2">
              {waitlistState.queue.map((item, index) => (
                <div
                  key={`${item.passenger_email}-${index}`}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-[#10243A] text-white flex items-center justify-center font-mono font-bold text-[10px]">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800">{item.passenger_name}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({item.passenger_email})</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                    {item.preferred_category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
