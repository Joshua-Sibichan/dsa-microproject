import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Search, AlertCircle, Users, CalendarDays, Plane } from 'lucide-react';

export type TripType = 'return' | 'oneway';
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface SearchCriteria {
  tripType: TripType;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
}

interface FlightSearchPanelProps {
  initial: SearchCriteria;
  onSearch: (criteria: SearchCriteria) => void;
  searching?: boolean;
}

const AIRPORTS = [
  { code: 'DXB', city: 'Dubai', name: 'Dubai International (Hub)' },
  { code: 'LHR', city: 'London', name: 'London Heathrow' },
  { code: 'JFK', city: 'New York', name: 'New York JFK' },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi' },
  { code: 'BKK', city: 'Bangkok', name: 'Bangkok Suvarnabhumi' },
  { code: 'BOM', city: 'Mumbai', name: 'Mumbai CSIA' },
  { code: 'HND', city: 'Tokyo', name: 'Tokyo Haneda' },
  { code: 'CDG', city: 'Paris', name: 'Paris Charles de Gaulle' },
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco Intl' },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

export const FlightSearchPanel: React.FC<FlightSearchPanelProps> = ({
  initial,
  onSearch,
  searching = false,
}) => {
  const [form, setForm] = useState<SearchCriteria>(initial);
  const [errors, setErrors] = useState<string[]>([]);

  const totalPax = form.adults + form.children + form.infants;

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.origin) errs.push('Select a departure airport.');
    if (!form.destination) errs.push('Select a destination airport.');
    if (form.origin && form.destination && form.origin === form.destination) {
      errs.push('Departure and destination must be different.');
    }
    if (!form.departDate) errs.push('Select a departure date.');
    if (form.departDate && form.departDate < todayISO()) {
      errs.push('Departure date cannot be in the past.');
    }
    if (form.tripType === 'return') {
      if (!form.returnDate) errs.push('Select a return date for a return trip.');
      else if (form.departDate && form.returnDate < form.departDate) {
        errs.push('Return date must be on or after the departure date.');
      }
    }
    if (form.adults < 1) errs.push('At least one adult is required.');
    if (form.infants > form.adults) errs.push('Infants cannot exceed the number of adults.');
    if (totalPax > 9) errs.push('Maximum 9 passengers per booking.');
    if (totalPax < 1) errs.push('Add at least one passenger.');
    return errs;
  };

  const swapAirports = () => {
    setForm((f) => ({ ...f, origin: f.destination, destination: f.origin }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length) return;
    onSearch(form);
  };

  const passengerSummary = useMemo(() => {
    const parts = [`${form.adults} Adult${form.adults !== 1 ? 's' : ''}`];
    if (form.children) parts.push(`${form.children} Child${form.children !== 1 ? 'ren' : ''}`);
    if (form.infants) parts.push(`${form.infants} Infant${form.infants !== 1 ? 's' : ''}`);
    return parts.join(', ');
  }, [form.adults, form.children, form.infants]);

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-md overflow-hidden">
      {/* Editorial Luxury Header Banner */}
      <div className="bg-slate-navy px-6 lg:px-8 py-6 text-surface-container-lowest flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Book Flight &amp; Reserve Seats
          </h2>
          <p className="text-xs text-surface-container-highest/80 mt-1 max-w-xl">
            Select your flight itinerary, customize cabin class tiers, and reserve tailored aircraft seating.
          </p>
        </div>

        {/* Trip Type Toggle Pill */}
        <div className="flex items-center bg-surface-container-lowest/10 p-1 rounded-xl self-start md:self-auto border border-white/10">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, tripType: 'return' }))}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              form.tripType === 'return'
                ? 'bg-primary-container text-white shadow-sm font-bold'
                : 'text-surface-container-highest/70 hover:text-white'
            }`}
          >
            Return Flight
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, tripType: 'oneway' }))}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              form.tripType === 'oneway'
                ? 'bg-primary-container text-white shadow-sm font-bold'
                : 'text-surface-container-highest/70 hover:text-white'
            }`}
          >
            One Way
          </button>
        </div>
      </div>

      {/* Search Form Form Fields */}
      <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
        {errors.length > 0 && (
          <div className="p-4 rounded-xl bg-crimson-light/80 border border-primary/20 text-error text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>Please review your search criteria:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-navy">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Airport Origin & Destination Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* Origin */}
          <div className="md:col-span-5 bg-surface-container-low p-3.5 rounded-xl border border-border-subtle focus-within:border-slate-navy focus-within:ring-1 focus-within:ring-slate-navy transition-all">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">flight_takeoff</span>
              <span>Departure Airport</span>
            </label>
            <select
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              className="w-full bg-transparent text-sm font-bold text-slate-navy focus:outline-none cursor-pointer"
            >
              <option value="">Select origin...</option>
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code}) — {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={swapAirports}
              title="Swap departure and destination"
              className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-gold-light border border-border-subtle flex items-center justify-center text-slate-navy transition-transform hover:scale-110 active:scale-95 shadow-sm"
            >
              <ArrowLeftRight className="w-4 h-4 text-secondary" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-5 bg-surface-container-low p-3.5 rounded-xl border border-border-subtle focus-within:border-slate-navy focus-within:ring-1 focus-within:ring-slate-navy transition-all">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">flight_land</span>
              <span>Arrival Airport</span>
            </label>
            <select
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className="w-full bg-transparent text-sm font-bold text-slate-navy focus:outline-none cursor-pointer"
            >
              <option value="">Select destination...</option>
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code}) — {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates, Passengers, Cabin Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Departure Date */}
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-border-subtle focus-within:border-slate-navy focus-within:ring-1 focus-within:ring-slate-navy transition-all">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">calendar_today</span>
              <span>Depart Date</span>
            </label>
            <input
              type="date"
              value={form.departDate}
              min={todayISO()}
              onChange={(e) => setForm({ ...form, departDate: e.target.value })}
              className="w-full bg-transparent text-sm font-bold text-slate-navy focus:outline-none"
            />
          </div>

          {/* Return Date */}
          <div
            className={`bg-surface-container-low p-3.5 rounded-xl border border-border-subtle transition-all ${
              form.tripType === 'oneway' ? 'opacity-40 pointer-events-none' : 'focus-within:border-slate-navy focus-within:ring-1 focus-within:ring-slate-navy'
            }`}
          >
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">event_repeat</span>
              <span>Return Date</span>
            </label>
            <input
              type="date"
              value={form.returnDate}
              min={form.departDate || todayISO()}
              disabled={form.tripType === 'oneway'}
              onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
              className="w-full bg-transparent text-sm font-bold text-slate-navy focus:outline-none"
            />
          </div>

          {/* Passengers Selector */}
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-border-subtle space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">group</span>
                <span>Passengers ({totalPax}/9)</span>
              </span>
              <span className="text-[10px] text-secondary font-mono font-semibold">{passengerSummary}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-charcoal-muted">Adults</span>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={form.adults}
                  onChange={(e) => setForm({ ...form, adults: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full px-2 py-1 text-xs font-bold bg-white rounded border border-border-subtle focus:outline-none"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-charcoal-muted">Children</span>
                <input
                  type="number"
                  min={0}
                  max={8}
                  value={form.children}
                  onChange={(e) => setForm({ ...form, children: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-2 py-1 text-xs font-bold bg-white rounded border border-border-subtle focus:outline-none"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-charcoal-muted">Infants</span>
                <input
                  type="number"
                  min={0}
                  max={form.adults}
                  value={form.infants}
                  onChange={(e) => setForm({ ...form, infants: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-2 py-1 text-xs font-bold bg-white rounded border border-border-subtle focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cabin Class Selection */}
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-border-subtle focus-within:border-slate-navy focus-within:ring-1 focus-within:ring-slate-navy transition-all">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">airline_seat_recline_extra</span>
              <span>Cabin Class</span>
            </label>
            <select
              value={form.cabinClass}
              onChange={(e) => setForm({ ...form, cabinClass: e.target.value as CabinClass })}
              className="w-full bg-transparent text-sm font-bold text-slate-navy focus:outline-none cursor-pointer"
            >
              <option value="ECONOMY">Economy Class</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business Class</option>
              <option value="FIRST">First Class Suites</option>
            </select>
          </div>
        </div>

        {/* Submit Button Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-charcoal-muted">
            <span className="material-symbols-outlined text-[16px] text-secondary">shield</span>
            <span>All flights operate on simulated mock inventory with live seat matrices.</span>
          </div>

          <button
            type="submit"
            disabled={searching}
            className="w-full sm:w-auto px-8 py-3.5 bg-primary-container hover:bg-crimson-deep text-white font-serif font-bold text-sm sm:text-base rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          >
            {searching ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Searching Flights...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>Search Available Flights</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
