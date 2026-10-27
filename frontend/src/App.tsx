import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FlightSelector } from './components/FlightSelector';
import { CabinMap } from './components/CabinMap';
import { PreferenceForm } from './components/PreferenceForm';
import { BookingSummary } from './components/BookingSummary';
import { ManageBooking } from './components/ManageBooking';
import { UndoFloatingBar } from './components/UndoFloatingBar';
import { AlgorithmArena } from './components/AlgorithmArena';

// DSA Hub Components
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
  createReservation,
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

import { AlertCircle, CheckCircle2, Layers } from 'lucide-react';

const DEFAULT_PASSENGERS: PassengerBookingItem[] = [
  { passengerIndex: 0, name: 'Eleanor Vance', email: 'eleanor@aero.org', seat: null },
  { passengerIndex: 1, name: 'Lord Arthur Sterling', email: 'sterling@aero.org', seat: null },
  { passengerIndex: 2, name: 'Dr. Maya Lin', email: 'maya@lin.org', seat: null },
  { passengerIndex: 3, name: 'Carlos Mendez', email: 'carlos@tech.io', seat: null },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'book' | 'manage' | 'dsa' | 'arena'>('book');
  const [dsaSubTab, setDsaSubTab] = useState<
    'seat_grid' | 'queue' | 'stack' | 'bst' | 'graph' | 'search_sort' | 'comparison' | 'matrix'
  >('seat_grid');

  // Flight & Seat State
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);

  // Multi-Passenger State (Features 1 & 2)
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [passengers, setPassengers] = useState<PassengerBookingItem[]>(DEFAULT_PASSENGERS.slice(0, 1));
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0);
  const [selectedSeatsByPassenger, setSelectedSeatsByPassenger] = useState<Record<number, Seat>>({});
  const [selectedCabinClass, setSelectedCabinClass] = useState<string>('ECONOMY');

  // Passenger Preference & Recommendation State
  const [passenger, setPassenger] = useState<PassengerProfile>({
    name: 'Eleanor Vance',
    email: 'eleanor@aero.org',
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

  // Undo Stack State
  const [undoStackTop, setUndoStackTop] = useState<UndoAction | null>(null);
  const [undoStackSize, setUndoStackSize] = useState<number>(0);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRec, setLoadingRec] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync passengers array when passengerCount changes
  useEffect(() => {
    const updated = DEFAULT_PASSENGERS.slice(0, passengerCount).map((p, idx) => ({
      ...p,
      seat: selectedSeatsByPassenger[idx] || null
    }));
    setPassengers(updated);
    if (activePassengerIndex >= passengerCount) {
      setActivePassengerIndex(0);
    }
  }, [passengerCount, selectedSeatsByPassenger]);

  // Initial Data Load
  useEffect(() => {
    loadFlights();
    loadUndoState();
  }, []);

  const loadFlights = async (origin?: string, destination?: string) => {
    try {
      const flList = await fetchFlights(origin, destination);
      setFlights(flList);
      if (flList.length > 0 && !selectedFlight) {
        setSelectedFlight(flList[0]);
        loadSeatsForFlight(flList[0].id);
      }
    } catch (err: any) {
      showToast('error', 'Failed to connect to backend flight inventory');
    }
  };

  const loadSeatsForFlight = async (flightId: string) => {
    try {
      const stList = await fetchFlightSeats(flightId);
      setSeats(stList);
      setSelectedSeatsByPassenger({});
      setRecommendation(null);
      setGroupResult(null);
      setHighlightedGroupSeats([]);
    } catch (err: any) {
      showToast('error', 'Failed to load aircraft seat inventory');
    }
  };

  const loadUndoState = async () => {
    try {
      const history = await fetchUndoHistory();
      setUndoStackSize(history.current_size);
      setUndoStackTop(history.stack_contents.length > 0 ? history.stack_contents[0] : null);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. Flight Selection
  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    loadSeatsForFlight(flight.id);
    showToast('success', `Selected Flight ${flight.flight_number} (${flight.origin} → ${flight.destination})`);
  };

  // 2. Interactive Seat Selection with Multi-Passenger Support (Feature 2)
  const handleSelectSeat = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') {
      showToast('error', `Seat ${seat.seat_number} is already occupied. Join waitlist via Manage Booking!`);
      return;
    }

    // Check if this seat is already selected by current active passenger -> Deselect
    const currentSeatForActive = selectedSeatsByPassenger[activePassengerIndex];
    if (currentSeatForActive?.seat_number === seat.seat_number) {
      const nextSeats = { ...selectedSeatsByPassenger };
      delete nextSeats[activePassengerIndex];
      setSelectedSeatsByPassenger(nextSeats);
      return;
    }

    // Check if this seat is already selected by another passenger in this booking -> Prevent duplicate
    const alreadyOwnerIdx = Object.entries(selectedSeatsByPassenger).find(
      ([idxStr, s]) => s.seat_number === seat.seat_number && Number(idxStr) !== activePassengerIndex
    );

    if (alreadyOwnerIdx) {
      const otherIdx = Number(alreadyOwnerIdx[0]);
      showToast('error', `Seat ${seat.seat_number} is already selected by Passenger ${otherIdx + 1}.`);
      return;
    }

    // Assign seat to active passenger
    const nextSeats = {
      ...selectedSeatsByPassenger,
      [activePassengerIndex]: seat
    };
    setSelectedSeatsByPassenger(nextSeats);

    // Auto-advance to next unassigned passenger for smooth UX
    for (let i = 0; i < passengerCount; i++) {
      if (!nextSeats[i]) {
        setActivePassengerIndex(i);
        break;
      }
    }
  };

  // 3. Trigger AI Seat Recommendation (CO3 MergeSort)
  const handleGetRecommendation = async () => {
    if (!selectedFlight) return;
    setLoadingRec(true);
    try {
      const res = await requestRecommendation(selectedFlight.id, passenger, selectedCabinClass);
      setRecommendation(res);
      if (res.recommended_seat) {
        // Assign to currently active passenger
        setSelectedSeatsByPassenger((prev) => ({
          ...prev,
          [activePassengerIndex]: res.recommended_seat!
        }));
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Recommendation failed');
    } finally {
      setLoadingRec(false);
    }
  };

  // 4. Trigger Group Seating Search
  const handleFindGroupSeats = async (size: number) => {
    if (!selectedFlight) return;
    try {
      const res = await requestGroupSeating(selectedFlight.id, size, selectedCabinClass);
      setGroupResult(res);
      if (res.found && res.seat_numbers && res.seats) {
        setHighlightedGroupSeats(res.seat_numbers);
        
        // Auto-assign contiguous block to passengers up to count
        const newSeats: Record<number, Seat> = { ...selectedSeatsByPassenger };
        res.seats.slice(0, passengerCount).forEach((st, idx) => {
          newSeats[idx] = st;
        });
        setSelectedSeatsByPassenger(newSeats);
        showToast('success', res.message);
      } else {
        setHighlightedGroupSeats([]);
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Group search failed');
    }
  };

  // 5. Confirm Multi-Passenger or Single Reservation
  const handleConfirmBooking = async () => {
    if (!selectedFlight) return;

    // Check that all passengers have assigned seats
    for (let i = 0; i < passengerCount; i++) {
      if (!selectedSeatsByPassenger[i]) {
        showToast('error', `Please assign a seat for Passenger ${i + 1}`);
        setActivePassengerIndex(i);
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
      showToast('success', `Reservation confirmed! Reference(s): ${pnrs}`);

      // Refresh seats and undo state
      await loadSeatsForFlight(selectedFlight.id);
      await loadFlights();
      await loadUndoState();
    } catch (err: any) {
      showToast('error', err.message || 'Reservation failed');
    } finally {
      setLoading(false);
    }
  };

  // 6. Trigger Undo
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

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 flex flex-col font-sans">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedFlight={selectedFlight}
        undoCount={undoStackSize}
        onTriggerUndo={handleTriggerUndo}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-500'
              : 'bg-red-900/90 text-white border-red-500'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: SEAT SELECTION & RESERVATION */}
        {activeTab === 'book' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Flight Search & Selector (Feature 1) */}
            <FlightSelector
              flights={flights}
              selectedFlight={selectedFlight}
              onSelectFlight={handleSelectFlight}
              passengerCount={passengerCount}
              setPassengerCount={setPassengerCount}
              selectedCabinClass={selectedCabinClass}
              setSelectedCabinClass={setSelectedCabinClass}
              onSearch={(orig, dest) => loadFlights(orig, dest)}
            />

            {/* Split Grid: Cabin Map + Right Sidebars (Feature 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Cabin Map Deck (7 Cols on large screens) */}
              <div className="lg:col-span-7">
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

              {/* Side Panels (5 Cols) */}
              <div className="lg:col-span-5 space-y-8">
                <PreferenceForm
                  passenger={passenger}
                  setPassenger={setPassenger}
                  onGetRecommendation={handleGetRecommendation}
                  onFindGroupSeats={handleFindGroupSeats}
                  recommendation={recommendation}
                  groupResult={groupResult}
                  loadingRec={loadingRec}
                />

                <BookingSummary
                  selectedFlight={selectedFlight}
                  selectedSeat={selectedSeatsByPassenger[0] || null}
                  passenger={passenger}
                  passengers={passengers}
                  selectedSeatsByPassenger={selectedSeatsByPassenger}
                  selectedCabinClass={selectedCabinClass}
                  onConfirmBooking={handleConfirmBooking}
                  loading={loading}
                  latestReservations={latestReservations}
                />
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: MANAGE BOOKING & WAITLIST (Feature 4) */}
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

        {/* VIEW 3: DSA HUB (Features 3 & 4) */}
        {activeTab === 'dsa' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* DSA Hub Header & Navigation Subtabs */}
            <div className="bg-[#10243A] text-white rounded-3xl p-8 shadow-xl border border-navy-800">
              <span className="text-xs font-mono font-bold tracking-widest text-[#C7A66A] uppercase">
                College DSA Microproject Demonstrator
              </span>
              <h1 className="text-3xl font-bold font-serif mt-1">AeroSeat Data Structures & Algorithms Hub</h1>
              <p className="text-sm text-slate-300 mt-2 max-w-3xl">
                Inspect, trigger, and verify the concrete data structures and algorithms actively operating within AeroSeat Intelligence.
              </p>

              {/* Subtabs */}
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-navy-800">
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
                        ? 'bg-[#C7A66A] text-[#10243A] font-bold shadow-md'
                        : 'bg-navy-900 text-slate-300 hover:bg-navy-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">[{tab.badge}]</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtab Body */}
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

        {/* VIEW 4: ALGORITHM ARENA */}
        {activeTab === 'arena' && <AlgorithmArena />}

      </main>

      {/* Persistent Floating Undo Bar */}
      <UndoFloatingBar
        topAction={undoStackTop}
        stackSize={undoStackSize}
        onTriggerUndo={handleTriggerUndo}
        loading={loading}
      />

      {/* Footer */}
      <footer className="mt-16 bg-[#10243A] text-slate-400 border-t border-navy-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs gap-4">
          <div>
            <span className="font-bold text-white">AeroSeat Intelligence</span> • College DSA Course Outcome Demonstration Platform
          </div>
          <div className="font-mono text-slate-400">
            Stack: React 18 + TypeScript + Vite + Tailwind + Python 3.14 + FastAPI + SQLite
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
