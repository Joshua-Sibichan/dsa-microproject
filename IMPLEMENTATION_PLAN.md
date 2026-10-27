# AeroSeat Intelligence — Implementation Plan & Roadmap

## 1. System Overview & Architecture
**AeroSeat Intelligence** is an Emirates-inspired flight reservation and College Data Structures & Algorithms (DSA) demonstration platform. It bridges realistic airline workflows (flight search, multi-passenger interactive aircraft seat maps, booking management) with pure, benchmarked DSA implementations (2D Arrays, FIFO Queues, LIFO Stacks, Binary Search Trees, Graphs with BFS, MergeSort, and Binary Search).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AeroSeat Intelligence                           │
├────────────────────────────────────────────────────────────────────────┤
│                           FRONTEND (React 18 + TS)                     │
│  [Flight Search]  [Interactive Cabin Map]  [Manage Booking]  [DSA Hub] │
├────────────────────────────────────────────────────────────────────────┤
│                          REST API (FastAPI)                            │
│  /api/flights  /api/reservations  /api/waitlist  /api/undo  /api/dsa   │
├────────────────────────────────────────────────────────────────────────┤
│                           DSA ENGINE LAYER                             │
│  • 2D Matrix (Seat Allocation)      • FIFO Queue (Waitlist)           │
│  • LIFO Stack (Booking Undo)        • BST (PNR Index O(log N))         │
│  • Graph + BFS (Fewest Layovers)    • MergeSort & BinarySearch Lab     │
├────────────────────────────────────────────────────────────────────────┤
│                      PERSISTENCE (SQLite with WAL)                     │
│  flights, seats, reservations (UNIQUE constraints), waitlist_entries  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema

### Table: `flights`
- `id` (TEXT, PK): e.g. `'FL-201'`
- `flight_number` (TEXT): e.g. `'EK-201'`
- `origin` (TEXT): IATA code, e.g. `'DXB'`
- `origin_city` (TEXT): e.g. `'Dubai'`
- `destination` (TEXT): IATA code, e.g. `'JFK'`
- `destination_city` (TEXT): e.g. `'New York'`
- `departure_time` (TEXT): e.g. `'08:30'`
- `arrival_time` (TEXT): e.g. `'14:25'`
- `duration` (TEXT): e.g. `'14h 25m'`
- `aircraft_type` (TEXT): e.g. `'Boeing 777-300ER'`
- `base_fare` (REAL): e.g. `920.0`
- `departure_date` (TEXT): e.g. `'2026-11-15'`
- `total_seats` (INTEGER): e.g. `120`
- `available_seats` (INTEGER): e.g. `110`
- `status` (TEXT): `'ON_TIME'`

### Table: `seats`
- `id` (TEXT, PK): e.g. `'FL-201_15A'`
- `flight_id` (TEXT, FK -> flights.id)
- `seat_number` (TEXT): e.g. `'15A'`
- `cabin_class` (TEXT): `'FIRST'`, `'BUSINESS'`, `'PREMIUM_ECONOMY'`, `'ECONOMY'`
- `category` (TEXT): `'REGULAR'`, `'PREFERRED'`, `'EXTRA_LEGROOM'`
- `row_number` (INTEGER): e.g. `15`
- `column_letter` (TEXT): e.g. `'A'`
- `is_window` (BOOLEAN): `1` or `0`
- `is_aisle` (BOOLEAN): `1` or `0`
- `is_exit_row` (BOOLEAN): `1` or `0`
- `has_bassinet` (BOOLEAN): `1` or `0`
- `pitch_inches` (INTEGER): e.g. `33`
- `price` (REAL): e.g. `140.0`
- `status` (TEXT): `'AVAILABLE'`, `'RESERVED'`, `'BLOCKED'`
- Constraint: `UNIQUE(flight_id, seat_number)` (prevents double bookings)

### Table: `reservations`
- `pnr` (TEXT, PK): 6-char unique booking reference, e.g. `'EK9X2B'`
- `flight_id` (TEXT, FK -> flights.id)
- `seat_number` (TEXT)
- `passenger_name` (TEXT)
- `passenger_email` (TEXT)
- `preferences_json` (TEXT)
- `created_at` (TIMESTAMP)
- `status` (TEXT): `'CONFIRMED'`, `'CANCELLED'`
- Constraint: `FOREIGN KEY(flight_id, seat_number) REFERENCES seats(flight_id, seat_number)`

### Table: `waitlist_entries`
- `id` (INTEGER, PK AUTOINCREMENT)
- `flight_id` (TEXT, FK -> flights.id)
- `passenger_name` (TEXT)
- `passenger_email` (TEXT)
- `preferred_category` (TEXT)
- `created_at` (TIMESTAMP)
- `status` (TEXT): `'WAITING'`, `'PROMOTED'`

---

## 3. Data Structures & Algorithms (DSA) Mapping to Course Outcomes

