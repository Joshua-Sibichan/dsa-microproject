import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CabinMap } from './components/CabinMap';
import { PreferenceForm } from './components/PreferenceForm';
import { BookingSummary } from './components/BookingSummary';
import { ManageBooking } from './components/ManageBooking';
import { UndoFloatingBar } from './components/UndoFloatingBar';
import { AlgorithmArena } from './components/AlgorithmArena';
import { BookingStepper, BookingStepId } from './components/BookingStepper';
import { FlightSearchPanel, SearchCriteria } from './components/FlightSearchPanel';
import { FlightResultsPanel, FareBrand } from './components/FlightResultsPanel';
import { PassengerDetailsForm } from './components/PassengerDetailsForm';
import { ConfirmationPanel } from './components/ConfirmationPanel';

import { SeatGridVisualizer } from './components/DsaHub/SeatGridVisualizer';
import { QueueVisualizer } from './components/DsaHub/QueueVisualizer';
import { StackVisualizer } from './components/DsaHub/StackVisualizer';
import { BstVisualizer } from './components/DsaHub/BstVisualizer';
import { GraphVisualizer } from './components/DsaHub/GraphVisualizer';
import { SearchSortLab } from './components/DsaHub/SearchSortLab';
import { StructureComparison } from './components/DsaHub/StructureComparison';
import { CourseOutcomeMatrix } from './components/DsaHub/CourseOutcomeMatrix';

import {
  fetchFlights,
  fetchFlightSeats,
  requestRecommendation,
  requestGroupSeating,
  createBatchReservations,
  triggerUndo,
  fetchUndoHistory
} from './api';

import {
  Flight,
  Seat,
  PassengerProfile,
  PassengerBookingItem,
  RecommendationResult,
  GroupSeatingResult,
  Reservation,
  UndoAction
} from './types';

const defaultSearch = (): SearchCriteria => ({
  tripType: 'return',
  origin: 'DXB',
  destination: 'LHR',
  departDate: '2026-11-15',
  returnDate: '2026-11-22',
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: 'ECONOMY',
});

