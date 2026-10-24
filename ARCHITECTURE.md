# AeroSeat Intelligence — System Architecture Specification

## 1. Architectural Overview

AeroSeat Intelligence is architected as a decoupled, layered full-stack application designed for maximum modularity, academic transparency, and zero circular dependencies.

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND (React + TS + Vite)                      |
|                                                                                   |
|   [ Reservation Workspace ]       [ Interactive Cabin Map ]     [ DSA Interactive Hub ]
|   - Flight Search / Selector       - SVG/Canvas Fuselage Deck    - 1. Queue Visualizer   |
|   - Passenger Preference Form     - Seat Matrix Component       - 2. Stack Undo Lab     |
|   - My Bookings & PNR Lookup      - Recommendation Overlay      - 3. BST PNR Explorer   |
|   - Real-time Boarding Pass       - Group Seating Visualizer    - 4. Graph & BFS Route  |
|                                                                 - 5. Search/Sort Lab    |
|                                                                 - 6. Struct Comparison  |
|                                                                 - 7. Algorithm Arena    |
+------------------------------------------+----------------------------------------+
                                           | HTTP REST API (JSON)
                                           v
+-----------------------------------------------------------------------------------+
|                                 BACKEND (FastAPI + Python 3.14)                   |
|                                                                                   |
|  [ API Router Layer ]                                                             |
|  - /api/flights            - /api/seats            - /api/reservations            |
|  - /api/recommendations    - /api/waitlist         - /api/undo                    |
|  - /api/dsa/bst            - /api/dsa/graph        - /api/dsa/benchmarks          |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                             CORE DSA ENGINE MODULES                         |  |
|  |  [QueueEngine]       [UndoStackEngine]     [BSTIndexEngine]                 |  |
|  |  - FIFO Waitlist     - State Snapshots     - Insert, Search, Traversal      |  |
|  |                                                                             |  |
|  |  [AirportGraphEngine]                      [SeatSortingEngine]              |  |
|  |  - Adjacency List BFS Routing              - MergeSort, InsertionSort       |  |
|  |                                            - Preference Scoring Engine      |  |
|  +-----------------------------------------------------------------------------+  |
|                                          |                                        |
|  [ Persistence Repository ]              | In-Memory Cache & State                |
|  - SQLite (WAL mode, ACID constraints)   | - Active seat lock table               |
|  - Strict UNIQUE(flight_id, seat_number) | - Real-time execution benchmark timers |
+------------------------------------------+----------------------------------------+
```

---

## 2. Component Subsystems

### 2.1 Backend Architecture (`/backend`)
1. **`app/main.py`**: FastAPI application entry point, CORS middleware, error handlers, and lifecycle hooks.
2. **`app/models/`**: Pydantic v2 schemas (`Seat`, `Flight`, `Passenger`, `Reservation`, `PreferenceRequest`, `DSARequest`, `BenchmarkResult`).
3. **`app/database/`**: SQLite persistence manager using Python's standard `sqlite3` library with WAL journaling, parameterized queries, and unique constraints.
4. **`app/dsa/`**: Standalone, testable algorithmic implementations:
   - `queue_waitlist.py`: Fixed-size and dynamic FIFO queue with peek, enqueue, dequeue, and history logs.
   - `stack_undo.py`: LIFO undo stack recording state delta operations with rollback safety validation.
   - `bst_index.py`: Binary Search Tree for 6-character PNR booking reference indexing, including Inorder, Preorder, Postorder traversals, search, insert, and delete.
   - `airport_graph.py`: Graph represented as an adjacency list with Breadth-First Search (BFS) for traversal order and fewest-segment route calculation.
   - `sorting_algorithms.py`: Custom implementations of MergeSort and InsertionSort with operation step counters and nanosecond timing.
   - `searching_algorithms.py`: Custom implementations of LinearSearch and BinarySearch on sorted inventories with comparison counters.
   - `seat_recommender.py`: Multi-factor deterministic preference scoring engine and contiguous group seating finder.
   - `benchmark_runner.py`: Reproducible microbenchmark suite executing identical datasets across algorithms.

### 2.2 Database Schema (`SQLite`)
```sql
CREATE TABLE IF NOT EXISTS flights (
    id TEXT PRIMARY KEY,
    flight_number TEXT NOT NULL,
    origin TEXT NOT NULL,
    origin_name TEXT NOT NULL,
    destination TEXT NOT NULL,
    destination_name TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    aircraft_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ON_TIME'
);

CREATE TABLE IF NOT EXISTS seats (
    id TEXT PRIMARY KEY,
    flight_id TEXT NOT NULL,
    seat_number TEXT NOT NULL,
    cabin_class TEXT NOT NULL, -- 'FIRST', 'BUSINESS', 'PREMIUM_ECONOMY', 'ECONOMY'
    category TEXT NOT NULL,    -- 'REGULAR', 'PREFERRED', 'TWIN', 'EXTRA_LEGROOM'
    row_number INTEGER NOT NULL,
    column_letter TEXT NOT NULL,
    is_window BOOLEAN NOT NULL DEFAULT 0,
    is_aisle BOOLEAN NOT NULL DEFAULT 0,
    is_exit_row BOOLEAN NOT NULL DEFAULT 0,
    has_bassinet BOOLEAN NOT NULL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RESERVED', 'BLOCKED'
    FOREIGN KEY(flight_id) REFERENCES flights(id),
    UNIQUE(flight_id, seat_number)
);

CREATE TABLE IF NOT EXISTS reservations (
    pnr TEXT PRIMARY KEY,
    flight_id TEXT NOT NULL,
    seat_number TEXT NOT NULL,
    passenger_name TEXT NOT NULL,
    passenger_email TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'CANCELLED'
    FOREIGN KEY(flight_id) REFERENCES flights(id),
    FOREIGN KEY(flight_id, seat_number) REFERENCES seats(flight_id, seat_number)
);

CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id TEXT NOT NULL,
    passenger_name TEXT NOT NULL,
    passenger_email TEXT NOT NULL,
    preferred_category TEXT NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'WAITING',
    FOREIGN KEY(flight_id) REFERENCES flights(id)
);
```

### 2.3 Frontend Architecture (`/frontend`)
Built with **React 18 + TypeScript + Vite + Tailwind CSS**:
- **State Management**: Reactive custom hooks + lightweight contextual stores for Flight, Active Cabin, Current Selection, Undo Stack, and Live DSA state.
- **Routing**: Seamless multi-tab navigation:
  - `/` (Home & Flight Search)
  - `/book` (Interactive Cabin Seat Reservation & Recommendation)
  - `/manage` (PNR Booking Retrieval & Seat Modification / Cancellation)
  - `/dsa` (Comprehensive DSA Visualizer Hub & Course Outcome Lab)
  - `/arena` (Algorithm Arena & Performance Benchmarking)
- **Visualizer Engine**: Custom SVG and Canvas vector components rendering queues, stacks, trees, and graphs with animated transitions.
