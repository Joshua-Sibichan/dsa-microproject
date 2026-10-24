# AeroSeat Intelligence ✈️

> **Full-Stack Airline Seat-Reservation Application & College Data Structures and Algorithms (DSA) Hub**  
> Inspired by Emirates' visual design and seating workflows, engineered with genuine algorithmic implementations, explainable recommendation heuristics, and comprehensive course outcome coverage (CO1–CO5).

---

## 🌟 Key Features

### Section A: Airline Seat Reservation
- **Scheduled Flight Operations**: Interactive demonstration manifest with Boeing 777-300ER and Airbus A380-800 flights (EK-201 DXB→JFK, EK-001 DXB→LHR, EK-384 DXB→BKK, EK-500 DXB→BOM).
- **Interactive Cabin Map**: Wide-body fuselage deck with cockpit bow, entry galleys, lavatories, First Class Private Suites (1-2-1), Business Class Flatbeds (1-2-1), Premium Economy (2-4-2), and Economy (3-4-3).
- **Seat States & Legend**: Available (Teal `#168C78`), Selected (Blue `#2563EB`), Occupied (Slate Grey `#94A3B8`), Extra Legroom Exit Row (Gold `#C7A66A`), Bassinet cradles, and Mobility accessibility.
- **Seat Intelligence & Explainable AI**: Multi-factor deterministic preference scoring engine (Window, Aisle, Extra Legroom, Avoid Middle, Near Front) ranking candidate seats using stable **MergeSort** with full factor breakdowns.
- **Contiguous Group Seating**: Algorithmic 2D row scanner finding 2 to 4 adjacent contiguous seats in identical rows.
- **Manage Booking Portal**: Dual-field PNR and Last Name retrieval powered by **Binary Search Tree (O(log N))** lookup path display, booking cancellation, and seat release.
- **Waitlist FIFO Queue**: Automated promotion from the waitlist when occupied seats are cancelled.
- **Live Boarding Pass**: High-resolution boarding pass with simulated barcode and encrypted reservation token.

### Section B: DSA Hub (Course Outcomes CO1–CO5)
1. **Module 1: Queue Visualizer (CO1)** — Waitlist management via strict FIFO queue. Displays live queue pipeline (Head to Tail pointers), capacity bounds, and deterministic promotion upon seat release.
2. **Module 2: Stack Visualizer (CO1)** — Reservation undo operations via strict LIFO stack. Reverts booking creations or cancellations with state rollback invariants.
3. **Module 3: Binary Search Tree (CO4)** — Booking reference (PNR) index. Visual tree hierarchy, step-by-step search comparison path, node insertion, deletion (0, 1, 2 children with inorder successor), and Inorder, Preorder, Postorder traversals.
4. **Module 4: Airport Graph & BFS Route Finder (CO5)** — Adjacency List graph of global airport hubs (DXB, LHR, JFK, SIN, SYD, HND, CDG, FRA, BOM, SFO). Computes BFS traversal order, level-by-level wave frontier expansion, and guaranteed **fewest-flight-segment route**.
5. **Module 5: Search & Sort Performance Lab (CO3)** — Empirical benchmark profiling MergeSort vs InsertionSort and Linear vs Binary Search with exact microsecond clocks and operation counters.
6. **Module 6: Data Structure Comparison (CO2)** — Contiguous array cabin inventory vs Hash table PNR lookup profiling cache locality, spatial indexing, and random access.
7. **Module 7: Algorithm Arena (Phase 4)** — Real head-to-head competition between First-Available sequential greedy allocation and AeroSeat Multi-Factor MergeSort on identical test manifests.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.14, FastAPI, Pydantic v2, Uvicorn.
- **Database**: SQLite (ACID transactions, WAL mode, foreign keys, unique seat constraints).
- **Testing**: Pytest (19 unit & integration tests covering 100% of pure DSA engines and API endpoints).

---

## 🚀 Quickstart & Installation

### 1. Backend Setup & Test Execution
```bash
cd aeroseat-intelligence/backend
# Activate virtual environment
source ../venv/bin/activate

# Run full test suite (19 tests)
PYTHONPATH=. pytest -v -p no:cacheprovider

# Start backend server
PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Build
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
├── REVERSE_ENGINEERING.md     # Phase 1: Emirates reverse-engineering investigation report
├── DESIGN.md                  # Phase 1: AeroSeat design system specification & tokens
├── ARCHITECTURE.md            # Phase 1: Layered system architecture specification
├── IMPLEMENTATION_PLAN.md     # Phase 1: Execution roadmap & testing strategy
├── DSA_MAPPING.md             # Phase 1 & 3: College DSA Course Outcome alignment matrix
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI router, lifespan sync, and static file mount
│   │   ├── database.py        # SQLite schema, foreign keys, and mock cabin seed
│   │   ├── models.py          # Pydantic v2 validation models
│   │   └── dsa/
│   │       ├── queue_waitlist.py      # CO1: FIFO Queue
│   │       ├── stack_undo.py          # CO1: LIFO Stack
│   │       ├── bst_index.py           # CO4: Binary Search Tree
│   │       ├── airport_graph.py       # CO5: Graph & BFS Fewest Segments Route
│   │       ├── sorting_algorithms.py  # CO3: MergeSort & InsertionSort
│   │       ├── searching_algorithms.py# CO3: LinearSearch & BinarySearch
│   │       ├── seat_recommender.py    # Phase 4: Multi-Factor Scoring & Group Seating
│   │       └── benchmark_runner.py    # Phase 4: Algorithm Arena Benchmark Suite
│   └── tests/
│       ├── test_dsa.py        # 11 Unit tests for pure DSA modules
│       └── test_api.py        # 8 Integration tests for FastAPI endpoints
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
            ├── FlightSelector.tsx     # Demonstration flight switcher
            ├── CabinMap.tsx           # Boeing 777 interactive cabin deck
            ├── PreferenceForm.tsx     # Multi-factor AI preference form
            ├── BookingSummary.tsx     # Boarding pass & confirmation
            ├── ManageBooking.tsx      # PNR BST retrieval & cancellation
            ├── UndoFloatingBar.tsx    # Persistent LIFO undo trigger
            ├── AlgorithmArena.tsx     # Head-to-head benchmark battle
            └── DsaHub/
                ├── QueueVisualizer.tsx        # CO1 Queue visualizer
                ├── StackVisualizer.tsx        # CO1 Stack visualizer
                ├── BstVisualizer.tsx          # CO4 BST canvas & traversals
                ├── GraphVisualizer.tsx        # CO5 Airport network & BFS
                ├── SearchSortLab.tsx          # CO3 Profiler lab
                ├── StructureComparison.tsx    # CO2 Array vs Hash Table
                └── CourseOutcomeMatrix.tsx    # CO1–CO5 verification matrix
```