const buildPassengers = (criteria: SearchCriteria): PassengerBookingItem[] => {
  const list: PassengerBookingItem[] = [];
  let idx = 0;
  for (let i = 0; i < criteria.adults; i++, idx++) {
    list.push({
      passengerIndex: idx,
      type: 'adult',
      name: '',
      email: '',
      seat: null,
      title: 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
    });
  }
  for (let i = 0; i < criteria.children; i++, idx++) {
    list.push({
      passengerIndex: idx,
      type: 'child',
      name: '',
      email: '',
      seat: null,
      title: 'Master',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
    });
  }
  for (let i = 0; i < criteria.infants; i++, idx++) {
    list.push({
      passengerIndex: idx,
      type: 'infant',
      name: '',
      email: '',
      seat: null,
      title: 'Miss',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Female',
    });
  }
  return list.length ? list : [{
    passengerIndex: 0,
    type: 'adult',
    name: '',
    email: '',
    seat: null,
    title: 'Mr',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
  }];
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'book' | 'manage' | 'dsa' | 'arena'>('book');
  const [dsaSubTab, setDsaSubTab] = useState<
    'seat_grid' | 'queue' | 'stack' | 'bst' | 'graph' | 'search_sort' | 'comparison' | 'matrix'
  >('seat_grid');

  const [bookingStep, setBookingStep] = useState<BookingStepId>('search');
  const [unlockedThrough, setUnlockedThrough] = useState<BookingStepId>('search');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(defaultSearch());
  const [fareBrand, setFareBrand] = useState<FareBrand>('SAVER');
  const [farePerAdult, setFarePerAdult] = useState<number>(0);

  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);

  const [passengers, setPassengers] = useState<PassengerBookingItem[]>(buildPassengers(defaultSearch()));
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0);
  const [selectedSeatsByPassenger, setSelectedSeatsByPassenger] = useState<Record<number, Seat>>({});
  const [selectedCabinClass, setSelectedCabinClass] = useState<string>('ECONOMY');

  const [passenger, setPassenger] = useState<PassengerProfile>({
    name: '',
    email: '',
    age: 28,
    traveling_with_infant: false,
    requires_wheelchair: false,
    preferences: {
      window: true,
      aisle: false,
      avoid_middle: true,
      extra_legroom: false,
      prefer_front: true
    }
  });

  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [groupResult, setGroupResult] = useState<GroupSeatingResult | null>(null);
  const [highlightedGroupSeats, setHighlightedGroupSeats] = useState<string[]>([]);
  const [latestReservations, setLatestReservations] = useState<Reservation[]>([]);

  const [undoStackTop, setUndoStackTop] = useState<UndoAction | null>(null);
  const [undoStackSize, setUndoStackSize] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRec, setLoadingRec] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const advanceUnlock = useCallback((step: BookingStepId) => {
    const order: BookingStepId[] = ['search', 'results', 'passengers', 'seats', 'confirm'];
    setUnlockedThrough((prev) => {
      const prevIdx = order.indexOf(prev);
      const nextIdx = order.indexOf(step);
      return nextIdx > prevIdx ? step : prev;
    });
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    window.setTimeout(() => setToastMessage(null), 4500);
  };

  const loadUndoState = async () => {
    try {
      const hist = await fetchUndoHistory();
      setUndoStackSize(hist.current_size);
      setUndoStackTop(hist.stack_contents?.[0] || null);
    } catch {
      /* ignore */
    }
  };

  const loadFlights = async (origin?: string, destination?: string) => {
    const flList = await fetchFlights(origin, destination);
    setFlights(flList);
    return flList;
  };

  const loadSeatsForFlight = async (flightId: string) => {
    const seatList = await fetchFlightSeats(flightId);
    setSeats(seatList);
  };

  useEffect(() => {
    loadFlights().catch(() => showToast('error', 'Unable to load flights'));
    loadUndoState();
  }, []);

  const handleSearch = async (criteria: SearchCriteria) => {
    setSearching(true);
    setSearchCriteria(criteria);
    setSelectedCabinClass(criteria.cabinClass);
    setSelectedFlight(null);
    setSelectedSeatsByPassenger({});
    setLatestReservations([]);
    setRecommendation(null);
    setGroupResult(null);
    setPassengers(buildPassengers(criteria));
    setActivePassengerIndex(0);
    try {
      await loadFlights(criteria.origin, criteria.destination);
      setBookingStep('results');
      advanceUnlock('results');
    } catch (err: any) {
      showToast('error', err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectItinerary = async (flight: Flight, brand: FareBrand, price: number) => {
    setSelectedFlight(flight);
    setFareBrand(brand);
    setFarePerAdult(price);
    setSelectedSeatsByPassenger({});
    setLatestReservations([]);
    setRecommendation(null);
    try {
      await loadSeatsForFlight(flight.id);
      setBookingStep('passengers');
      advanceUnlock('passengers');
    } catch (err: any) {
      showToast('error', err.message || 'Unable to load seats');
    }
  };

  const handleSelectSeat = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') {
      showToast('error', `Seat ${seat.seat_number} is already occupied.`);
      return;
    }
    if (selectedCabinClass && seat.cabin_class !== selectedCabinClass) {
      showToast('error', `Please choose a seat in ${selectedCabinClass.replace('_', ' ')}.`);
      return;
    }

    const currentSeatForActive = selectedSeatsByPassenger[activePassengerIndex];
    if (currentSeatForActive && currentSeatForActive.seat_number === seat.seat_number) {
      const nextSeats = { ...selectedSeatsByPassenger };
      delete nextSeats[activePassengerIndex];
      setSelectedSeatsByPassenger(nextSeats);
      return;
    }

    const alreadyOwnerIdx = Object.entries(selectedSeatsByPassenger).find(
      ([idxStr, s]) => s.seat_number === seat.seat_number && Number(idxStr) !== activePassengerIndex
    );
    if (alreadyOwnerIdx) {
      const otherIdx = Number(alreadyOwnerIdx[0]);
      showToast('error', `Seat ${seat.seat_number} is already allocated to Passenger ${otherIdx + 1}.`);
      return;
    }

    const nextSeats = {
      ...selectedSeatsByPassenger,
      [activePassengerIndex]: seat
    };
    setSelectedSeatsByPassenger(nextSeats);

    for (let i = 0; i < passengers.length; i++) {
      if (!nextSeats[i] && i !== activePassengerIndex) {
        setActivePassengerIndex(i);
        break;
      }
    }
  };

  const handleGetRecommendation = async () => {
    if (!selectedFlight) return;
    setLoadingRec(true);
    try {
      const profile = {
        ...passenger,
        name: passengers[activePassengerIndex]?.name || passenger.name,
        email: passengers[activePassengerIndex]?.email || passenger.email,
      };
      const res = await requestRecommendation(selectedFlight.id, profile, selectedCabinClass);
      setRecommendation(res);
      if (res.recommended_seat) {
        setSelectedSeatsByPassenger((prev) => ({
          ...prev,
          [activePassengerIndex]: res.recommended_seat!
        }));
        showToast('success', `Smart Recommend selected Seat ${res.recommended_seat.seat_number}`);
      } else {
        showToast('error', res.message || 'No recommendation found');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Recommendation failed');
    } finally {
      setLoadingRec(false);
    }
  };

  const handleFindGroupSeats = async (size: number) => {
    if (!selectedFlight) return;
    setLoadingRec(true);
    try {
      const res = await requestGroupSeating(selectedFlight.id, size, selectedCabinClass);
      setGroupResult(res);
      if (res.found && res.seats) {
        const newSeats: Record<number, Seat> = { ...selectedSeatsByPassenger };
        res.seats.slice(0, passengers.length).forEach((st, idx) => {
          newSeats[idx] = st;
        });
        setSelectedSeatsByPassenger(newSeats);
        setHighlightedGroupSeats(res.seat_numbers || res.seats.map((s) => s.seat_number));
        showToast('success', res.message || 'Contiguous group seating allocated');
      } else {
        setHighlightedGroupSeats([]);
        showToast('error', res.message || 'No contiguous group block available in this cabin');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Group search failed');
    } finally {
      setLoadingRec(false);
    }
  };

  const goToConfirmReview = () => {
    for (let i = 0; i < passengers.length; i++) {
      if (!selectedSeatsByPassenger[i]) {
        showToast('error', `Please assign a seat for Passenger ${i + 1}`);
        setActivePassengerIndex(i);
        return;
      }
    }
    setBookingStep('confirm');
    advanceUnlock('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!selectedFlight) return;

    for (let i = 0; i < passengers.length; i++) {
      if (!selectedSeatsByPassenger[i]) {
        showToast('error', `Please assign a seat for Passenger ${i + 1}`);
        setActivePassengerIndex(i);
        setBookingStep('seats');
        return;
      }
    }

    setLoading(true);
    try {
      const items = passengers.map((p, idx) => ({
        flight_id: selectedFlight.id,
        seat_number: selectedSeatsByPassenger[idx].seat_number,
        passenger_name: p.name || `Traveler ${idx + 1}`,
        passenger_email: p.email || 'traveler@aero.org',
        preferences: passenger.preferences
      }));

      const resList = await createBatchReservations({
        flight_id: selectedFlight.id,
        items
      });

      setLatestReservations(resList);
      const pnrs = resList.map((r) => r.pnr).join(', ');
      showToast('success', `Reservation confirmed! Booking Reference(s): ${pnrs}`);
      setBookingStep('confirm');
      advanceUnlock('confirm');

      await loadSeatsForFlight(selectedFlight.id);
      await loadFlights();
      await loadUndoState();
    } catch (err: any) {
      showToast('error', err.message || 'Reservation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerUndo = async () => {
    setLoading(true);
    try {
      const res = await triggerUndo();
      showToast('success', res.message);
      if (selectedFlight) {
        await loadSeatsForFlight(selectedFlight.id);
        await loadFlights();
      }
      await loadUndoState();
    } catch (err: any) {
      showToast('error', err.message || 'Undo operation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setBookingStep('search');
    setUnlockedThrough('search');
    setSearchCriteria(defaultSearch());
    setSelectedFlight(null);
    setSelectedSeatsByPassenger({});
    setLatestReservations([]);
    setPassengers(buildPassengers(defaultSearch()));
    setFareBrand('SAVER');
    setFarePerAdult(0);
    setRecommendation(null);
    setGroupResult(null);
  };

  const jumpStep = (step: BookingStepId) => {
    if (latestReservations.length > 0 && step !== 'confirm') {
      showToast('error', 'Booking already confirmed. Start a new search to change details.');
      return;
    }
    setBookingStep(step);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col antialiased selection:bg-crimson-light selection:text-primary">
      {/* Stitch Design System Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedFlight={selectedFlight}
        undoCount={undoStackSize}
        onTriggerUndo={handleTriggerUndo}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-slate-navy text-surface-container-lowest border-emerald-500/60 ring-1 ring-emerald-400'
                : 'bg-primary-container text-white border-white/20'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {toastMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 space-y-6">
        {activeTab === 'book' && (
          <div className="space-y-6">
            {/* Booking Progress Stepper */}
            <BookingStepper
              current={bookingStep}
              unlockedThrough={unlockedThrough}
              onJump={jumpStep}
            />

            {/* Step 1: Flight Search Panel */}
            {bookingStep === 'search' && (
              <FlightSearchPanel
                initial={searchCriteria}
                onSearch={handleSearch}
                searching={searching}
              />
            )}

            {/* Step 2: Flight Results & Fare Selection */}
            {bookingStep === 'results' && (
              <FlightResultsPanel
                flights={flights}
                criteria={searchCriteria}
                onBack={() => setBookingStep('search')}
                onSelect={handleSelectItinerary}
              />
            )}

            {/* Step 3: Passenger Details */}
            {bookingStep === 'passengers' && (
              <PassengerDetailsForm
                passengers={passengers}
                onChange={setPassengers}
                onBack={() => setBookingStep('results')}
                onContinue={() => {
                  setBookingStep('seats');
                  advanceUnlock('seats');
                  const first = passengers[0];
                  if (first) {
                    setPassenger((prev) => ({
                      ...prev,
                      name: first.name,
                      email: first.email,
                      traveling_with_infant: passengers.some((p) => p.type === 'infant'),
                    }));
                  }
                }}
              />
            )}

            {/* Step 4: Seat Selection Workstation (8 cols Fuselage / 4 cols Sidebar) */}
            {bookingStep === 'seats' && selectedFlight && (
              <div className="space-y-5">
                {/* Back to Passengers Link */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low p-3.5 rounded-xl border border-border-subtle shadow-sm">
                  <button
                    type="button"
                    onClick={() => setBookingStep('passengers')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-crimson-deep transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Back to Passenger Details</span>
                  </button>

                  <div className="text-xs text-charcoal-muted">
                    <span className="font-mono font-bold text-slate-navy">{selectedFlight.flight_number}</span>
                    <span className="mx-2 text-border-subtle">•</span>
                    <span>
                      Allocating seats for {passengers.length} traveler(s) in{' '}
                      <strong className="text-secondary">{selectedCabinClass.replace('_', ' ')}</strong>
                    </span>
                  </div>
                </div>

                {/* 12-Column Main Workstation Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Fuselage Map (8 cols) */}
                  <div className="lg:col-span-8">
                    <CabinMap
                      seats={seats}
                      selectedSeat={selectedSeatsByPassenger[activePassengerIndex] || null}
                      onSelectSeat={handleSelectSeat}
                      recommendedSeat={recommendation?.recommended_seat || null}
                      highlightedGroupSeats={highlightedGroupSeats}
                      passengers={passengers}
                      activePassengerIndex={activePassengerIndex}
                      onSelectActivePassenger={setActivePassengerIndex}
                      selectedSeatsByPassenger={selectedSeatsByPassenger}
                    />
                  </div>

                  {/* Right Column: Sticky Reservation & Inspector Card (4 cols) */}
                  <div className="lg:col-span-4 space-y-5">
                    <BookingSummary
                      selectedFlight={selectedFlight}
                      selectedSeat={selectedSeatsByPassenger[0] || null}
                      passenger={passenger}
                      passengers={passengers}
                      selectedSeatsByPassenger={selectedSeatsByPassenger}
                      selectedCabinClass={selectedCabinClass}
                      onConfirmBooking={goToConfirmReview}
                      loading={loading}
                      latestReservations={[]}
                    />

                    {/* DSA Smart Engine & Preferences */}
                    <PreferenceForm
                      passenger={passenger}
                      setPassenger={setPassenger}
                      onGetRecommendation={handleGetRecommendation}
                      onFindGroupSeats={handleFindGroupSeats}
                      recommendation={recommendation}
                      groupResult={groupResult}
                      loadingRec={loadingRec}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Final Review & Confirmation */}
            {bookingStep === 'confirm' && selectedFlight && (
              <div className="space-y-4">
                <ConfirmationPanel
                  flight={selectedFlight}
                  criteria={searchCriteria}
                  fareBrand={fareBrand}
                  farePerAdult={farePerAdult}
                  passengers={passengers}
                  selectedSeatsByPassenger={selectedSeatsByPassenger}
                  reservations={latestReservations}
                  onBackToSeats={() => setBookingStep('seats')}
                  onStartNew={resetBooking}
                />

                {latestReservations.length === 0 && (
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setBookingStep('seats')}
                      className="px-5 py-2.5 rounded-xl border border-border-subtle bg-white text-xs font-bold text-slate-navy hover:bg-surface-container-low transition-colors"
                    >
                      Modify Seats
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleConfirmBooking}
                      className="px-8 py-3 rounded-xl bg-primary-container hover:bg-crimson-deep disabled:opacity-60 text-white font-serif text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Securing Seat Inventory...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          <span>Confirm Seat Reservation</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Manage Booking */}
        {activeTab === 'manage' && (
          <ManageBooking
            onReservationCancelled={async () => {
              if (selectedFlight) {
                await loadSeatsForFlight(selectedFlight.id);
                await loadFlights();
              }
              await loadUndoState();
            }}
          />
        )}

        {/* Tab 3: DSA Hub Visualizers */}
        {activeTab === 'dsa' && (
          <div className="space-y-8">
            <div className="bg-slate-navy text-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10">
              <span className="text-xs font-mono font-bold tracking-widest text-secondary-container uppercase">
                College DSA Microproject Demonstrator
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1 text-white">
                X Airways Data Structures &amp; Algorithms Hub
              </h1>
              <p className="text-xs sm:text-sm text-surface-container-highest/80 mt-2 max-w-3xl">
                Inspect, trigger, and verify the concrete data structures and algorithms actively operating within X Airways Intelligence.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/10">
                {[
                  { id: 'seat_grid', label: '0. 2D Seat Matrix', badge: 'CO2' },
                  { id: 'queue', label: '1. Queue (Waitlist)', badge: 'CO1' },
                  { id: 'stack', label: '2. Stack (Undo)', badge: 'CO1' },
                  { id: 'bst', label: '3. BST (PNR Index)', badge: 'CO4' },
                  { id: 'graph', label: '4. Graph & BFS', badge: 'CO5' },
                  { id: 'search_sort', label: '5. Search & Sort Lab', badge: 'CO3' },
                  { id: 'comparison', label: '6. Struct Comparison', badge: 'CO2' },
                  { id: 'matrix', label: 'Course Outcome Alignment', badge: 'CO1–CO5' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDsaSubTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 ${
                      dsaSubTab === tab.id
                        ? 'bg-secondary-container text-slate-navy font-bold shadow-md'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">[{tab.badge}]</span>
                  </button>
                ))}
              </div>
            </div>

            {dsaSubTab === 'seat_grid' && <SeatGridVisualizer />}
            {dsaSubTab === 'queue' && <QueueVisualizer />}
            {dsaSubTab === 'stack' && <StackVisualizer />}
            {dsaSubTab === 'bst' && <BstVisualizer />}
            {dsaSubTab === 'graph' && <GraphVisualizer />}
            {dsaSubTab === 'search_sort' && <SearchSortLab />}
            {dsaSubTab === 'comparison' && <StructureComparison />}
            {dsaSubTab === 'matrix' && <CourseOutcomeMatrix />}
          </div>
        )}

        {/* Tab 4: Algorithm Arena */}
        {activeTab === 'arena' && <AlgorithmArena />}
      </main>

      {/* Floating Undo Stack Bar */}
      <UndoFloatingBar
        topAction={undoStackTop}
        stackSize={undoStackSize}
        onTriggerUndo={handleTriggerUndo}
        loading={loading}
      />

      {/* Footer */}
      <footer className="w-full bg-slate-navy text-surface-container-lowest py-8 mt-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center font-bold text-white">
              <span className="material-symbols-outlined text-[16px]">flight</span>
            </div>
            <div>
              <span className="font-bold text-white">X Airways</span>
            </div>
          </div>

          <div className="text-surface-container-highest/60 text-[11px]">
            © 2026 X Airways. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
