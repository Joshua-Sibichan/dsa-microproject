# AeroSeat Intelligence — Reverse Engineering & Investigation Report

## Executive Summary
This document records the empirical reverse-engineering investigation of the Emirates airline web application (https://www.emirates.com/), specifically analyzing its flight booking, seat reservation, aircraft cabin layouts, and manage-booking workflows. The findings directly guide the architectural design, user experience, and algorithm integration of **AeroSeat Intelligence**, a high-fidelity academic airline seat-reservation and Data Structures & Algorithms (DSA) demonstration platform.

---

## 1. Target References Investigated
- **Emirates Global Portal**: `https://www.emirates.com/` & `https://www.emirates.com/english/`
- **Flight Search Widget**: Live DOM analysis of departure/arrival selection, date pickers, passenger selectors, and cabin class filters.
- **Seat Selection Experience**: `https://www.emirates.com/english/book/about-booking-online/emirates-seat-selection/`
- **Interactive Seating Charts**: `https://www.emirates.com/english/experience/seating-charts/`
- **Manage Booking Portal**: `https://www.emirates.com/english/manage-booking/`

*Investigation Tooling*: Playwright CDP browser automation agent (`browser_navigate`, `browser_snapshot`, DOM introspection). Non-invasive passive inspection was maintained; no live bookings or payments were initiated.

---

## 2. Empirical Observations vs. AeroSeat Implementation

| Domain | Emirates Live Observations (Empirically Verified) | AeroSeat Implementation Strategy |
| :--- | :--- | :--- |
| **Visual Architecture** | • Deep luxury palette: Deep navy header/footer (`#10243A` / `#0D1929`), crisp white surfaces, soft neutral backgrounds (`#F7F9FC`), gold/bronze badges (`#C7A66A`), emerald teal (`#168C78`) for available seats, royal electric blue (`#2563EB`) for selected seats.<br>• High-contrast typography with bold headings and clean geometric body copy.<br>• Floating cards with soft elevation shadows (`box-shadow: 0 4px 20px rgba(0,0,0,0.08)`). | Direct adoption of Emirates-inspired color tokens, clean card elevations, intuitive legend banners, and responsive layout for mobile and desktop screens. |
| **Flight Search & Selection** | • Prominent flight search widget with: Departure airport (IATA + City, e.g. DXB - Dubai), Arrival airport, travel dates, passenger count (Adults, Children, Infants), and Cabin Class (Economy, Premium Economy, Business, First).<br>• Results matrix displaying Flight Numbers (e.g. EK-201), non-stop vs layovers, departure/arrival times, explicit **Duration** (e.g., 14h 25m), Aircraft Type (Boeing 777-300ER, Airbus A380-800), available seats, and tier fares. | Dedicated flight search interface allowing users to filter by origin, destination, travel date, passenger count (1-4), and cabin class, displaying duration and dynamic fares with one-click selection. |
| **Aircraft Seat Map** | • Distinct cabin zones: First Class (1-2-1 private suites), Business Class (1-2-1 lie-flat), Premium Economy (2-4-2 wide), Economy Class (3-4-3 wide-body standard).<br>• Aisle and window indicators, cockpit/bow orientation, exit doors, galleys, lavatories, bassinet locations.<br>• Seat states: Available (Teal), Occupied (Muted Slate Gray), Selected (Royal Blue), Preferred/Extra Legroom (Gold border), Exit Row with safety alerts.<br>• Multi-passenger assignment: Active passenger selector banner allowing seats to be assigned to each passenger individually. | Realistic SVG/CSS aircraft fuselage cabin map implementing Boeing 777-300ER and Airbus A380 layouts, multi-passenger selection bar with active passenger targeting, duplicate reservation prevention, and real-time pricing updates. |
| **Manage Booking Flow** | • Dual-field retrieval: **Last Name** (min 2 chars) + **Booking Reference / PNR** (6-character alphanumeric code, e.g., `EK` + 4 characters).<br>• Itinerary overview, seat change/modification, cancellation, special requests.<br>• Clear validation feedback and error states. | Dual-field retrieval powered by **Binary Search Tree (BST)** showing the exact comparison traversal path ($O(\log N)$). Displays boarding pass with simulated barcode, seat modification, cancellation, and waitlist auto-promotion. |
| **Waitlist & Concurrency** | • When cabins or fare buckets sell out, passengers can join waitlists or alternate flights.<br>• In commercial aviation, GDS systems manage queue priorities. | Strict **FIFO Queue** managing passenger waitlists. When an occupied seat is cancelled, the head of the waitlist queue is automatically dequeued and offered/promoted to the newly released seat in $O(1)$ time. |
| **State Reversibility** | • Complex transaction logs and Sabre/Amadeus ticketing locks. | Transparent **LIFO Stack** for booking history and undo operations, recording state deltas with rollback invariants. |

---

## 3. Technology Stack Choice & Justification

After inspecting the workspace and requirements, the most suitable, robust, and clean technology stack for this college DSA micro-project is:

1. **Frontend**:
   - **React 18** with **TypeScript** for type safety and component-driven UI.
   - **Vite** for fast modern bundling and hot module replacement.
   - **Tailwind CSS** for responsive styling matching Emirates' luxury color palette (`#10243A` navy, `#C7A66A` gold, `#168C78` teal, `#2563EB` blue).
   - **Lucide Icons** for aviation iconography (Plane, Ticket, Users, Clock, Calendar, QrCode, Shield, Layers, Sparkles).

2. **Backend**:
   - **Python 3.14** with **FastAPI** for high-performance async REST API endpoints.
   - **Pydantic v2** for rigorous schema validation.
   - **SQLite** in WAL mode with foreign keys and unique constraints for ACID-compliant persistence and duplicate reservation prevention.
   - **Uvicorn** ASGI server serving both backend APIs and the compiled frontend single-page application.

3. **DSA Engine Architecture**:
   - Implemented as pure, decoupled Python data structures with explicit time and space complexities:
     - **2D Array / Matrix (`SeatGrid2D`)**: Direct $O(1)$ coordinate access `grid[row][col]`, contiguous 2D block search.
     - **FIFO Queue (`WaitlistQueue`)**: $O(1)$ `enqueue()` and `dequeue()` for passenger waitlist handling.
     - **LIFO Stack (`UndoStack`)**: $O(1)$ `push()` and `pop()` for reservation history and rollback.
     - **Binary Search Tree (`BookingBST`)**: $O(\log N)$ average insertion, search, and deletion with Inorder, Preorder, and Postorder traversals.
     - **Adjacency List Graph (`AirportGraph`)**: Breadth-First Search (BFS) in $O(V + E)$ computing guaranteed fewest-flight-segment routes.
     - **Sorting & Searching Algorithms**: MergeSort $O(N \log N)$ vs InsertionSort $O(N^2)$, Binary Search $O(\log N)$ vs Linear Search $O(N)$.
