import React, { useMemo, useState } from 'react';
import { Flight } from '../types';
import { CabinClass, SearchCriteria } from './FlightSearchPanel';

export type FareBrand = 'SPECIAL' | 'SAVER' | 'FLEX' | 'FLEX_PLUS';

export const FARE_META: Record<
  FareBrand,
  { label: string; multiplier: number; perks: string[] }
> = {
  SPECIAL: {
    label: 'Special',
    multiplier: 0.85,
    perks: ['Lowest available fare', 'Seat selection paid in Economy', 'Changes with service fee'],
  },
  SAVER: {
    label: 'Saver',
    multiplier: 1.0,
    perks: ['Standard baggage allowance', 'Seat selection paid in Economy', 'One fee-paid modification'],
  },
  FLEX: {
    label: 'Flex',
    multiplier: 1.35,
    perks: ['Complimentary Regular seat', 'Flexible change policy', 'Bonus Miles earn'],
  },
  FLEX_PLUS: {
    label: 'Flex Plus',
    multiplier: 1.7,
    perks: ['Complimentary Regular & Preferred', 'Complimentary ticket changes', 'Highest Tier Miles earn'],
  },
};

export const cabinMultiplier = (cabin: CabinClass): number => {
  switch (cabin) {
    case 'FIRST':
      return 5.2;
    case 'BUSINESS':
      return 2.8;
    case 'PREMIUM_ECONOMY':
      return 1.6;
    default:
      return 1;
  }
};

const AIRPORT_INFO: Record<string, { city: string; name: string; durFromDXB: string; durToDXB: string; depToDXB: string; arrToDXB: string; depFromDXB: string; arrFromDXB: string; baseFare: number; aircraft: string; flightNoIn: string; flightNoOut: string }> = {
  DXB: { city: 'Dubai', name: 'Dubai International (Hub)', durFromDXB: '0h', durToDXB: '0h', depToDXB: '00:00', arrToDXB: '00:00', depFromDXB: '00:00', arrFromDXB: '00:00', baseFare: 0, aircraft: 'Airbus A380-800', flightNoIn: 'XA-001', flightNoOut: 'XA-001' },
  LHR: { city: 'London', name: 'London Heathrow', durFromDXB: '7h 25m', durToDXB: '6h 45m', depToDXB: '20:45', arrToDXB: '06:30', depFromDXB: '14:15', arrFromDXB: '18:40', baseFare: 680, aircraft: 'Airbus A380-800', flightNoIn: 'XA-002', flightNoOut: 'EK-001' },
  JFK: { city: 'New York', name: 'New York JFK', durFromDXB: '14h 25m', durToDXB: '12h 15m', depToDXB: '16:30', arrToDXB: '11:45', depFromDXB: '08:30', arrFromDXB: '14:25', baseFare: 920, aircraft: 'Boeing 777-300ER', flightNoIn: 'XA-202', flightNoOut: 'EK-201' },
  SIN: { city: 'Singapore', name: 'Singapore Changi', durFromDXB: '7h 25m', durToDXB: '7h 25m', depToDXB: '09:15', arrToDXB: '12:40', depFromDXB: '03:15', arrFromDXB: '14:40', baseFare: 490, aircraft: 'Boeing 777-300ER', flightNoIn: 'XA-355', flightNoOut: 'EK-354' },
  BKK: { city: 'Bangkok', name: 'Bangkok Suvarnabhumi', durFromDXB: '6h 20m', durToDXB: '6h 45m', depToDXB: '09:30', arrToDXB: '13:15', depFromDXB: '22:30', arrFromDXB: '07:50', baseFare: 540, aircraft: 'Boeing 777-300ER', flightNoIn: 'XA-385', flightNoOut: 'EK-384' },
  BOM: { city: 'Mumbai', name: 'Mumbai CSIA', durFromDXB: '3h 15m', durToDXB: '3h 15m', depToDXB: '16:15', arrToDXB: '18:30', depFromDXB: '10:00', arrFromDXB: '14:45', baseFare: 310, aircraft: 'Boeing 777-300ER', flightNoIn: 'XA-501', flightNoOut: 'EK-500' },
  HND: { city: 'Tokyo', name: 'Tokyo Haneda', durFromDXB: '9h 45m', durToDXB: '9h 40m', depToDXB: '19:20', arrToDXB: '02:00', depFromDXB: '02:50', arrFromDXB: '17:35', baseFare: 830, aircraft: 'Boeing 777-300ER', flightNoIn: 'XA-319', flightNoOut: 'EK-318' },
  CDG: { city: 'Paris', name: 'Paris Charles de Gaulle', durFromDXB: '7h 10m', durToDXB: '6h 45m', depToDXB: '15:35', arrToDXB: '00:20', depFromDXB: '08:20', arrFromDXB: '13:30', baseFare: 710, aircraft: 'Airbus A380-800', flightNoIn: 'XA-074', flightNoOut: 'EK-073' },
  SYD: { city: 'Sydney', name: 'Sydney Kingsford Smith', durFromDXB: '13h 50m', durToDXB: '14h 20m', depToDXB: '06:00', arrToDXB: '13:20', depFromDXB: '02:15', arrFromDXB: '22:05', baseFare: 1150, aircraft: 'Airbus A380-800', flightNoIn: 'XA-415', flightNoOut: 'EK-414' },
  SFO: { city: 'San Francisco', name: 'San Francisco Intl', durFromDXB: '15h 15m', durToDXB: '14h 40m', depToDXB: '15:45', arrToDXB: '19:25', depFromDXB: '08:45', arrFromDXB: '13:00', baseFare: 980, aircraft: 'Boeing 777-300ER', flightNoIn: 'XA-802', flightNoOut: 'XA-801' },
};

