import React, { useState } from 'react';
import { Seat, RecommendedSeat, PassengerBookingItem } from '../types';
import { Sparkles, Info, Users, Baby, Accessibility, ShieldAlert, Check, UserCheck } from 'lucide-react';

interface CabinMapProps {
  seats: Seat[];
  selectedSeat: Seat | null; // For single passenger backward compat
  onSelectSeat: (seat: Seat) => void;
  recommendedSeat: RecommendedSeat | null;
  highlightedGroupSeats: string[];
  // Multi-passenger props
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
  selectedSeatsByPassenger = {}
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [activeCabinFilter, setActiveCabinFilter] = useState<string>('ALL');

  // Filter seats by cabin class if tab selected
  const displayedSeats = activeCabinFilter === 'ALL'
    ? seats
    : seats.filter(s => s.cabin_class === activeCabinFilter);

  // Group seats by row
  const rowsMap = displayedSeats.reduce((acc, seat) => {
    if (!acc[seat.row_number]) {
      acc[seat.row_number] = [];
    }
    acc[seat.row_number].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  const rowNumbers = Object.keys(rowsMap)
    .map(Number)
    .sort((a, b) => a - b);

  // Map of seat_number -> passenger index
  const seatAssignedToPassengerMap: Record<string, number> = {};
  Object.entries(selectedSeatsByPassenger).forEach(([pIdx, s]) => {
    if (s) {
      seatAssignedToPassengerMap[s.seat_number] = Number(pIdx);
    }
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 relative space-y-6">
      
      {/* Header and Cabin Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-[#C7A66A] uppercase flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Emirates Wide-Body Cabin Deck
          </span>
          <h2 className="text-2xl font-bold text-[#10243A]">Interactive Aircraft Seat Map</h2>
          <p className="text-xs text-slate-500 mt-0.5">Boeing 777-300ER & A380 Wide-body Fuselage (First, Business, Premium Economy & Economy)</p>
        </div>

        {/* Cabin Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium space-x-1 overflow-x-auto">
          {['ALL', 'FIRST', 'BUSINESS', 'PREMIUM_ECONOMY', 'ECONOMY'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveCabinFilter(filter)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeCabinFilter === filter
                  ? 'bg-white text-[#10243A] font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Passenger Assignment Bar (Feature 2 Requirement) */}
      {passengers.length > 0 && (
        <div className="bg-[#10243A] text-white p-4 rounded-2xl shadow-md border border-navy-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono text-[#C7A66A] font-bold uppercase flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#C7A66A]" /> Multi-Passenger Seat Assignment
            </span>
            <span className="text-[11px] text-slate-300">
              Select a passenger, then click any available seat to assign
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {passengers.map((p, idx) => {
              const isActive = activePassengerIndex === idx;
              const assignedSeat = selectedSeatsByPassenger[idx];
              return (
                <button
                  key={`passenger-tab-${idx}`}
                  type="button"
                  onClick={() => onSelectActivePassenger && onSelectActivePassenger(idx)}
                  className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                    isActive
                      ? 'bg-blue-600/90 border-blue-400 text-white ring-2 ring-blue-400/50 shadow'
                      : 'bg-[#18304D] border-slate-700 text-slate-300 hover:bg-[#1E3A5F]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold truncate">
                      P{idx + 1}: {p.name || `Traveler ${idx + 1}`}
                    </span>
                    {assignedSeat && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-300">Seat:</span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                      assignedSeat ? 'bg-white text-slate-900' : 'bg-navy-900/80 text-amber-300'
                    }`}>
                      {assignedSeat ? assignedSeat.seat_number : 'Select'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-5 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-[#168C78] border border-teal-600/40 flex items-center justify-center text-[10px] text-white font-mono font-bold">12</div>
            <span className="text-slate-700 font-medium">Available</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-[#2563EB] ring-2 ring-blue-400 text-white flex items-center justify-center text-[10px] font-mono font-bold">14</div>
            <span className="text-slate-700 font-medium">Selected</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-[#94A3B8] opacity-60 flex items-center justify-center text-[10px] text-slate-100 line-through">18</div>
            <span className="text-slate-700 font-medium">Occupied</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-[#168C78] ring-2 ring-amber-400 flex items-center justify-center text-[10px] text-white">⭐</div>
            <span className="text-slate-700 font-medium">Extra Legroom / Exit Row</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-[#168C78] ring-2 ring-purple-500 pulse-recommended flex items-center justify-center text-[10px] text-white font-bold">AI</div>
            <span className="text-purple-700 font-bold">AI Recommended</span>
          </div>

          {highlightedGroupSeats.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">👥</div>
              <span className="text-emerald-700 font-bold">Group Contiguous</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center">
          <Info className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" />
          <span>Click any seat to assign to the active passenger</span>
        </div>
      </div>

      {/* Aircraft Fuselage Container */}
      <div className="overflow-x-auto py-6">
        <div className="min-w-[680px] max-w-[800px] mx-auto bg-[#F7F9FC] rounded-[48px] p-8 border-4 border-slate-300 fuselage-shadow relative">
          
          {/* Aircraft Nose Graphic */}
          <div className="w-full flex justify-center mb-6">
            <div className="relative">
              <div className="w-36 h-16 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-full border-t-2 border-x-2 border-slate-300 flex items-center justify-center shadow-inner">
                <span className="text-[10px] font-mono tracking-widest text-slate-600 font-bold uppercase">Cockpit / Bow</span>
              </div>
            </div>
          </div>

          {/* Galley & Entry Door Marker */}
          <div className="flex justify-between items-center px-4 py-2 mb-6 bg-slate-200/70 rounded-lg text-[10px] font-mono text-slate-600 font-semibold uppercase">
            <span>🚪 Entry Door 1L (Galley)</span>
            <span>Lavatory & Wardrobe</span>
            <span>🚪 Entry Door 1R</span>
          </div>

          {/* Seat Grid Rows */}
          <div className="space-y-3">
            {rowNumbers.map((rowNum) => {
              const rowSeats = rowsMap[rowNum] || [];
              const firstSeat = rowSeats[0];
              const cabin = firstSeat?.cabin_class;

              // Distinct row divider for cabin transitions
              const isFirstRowOfCabin = rowNum === 1 || rowNum === 6 || rowNum === 12 || rowNum === 15;
              const isExitRow = firstSeat?.is_exit_row;

              return (
                <div key={rowNum}>
                  {isFirstRowOfCabin && (
                    <div className="my-4 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span className="bg-slate-200/80 px-2.5 py-0.5 rounded text-[11px] text-[#10243A]">
                        {cabin.replace('_', ' ')} CLASS
                      </span>
                      <span className="text-[10px] font-normal text-slate-400">
                        {cabin === 'FIRST' && 'Private Suites 1-2-1'}
                        {cabin === 'BUSINESS' && 'Flatbed Direct Aisle Access 1-2-1'}
                        {cabin === 'PREMIUM_ECONOMY' && 'Spacious 2-4-2 Configuration'}
                        {cabin === 'ECONOMY' && 'Standard 3-4-3 Wide-body'}
                      </span>
                    </div>
                  )}

                  {isExitRow && (
                    <div className="my-2 py-1 px-3 bg-amber-50 border border-amber-200 rounded text-center text-[10px] font-bold text-amber-800 flex items-center justify-center space-x-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>EMERGENCY EXIT ROW (Row {rowNum}) — Extra Legroom & Safety Fitness Requirements</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center space-x-3">
                    
                    {/* Left Wing / Window Indicator */}
                    <div className="text-[10px] font-mono font-bold text-slate-400 w-6 text-right">
                      {rowNum}
                    </div>

                    {/* Left Seat Group (e.g. A, B, C or A) */}
                    <div className="flex space-x-1.5">
                      {rowSeats.filter(s => ['A', 'B', 'C'].includes(s.column_letter)).map(seat => renderSeat(seat))}
                    </div>

                    {/* Aisle 1 */}
                    <div className="w-8 h-8 rounded bg-slate-200/50 flex items-center justify-center text-[10px] font-mono font-semibold text-slate-400 select-none">
                      AISLE
                    </div>

                    {/* Center Seat Group (e.g. D, E, F, G or E, F) */}
                    <div className="flex space-x-1.5">
                      {rowSeats.filter(s => ['D', 'E', 'F', 'G'].includes(s.column_letter)).map(seat => renderSeat(seat))}
                    </div>

                    {/* Aisle 2 (if wide-body) */}
                    <div className="w-8 h-8 rounded bg-slate-200/50 flex items-center justify-center text-[10px] font-mono font-semibold text-slate-400 select-none">
                      AISLE
                    </div>

                    {/* Right Seat Group (e.g. H, J, K or K) */}
                    <div className="flex space-x-1.5">
                      {rowSeats.filter(s => ['H', 'J', 'K'].includes(s.column_letter)).map(seat => renderSeat(seat))}
                    </div>

                    {/* Right Row Indicator */}
                    <div className="text-[10px] font-mono font-bold text-slate-400 w-6 text-left">
                      {rowNum}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Aircraft Tail Marker */}
          <div className="w-full flex justify-center mt-8">
            <div className="w-48 py-2 bg-slate-200/60 rounded-b-xl border-b-2 border-slate-300 text-center">
              <span className="text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase">Aircraft Tail / Aft Galley</span>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Hover Seat Inspector Card */}
      {hoveredSeat && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10243A] text-white p-4 rounded-2xl shadow-2xl border border-navy-700 w-72 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-navy-800">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-bold text-[#C7A66A]">{hoveredSeat.seat_number}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-navy-800 text-slate-300 font-medium">
                {hoveredSeat.cabin_class}
              </span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              hoveredSeat.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
            }`}>
              {hoveredSeat.status}
            </span>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="font-medium text-white">{hoveredSeat.category.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Seat Pitch:</span>
              <span className="font-medium text-white">{hoveredSeat.pitch_inches}" Legroom</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Position:</span>
              <span className="font-medium text-white">
                {hoveredSeat.is_window ? 'Window View' : hoveredSeat.is_aisle ? 'Direct Aisle' : 'Middle Seat'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Seat Fee:</span>
              <span className="font-mono font-bold text-[#C7A66A]">
                {hoveredSeat.price > 0 ? `$${hoveredSeat.price.toFixed(2)}` : 'Included in Fare'}
              </span>
            </div>
          </div>

          {hoveredSeat.has_bassinet && (
            <div className="mt-2.5 pt-2 border-t border-navy-800 flex items-center text-[11px] text-amber-300">
              <Baby className="w-3.5 h-3.5 mr-1.5" />
              <span>Bassinet cradle facility available</span>
            </div>
          )}

          {hoveredSeat.is_exit_row && (
            <div className="mt-2.5 pt-2 border-t border-navy-800 flex items-center text-[11px] text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
              <span>Emergency exit: must meet fitness criteria</span>
            </div>
          )}
        </div>
      )}

    </div>
  );

  function renderSeat(seat: Seat) {
    const isOccupied = seat.status === 'RESERVED' || seat.status === 'BLOCKED';
    
    // Check if assigned to any passenger in multi-passenger mode
    const assignedPassengerIdx = seatAssignedToPassengerMap[seat.seat_number];
    const isSelectedByAny = assignedPassengerIdx !== undefined;
    const isSelectedByActive = assignedPassengerIdx === activePassengerIndex;

    // Single passenger fallback
    const isSingleSelected = selectedSeat?.seat_number === seat.seat_number;
    const isSelected = isSelectedByAny || isSingleSelected;

    const isRecommended = recommendedSeat?.seat_number === seat.seat_number;
    const isGroupMatch = highlightedGroupSeats.includes(seat.seat_number);

    let baseBg = 'bg-[#168C78] text-white hover:bg-teal-700';
    let ringClass = '';

    if (isOccupied) {
      baseBg = 'bg-[#94A3B8] opacity-50 cursor-not-allowed line-through text-slate-100';
    } else if (isSelected) {
      baseBg = 'bg-[#2563EB] text-white shadow-lg';
      ringClass = isSelectedByActive
        ? 'ring-4 ring-blue-400 scale-105'
        : 'ring-2 ring-blue-300';
    } else if (isRecommended) {
      baseBg = 'bg-[#168C78] text-white font-bold';
      ringClass = 'ring-4 ring-[#C7A66A] pulse-recommended scale-105';
    } else if (isGroupMatch) {
      baseBg = 'bg-emerald-500 text-white font-bold';
      ringClass = 'ring-2 ring-emerald-300 animate-bounce';
    } else if (seat.category === 'EXTRA_LEGROOM' || seat.category === 'PREFERRED') {
      ringClass = 'ring-1 ring-[#C7A66A]/60';
    }

    return (
      <button
        key={seat.seat_number}
        disabled={isOccupied}
        onClick={() => onSelectSeat(seat)}
        onMouseEnter={() => setHoveredSeat(seat)}
        onMouseLeave={() => setHoveredSeat(null)}
        title={`Seat ${seat.seat_number} (${seat.cabin_class})`}
        className={`w-9 h-10 rounded-lg text-xs font-mono font-semibold flex flex-col items-center justify-center transition-all relative ${baseBg} ${ringClass}`}
      >
        <span className="text-[11px] leading-none">{seat.seat_number}</span>
        
        {/* Passenger indicator badge */}
        {assignedPassengerIdx !== undefined && (
          <span className="text-[8px] font-bold bg-white text-blue-700 rounded-full px-1 absolute -top-1.5 -right-1.5 shadow">
            P{assignedPassengerIdx + 1}
          </span>
        )}

        {seat.has_bassinet && <span className="text-[8px] absolute top-0.5 right-0.5">🍼</span>}
        {seat.category === 'EXTRA_LEGROOM' && !isOccupied && !isSelected && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 absolute bottom-1"></span>
        )}
      </button>
    );
  }
};
