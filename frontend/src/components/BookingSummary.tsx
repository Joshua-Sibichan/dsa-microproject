import React from 'react';
import { Seat, Flight, PassengerProfile, Reservation, PassengerBookingItem } from '../types';
import { Plane, CheckCircle2, Ticket, ShieldCheck, QrCode, Users, AlertTriangle } from 'lucide-react';

interface BookingSummaryProps {
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  passenger: PassengerProfile;
  passengers?: PassengerBookingItem[];
  selectedSeatsByPassenger?: Record<number, Seat>;
  selectedCabinClass?: string;
  onConfirmBooking: () => void;
  loading: boolean;
  latestReservations?: Reservation[];
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedFlight,
  selectedSeat,
  passenger,
  passengers = [],
  selectedSeatsByPassenger = {},
  selectedCabinClass = 'ECONOMY',
  onConfirmBooking,
  loading,
  latestReservations = []
}) => {
  // Cabin Class Fare Multiplier
  const getFareForCabin = (baseFare: number, cabin: string): number => {
    switch (cabin) {
      case 'FIRST': return Math.round(baseFare * 5.2);
      case 'BUSINESS': return Math.round(baseFare * 2.8);
      case 'PREMIUM_ECONOMY': return Math.round(baseFare * 1.6);
      case 'ECONOMY':
      default: return Math.round(baseFare);
    }
  };

  const singleBaseFare = getFareForCabin(selectedFlight?.base_fare || 450.0, selectedCabinClass);
  const passengerCount = Math.max(1, passengers.length);

  // Compute total base fare
  const totalBaseFare = singleBaseFare * passengerCount;

  // Compute total seat fees
  let totalSeatFees = 0;
  if (passengers.length > 0) {
    Object.values(selectedSeatsByPassenger).forEach((s) => {
      if (s) totalSeatFees += s.price;
    });
  } else if (selectedSeat) {
    totalSeatFees = selectedSeat.price;
  }

  const grandTotal = totalBaseFare + totalSeatFees;

  // Verification if all passengers have seats
  const allPassengersAssigned = passengers.length > 0
    ? passengers.every((_, idx) => !!selectedSeatsByPassenger[idx])
    : !!selectedSeat;

  const assignedCount = passengers.length > 0
    ? Object.keys(selectedSeatsByPassenger).length
    : (selectedSeat ? 1 : 0);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
      <div>
        <span className="text-xs font-mono font-bold tracking-wider text-[#C7A66A] uppercase flex items-center gap-1">
          <Ticket className="w-3.5 h-3.5" /> Emirates-Inspired Itinerary
        </span>
        <h2 className="text-xl font-bold text-[#10243A]">Booking Confirmation</h2>
        <p className="text-xs text-slate-500 mt-0.5">Review passenger allocations and fare breakdown before confirming</p>
      </div>

      {/* Flight Mini-Leg */}
      {selectedFlight && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm text-[#10243A] bg-white px-2 py-0.5 rounded border border-slate-200">
                {selectedFlight.flight_number}
              </span>
              <span className="text-[11px] font-semibold text-slate-600">{selectedFlight.aircraft_type}</span>
            </div>
            <span className="text-xs font-mono text-[#C7A66A] font-bold">
              {selectedFlight.duration || '7h 15m'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-black text-slate-900 text-sm">{selectedFlight.origin}</div>
              <div className="text-slate-500">{selectedFlight.origin_city}</div>
              <div className="text-slate-700 font-mono font-bold">{selectedFlight.departure_time}</div>
            </div>

            <div className="flex flex-col items-center px-2">
              <Plane className="w-4 h-4 text-[#C7A66A] transform rotate-90" />
              <div className="w-12 h-px bg-slate-300 my-1"></div>
              <span className="text-[9px] text-slate-400">Non-stop</span>
            </div>

            <div className="text-right">
              <div className="font-black text-slate-900 text-sm">{selectedFlight.destination}</div>
              <div className="text-slate-500">{selectedFlight.destination_city}</div>
              <div className="text-slate-700 font-mono font-bold">{selectedFlight.arrival_time}</div>
            </div>
          </div>
        </div>
      )}

      {/* Passenger & Seat Assignment List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="uppercase tracking-wider text-[11px] text-slate-500">Passenger Seat Allocation</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {assignedCount}/{passengerCount} Assigned
          </span>
        </div>

        {passengers.length > 0 ? (
          <div className="space-y-2">
            {passengers.map((p, idx) => {
              const seat = selectedSeatsByPassenger[idx];
              return (
                <div
                  key={`booking-summary-p-${idx}`}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    seat ? 'bg-blue-50/50 border-blue-200' : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#10243A] text-white flex items-center justify-center font-mono font-bold text-[10px]">
                      P{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{p.name || `Traveler ${idx + 1}`}</div>
                      <div className="text-[10px] text-slate-500">{p.email || 'traveler@aero.org'}</div>
                    </div>
                  </div>

                  {seat ? (
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs bg-[#2563EB] text-white px-2 py-0.5 rounded-md shadow-sm">
                        {seat.seat_number}
                      </span>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {seat.price > 0 ? `+$${seat.price.toFixed(2)}` : 'Complimentary'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Seat Required
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Passenger Fallback */
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60">
            {selectedSeat ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white font-mono font-bold text-lg flex items-center justify-center shadow-md">
                    {selectedSeat.seat_number}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{selectedSeat.cabin_class} Class</div>
                    <div className="text-xs text-slate-600">{selectedSeat.category.replace('_', ' ')} • {selectedSeat.pitch_inches}" pitch</div>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-[#2563EB]">
                  {selectedSeat.price > 0 ? `+$${selectedSeat.price.toFixed(2)}` : 'Complimentary'}
                </span>
              </div>
            ) : (
              <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>No seat selected yet. Click an available seat on the cabin map.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fare Calculation Table (Feature 2 Requirement) */}
      <div className="text-xs space-y-2 pt-4 border-t border-slate-100">
        <div className="flex justify-between">
          <span className="text-slate-500">Cabin Class:</span>
          <span className="font-semibold text-slate-800">{selectedCabinClass.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Base Fare ({passengerCount} x ${singleBaseFare}):</span>
          <span className="font-mono text-slate-800">${totalBaseFare.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Seat Reservation Fees:</span>
          <span className="font-mono text-slate-800">${totalSeatFees.toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-bold text-[#10243A]">
          <span>Total Booking Price:</span>
          <span className="font-mono font-black text-lg text-[#2563EB]">${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={!selectedFlight || !allPassengersAssigned || loading}
        onClick={onConfirmBooking}
        className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
          !selectedFlight || !allPassengersAssigned || loading
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-lg'
        }`}
      >
        {loading ? (
          <span className="flex items-center space-x-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Confirming Reservation...</span>
          </span>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Simulated Reservation</span>
          </>
        )}
      </button>

      {/* Confirmation & Boarding Passes Display */}
      {latestReservations && latestReservations.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Reservation Confirmed ({latestReservations.length} Ticket{latestReservations.length > 1 ? 's' : ''})</span>
          </div>

          <div className="space-y-2">
            {latestReservations.map((res) => (
              <div key={res.pnr} className="p-3 bg-white rounded-xl border border-emerald-300 shadow-sm">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-800">{res.passenger_name}</span>
                  <span className="font-mono font-bold text-[#10243A] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    PNR: {res.pnr}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-slate-600 text-[11px]">
                  <span>Flight {res.flight_number} • Seat {res.seat_number}</span>
                  <span className="font-mono text-emerald-600 font-semibold">{res.status}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-emerald-700 italic">
            Reference code(s) synchronized to the Binary Search Tree (BST) index and Undo Stack.
          </p>
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>ACID Compliant SQLite Transaction • In-Memory Concurrent Locking</span>
      </div>

    </div>
  );
};