function buildConnectingFlights(flights: Flight[], criteria: SearchCriteria): Flight[] {
  const origin = (criteria.origin || '').toUpperCase().trim();
  const dest = (criteria.destination || '').toUpperCase().trim();
  if (!origin || !dest || origin === dest) return [];

  const hub = 'DXB';
  const originInfo = AIRPORT_INFO[origin] || {
    city: origin,
    name: `${origin} Airport`,
    durFromDXB: '7h 00m',
    durToDXB: '7h 00m',
    depToDXB: '09:00',
    arrToDXB: '13:00',
    depFromDXB: '14:00',
    arrFromDXB: '18:00',
    baseFare: 500,
    aircraft: 'Boeing 777-300ER',
    flightNoIn: `XA-9${origin.charCodeAt(0) % 90}`,
    flightNoOut: `XA-8${origin.charCodeAt(0) % 90}`,
  };

  const destInfo = AIRPORT_INFO[dest] || {
    city: dest,
    name: `${dest} Airport`,
    durFromDXB: '7h 00m',
    durToDXB: '7h 00m',
    depToDXB: '10:00',
    arrToDXB: '14:00',
    depFromDXB: '14:30',
    arrFromDXB: '18:30',
    baseFare: 500,
    aircraft: 'Airbus A380-800',
    flightNoIn: `XA-7${dest.charCodeAt(0) % 90}`,
    flightNoOut: `XA-6${dest.charCodeAt(0) % 90}`,
  };

  // Find DB legs where available
  const leg1InDb = flights.find((f) => f.origin === origin && f.destination === hub);
  const leg2InDb = flights.find((f) => f.origin === hub && f.destination === dest);

  const leg1 = {
    flight_number: leg1InDb?.flight_number || originInfo.flightNoIn,
    origin,
    origin_city: leg1InDb?.origin_city || originInfo.city,
    destination: hub,
    destination_city: 'Dubai',
    departure_time: leg1InDb?.departure_time || originInfo.depToDXB,
    arrival_time: leg1InDb?.arrival_time || originInfo.arrToDXB,
    duration: leg1InDb?.duration || originInfo.durToDXB,
    aircraft_type: leg1InDb?.aircraft_type || originInfo.aircraft,
    base_fare: leg1InDb?.base_fare || originInfo.baseFare,
  };

  const leg2 = {
    flight_number: leg2InDb?.flight_number || destInfo.flightNoOut,
    origin: hub,
    origin_city: 'Dubai',
    destination: dest,
    destination_city: leg2InDb?.destination_city || destInfo.city,
    departure_time: leg2InDb?.departure_time || destInfo.depFromDXB,
    arrival_time: leg2InDb?.arrival_time || destInfo.arrFromDXB,
    duration: leg2InDb?.duration || destInfo.durFromDXB,
    aircraft_type: leg2InDb?.aircraft_type || destInfo.aircraft,
    base_fare: leg2InDb?.base_fare || destInfo.baseFare,
  };

  // Always use a real flight ID from the database for seat inventory allocation
  const targetId = leg2InDb?.id || leg1InDb?.id || flights.find((f) => f.id.startsWith('FL-'))?.id || 'FL-001';

  // Combined discounted fare
  const combinedFare = Math.round((leg1.base_fare + leg2.base_fare) * 0.88);

  const connectingFlight: Flight = {
    id: targetId,
    flight_number: `${leg1.flight_number} / ${leg2.flight_number}`,
    origin,
    origin_city: originInfo.city,
    destination: dest,
    destination_city: destInfo.city,
    departure_time: leg1.departure_time,
    arrival_time: leg2.arrival_time,
    duration: '16h 25m',
    aircraft_type: `${leg1.aircraft_type.split(' ')[0]} / ${leg2.aircraft_type.split(' ')[0]}`,
    base_fare: combinedFare,
    departure_date: criteria.departDate || '2026-11-15',
    total_seats: 120,
    available_seats: 108,
    status: 'ON_TIME',
    is_connecting: true,
    layover_airport: 'DXB',
    layover_city: 'Dubai',
    layover_duration: '1h 35m',
    segments: [
      {
        flight_number: leg1.flight_number,
        origin: leg1.origin,
        origin_city: leg1.origin_city,
        destination: leg1.destination,
        destination_city: leg1.destination_city,
        departure_time: leg1.departure_time,
        arrival_time: leg1.arrival_time,
        duration: leg1.duration,
        aircraft_type: leg1.aircraft_type,
      },
      {
        flight_number: leg2.flight_number,
        origin: leg2.origin,
        origin_city: leg2.origin_city,
        destination: leg2.destination,
        destination_city: leg2.destination_city,
        departure_time: leg2.departure_time,
        arrival_time: leg2.arrival_time,
        duration: leg2.duration,
        aircraft_type: leg2.aircraft_type,
      },
    ],
  };

  return [connectingFlight];
}

