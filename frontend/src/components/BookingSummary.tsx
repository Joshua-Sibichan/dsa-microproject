import React from 'react';
import { Seat, Flight, PassengerProfile, Reservation } from '../types';
import { Plane, CheckCircle2, Ticket, ShieldCheck, QrCode } from 'lucide-react';

interface BookingSummaryProps {
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  passenger: PassengerProfile;
  onConfirmBooking: () => void;
  loading: boolean;
  latestReservation: Reservation | null;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedFlight,
  selectedSeat,
  passenger,
  onConfirmBooking,
  loading,
  latestReservation
}) => {
  const baseFare = 380.0;
  const seatFee = selectedSeat ? selectedSeat.price : 0.0;
  const totalFare = baseFare + seatFee;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
      <div>
        <span className="text-xs font-mono font-bold tracking-wider text-[#C7A66A] uppercase">Itinerary Summary</span>
        <h2 className="text-xl font-bold text-[#10243A]">Booking Confirmation</h2>
        <p className="text-xs text-slate-500 mt-0.5">Review passenger and seat assignment before confirming</p>
      </div>

      {/* Flight Mini-Leg */}
      {selectedFlight && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-sm text-[#10243A]">{selectedFlight.flight_number}</span>
            <span className="text-xs font-semibold text-slate-500">{selectedFlight.aircraft_type}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800 text-sm">{selectedFlight.origin}</div>
              <div className="text-slate-500">{selectedFlight.departure_time}</div>
            </div>
            <Plane className="w-4 h-4 text-[#C7A66A] transform rotate-90" />
            <div className="text-right">
              <div className="font-bold text-slate-800 text-sm">{selectedFlight.destination}</div>
              <div className="text-slate-500">{selectedFlight.arrival_time}</div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Seat Details */}
      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned Seat</div>
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
          <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            ⚠️ No seat selected yet. Click an available seat on the cabin map or use the AI Recommender.
          </div>
        )}
      </div>

      {/* Passenger Manifest */}
      <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100">
        <div className="flex justify-between">
          <span className="text-slate-500">Passenger:</span>
          <span className="font-semibold text-slate-800">{passenger.name || 'Anonymous Traveler'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Contact:</span>
          <span className="font-mono text-slate-800">{passenger.email || 'passenger@aero.org'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Fare Base:</span>
          <span className="font-mono text-slate-800">${baseFare.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Seat Reservation Fee:</span>
          <span className="font-mono text-slate-800">${seatFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-[#10243A]">
          <span>Total Fare:</span>
          <span className="font-mono text-base">${totalFare.toFixed(2)}</span>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        type="button"
        disabled={!selectedSeat || loading}
        onClick={onConfirmBooking}
        className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide uppercase transition-all shadow-md flex items-center justify-center space-x-2 ${
          selectedSeat && !loading
            ? 'bg-[#C7A66A] hover:bg-[#d8b97c] text-[#10243A] hover:shadow-lg'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <ShieldCheck className="w-5 h-5" />
        <span>{loading ? 'Confirming Reservation...' : 'Confirm Seat Reservation'}</span>
      </button>

      {/* Real-time Generated Boarding Pass Preview */}
      {latestReservation && (
        <div className="mt-6 pt-6 border-t border-slate-200 animate-in fade-in duration-300">
          <div className="bg-[#10243A] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-navy-800">
            
            {/* Watermark Crest */}
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <Plane className="w-40 h-40 text-white" />
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-navy-800 relative z-10">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#C7A66A] font-bold uppercase">Official Boarding Pass</span>
                <h3 className="font-serif text-lg font-bold">AeroSeat Express</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase">Booking Reference (PNR)</span>
                <div className="font-mono text-xl font-bold text-[#C7A66A]">{latestReservation.pnr}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 relative z-10 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">PASSENGER</span>
                <span className="font-bold text-sm text-white">{latestReservation.passenger_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">FLIGHT</span>
                <span className="font-bold text-sm font-mono text-white">{latestReservation.flight_number || 'EK-201'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ROUTE</span>
                <span className="font-bold text-sm text-white">{latestReservation.origin || 'DXB'} → {latestReservation.destination || 'JFK'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SEAT / CLASS</span>
                <span className="font-bold text-sm font-mono text-[#C7A66A]">
                  {latestReservation.seat_number} ({latestReservation.cabin_class || 'ECONOMY'})
                </span>
              </div>
            </div>

            {/* Simulated Barcode / QR */}
            <div className="pt-4 border-t border-dashed border-navy-800 flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block">ENCRYPTED RESERVATION TOKEN</span>
                <div className="h-6 w-36 bg-slate-700/80 rounded flex items-center px-2 space-x-1">
                  <div className="w-1 h-4 bg-white"></div>
                  <div className="w-2 h-4 bg-white"></div>
                  <div className="w-1 h-4 bg-white"></div>
                  <div className="w-3 h-4 bg-white"></div>
                  <div className="w-1 h-4 bg-white"></div>
                  <div className="w-2 h-4 bg-white"></div>
                  <div className="w-1 h-4 bg-white"></div>
                  <div className="w-2 h-4 bg-white"></div>
                </div>
              </div>
              <div className="text-right text-[10px] text-emerald-400 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>CONFIRMED & INDEXED (BST)</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
