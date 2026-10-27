import React, { useState } from 'react';
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
  const [expandedId, setExpandedId] = useState<string | null>(flights[0]?.id ?? null);
  const [selectedFareByFlight, setSelectedFareByFlight] = useState<Record<string, FareBrand>>({});

  const filtered = flights.filter((f) => {
    const o = !criteria.origin || f.origin === criteria.origin;
    const d = !criteria.destination || f.destination === criteria.destination;
    return o && d;
  });

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

      {/* Flight Results List */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 text-center rounded-2xl border border-border-subtle shadow-sm space-y-3">
          <span className="material-symbols-outlined text-[48px] text-charcoal-muted">flight_takeoff</span>
          <h3 className="font-serif text-xl font-bold text-slate-navy">No Direct Flights Found</h3>
          <p className="text-xs text-charcoal-muted max-w-md mx-auto">
            No scheduled flights matched {criteria.origin} to {criteria.destination}. Try selecting Dubai (DXB) as either your origin or destination hub.
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
          {filtered.map((flight) => {
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
                      <div className="w-10 h-10 rounded-xl bg-crimson-light text-primary flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[20px]">flight</span>
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
                          <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rounded-full bg-gold-metallic flex items-center justify-center" title="Direct Flight / Hub Connection">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          </div>
                        </div>
                        <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider mt-1">
                          Non-Stop Direct
                        </span>
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
                            {/* Crimson Top Border (3px) on select per Stitch DESIGN.md */}
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
                              <span>{isSelected ? 'Select & Continue' : 'Select ' + tier.label}</span>
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
