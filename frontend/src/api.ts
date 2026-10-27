import {
  Flight, Seat, Reservation, RecommendationResult, GroupSeatingResult,
  WaitlistState, UndoAction, BSTSummary, GraphNetwork, BFSResult, GraphRouteResult,
  PassengerProfile, SeatGridResponse
} from './types';

const BASE_URL = '/api';

export async function fetchFlights(origin?: string, destination?: string): Promise<Flight[]> {
  let url = `${BASE_URL}/flights`;
  const params: string[] = [];
  if (origin) params.push(`origin=${encodeURIComponent(origin)}`);
  if (destination) params.push(`destination=${encodeURIComponent(destination)}`);
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load flights');
  return res.json();
}

export async function fetchFlightSeats(flightId: string): Promise<Seat[]> {
  const res = await fetch(`${BASE_URL}/flights/${flightId}/seats`);
  if (!res.ok) throw new Error('Failed to load seats');
  return res.json();
}

export async function requestRecommendation(
  flightId: string,
  passenger: PassengerProfile,
  cabinClass: string = 'ECONOMY'
): Promise<RecommendationResult> {
  const res = await fetch(`${BASE_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flight_id: flightId, cabin_class: cabinClass, passenger })
  });
  if (!res.ok) throw new Error('Failed to get seat recommendations');
  return res.json();
}

export async function requestGroupSeating(
  flightId: string,
  groupSize: number,
  cabinClass: string = 'ECONOMY'
): Promise<GroupSeatingResult> {
  const res = await fetch(`${BASE_URL}/group-seating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flight_id: flightId, group_size: groupSize, cabin_class: cabinClass })
  });
  if (!res.ok) throw new Error('Failed to search group seating');
  return res.json();
}

export async function createReservation(data: {
  flight_id: string;
  seat_number: string;
  passenger_name: string;
  passenger_email: string;
  preferences?: any;
}): Promise<Reservation> {
  const res = await fetch(`${BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'Reservation failed');
  }
  return res.json();
}

export async function createBatchReservations(data: {
  flight_id: string;
  items: Array<{
    flight_id: string;
    seat_number: string;
    passenger_name: string;
    passenger_email: string;
    preferences?: any;
  }>;
}): Promise<Reservation[]> {
  const res = await fetch(`${BASE_URL}/reservations/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'Batch reservation failed');
  }
  return res.json();
}

export async function retrieveReservation(pnr: string, lastName?: string): Promise<Reservation> {
  let url = `${BASE_URL}/reservations/${pnr}`;
  if (lastName) url += `?last_name=${encodeURIComponent(lastName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'Booking not found');
  }
  return res.json();
}

export async function modifyReservationSeat(pnr: string, newSeatNumber: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/reservations/${pnr}/modify-seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_seat_number: newSeatNumber })
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'Seat modification failed');
  }
  return res.json();
}

export async function cancelReservation(pnr: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/reservations/${pnr}/cancel`, { method: 'POST' });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'Cancellation failed');
  }
  return res.json();
}

export async function triggerUndo(): Promise<any> {
  const res = await fetch(`${BASE_URL}/undo`, { method: 'POST' });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'Undo failed');
  }
  return res.json();
}

export async function fetchUndoHistory(): Promise<{
  current_size: number;
  max_capacity: number;
  stack_contents: UndoAction[];
  recent_logs: any[];
}> {
  const res = await fetch(`${BASE_URL}/undo/history`);
  if (!res.ok) throw new Error('Failed to fetch undo history');
  return res.json();
}

export async function fetchWaitlist(): Promise<WaitlistState> {
  const res = await fetch(`${BASE_URL}/waitlist`);
  if (!res.ok) throw new Error('Failed to fetch waitlist');
  return res.json();
}

export async function enqueueWaitlist(data: {
  flight_id: string;
  passenger_name: string;
  passenger_email: string;
  preferred_category: string;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/waitlist/enqueue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'Enqueue failed');
  }
  return res.json();
}

export async function dequeueWaitlist(): Promise<any> {
  const res = await fetch(`${BASE_URL}/waitlist/dequeue`, { method: 'POST' });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'Dequeue failed');
  }
  return res.json();
}

export async function fetchBSTSummary(): Promise<BSTSummary> {
  const res = await fetch(`${BASE_URL}/dsa/bst`);
  if (!res.ok) throw new Error('Failed to fetch BST summary');
  return res.json();
}

export async function operateBST(data: {
  action: 'INSERT' | 'SEARCH' | 'DELETE';
  pnr: string;
  passenger_name?: string;
  seat_number?: string;
  flight_id?: string;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/dsa/bst/operate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'BST operation failed');
  }
  return res.json();
}

export async function fetchAirportGraph(): Promise<GraphNetwork> {
  const res = await fetch(`${BASE_URL}/dsa/graph`);
  if (!res.ok) throw new Error('Failed to fetch airport network');
  return res.json();
}

export async function runBFS(origin: string): Promise<BFSResult> {
  const res = await fetch(`${BASE_URL}/dsa/graph/bfs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin })
  });
  if (!res.ok) throw new Error('Failed to run BFS');
  return res.json();
}

export async function calculateRoute(origin: string, destination: string): Promise<GraphRouteResult> {
  const res = await fetch(`${BASE_URL}/dsa/graph/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination })
  });
  if (!res.ok) throw new Error('Failed to calculate route');
  return res.json();
}

export async function fetchSeatGrid(flightId: string): Promise<SeatGridResponse> {
  const res = await fetch(`${BASE_URL}/dsa/seat-grid/${flightId}`);
  if (!res.ok) throw new Error('Failed to fetch 2D seat grid');
  return res.json();
}

export async function allocateSeatGrid(data: {
  flight_id: string;
  row_number: number;
  column_letter: string;
  passenger_name: string;
  pnr: string;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/dsa/seat-grid/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || 'Grid allocation failed');
  }
  return res.json();
}

export async function runArenaBenchmark(): Promise<any> {
  const res = await fetch(`${BASE_URL}/dsa/benchmarks/arena`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run arena benchmark');
  return res.json();
}

export async function runSortingBenchmark(datasetSize: number): Promise<any> {
  const res = await fetch(`${BASE_URL}/dsa/benchmarks/sorting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_size: datasetSize })
  });
  if (!res.ok) throw new Error('Failed to run sorting benchmark');
  return res.json();
}

export async function runSearchingBenchmark(datasetSize: number): Promise<any> {
  const res = await fetch(`${BASE_URL}/dsa/benchmarks/searching`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_size: datasetSize })
  });
  if (!res.ok) throw new Error('Failed to run searching benchmark');
  return res.json();
}

export async function runDataStructuresBenchmark(datasetSize: number): Promise<any> {
  const res = await fetch(`${BASE_URL}/dsa/benchmarks/data-structures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_size: datasetSize })
  });
  if (!res.ok) throw new Error('Failed to run data structure benchmark');
  return res.json();
}
