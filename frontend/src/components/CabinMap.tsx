import React, { useState } from 'react';
import { Seat, RecommendedSeat, PassengerBookingItem } from '../types';

interface CabinMapProps {
  seats: Seat[];
  selectedSeat: Seat | null;
  onSelectSeat: (seat: Seat) => void;
  recommendedSeat: RecommendedSeat | null;
  highlightedGroupSeats: string[];
  passengers?: PassengerBookingItem[];
  activePassengerIndex?: number;
  onSelectActivePassenger?: (index: number) => void;
  selectedSeatsByPassenger?: Record<number, Seat>;
}

export const CabinMap: React.FC<CabinMapProps> = ({
  seats,
  selectedSeat,
  onSelectSeat,
  recommendedSeat,
  highlightedGroupSeats,
  passengers = [],
  activePassengerIndex = 0,
  onSelectActivePassenger,
  selectedSeatsByPassenger = {},
}) => {
  const [deck, setDeck] = useState<'upper' | 'main' | 'all'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Group seats by cabin class & rows
  const seatAssignedToPassengerMap: Record<string, number> = {};
  Object.entries(selectedSeatsByPassenger).forEach(([pIdx, s]) => {
    if (s) {
      seatAssignedToPassengerMap[s.seat_number] = Number(pIdx);
    }
  });

  // Filter seats according to deck
  const filteredSeats = seats.filter((s) => {
    if (deck === 'upper') {
      return s.cabin_class === 'FIRST' || s.cabin_class === 'BUSINESS';
    }
    if (deck === 'main') {
      return s.cabin_class === 'PREMIUM_ECONOMY' || s.cabin_class === 'ECONOMY';
    }
    return true;
  });

  // Group filtered seats by row
  const rowsMap = filteredSeats.reduce((acc, seat) => {
    if (!acc[seat.row_number]) {
      acc[seat.row_number] = [];
    }
    acc[seat.row_number].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  const rowNumbers = Object.keys(rowsMap)
    .map(Number)
    .sort((a, b) => a - b);

  const adjustZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(parseFloat((prev + delta).toFixed(2)), 0.85), 1.25));
  };

  const getInitials = (p?: PassengerBookingItem, idx?: number): string => {
    if (!p) return `P${(idx ?? 0) + 1}`;
    if (p.firstName && p.lastName) {
      return `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
    }
    if (p.name) {
      const parts = p.name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `P${(idx ?? 0) + 1}`;
  };

  const allocatedCount = Object.keys(selectedSeatsByPassenger).length;
  const totalPax = Math.max(1, passengers.length);

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-Header & Passenger Switcher Strip */}
      <div className="bg-surface-container-low p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-serif font-bold text-sm text-slate-navy">
              Select Passenger To Assign Seat
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>
              {allocatedCount} of {totalPax} Seats Allocated
            </span>
          </div>
        </div>

        {/* Passenger Switcher Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {passengers.map((p, idx) => {
            const isActive = idx === activePassengerIndex;
            const assignedSeat = selectedSeatsByPassenger[idx];
            const initials = getInitials(p, idx);
            const displayName = p.name || `${p.firstName || 'Traveler'} ${p.lastName || idx + 1}`.trim();

            return (
              <button
                key={p.passengerIndex ?? idx}
                type="button"
                onClick={() => onSelectActivePassenger?.(idx)}
                className={`group flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all shadow-sm shrink-0 text-left ${
                  isActive
                    ? 'bg-slate-navy text-white shadow-md ring-2 ring-primary-container'
                    : 'bg-white hover:bg-gold-light/40 text-slate-navy border border-border-subtle'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    isActive
                      ? 'bg-primary-container text-white'
                      : 'bg-surface-container-high text-slate-navy'
                  }`}
                >
                  {initials}
                </div>

                <div>
                  <p className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-navy'}`}>
                    {displayName}
                  </p>
                  <p className="text-[10px] text-secondary-container flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">airline_seat_recline_extra</span>
                    <span>
                      {assignedSeat ? `Seat ${assignedSeat.seat_number} • $${assignedSeat.price}` : 'No seat selected'}
                    </span>
                  </p>
                </div>

                {assignedSeat ? (
                  <span className="material-symbols-outlined text-gold-metallic text-[18px]">
                    check_circle
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-dashed border-charcoal-muted"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deck Switcher & Quick Jumps Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 border border-border-subtle shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Deck Toggle Pill */}
        <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setDeck('upper')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              deck === 'upper'
                ? 'bg-slate-navy text-white shadow-sm'
                : 'text-charcoal-muted hover:text-slate-navy'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-secondary-container">flight_class</span>
            <span>Upper Deck (First &amp; Business)</span>
          </button>

          <button
            type="button"
            onClick={() => setDeck('main')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              deck === 'main'
                ? 'bg-slate-navy text-white shadow-sm'
                : 'text-charcoal-muted hover:text-slate-navy'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">group</span>
            <span>Main Deck (Prem Econ &amp; Econ)</span>
          </button>

          <button
            type="button"
            onClick={() => setDeck('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              deck === 'all'
                ? 'bg-slate-navy text-white shadow-sm'
                : 'text-charcoal-muted hover:text-slate-navy'
            }`}
          >
            <span>All Decks</span>
          </button>
        </div>

        {/* Quick Jump & Zoom Controls */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-charcoal-muted mr-1 hidden sm:inline">Jump:</span>
            <a
              href="#first-class-section"
              className="px-2 py-1 rounded bg-surface-container hover:bg-gold-light text-slate-navy text-[11px] font-semibold transition-colors"
            >
              First
            </a>
            <a
              href="#business-class-section"
              className="px-2 py-1 rounded bg-surface-container hover:bg-gold-light text-slate-navy text-[11px] font-semibold transition-colors"
            >
              Business
            </a>
            <a
              href="#economy-class-section"
              className="px-2 py-1 rounded bg-surface-container hover:bg-gold-light text-slate-navy text-[11px] font-semibold transition-colors"
            >
              Economy
            </a>
          </div>

          <div className="h-4 w-px bg-border-subtle"></div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-border-subtle">
            <button
              type="button"
              onClick={() => adjustZoom(-0.05)}
              className="p-1 text-charcoal-muted hover:text-slate-navy rounded hover:bg-white"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-navy font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => adjustZoom(0.05)}
              className="p-1 text-charcoal-muted hover:text-slate-navy rounded hover:bg-white"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seat Map Legend Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-3 border border-border-subtle shadow-sm flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-primary-container text-white flex items-center justify-center text-[10px] font-bold">
            P1
          </div>
          <span className="text-slate-navy font-semibold">Selected</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-white border-2 border-slate-navy/40 flex items-center justify-center text-[9px] text-slate-navy font-bold">
            12A
          </div>
          <span className="text-slate-navy font-semibold">Available</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-seat-occupied flex items-center justify-center text-charcoal-muted">
            <span className="material-symbols-outlined text-[12px]">lock</span>
          </div>
          <span className="text-charcoal-muted font-semibold">Occupied</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-gold-light border border-secondary flex items-center justify-center text-[10px] font-bold text-secondary">
            ★
          </div>
          <span className="text-secondary font-semibold">Extra Legroom</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-error">exit_to_app</span>
          <span className="text-charcoal-muted font-medium">Exit Door</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-charcoal-muted">wc</span>
          <span className="text-charcoal-muted font-medium">Lavatory</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-gold-metallic">local_bar</span>
          <span className="text-secondary font-medium">A380 Lounge</span>
        </div>
      </div>

      {/* Fuselage Container Canvas */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-8 shadow-inner overflow-x-auto relative border border-border-subtle">
        <div
          className="w-full max-w-[640px] mx-auto bg-surface-container-lowest rounded-t-[140px] rounded-b-[40px] shadow-md relative p-4 sm:p-6 transition-transform origin-top duration-200 border border-border-subtle"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Nose Radome & Aerodynamic Marker */}
          <div className="flex flex-col items-center pt-2 pb-6">
            <div className="w-14 h-1.5 bg-surface-container-highest rounded-full mb-3"></div>
            <div className="flex items-center gap-2 text-charcoal-muted text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-gold-metallic rotate-180">
                airplanemode_active
              </span>
              <span className="tracking-widest uppercase font-mono text-[11px]">
                Aircraft Nose • Forward Fuselage
              </span>
            </div>
          </div>

          {/* Forward Galley & First Class Shower Spa Section */}
          <div className="bg-surface-container-low rounded-xl p-3.5 mb-6 relative overflow-hidden border border-border-subtle">
            <div className="flex items-center justify-between text-charcoal-muted text-xs pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-gold-metallic">shower</span>
                <span className="font-semibold text-slate-navy">Shower Spa (2 Suites)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] uppercase font-bold text-charcoal-muted">
                  Galley 1
                </span>
                <span className="material-symbols-outlined text-[16px]">stairs</span>
                <span className="text-[10px] uppercase font-bold text-charcoal-muted">Grand Stairs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-charcoal-muted">wc</span>
                <span className="font-semibold text-slate-navy">Lavatories</span>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-gold-metallic/20 via-gold-metallic/60 to-gold-metallic/20 rounded-full"></div>
          </div>

          {/* Emergency Exit Row 1 */}
          <div className="my-4 flex items-center justify-between px-3 bg-surface-container py-2 rounded-lg text-xs">
            <span className="font-bold text-slate-navy tracking-wider uppercase">Emergency Exit Doors 1L / 1R</span>
            <div className="flex items-center gap-1 text-error font-semibold">
              <span className="material-symbols-outlined text-[16px]">emergency_home</span>
              <span>Slide Raft</span>
            </div>
          </div>

          {/* Render Cabin Rows */}
          {rowNumbers.length === 0 ? (
            <div className="p-8 text-center text-charcoal-muted text-xs">
              No seats found for selected deck filter.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group by cabin class for visual headers */}
              {['FIRST', 'BUSINESS', 'PREMIUM_ECONOMY', 'ECONOMY'].map((cabin) => {
                const cabinRows = rowNumbers.filter((r) =>
                  rowsMap[r]?.some((s) => s.cabin_class === cabin)
                );
                if (cabinRows.length === 0) return null;

                const cabinTitle =
                  cabin === 'FIRST'
                    ? 'First Class Private Suites'
                    : cabin === 'BUSINESS'
                      ? 'Business Class Cabin'
                      : cabin === 'PREMIUM_ECONOMY'
                        ? 'Premium Economy'
                        : 'Economy Class';

                const cabinId =
                  cabin === 'FIRST'
                    ? 'first-class-section'
                    : cabin === 'BUSINESS'
                      ? 'business-class-section'
                      : 'economy-class-section';

                return (
                  <div key={cabin} id={cabinId} className="space-y-3">
                    {/* Section Header */}
                    <div className="flex items-center justify-between px-2 pt-2 border-t border-border-subtle">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            cabin === 'FIRST'
                              ? 'bg-gold-metallic'
                              : cabin === 'BUSINESS'
                                ? 'bg-primary-container'
                                : cabin === 'PREMIUM_ECONOMY'
                                  ? 'bg-[#2B5273]'
                                  : 'bg-[#4A5568]'
                          }`}
                        ></span>
                        <h4 className="font-serif text-sm font-bold text-slate-navy">{cabinTitle}</h4>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-charcoal-muted bg-surface-container px-2 py-0.5 rounded-full">
                        {cabin === 'FIRST' ? '1-2-1 Enclosed Suites' : cabin === 'BUSINESS' ? '1-2-1 Lie-Flat' : 'Spacious Pitch'}
                      </span>
                    </div>

                    {/* Cabin Row Grid */}
                    <div className="space-y-2">
                      {cabinRows.map((rowNum) => {
                        const rowSeats = rowsMap[rowNum] || [];
                        // Sort by seat letter
                        const sortedSeats = [...rowSeats].sort((a, b) =>
                          a.column_letter.localeCompare(b.column_letter)
                        );

                        // Split seats into left, middle, right for realistic aisle geometry
                        const leftSeats = sortedSeats.filter((s) => ['A', 'B', 'C'].includes(s.column_letter));
                        const middleSeats = sortedSeats.filter((s) => ['D', 'E', 'F', 'G'].includes(s.column_letter));
                        const rightSeats = sortedSeats.filter((s) => ['H', 'J', 'K'].includes(s.column_letter));

                        return (
                          <div
                            key={rowNum}
                            className="flex items-center justify-between p-1.5 bg-surface-container-low/50 hover:bg-surface-container-low rounded-xl transition-colors gap-2"
                          >
                            {/* Left Column Group */}
                            <div className="flex items-center gap-1.5 justify-end flex-1">
                              {leftSeats.map((seat) => renderSeatButton(seat))}
                            </div>

                            {/* Row Number Marker */}
                            <div className="w-8 text-center font-mono font-bold text-xs text-charcoal-muted">
                              {rowNum}
                            </div>

                            {/* Center Column Group */}
                            <div className="flex items-center gap-1.5 justify-center flex-1">
                              {middleSeats.map((seat) => renderSeatButton(seat))}
                            </div>

                            {/* Row Number Marker (for symmetry if right seats exist) */}
                            {rightSeats.length > 0 && (
                              <div className="w-8 text-center font-mono font-bold text-xs text-charcoal-muted">
                                {rowNum}
                              </div>
                            )}

                            {/* Right Column Group */}
                            <div className="flex items-center gap-1.5 justify-start flex-1">
                              {rightSeats.map((seat) => renderSeatButton(seat))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Over-Wing Emergency Exit Banner */}
          <div className="my-6 py-2 px-3 bg-surface-container rounded-lg flex items-center justify-between text-charcoal-muted text-xs">
            <div className="flex items-center gap-1.5 text-error">
              <span className="material-symbols-outlined text-[16px]">exit_to_app</span>
              <span className="font-bold">Overwing Exit 2L / 2R</span>
            </div>
            <span className="text-charcoal-muted italic text-[11px]">Airbus A380 Wing Root Level</span>
            <div className="flex items-center gap-1.5 text-error">
              <span className="font-bold">Exit</span>
              <span className="material-symbols-outlined text-[16px]">exit_to_app</span>
            </div>
          </div>

          {/* Rear of Upper Deck: A380 Onboard Lounge & Bar Schematic */}
          <div
            className="mt-8 bg-slate-navy text-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden border border-white/10"
            id="lounge-section"
          >
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-gold-metallic/10 blur-xl pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-light/20 flex items-center justify-center text-secondary-container">
                  <span className="material-symbols-outlined text-[22px]">local_bar</span>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-gold-light">A380 Onboard Lounge &amp; Bar</h4>
                  <p className="text-[11px] text-surface-container-highest/80">Exclusive to First &amp; Business Class Travellers</p>
                </div>
              </div>
              <span className="bg-gold-metallic text-slate-navy px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto">
                40,000 FT Social Lounge
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-3 text-center">
              <div className="bg-surface-container-lowest/10 p-2.5 rounded-xl">
                <span className="material-symbols-outlined text-[20px] text-gold-light">wine_bar</span>
                <p className="text-[11px] font-bold text-surface-container-lowest mt-1">Hors d'œuvres &amp; Bar</p>
                <p className="text-[10px] text-charcoal-muted">Dedicated Bartender</p>
              </div>
              <div className="bg-surface-container-lowest/10 p-2.5 rounded-xl">
                <span className="material-symbols-outlined text-[20px] text-gold-light">weekend</span>
                <p className="text-[11px] font-bold text-surface-container-lowest mt-1">Sofa Seating</p>
                <p className="text-[10px] text-charcoal-muted">Leather banquettes</p>
              </div>
              <div className="bg-surface-container-lowest/10 p-2.5 rounded-xl">
                <span className="material-symbols-outlined text-[20px] text-gold-light">live_tv</span>
                <p className="text-[11px] font-bold text-surface-container-lowest mt-1">Live Satellite TV</p>
                <p className="text-[10px] text-charcoal-muted">55" ice Entertainment</p>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between text-surface-container-highest/70 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">restaurant</span>
                <span>Aft Main Galley</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">wc</span> Lavatory D
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">wc</span> Lavatory E
                </span>
              </div>
            </div>
          </div>

          {/* Rear Fuselage Tail Marker */}
          <div className="text-center pt-8 pb-2">
            <span className="text-[11px] uppercase tracking-widest text-charcoal-muted font-mono">
              Empennage / Tail Section • Aft Fuselage
            </span>
            <div className="w-16 h-1 bg-surface-container-highest rounded-full mx-auto mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );

  function renderSeatButton(seat: Seat) {
    const isOccupied = seat.status !== 'AVAILABLE';
    const assignedPaxIdx = seatAssignedToPassengerMap[seat.seat_number];
    const isAssigned = assignedPaxIdx !== undefined;
    const isAssignedToActive = isAssigned && assignedPaxIdx === activePassengerIndex;
    const isRecommended = recommendedSeat?.seat_number === seat.seat_number;
    const isGroup = highlightedGroupSeats.includes(seat.seat_number);

    let initials = 'P';
    if (isAssigned) {
      initials = getInitials(passengers[assignedPaxIdx], assignedPaxIdx);
    }

    if (isOccupied) {
      return (
        <div
          key={seat.seat_number}
          className="w-11 h-11 rounded-lg bg-seat-occupied flex flex-col items-center justify-center text-charcoal-muted cursor-not-allowed border border-border-subtle"
          title={`Seat ${seat.seat_number} - Occupied`}
        >
          <span className="text-[10px] font-bold leading-none">{seat.seat_number}</span>
          <span className="material-symbols-outlined text-[12px] mt-0.5">lock</span>
        </div>
      );
    }

    if (isAssigned) {
      return (
        <div key={seat.seat_number} className="relative">
          <button
            type="button"
            onClick={() => onSelectSeat(seat)}
            className={`w-11 h-11 rounded-lg shadow-md flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
              isAssignedToActive
                ? 'bg-primary-container text-white ring-2 ring-primary ring-offset-1'
                : 'bg-slate-navy text-gold-light border border-gold-metallic/50'
            }`}
            title={`Seat ${seat.seat_number} assigned to ${passengers[assignedPaxIdx]?.name || `Passenger ${assignedPaxIdx + 1}`}. Click to unassign or switch.`}
          >
            <span className="text-[10px] font-bold leading-none">{seat.seat_number}</span>
            <span className="text-[9px] uppercase tracking-wider font-bold text-secondary-container mt-0.5">
              {initials}
            </span>
          </button>
          <span className="absolute -top-1 -right-1 bg-gold-metallic text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow">
            ✓
          </span>
        </div>
      );
    }

    return (
      <button
        key={seat.seat_number}
        type="button"
        onClick={() => onSelectSeat(seat)}
        className={`w-11 h-11 rounded-lg bg-surface-container-lowest border shadow-sm flex flex-col items-center justify-center transition-all hover:bg-gold-light active:scale-95 group relative ${
          isRecommended
            ? 'border-gold-metallic ring-2 ring-gold-metallic/50 animate-pulse bg-gold-light/30'
            : isGroup
              ? 'border-secondary ring-2 ring-secondary/40 bg-secondary-container/20'
              : 'border-border-subtle hover:border-primary'
        }`}
        title={`Seat ${seat.seat_number} (${seat.cabin_class.replace('_', ' ')}) - ${seat.category} - $${seat.price}`}
      >
        {seat.category === 'EXTRA_LEGROOM' && (
          <span className="absolute top-0.5 right-0.5 text-[9px] text-gold-metallic leading-none font-bold">
            ★
          </span>
        )}
        <span className="text-[10px] font-bold text-slate-navy group-hover:text-primary leading-none">
          {seat.seat_number}
        </span>
        <span className="text-[8px] text-charcoal-muted mt-0.5 font-mono">
          {seat.price > 0 ? `+$${seat.price}` : 'Free'}
        </span>
      </button>
    );
  }
};
