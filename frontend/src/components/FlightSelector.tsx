import React, { useState } from 'react';
import { Plane, Clock, Calendar, CheckCircle2, Users, Search, RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import { Flight } from '../types';

interface FlightSelectorProps {
  flights: Flight[];
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight) => void;
  passengerCount: number;
  setPassengerCount: (count: number) => void;
  selectedCabinClass: string;
  setSelectedCabinClass: (cabinClass: string) => void;
  onSearch?: (origin: string, destination: string) => void;
}

const AIRPORTS = [
  { code: 'ALL', name: 'All Departure Hubs' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International (DXB)' },
  { code: 'LHR', city: 'London', name: 'London Heathrow (LHR)' },
  { code: 'JFK', city: 'New York', name: 'New York JFK (JFK)' },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi (SIN)' },
  { code: 'BKK', city: 'Bangkok', name: 'Bangkok Suvarnabhumi (BKK)' },
  { code: 'BOM', city: 'Mumbai', name: 'Mumbai Chhatrapati Shivaji (BOM)' },
  { code: 'HND', city: 'Tokyo', name: 'Tokyo Haneda (HND)' },
  { code: 'CDG', city: 'Paris', name: 'Paris Charles de Gaulle (CDG)' },
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith (SYD)' },
];

export const FlightSelector: React.FC<FlightSelectorProps> = ({
  flights,
  selectedFlight,
  onSelectFlight,
  passengerCount,
  setPassengerCount,
  selectedCabinClass,
  setSelectedCabinClass,
  onSearch
}) => {
  const [originFilter, setOriginFilter] = useState<string>('ALL');
  const [destFilter, setDestFilter] = useState<string>('ALL');
  const [travelDate, setTravelDate] = useState<string>('2026-11-15');

  // Filter flights by search parameters
  const displayedFlights = flights.filter((fl) => {
    const matchOrigin = originFilter === 'ALL' || fl.origin === originFilter;
    const matchDest = destFilter === 'ALL' || fl.destination === destFilter;
    return matchOrigin && matchDest;
  });

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(originFilter === 'ALL' ? '' : originFilter, destFilter === 'ALL' ? '' : destFilter);
    }
  };

  const handleResetClick = () => {
    setOriginFilter('ALL');
    setDestFilter('ALL');
    if (onSearch) {
      onSearch('', '');
    }
  };

  // Multiplier for cabin class fare estimation
  const getFareForCabin = (baseFare: number, cabin: string): number => {
    switch (cabin) {
      case 'FIRST':
        return Math.round(baseFare * 5.2);
      case 'BUSINESS':
        return Math.round(baseFare * 2.8);
      case 'PREMIUM_ECONOMY':
        return Math.round(baseFare * 1.6);
      case 'ECONOMY':
      default:
        return Math.round(baseFare);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 mb-8 space-y-6">
      
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-[#C7A66A] uppercase flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5" /> X Airways Global Flight Search
          </span>
          <h2 className="text-2xl font-bold text-[#10243A] tracking-tight">Find & Select Your Flight</h2>
          <p className="text-xs text-slate-500 mt-0.5">Explore scheduled wide-body flights, filter by cabin & dates, and proceed to interactive seat selection</p>
        </div>

        <div className="flex items-center text-xs text-slate-500 space-x-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/60">
          <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" /> Daily Operations</span>
          <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" /> On-Time Real-Time GDS</span>
        </div>
      </div>

      {/* Flight Search & Filter Console (Feature 1 Requirement) */}
      <div className="p-5 bg-gradient-to-br from-[#10243A] to-[#1E3A5F] rounded-2xl text-white shadow-lg space-y-4">
        <div className="text-xs font-mono font-semibold tracking-wider text-[#C7A66A] uppercase flex items-center justify-between">
          <span>Flight Parameters & Cabin Preferences</span>
          <span className="text-[11px] text-slate-300 font-normal">Step 1 of 3: Flight Booking</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Departure Airport */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Departure Airport</label>
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="w-full bg-[#0D1B2A] border border-slate-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#C7A66A]"
            >
              {AIRPORTS.map((a) => (
                <option key={`origin-${a.code}`} value={a.code} className="bg-[#10243A]">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Airport */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Destination Airport</label>
            <select
              value={destFilter}
              onChange={(e) => setDestFilter(e.target.value)}
              className="w-full bg-[#0D1B2A] border border-slate-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#C7A66A]"
            >
              <option value="ALL" className="bg-[#10243A]">All Destinations</option>
              {AIRPORTS.filter(a => a.code !== 'ALL').map((a) => (
                <option key={`dest-${a.code}`} value={a.code} className="bg-[#10243A]">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Travel Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Travel Date</label>
            <div className="relative">
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-[#0D1B2A] border border-slate-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#C7A66A]"
              />
            </div>
          </div>

          {/* Passenger Count */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Passenger Count</label>
            <div className="flex items-center space-x-1 bg-[#0D1B2A] border border-slate-600 rounded-xl p-1">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPassengerCount(num)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                    passengerCount === num
                      ? 'bg-[#C7A66A] text-[#10243A] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {num} {num === 1 ? 'Pax' : 'Pax'}
                </button>
              ))}
            </div>
          </div>

          {/* Cabin Class */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cabin Class</label>
            <select
              value={selectedCabinClass}
              onChange={(e) => setSelectedCabinClass(e.target.value)}
              className="w-full bg-[#0D1B2A] border border-slate-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#C7A66A]"
            >
              <option value="ECONOMY" className="bg-[#10243A]">Economy Class</option>
              <option value="PREMIUM_ECONOMY" className="bg-[#10243A]">Premium Economy</option>
              <option value="BUSINESS" className="bg-[#10243A]">Business Class</option>
              <option value="FIRST" className="bg-[#10243A]">First Class Suites</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
          <div className="text-slate-300">
            Showing <span className="font-bold text-white">{displayedFlights.length}</span> flight{displayedFlights.length === 1 ? '' : 's'} available
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetClick}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-600/60"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSearchClick}
              className="px-4 py-1.5 rounded-xl bg-[#C7A66A] hover:bg-[#b89557] text-[#10243A] font-bold text-xs flex items-center space-x-1 shadow-md"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filter Flights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flight Cards Grid */}
      {displayedFlights.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <Plane className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No scheduled services match your route filters.</p>
          <p className="text-xs text-slate-500 mt-1">Try selecting "All Departure Hubs" or reset filters to browse all flights.</p>
          <button
            onClick={handleResetClick}
            className="mt-4 px-4 py-2 bg-[#10243A] text-white text-xs font-semibold rounded-xl hover:bg-navy-800 shadow"
          >
            Show All Flights
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {displayedFlights.map((flight) => {
            const isSelected = selectedFlight?.id === flight.id;
            const fare = getFareForCabin(flight.base_fare || 450, selectedCabinClass);

            return (
              <div
                key={flight.id}
                onClick={() => onSelectFlight(flight)}
                className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#2563EB] bg-blue-50/40 shadow-lg ring-2 ring-blue-500/20 scale-[1.01]'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 shadow-sm'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-[#2563EB]">
                    <CheckCircle2 className="w-5 h-5 fill-current text-white" />
                  </div>
                )}

                <div>
                  {/* Top Bar: Flight Number & Available Count */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-[#10243A] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80">
                      {flight.flight_number}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {flight.available_seats} Seats Available
                    </span>
                  </div>

                  {/* Route & Times */}
                  <div className="flex items-center justify-between my-3">
                    <div>
                      <div className="text-xl font-black text-slate-900 tracking-tight">{flight.origin}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[85px]">{flight.origin_city}</div>
                      <div className="text-xs font-mono font-bold text-slate-700 mt-1">{flight.departure_time}</div>
                    </div>

                    <div className="flex flex-col items-center px-2">
                      <span className="text-[10px] font-mono text-[#C7A66A] font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mb-1">
                        {flight.duration || '7h 15m'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <div className="w-5 h-px bg-slate-300"></div>
                        <Plane className="w-3.5 h-3.5 text-[#C7A66A] transform rotate-90" />
                        <div className="w-5 h-px bg-slate-300"></div>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 font-medium">Non-stop</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900 tracking-tight">{flight.destination}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[85px]">{flight.destination_city}</div>
                      <div className="text-xs font-mono font-bold text-slate-700 mt-1">{flight.arrival_time}</div>
                    </div>
                  </div>
                </div>

                {/* Footer: Aircraft & Dynamic Fare */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">{flight.aircraft_type}</span>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block leading-tight">From / Pax</span>
                      <span className="font-mono font-black text-base text-[#10243A]">
                        ${fare}
                      </span>
                    </div>
                  </div>

                  <div className={`w-full py-1.5 px-3 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}>
                    <span>{isSelected ? 'Flight Selected' : 'Select Flight'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
