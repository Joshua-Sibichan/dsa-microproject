import React from 'react';
import { Flight, PassengerBookingItem, Reservation, Seat } from '../types';
import { FareBrand, FARE_META } from './FlightResultsPanel';
import { SearchCriteria } from './FlightSearchPanel';

interface ConfirmationPanelProps {
  flight: Flight;
  criteria: SearchCriteria;
  fareBrand: FareBrand;
  farePerAdult: number;
  passengers: PassengerBookingItem[];
  selectedSeatsByPassenger: Record<number, Seat>;
  reservations: Reservation[];
  onBackToSeats: () => void;
  onStartNew: () => void;
}

export const ConfirmationPanel: React.FC<ConfirmationPanelProps> = ({
  flight,
  criteria,
  fareBrand,
  farePerAdult,
  passengers,
  selectedSeatsByPassenger,
  reservations,
  onBackToSeats,
  onStartNew,
}) => {
  const paxCount = Math.max(1, passengers.length);
  const baseTotal = farePerAdult * paxCount;
  const seatFees = Object.values(selectedSeatsByPassenger).reduce((s, seat) => s + (seat.price || 0), 0);
  const grand = baseTotal + seatFees;
  const confirmed = reservations.length > 0;

  return (
    <section className="space-y-6">
      {/* Top Banner */}
      {!confirmed ? (
        <div className="bg-surface-container-low p-4 sm:px-6 rounded-xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <button
            type="button"
            onClick={onBackToSeats}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-crimson-deep transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Modify Seat Selection</span>
          </button>

          <p className="text-xs text-charcoal-muted">
            Final review: Verify flight itinerary and seat allocations before locking database inventory.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/10 p-5 sm:p-6 text-slate-navy flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">verified</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-navy">
                Seat Reservation Confirmed
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active in Database
              </span>
            </div>
            <p className="text-xs text-charcoal-muted max-w-2xl leading-relaxed">
              Your simulated seat reservation has been recorded in the database. Use your Booking Reference (PNR) to retrieve or modify your seats in the <strong>Manage Booking</strong> tab.
            </p>
          </div>
        </div>
      )}

      {/* Main Review Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Itinerary & Passengers (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Flight Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-border-subtle shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">flight_takeoff</span>
                <h3 className="font-serif text-base font-bold text-slate-navy">Flight Details</h3>
              </div>
              <span className="text-xs font-mono font-bold text-primary bg-crimson-light px-2.5 py-0.5 rounded-full">
                {flight.flight_number}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-charcoal-muted uppercase text-[10px] block">Departure</span>
                <span className="font-bold text-sm text-slate-navy block mt-0.5">{flight.departure_time}</span>
                <span className="text-charcoal-muted font-medium">{flight.origin_city} ({flight.origin})</span>
                <span className="text-[11px] text-charcoal-muted block mt-0.5">{criteria.departDate}</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-charcoal-muted font-mono text-[11px]">{flight.duration || '7h 15m'}</span>
                <div className="w-24 h-0.5 bg-border-subtle my-1 relative">
                  <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-gold-metallic"></div>
                </div>
                <span className="text-[10px] text-secondary font-semibold uppercase">
                  {flight.is_connecting ? '1 Stop via DXB' : 'Non-Stop'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-charcoal-muted uppercase text-[10px] block">Arrival</span>
                <span className="font-bold text-sm text-slate-navy block mt-0.5">{flight.arrival_time}</span>
                <span className="text-charcoal-muted font-medium">{flight.destination_city} ({flight.destination})</span>
                <span className="text-[11px] text-charcoal-muted block mt-0.5">{criteria.departDate}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-[11px] text-charcoal-muted">
              <span>Aircraft: <strong className="text-slate-navy">{flight.aircraft_type}</strong></span>
              <span>Fare Tier: <strong className="text-secondary">{FARE_META[fareBrand].label}</strong></span>
              <span>Cabin: <strong className="text-slate-navy">{criteria.cabinClass.replace('_', ' ')}</strong></span>
            </div>
          </div>

          {/* Passenger & Seat Allocations Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-border-subtle shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">airline_seat_recline_extra</span>
                <h3 className="font-serif text-base font-bold text-slate-navy">Passenger &amp; Seat Allocations</h3>
              </div>
              <span className="text-xs text-charcoal-muted font-medium">
                {paxCount} Traveler{paxCount > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {passengers.map((p, idx) => {
                const seat = selectedSeatsByPassenger[idx];
                const res = reservations[idx];

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface-container-low/60 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-navy text-gold-light text-xs font-bold flex items-center justify-center">
                        {p.firstName ? p.firstName[0].toUpperCase() : idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-navy">
                          {p.title ? `${p.title}. ` : ''}{p.name || `Traveler ${idx + 1}`}
                          <span className="ml-2 text-[10px] text-charcoal-muted uppercase font-normal">
                            ({p.type || 'adult'})
                          </span>
                        </div>
                        <div className="text-[11px] text-charcoal-muted">{p.email || 'traveler@aero.org'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      {res && (
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] text-charcoal-muted uppercase font-bold block">PNR Reference</span>
                          <span className="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded border border-border-subtle">
                            {res.pnr}
                          </span>
                        </div>
                      )}

                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-charcoal-muted uppercase font-bold block">Assigned Seat</span>
                        <span className="font-bold text-slate-navy text-sm font-mono">
                          {seat ? `Seat ${seat.seat_number}` : 'Unassigned'}
                        </span>
                        {seat && seat.price > 0 && (
                          <span className="text-[10px] text-secondary font-mono block">+${seat.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Ledger & Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-border-subtle shadow-sm space-y-4">
            <h4 className="font-serif text-base font-bold text-slate-navy border-b border-border-subtle pb-3">
              Fare &amp; Payment Summary
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-charcoal-muted">
                <span>Base Airfare ({paxCount} × ${farePerAdult})</span>
                <span className="font-semibold text-slate-navy">${baseTotal} USD</span>
              </div>

              <div className="flex items-center justify-between text-charcoal-muted">
                <span>Seat Selection Fees</span>
                <span className="font-semibold text-secondary">
                  {seatFees > 0 ? `+$${seatFees} USD` : '$0.00 (Complimentary)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-charcoal-muted">
                <span>Taxes &amp; Airport Security Fees</span>
                <span className="font-semibold text-slate-navy">$0.00 (Included)</span>
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-navy block">Total Amount</span>
                  <span className="text-[10px] text-charcoal-muted">Simulated booking</span>
                </div>
                <span className="font-serif text-2xl font-bold text-slate-navy">
                  ${grand} <span className="text-xs font-sans text-charcoal-muted font-normal">USD</span>
                </span>
              </div>
            </div>

            {/* PNR Highlights when confirmed */}
            {confirmed && (
              <div className="pt-3 border-t border-border-subtle bg-gold-light/40 p-3 rounded-xl border border-gold-metallic/30 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
                  Active Booking References
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {reservations.map((r) => (
                    <span
                      key={r.pnr}
                      className="font-mono font-bold text-xs bg-slate-navy text-gold-light px-2.5 py-1 rounded-lg"
                    >
                      {r.pnr}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              {!confirmed ? (
                <p className="text-[11px] text-charcoal-muted text-center">
                  Clicking confirm will commit these seat selections into the database via atomic batch reservation.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={onStartNew}
                  className="w-full py-3 px-4 bg-primary-container hover:bg-crimson-deep text-white font-serif font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Book Another Itinerary</span>
                </button>
              )}
            </div>
          </div>

          {/* Guarantee Reassurance Card */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle flex items-start gap-2.5 text-xs text-charcoal-muted">
            <span className="material-symbols-outlined text-[18px] text-gold-metallic shrink-0 mt-0.5">
              shield
            </span>
            <span>
              All seats are reserved with concurrency locks and duplicate-assignment prevention in SQLite.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
