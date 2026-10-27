import React from 'react';
import { Seat, Flight, PassengerProfile, Reservation, PassengerBookingItem } from '../types';

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
}) => {
  // Cabin Class Multiplier
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
  const assignedCount = Object.keys(selectedSeatsByPassenger).length;
  const allAssigned = passengers.length > 0
    ? passengers.every((_, idx) => !!selectedSeatsByPassenger[idx])
    : !!selectedSeat;

  // Find inspected seat (first selected or active)
  const inspectedSeat: Seat | null =
    selectedSeatsByPassenger[0] || selectedSeat || (passengers[0] && selectedSeatsByPassenger[0]) || null;

  return (
    <div className="sticky top-28 space-y-4">
      {/* Active Seat Inspector Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-md border border-border-subtle">
        {/* Header of Inspector Card */}
        <div className="flex items-start justify-between pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block">
              Seat Reservation Review
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-navy">
              {inspectedSeat ? `Seat ${inspectedSeat.seat_number}` : 'Select a Seat'}
            </h3>
            <p className="text-xs text-charcoal-muted">
              {inspectedSeat
                ? `${inspectedSeat.category} • ${inspectedSeat.cabin_class.replace('_', ' ')}`
                : `${selectedCabinClass.replace('_', ' ')} Deck`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-crimson-light text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">airline_seat_individual_suite</span>
          </div>
        </div>

        {/* 3D Cabin Atmosphere Preview Photo */}
        <div className="w-full h-40 rounded-xl overflow-hidden relative shadow-sm my-3 border border-border-subtle">
          <img
            alt="X Airways Airbus A380 luxurious Business Class cabin interior featuring polished wood veneers and lie-flat seating."
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0_NDTGV8nRQwE3B7uu6XmhNBiMhAN0VIyTCrr-78qEN3wNFnhZMsJJCrnvJETMbaZ71VbwcRQkRextDRluPMe78HDH6_n5ukaAz-XaJX9MIFoDAhap9n1N1Q06T6CQfuQocAGVTB7HK4T_5n_HRNA5rHit5t_Xvb4NXWKSeVQhFZD8WwGnboJbXT5YsAGqDu4UcbLSYCHwQP5-L1dR8WxcKntXgkhrtc37GsRQWW6CTBd2ms_052w"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-navy/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-secondary-container">
              <span className="material-symbols-outlined text-[15px]">view_in_ar</span>
              <span>3D Inflight View</span>
            </span>
            <span className="bg-slate-navy/80 px-2 py-0.5 rounded text-gold-light text-[10px] font-mono">
              {selectedFlight ? `${selectedFlight.flight_number} • ${selectedFlight.aircraft_type}` : 'Flagship Fleet'}
            </span>
          </div>
        </div>

        {/* Ergonomic Specifications Checklist */}
        <div className="space-y-2 py-2 border-y border-border-subtle">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-navy">
            Cabin Privileges &amp; Ergonomics
          </h4>
          <div className="space-y-1.5 text-xs text-slate-navy">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">king_bed</span>
              <span>
                <strong>
                  {selectedCabinClass === 'FIRST'
                    ? 'Private Enclosed Suite with Sliding Doors'
                    : selectedCabinClass === 'BUSINESS'
                      ? '78" Fully Flat Bed with Soft Mattress'
                      : 'Ergonomic Contoured Seat with Adjustable Headrest'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">tv</span>
              <span>
                <strong>6,500+ ice Channels</strong> on HD personal display
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">restaurant</span>
              <span>
                <strong>Gourmet Multi-Course Dining</strong> &amp; Sommelier selection
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">wifi</span>
              <span>
                <strong>Complimentary Onboard Wi-Fi</strong> for X Airways members
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Passenger Badges */}
        <div className="bg-surface-container-low p-3 rounded-xl mt-3 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
            Passenger Seat Allocations ({assignedCount}/{passengerCount})
          </label>
          {passengers.map((p, idx) => {
            const s = selectedSeatsByPassenger[idx];
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-container text-white text-[10px] font-bold flex items-center justify-center">
                    {p.firstName ? p.firstName[0].toUpperCase() : idx + 1}
                  </span>
                  <span className="font-semibold text-slate-navy">
                    {p.name || `${p.firstName || 'Traveler'} ${p.lastName || idx + 1}`.trim()}
                  </span>
                </div>
                <span className={`font-mono font-bold ${s ? 'text-primary' : 'text-charcoal-muted italic'}`}>
                  {s ? `Seat ${s.seat_number} (+$${s.price})` : 'Unassigned'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Financial Summary & Breakdown */}
        <div className="pt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span>Base Itinerary Fare ({passengerCount} Traveler{passengerCount > 1 ? 's' : ''})</span>
            <span className="font-semibold text-slate-navy">${totalBaseFare} USD</span>
          </div>

          <div className="flex items-center justify-between text-charcoal-muted">
            <span>Seat Selection Surcharges</span>
            <span className="font-semibold text-secondary">
              {totalSeatFees > 0 ? `+$${totalSeatFees} USD` : '$0.00 (Tier Benefit)'}
            </span>
          </div>

          <div className="pt-2 border-t border-border-subtle flex items-baseline justify-between">
            <div>
              <span className="text-xs font-bold text-slate-navy block">Grand Total Fare</span>
              <p className="text-[10px] text-charcoal-muted">All taxes &amp; carrier surcharges inclusive</p>
            </div>
            <span className="font-serif text-2xl font-bold text-slate-navy">
              ${grandTotal} <span className="text-xs font-sans font-normal text-charcoal-muted">USD</span>
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-4 space-y-2">
          <button
            type="button"
            disabled={loading || !allAssigned}
            onClick={onConfirmBooking}
            className={`w-full py-3.5 px-4 rounded-xl font-serif text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
              allAssigned
                ? 'bg-primary-container hover:bg-crimson-deep text-white cursor-pointer'
                : 'bg-surface-container-high text-charcoal-muted cursor-not-allowed opacity-75'
            }`}
          >
            <span>
              {allAssigned
                ? 'Review & Confirm Seat Reservations'
                : `Assign Seats for All Travelers (${assignedCount}/${passengerCount})`}
            </span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          {!allAssigned && (
            <p className="text-[10px] text-primary text-center font-medium">
              Click available seats on the map above to allocate seats for each traveler.
            </p>
          )}
        </div>

        {/* Reassurance Badge */}
        <div className="mt-4 flex items-center gap-2 text-charcoal-muted text-[11px] bg-surface-container-low p-2.5 rounded-lg border border-border-subtle">
          <span className="material-symbols-outlined text-[16px] text-gold-metallic">verified_user</span>
          <span>Complimentary seat modifications permitted via Manage Booking.</span>
        </div>
      </div>

      {/* X Airways Perks Mini Banner */}
      <div className="bg-gradient-to-r from-slate-navy to-tertiary text-white rounded-xl p-4 shadow-sm flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary-container text-[26px]">stars</span>
          <div>
            <p className="text-xs font-bold text-gold-light">X Airways Miles Guarantee</p>
            <p className="text-[10px] text-surface-container-highest/80">Earn up to 14,200 Tier Miles on this reservation</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-surface-container-lowest/40">chevron_right</span>
      </div>
    </div>
  );
};