interface FlightResultsPanelProps {
  flights: Flight[];
  criteria: SearchCriteria;
  onBack: () => void;
  onSelect: (flight: Flight, fareBrand: FareBrand, price: number) => void;
}

export const FlightResultsPanel: React.FC<FlightResultsPanelProps> = ({
  flights,
  criteria,
  onBack,
  onSelect,
}) => {
  const directFiltered = useMemo(() => {
    return flights.filter((f) => {
      const o = !criteria.origin || f.origin === criteria.origin;
      const d = !criteria.destination || f.destination === criteria.destination;
      return o && d;
    });
  }, [flights, criteria.origin, criteria.destination]);

  const connectingFlights = useMemo(() => {
    if (directFiltered.length > 0) return [];
    return buildConnectingFlights(flights, criteria);
  }, [directFiltered, flights, criteria]);

  const displayFlights = directFiltered.length > 0 ? directFiltered : connectingFlights;
  const isConnectingResult = directFiltered.length === 0 && connectingFlights.length > 0;

  const [expandedId, setExpandedId] = useState<string | null>(displayFlights[0]?.id ?? null);
  const [selectedFareByFlight, setSelectedFareByFlight] = useState<Record<string, FareBrand>>({});

  const getComputedPrice = (flight: Flight, brand: FareBrand): number => {
    const base = flight.base_fare || 450;
    const cMul = cabinMultiplier(criteria.cabinClass);
    const bMul = FARE_META[brand].multiplier;
    return Math.round(base * cMul * bMul);
  };

  return (
    <section className="space-y-6">
      {/* Search Itinerary Context Bar */}
      <div className="bg-surface-container-low p-4 sm:px-6 rounded-xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-crimson-deep transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Modify Flight Search</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-muted">
          <span className="font-bold text-slate-navy">
            {criteria.origin || 'DXB'} → {criteria.destination || 'Destination'}
          </span>
          <span>•</span>
          <span>{criteria.departDate}</span>
          {criteria.tripType === 'return' && criteria.returnDate && (
            <span>• Return {criteria.returnDate}</span>
          )}
          <span>•</span>
          <span className="capitalize font-semibold text-secondary">
            {criteria.adults + criteria.children + criteria.infants} Pax · {criteria.cabinClass.replace('_', ' ').toLowerCase()}
          </span>
        </div>
      </div>

      {criteria.tripType === 'return' && (
        <div className="bg-gold-light/60 border border-gold-metallic/30 rounded-xl p-3 text-xs text-secondary flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>Outbound flight schedule shown below. Return segment uses mirrored routing with identical fare tier privileges at confirmation.</span>
        </div>
      )}

      {/* Connecting Flight Route Redirection Notice */}
      {isConnectingResult && (
        <div className="bg-slate-navy text-white rounded-2xl p-4 sm:p-5 border border-gold-metallic/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gold-metallic/20 border border-gold-metallic/40 flex items-center justify-center text-secondary-container shrink-0">
              <span className="material-symbols-outlined text-[24px]">connecting_airports</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-secondary-container">
                  Route Redirection
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary-container text-[10px] font-bold">
                  1 Stop via Dubai (DXB)
                </span>
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-white mt-0.5">
                No Direct Flights · Redirected to Connecting Flight
              </h3>
              <p className="text-xs text-surface-container-highest/80 mt-0.5">
                No scheduled non-stop flights operate on this route. Showing guaranteed connecting itinerary with 1 seamless transfer at Dubai International (DXB).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 border border-white/10 text-xs font-semibold text-white whitespace-nowrap transition-colors"
          >
            Change Search
          </button>
        </div>
      )}

      {/* Flight Results List */}
      {displayFlights.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 text-center rounded-2xl border border-border-subtle shadow-sm space-y-3">
          <span className="material-symbols-outlined text-[48px] text-charcoal-muted">flight_takeoff</span>
          <h3 className="font-serif text-xl font-bold text-slate-navy">No Route Available</h3>
          <p className="text-xs text-charcoal-muted max-w-md mx-auto">
            Please choose different departure and arrival destinations.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-2 px-6 py-2 bg-slate-navy text-white text-xs font-bold rounded-xl"
          >
            Change Search Criteria
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayFlights.map((flight) => {
            const isExpanded = expandedId === flight.id;
            const currentBrand = selectedFareByFlight[flight.id] || 'SAVER';
            const price = getComputedPrice(flight, currentBrand);

            return (
              <div
                key={flight.id}
                className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Horizontal Timeline Summary Row */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Flight Info & Times */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8 flex-1">
                    {/* Airline & Flight Number */}
                    <div className="flex items-center gap-3 min-w-[130px]">
                      <div className="w-10 h-10 rounded-xl bg-crimson-light text-primary flex items-center justify-center font-bold shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {flight.is_connecting ? 'connecting_airports' : 'flight'}
                        </span>
                      </div>
                      <div>
                        <span className="font-mono font-bold text-sm text-slate-navy block">
                          {flight.flight_number}
                        </span>
                        <span className="text-[11px] text-charcoal-muted font-medium">
                          {flight.aircraft_type}
                        </span>
                      </div>
                    </div>

                    {/* Timeline (Departure -> Duration/Stops -> Arrival) */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-1">
                      {/* Departure */}
                      <div className="text-left">
                        <span className="font-serif text-xl font-bold text-slate-navy block">
                          {flight.departure_time}
                        </span>
                        <span className="font-bold text-xs text-slate-navy block">{flight.origin}</span>
                        <span className="text-[11px] text-charcoal-muted">{flight.origin_city}</span>
                      </div>

                      {/* Timeline Bar with Hub Badge */}
                      <div className="flex-1 flex flex-col items-center px-2">
                        <span className="text-[11px] font-mono text-charcoal-muted mb-1">
                          {flight.duration || '7h 15m'}
                        </span>
                        <div className="w-full flex items-center relative">
                          <div className="h-0.5 w-full bg-border-subtle"></div>
                          <div
                            className={`absolute left-1/2 -translate-x-1/2 -top-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                              flight.is_connecting
                                ? 'bg-secondary-container ring-2 ring-gold-metallic/40'
                                : 'bg-gold-metallic'
                            }`}
                            title={flight.is_connecting ? '1 Stop in Dubai (DXB)' : 'Non-Stop Direct'}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-navy"></span>
                          </div>
                        </div>
                        {flight.is_connecting ? (
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">hub</span>
                            <span>1 Stop via {flight.layover_airport || 'DXB'} ({flight.layover_duration || '1h 35m'})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider mt-1">
                            Non-Stop Direct
                          </span>
                        )}
                      </div>

                      {/* Arrival */}
                      <div className="text-right">
                        <span className="font-serif text-xl font-bold text-slate-navy block">
                          {flight.arrival_time}
                        </span>
                        <span className="font-bold text-xs text-slate-navy block">{flight.destination}</span>
                        <span className="text-[11px] text-charcoal-muted">{flight.destination_city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Preview & Expand Trigger */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-border-subtle">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-charcoal-muted uppercase tracking-wider block">Starting from</span>
                      <span className="font-serif text-2xl font-bold text-slate-navy">
                        ${getComputedPrice(flight, 'SAVER')}
                        <span className="text-xs font-sans text-charcoal-muted ml-1 font-normal">USD / adult</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : flight.id)}
                      className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all ${
                        isExpanded
                          ? 'bg-slate-navy text-white'
                          : 'bg-surface-container-low hover:bg-gold-light text-slate-navy'
                      }`}
                    >
                      <span>{isExpanded ? 'Hide Fares' : 'View Fares'}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Fare Matrix (Segmented Cards with Crimson Top Border) */}
                {isExpanded && (
                  <div className="bg-surface-container-low/50 p-5 sm:p-6 border-t border-border-subtle space-y-4">
                    {/* Connecting Segments Breakdown Box */}
                    {flight.segments && flight.segments.length > 1 && (
                      <div className="bg-white rounded-xl p-4 border border-border-subtle shadow-sm space-y-3">
                        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 pb-2 border-b border-border-subtle">
                          <span className="material-symbols-outlined text-[16px]">linear_scale</span>
                          <span>Connecting Itinerary Flight Segments</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Segment 1 */}
                          <div className="bg-surface-container-low p-3.5 rounded-xl border border-border-subtle space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary-container text-white">
                                Flight 1
                              </span>
                              <span className="font-mono font-bold text-xs text-slate-navy">
                                {flight.segments[0].flight_number}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-navy block text-sm">{flight.segments[0].departure_time}</span>
                                <span className="text-charcoal-muted text-[11px]">{flight.segments[0].origin} · {flight.segments[0].origin_city}</span>
                              </div>
                              <span className="text-charcoal-muted text-[11px] font-mono">{flight.segments[0].duration}</span>
                              <div className="text-right">
                                <span className="font-bold text-slate-navy block text-sm">{flight.segments[0].arrival_time}</span>
                                <span className="text-charcoal-muted text-[11px]">{flight.segments[0].destination} · {flight.segments[0].destination_city}</span>
                              </div>
                            </div>
                            <div className="text-[10px] text-charcoal-muted pt-1 border-t border-border-subtle flex justify-between">
                              <span>Aircraft: <strong>{flight.segments[0].aircraft_type}</strong></span>
                              <span className="text-emerald-700 font-semibold">Baggage Checked Through</span>
                            </div>
                          </div>

                          {/* Segment 2 */}
                          <div className="bg-surface-container-low p-3.5 rounded-xl border border-border-subtle space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary-container text-white">
                                Flight 2
                              </span>
                              <span className="font-mono font-bold text-xs text-slate-navy">
                                {flight.segments[1].flight_number}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-navy block text-sm">{flight.segments[1].departure_time}</span>
                                <span className="text-charcoal-muted text-[11px]">{flight.segments[1].origin} · {flight.segments[1].origin_city}</span>
                              </div>
                              <span className="text-charcoal-muted text-[11px] font-mono">{flight.segments[1].duration}</span>
                              <div className="text-right">
                                <span className="font-bold text-slate-navy block text-sm">{flight.segments[1].arrival_time}</span>
                                <span className="text-charcoal-muted text-[11px]">{flight.segments[1].destination} · {flight.segments[1].destination_city}</span>
                              </div>
                            </div>
                            <div className="text-[10px] text-charcoal-muted pt-1 border-t border-border-subtle flex justify-between">
                              <span>Aircraft: <strong>{flight.segments[1].aircraft_type}</strong></span>
                              <span className="text-secondary font-semibold">Flagship Service</span>
                            </div>
                          </div>
                        </div>

                        {/* Layover Hub Pill */}
                        <div className="bg-gold-light/40 border border-gold-metallic/30 rounded-lg p-2.5 flex items-center justify-between text-xs text-secondary">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">transfer_within_a_station</span>
                            <span className="font-semibold">Layover Transfer at Dubai International (DXB)</span>
                          </div>
                          <span className="font-mono font-bold">{flight.layover_duration || '1h 35m'} Layover</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-base font-bold text-slate-navy">
                        Choose Fare Tier for {criteria.cabinClass.replace('_', ' ')}
                      </h4>
                      <span className="text-xs text-charcoal-muted">
                        Select a brand to see inclusions &amp; continue
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {(['SPECIAL', 'SAVER', 'FLEX', 'FLEX_PLUS'] as FareBrand[]).map((brand) => {
                        const tier = FARE_META[brand];
                        const tierPrice = getComputedPrice(flight, brand);
                        const isSelected = currentBrand === brand;

                        return (
                          <div
                            key={brand}
                            onClick={() => setSelectedFareByFlight({ ...selectedFareByFlight, [flight.id]: brand })}
                            className={`bg-white rounded-xl p-4 border transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'border-primary shadow-md ring-1 ring-primary'
                                : 'border-border-subtle hover:border-slate-navy/40 shadow-sm'
                            }`}
                          >
                            {/* Crimson Top Border (3px) on select */}
                            {isSelected && (
                              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-t-xl"></div>
                            )}

                            <div>
                              <div className="flex items-center justify-between pb-2">
                                <span className="font-bold text-sm text-slate-navy">{tier.label}</span>
                                {isSelected ? (
                                  <span className="material-symbols-outlined text-primary text-[18px]">
                                    check_circle
                                  </span>
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-border-subtle"></div>
                                )}
                              </div>

                              <div className="font-serif text-xl font-bold text-slate-navy pb-3">
                                ${tierPrice}
                                <span className="text-[11px] font-sans font-normal text-charcoal-muted ml-1">
                                  USD
                                </span>
                              </div>

                              <ul className="space-y-1.5 text-[11px] text-charcoal-muted border-t border-border-subtle pt-2.5">
                                {tier.perks.map((p, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="material-symbols-outlined text-[13px] text-secondary shrink-0 mt-0.5">
                                      check
                                    </span>
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFareByFlight({ ...selectedFareByFlight, [flight.id]: brand });
                                onSelect(flight, brand, tierPrice);
                              }}
                              className={`mt-4 w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                isSelected
                                  ? 'bg-primary-container hover:bg-crimson-deep text-white shadow'
                                  : 'bg-surface-container-low hover:bg-surface-container text-slate-navy'
                              }`}
                            >
                              <span>
                                {isSelected
                                  ? flight.is_connecting
                                    ? 'Select Connecting Flight'
                                    : 'Select & Continue'
                                  : 'Select ' + tier.label}
                              </span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
