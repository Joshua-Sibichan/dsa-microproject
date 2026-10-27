export interface FlightSegment {
  flight_number: string;
  origin: string;
  origin_city: string;
  destination: string;
  destination_city: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  aircraft_type: string;
}

export interface Flight {
  id: string;
  flight_number: string;
  origin: string;
  origin_city: string;
  destination: string;
  destination_city: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  aircraft_type: string;
  base_fare: number;
  departure_date: string;
  total_seats: number;
  available_seats: number;
  status: string;
  is_connecting?: boolean;
  layover_city?: string;
  layover_airport?: string;
  layover_duration?: string;
  segments?: FlightSegment[];
}

export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  cabin_class: 'FIRST' | 'BUSINESS' | 'PREMIUM_ECONOMY' | 'ECONOMY';
  category: 'REGULAR' | 'PREFERRED' | 'TWIN' | 'EXTRA_LEGROOM';
  row_number: number;
  column_letter: string;
  is_window: boolean;
  is_aisle: boolean;
  is_exit_row: boolean;
  has_bassinet: boolean;
  pitch_inches: number;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'BLOCKED';
}

export interface PassengerPreferences {
  window: boolean;
  aisle: boolean;
  avoid_middle: boolean;
  extra_legroom: boolean;
  prefer_front: boolean;
}

export interface PassengerProfile {
  name: string;
  email: string;
  age: number;
  traveling_with_infant: boolean;
  requires_wheelchair: boolean;
  preferences: PassengerPreferences;
}

export interface PassengerBookingItem {
  passengerIndex: number;
  name: string;
  email: string;
  seat: Seat | null;
  type?: 'adult' | 'child' | 'infant';
  title?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  frequentFlyer?: string;
}

export interface Reservation {
  pnr: string;
  flight_id: string;
  flight_number?: string;
  origin?: string;
  origin_city?: string;
  destination?: string;
  destination_city?: string;
  departure_time?: string;
  arrival_time?: string;
  duration?: string;
  aircraft_type?: string;
  seat_number: string;
  cabin_class?: string;
  category?: string;
  pitch_inches?: number;
  price?: number;
  passenger_name: string;
  passenger_email: string;
  created_at: string;
  status: string;
  bst_lookup_path?: string[];
}

export interface RecommendationFactor {
  factor: string;
  delta: number;
  description: string;
}

export interface RecommendedSeat extends Seat {
  preference_score: number;
  score_breakdown: RecommendationFactor[];
}

export interface RecommendationResult {
  recommended_seat: RecommendedSeat | null;
  alternatives: RecommendedSeat[];
  sorting_metrics?: {
    algorithm: string;
    comparisons: number;
    swaps_or_copies: number;
    execution_time_ns: number;
    execution_time_us: number;
  };
  total_candidates_evaluated: number;
  message: string;
}

export interface GroupSeatingResult {
  found: boolean;
  row?: number;
  section?: string;
  seats?: Seat[];
  seat_numbers?: string[];
  message: string;
}

export interface WaitlistEntry {
  flight_id: string;
  passenger_name: string;
  passenger_email: string;
  preferred_category: string;
  enqueued_at: number;
  queue_position?: number;
}

export interface WaitlistState {
  current_size: number;
  max_capacity: number;
  queue: WaitlistEntry[];
  operation_history: any[];
}

export interface UndoAction {
  action_type: string;
  pnr?: string;
  flight_id?: string;
  seat_number?: string;
  old_seat?: string;
  new_seat?: string;
  passenger_name?: string;
  description: string;
  timestamp: number;
  stack_depth?: number;
}

export interface BSTNodeDict {
  key: string;
  value: any;
  left: BSTNodeDict | null;
  right: BSTNodeDict | null;
}

export interface BSTSummary {
  size: number;
  height: number;
  inorder_traversal: { key: string; value: any }[];
  preorder_traversal: { key: string; value: any }[];
  postorder_traversal: { key: string; value: any }[];
  tree_hierarchy: BSTNodeDict | null;
}

export interface AirportNode {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface AirportEdge {
  source: string;
  target: string;
  flight_number: string;
  duration_hrs: number;
  price: number;
}

export interface GraphNetwork {
  nodes: AirportNode[];
  edges: AirportEdge[];
  adjacency_list: Record<string, string[]>;
}

export interface BFSResult {
  start_node: string;
  traversal_order: string[];
  levels: Record<number, string[]>;
  total_visited: number;
  steps: {
    step: number;
    current_node: string;
    current_level: number;
    queue_before_pop: string[];
    visited_so_far: string[];
    neighbors_enqueued: string[];
  }[];
}

export interface GraphRouteResult {
  origin: string;
  destination: string;
  path: string[];
  segments_count: number;
  stops: number;
  total_estimated_duration_hrs?: number;
  total_estimated_price?: number;
  route_details?: any[];
  algorithm: string;
  optimality_guarantee: string;
  message?: string;
}

export interface SeatGridMetrics {
  matrix_dimensions: string;
  total_matrix_cells: number;
  configured_seats: number;
  occupied_seats: number;
  available_seats: number;
  occupancy_rate_percent: number;
  theoretical_time_complexity: string;
  memory_layout: string;
}

export interface SeatGridResponse {
  flight_id: string;
  metrics: SeatGridMetrics;
  columns: string[];
  min_row: number;
  max_row: number;
  matrix: (Seat | null)[][];
}
