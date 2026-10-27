# AeroSeat Intelligence ✈️

> **Full-Stack Airline Seat-Reservation Application & College Data Structures and Algorithms (DSA) Hub**  
> Inspired by Emirates' visual design and seating workflows, engineered with genuine algorithmic implementations, explainable recommendation heuristics, and comprehensive course outcome coverage (CO1–CO5).

---

## 🌟 Key Features

### Section A: Airline Seat Reservation (Emirates-Inspired)
- **Flight Search & Selection (Feature 1)**: Enter departure and destination airports (Dubai DXB, London LHR, New York JFK, Bangkok BKK, Mumbai BOM, Tokyo HND, Paris CDG, Sydney SYD, Singapore SIN, San Francisco SFO), travel dates, passenger counts (1–4 travelers), and cabin class (Economy, Premium Economy, Business, First). Displays flight numbers, aircraft type, departure/arrival schedules, explicit flight durations (e.g. `14h 25m`), available seats, and dynamic tier fares.
- **Interactive Aircraft Seat Reservation (Feature 2)**: Realistic wide-body Boeing 777-300ER and Airbus A380 cabin fuselage map with cockpit bow, entry galleys, lavatories, exit doors, and aisles.
  - **Cabin Classes**: First Class Private Suites (1-2-1), Business Class Lie-Flat (1-2-1), Premium Economy (2-4-2), and Economy (3-4-3).
  - **Seat States & Legend**: Available (Teal `#168C78`), Selected (Royal Blue `#2563EB`), Occupied (Muted Slate `#94A3B8`), Extra Legroom Exit Row (Gold `#C7A66A` / `#D97706`), Preferred front rows, and Bassinet locations.
  - **Multi-Passenger Seat Assignment**: Dedicated passenger assignment banner pinning active traveler focus, selecting/deselecting seats, preventing duplicate reservations across passengers, and dynamically updating the total booking price and fees in real time.
- **Seat Intelligence & Explainable AI**: Multi-factor deterministic preference scoring engine (Window, Aisle, Extra Legroom, Avoid Middle, Near Front) ranking candidate seats using stable **MergeSort** with full factor breakdowns.
- **Contiguous Group Seating**: Algorithmic 2D row scanner finding 2 to 4 adjacent contiguous seats in identical rows.
- **Manage Booking Portal (Feature 4)**: Dual-field retrieval via **Booking Reference (PNR)** and **Passenger Last Name** powered by a **Binary Search Tree (O(log N))** lookup path display, booking modification (seat change), cancellation, and FIFO waitlist auto-promotion.
- **Live Boarding Pass**: High-resolution boarding pass with simulated barcode and electronic ticket metadata.

### Section B: DSA Hub (Course Outcomes CO1–CO5)
0. **Module 0: 2D Matrix Seat Grid (CO2)** — Aircraft cabin represented as a 2D array `grid[row][col]`. Demonstrates $O(1)$ constant-time coordinate indexing, row-major memory mapping, and spatial contiguous block scanning.
1. **Module 1: Queue Visualizer (CO1)** — Waitlist management via strict FIFO queue. Displays live queue pipeline (Head to Tail pointers), capacity bounds, and deterministic promotion upon seat cancellation in $O(1)$ time.
2. **Module 2: Stack Visualizer (CO1)** — Reservation undo operations via strict LIFO stack. Reverts booking creations, cancellations, or seat swaps with state rollback invariants.
3. **Module 3: Binary Search Tree (CO4)** — Booking reference (PNR) index. Visual tree hierarchy, step-by-step search comparison path, node insertion, deletion (0, 1, 2 children with inorder successor), and Inorder, Preorder, Postorder traversals.
4. **Module 4: Airport Graph & BFS Route Finder (CO5)** — Adjacency List graph of global airport hubs (DXB, LHR, JFK, SIN, SYD, HND, CDG, FRA, BOM, SFO). Computes BFS traversal order, level-by-level wave frontier expansion, and guaranteed **fewest-flight-segment route**.
5. **Module 5: Search & Sort Performance Lab (CO3)** — Empirical benchmark profiling MergeSort vs InsertionSort and Linear vs Binary Search with exact microsecond clocks and operation counters.
6. **Module 6: Data Structure Comparison (CO2)** — Contiguous array cabin inventory vs Hash table PNR lookup profiling cache locality, spatial indexing, and random access.
7. **Module 7: Algorithm Arena (CO3)** — Real head-to-head competition between First-Available sequential greedy allocation and AeroSeat Multi-Factor MergeSort on identical test manifests.
8. **Module 8: Course Outcome Alignment Matrix (CO1–CO5)** — Direct academic syllabus cross-walk mapping all 5 Course Outcomes to code implementations.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.14, FastAPI, Pydantic v2, Uvicorn.
- **Database**: SQLite (ACID transactions, WAL mode, foreign keys, unique seat constraints).
- **Testing**: Pytest (22 unit & integration tests covering 100% of pure DSA engines and API endpoints).