| Course Outcome | Data Structure / Algorithm | Concrete Feature in AeroSeat | Operational Complexity |
| :--- | :--- | :--- | :--- |
| **CO1: Stacks & Queues** | **FIFO Queue** (`WaitlistQueue`) | Waitlist processing when seats are fully booked. Automatic promotion upon cancellation. | Enqueue: $O(1)$, Dequeue: $O(1)$, Space: $O(N)$ |
| **CO1: Stacks & Queues** | **LIFO Stack** (`UndoStack`) | Booking history and multi-step transaction rollback (creation, cancellation, seat swap). | Push: $O(1)$, Pop: $O(1)$, Space: $O(N)$ |
| **CO2: Data Structure Selection** | **2D Array Matrix** (`SeatGrid2D`) vs. **Hash Table** | Spatial cabin layout coordinate indexing `grid[row][col]` vs. random PNR key lookup. | Array: $O(1)$ coord access, Hash: $O(1)$ key lookup |
| **CO3: Searching & Sorting** | **MergeSort** vs. **InsertionSort** | Multi-factor seat recommendation scoring (Window, Legroom, Pitch, Front row). | MergeSort: $O(N \log N)$ (stable), InsertionSort: $O(N^2)$ |
| **CO3: Searching & Sorting** | **Binary Search** vs. **Linear Search** | Sorted inventory and PNR manifest search with step counters and comparisons. | Binary: $O(\log N)$, Linear: $O(N)$ |
| **CO4: Trees & Hierarchies** | **Binary Search Tree** (`BookingBST`) | PNR reservation directory. Search with step-by-step path, insertion, deletion (0, 1, 2 children), and Inorder, Preorder, Postorder traversals. | Search/Insert/Delete: $O(\log N)$ avg, $O(N)$ worst, Space: $O(N)$ |
| **CO5: Graphs & BFS** | **Adjacency List Graph** (`AirportGraph`) | Global flight hub connectivity. BFS traversal and guaranteed fewest-flight-segment route. | BFS: $O(V + E)$ |

---

## 4. Phased Implementation Tasks

### Step 1: Backend DSA & Model Enhancements
- Implement `SeatGrid2D` in `backend/app/dsa/seat_grid_2d.py` providing explicit 2D matrix allocation, deallocation, bounds checking, and contiguous block scanning.
- Update `database.py` with `duration`, `base_fare`, and enriched flight routes (DXB-JFK, DXB-LHR, DXB-BKK, DXB-BOM, DXB-HND, DXB-CDG, DXB-SYD, DXB-SIN).
- Update `models.py` with `duration`, `base_fare`, and multi-passenger reservation schemas.
- Add endpoints in `main.py` for seat modification (`/api/reservations/{pnr}/modify-seat`), 2D seat grid inspection (`/api/dsa/seat-grid/{flight_id}`), and multi-passenger booking.

### Step 2: Frontend Flight Search & Selection (Feature 1)
- Redesign `FlightSelector.tsx` to provide an Emirates-inspired flight search panel:
  - Departure & Destination airport selector (with major international hubs).
  - Travel date selector.
  - Passenger count selector (1–4 travelers).
  - Cabin class selector (Economy, Premium Economy, Business, First).
  - Flight cards displaying flight number, aircraft, origin, destination, departure/arrival times, explicit duration (e.g. `14h 25m`), and cabin-tier fares.
  - One-click flight selection with visual confirmation.

### Step 3: Interactive Aircraft Seat Reservation & Multi-Passenger Assignment (Feature 2)
- Enhance `CabinMap.tsx` and `App.tsx`:
  - Multi-passenger assignment header: tabs for Passenger 1, Passenger 2, etc., highlighting the currently active passenger.
  - Interactive seat selection: clicking an available seat assigns it to the active passenger; clicking a selected seat unselects it.
  - Duplicate seat assignment prevention across passengers.
  - Color-coded seat states: Available (Teal `#168C78`), Selected (Royal Blue `#2563EB`), Occupied (Muted Slate `#94A3B8`), Extra Legroom Exit Row (Gold `#C7A66A` / `#D97706`), Preferred (Gold border), Recommended (Purple), Contiguous Group (Emerald).
  - Dynamic `BookingSummary.tsx`: displays all passengers, assigned seats, base fare $\times$ passenger count, seat reservation fees, and real-time total fare.

### Step 4: Booking Management & DSA Hub (Features 3 & 4)
- Enhance `ManageBooking.tsx`:
  - PNR & Last Name lookup displaying the BST search comparison path.
  - Realistic boarding pass with simulated barcode.
  - Booking cancellation releasing seat and auto-promoting next waitlisted passenger.
  - Change seat / modify reservation interface.
  - Waitlist manager.
- Enhance DSA Hub:
  - Add 2D Array Matrix Visualizer (`SeatGridVisualizer.tsx`) displaying the row $\times$ column matrix, memory indices, and $O(1)$ coordinate access.
  - Ensure all visualizers (Queue, Stack, BST, Graph BFS, Search/Sort Lab, Structure Comparison, Course Outcome Matrix, Algorithm Arena) are fully responsive and functional.

### Step 5: Verification, Testing & Build
- Add tests in `test_dsa.py` and `test_api.py` for the 2D seat grid, multi-passenger reservations, and seat modifications.
- Run complete pytest suite to ensure 100% test pass rate.
- Run frontend build (`npm run build`) and test production bundle serving via FastAPI.
- Verify end-to-end functionality in browser.
