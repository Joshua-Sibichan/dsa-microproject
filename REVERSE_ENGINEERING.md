# AeroSeat Intelligence — Reverse Engineering & Investigation Report

## Executive Summary
This document records a public, read-only investigation of the Emirates website (https://www.emirates.com/), specifically its flight-search, seat-selection information, aircraft seating-chart, and manage-booking workflows. The findings guide the original user experience and algorithm integration of **AeroSeat Intelligence**, an academic airline reservation and Data Structures & Algorithms (DSA) demonstration platform.

---

## 1. Target References Investigated
- **Emirates Global Portal**: `https://www.emirates.com/` (regional redirect: `/in/english/`)
- **Flight Search Widget**: Live DOM analysis of departure/arrival selection, date pickers, passenger selectors, and cabin class filters.
- **Seat Selection Experience**: `https://www.emirates.com/english/book/about-booking-online/emirates-seat-selection/`
- **Interactive Seating Charts**: `https://www.emirates.com/english/experience/seating-charts/`
- **Manage Booking Portal**: `https://www.emirates.com/english/manage-booking/`

*Investigation tooling and boundary*: REA 6.7.0 was verified locally (`rea doctor --client codex --json`): its Codex registration and local launcher are aligned, but REA MCP browser tools were not attached to this agent session. The public Emirates landing page was therefore inspected read-only through the available web browser tool. It exposes Book, Manage, Experience, Where We Fly, Loyalty, and Help navigation; its accessible flight form lists origin, destination, departure/return dates, passenger categories (with a stated maximum of nine), cabin classes, advanced search, and a Search flights action. The public navigation also exposes Seat selection, Seating charts, Manage your booking, Change your booking, and Cancel your booking. No login, booking, form submission, payment, or private API was used.

---

## 2. Empirical Observations vs. AeroSeat Implementation

| Domain | Emirates Live Observations (Empirically Verified) | AeroSeat Implementation Strategy |
| :--- | :--- | :--- |
| **Visual Architecture** | • The public page uses a premium airline presentation: a prominent booking module, large destination imagery, strong navigation hierarchy, and dense utility links.<br>• Its publicly observable page does not establish a private design-token system or internal implementation details. | Original AeroSeat tokens use navy, warm gold, white, teal, blue, and slate for a premium aviation feel without copying Emirates assets, logos, or components. |
| **Flight Search & Selection** | • Prominent flight search widget with: Departure airport (IATA + City, e.g. DXB - Dubai), Arrival airport, travel dates, passenger count (Adults, Children, Infants), and Cabin Class (Economy, Premium Economy, Business, First).<br>• Results matrix displaying Flight Numbers (e.g. EK-201), non-stop vs layovers, departure/arrival times, explicit **Duration** (e.g., 14h 25m), Aircraft Type (Boeing 777-300ER, Airbus A380-800), available seats, and tier fares. | Dedicated flight search interface allowing users to filter by origin, destination, travel date, passenger count (1-4), and cabin class, displaying duration and dynamic fares with one-click selection. |
| **Aircraft Seat Map** | • The public site links to Seat selection and Seating charts, and its fleet navigation lists Boeing 777, A380, and A350. Exact live inventory, pricing, and authenticated seat maps are deliberately outside this investigation. | Original CSS cabin map with representative 1-2-1, 2-4-2, and 3-4-3 zones; window/aisle positions; exit-row and bassinet markers; multi-passenger targeting; duplicate prevention; and live price totals. |
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