---

## 🚀 Quickstart & Installation

### 1. Repository Branch
Verify you are on the feature branch:
```bash
git checkout feature/aeroseat-emirates-inspired-reservation
```

### 2. Backend Setup & Test Execution
```bash
cd aeroseat-intelligence/backend
# Activate virtual environment
source ../venv/bin/activate

# Run full test suite (22 tests passing)
PYTHONPATH=. pytest -v -p no:cacheprovider

# Start backend server
PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Build
```bash
cd aeroseat-intelligence/frontend
# Install dependencies
npm install

# Build production bundle (automatically served by FastAPI at http://localhost:8000)
npm run build
```

The unified full-stack application will be live at:
**`http://127.0.0.1:8000`**

---

## 📂 Project Structure

```
aeroseat-intelligence/
├── REVERSE_ENGINEERING.md     # Emirates reverse-engineering investigation report
├── DESIGN.md                  # AeroSeat design system specification & tokens
├── ARCHITECTURE.md            # Layered system architecture specification
├── IMPLEMENTATION_PLAN.md     # Execution roadmap & database schema
├── DSA_MAPPING.md             # College DSA Course Outcome alignment matrix (CO1-CO5)
├── README.md                  # Quickstart, architecture & verification summary
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI router, lifespan sync, and static file mount
│   │   ├── database.py        # SQLite schema, migrations, foreign keys, and mock flights
│   │   ├── models.py          # Pydantic v2 validation models
│   │   └── dsa/
│   │       ├── seat_grid_2d.py        # CO2: 2D Matrix Seat Allocation
│   │       ├── queue_waitlist.py      # CO1: FIFO Queue Waitlist
│   │       ├── stack_undo.py          # CO1: LIFO Stack Rollback
│   │       ├── bst_index.py           # CO4: Binary Search Tree PNR Index
│   │       ├── airport_graph.py       # CO5: Graph & BFS Fewest Segments Route
│   │       ├── sorting_algorithms.py  # CO3: MergeSort & InsertionSort
│   │       ├── searching_algorithms.py# CO3: LinearSearch & BinarySearch
│   │       ├── seat_recommender.py    # Multi-Factor Scoring & Group Seating
│   │       └── benchmark_runner.py    # Algorithm Arena Benchmark Suite
│   └── tests/
│       ├── test_dsa.py        # 12 Unit tests for pure DSA modules
│       └── test_api.py        # 10 Integration tests for FastAPI endpoints
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── types.ts           # Shared TypeScript interfaces
        ├── api.ts             # REST client for backend
        ├── App.tsx            # Full-stack orchestrator
        └── components/
            ├── Navbar.tsx             # Luxury aviation header
            ├── FlightSelector.tsx     # Flight search, cabin classes, duration & fares
            ├── CabinMap.tsx           # Multi-passenger interactive cabin deck
            ├── PreferenceForm.tsx     # Multi-factor AI preference form
            ├── BookingSummary.tsx     # Dynamic fare calculation & confirmation
            ├── ManageBooking.tsx      # PNR BST retrieval, seat modify & waitlist
            ├── UndoFloatingBar.tsx    # Persistent LIFO undo trigger
            ├── AlgorithmArena.tsx     # Head-to-head benchmark battle
            └── DsaHub/
                ├── SeatGridVisualizer.tsx     # CO2 2D Matrix visualizer
                ├── QueueVisualizer.tsx        # CO1 Queue visualizer
                ├── StackVisualizer.tsx        # CO1 Stack visualizer
                ├── BstVisualizer.tsx          # CO4 BST canvas & traversals
                ├── GraphVisualizer.tsx        # CO5 Airport network & BFS
                ├── SearchSortLab.tsx          # CO3 Profiler lab
                ├── StructureComparison.tsx    # CO2 Array vs Hash Table
                └── CourseOutcomeMatrix.tsx    # CO1–CO5 verification matrix
```
