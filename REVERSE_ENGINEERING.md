# AeroSeat Intelligence — Reverse Engineering Investigation Report

## Executive Summary
This document records the empirical reverse-engineering investigation of the Emirates airline web application, specifically targeting flight booking, manage-booking, and seat-selection workflows. The goal is to inform the architectural design and user experience of **AeroSeat Intelligence**, a high-fidelity academic airline seat-reservation and Data Structures & Algorithms (DSA) demonstration platform.

---

## 1. Target References Investigated
- **Emirates Global Portal**: `https://www.emirates.com/`
- **Seat Selection Experience**: `https://www.emirates.com/english/book/about-booking-online/emirates-seat-selection/`
- **Interactive Seating Charts**: `https://www.emirates.com/english/experience/seating-charts/`
- **Manage Booking Portal**: `https://www.emirates.com/english/manage-booking/`

*Tooling Used*: Playwright browser automation MCP agent (`browser_navigate`, `browser_snapshot`, DOM introspection). Non-invasive passive inspection was maintained; no authentications were bypassed, and no live bookings or payments were initiated.

---

## 2. Verified Observations vs. Assumptions

| Domain | Verified Observations (Empirically Inspected) | Assumptions & Operational Inferences |
| :--- | :--- | :--- |
| **Visual Architecture** | • Deep luxury palette: Deep navy header/footer (`#10243A` / `#222222`), pure white card surfaces, soft neutral backgrounds (`#F7F9FC`), gold/bronze badges (`#C7A66A`), emerald/teal for active/available elements, vivid blue for current selections.<br>• High-contrast typographic scale with bold serif/sans-serif headings and clean geometric body copy.<br>• Floating elevation cards with soft shadows (`box-shadow: 0 4px 20px rgba(0,0,0,0.08)`). | Cabin textures and 3D WebGL rendering engine likely leverage three.js or Babylon.js for their 3D aircraft view. For AeroSeat, an SVG + Canvas responsive interactive deck map provides predictable rendering and accessibility across devices. |
| **Manage Booking Flow** | • Dual-field retrieval: **Last Name** (string, min 2 chars) + **Booking Reference / PNR** (alphanumeric string, standard 6-character format).<br>• Prominent primary CTA "Retrieve Booking".<br>• Clear error feedback when parameters are missing or invalid.<br>• Once loaded: shows passenger list, flight leg summary, and actionable tabs ("Select Seat", "Change Seat", "Cancel Flight", "Special Requests"). | Backend storage uses indexed PNR lookups. In our DSA module, this maps directly to a **Binary Search Tree** and **Hash Table** comparison for PNR retrieval (O(log n) vs O(1)). |
| **Seat Classification** | • Distinct cabin tiers: First Class, Business Class, Premium Economy, Economy Class.<br>• Economy sub-categories:<br>  1. **Regular Seat**: Standard seat (Window, Middle, Aisle).<br>  2. **Preferred Seat**: Front rows of economy cabin or upper deck for priority disembarkation.<br>  3. **Twin Seat**: Two-seat rows at rear of wide-body aircraft (no middle seat).<br>  4. **Extra Legroom Seat**: Exit row seats with strict safety eligibility rules (e.g. age, physical ability).<br>  5. **Bassinet & Accessible Seats**: Designated for infants or mobility requirements. | Pricing logic dynamically adjusts seat fees based on fare class (Special, Saver, Flex, Flex Plus) and frequent flyer tier. AeroSeat implements deterministic scoring and allocation based on these exact seat attributes. |
| **Seat Map Interaction** | • Deck switcher (Upper Deck vs Lower Deck on multi-deck aircraft such as A380).<br>• Clear visual legend: Available, Selected, Occupied, Bassinet, Accessible, Exit Row, Galley, Lavatory.<br>• Multi-passenger seat assignment banner pinning active passenger selector to current seat selection.<br>• Interactive seat nodes with hover states, row/column indicators (e.g., 12A, 12B, 12C \| Aisle \| 12D, 12E, 12F, 12G \| Aisle \| 12H, 12J, 12K). | Real-time seat locking uses WebSockets or short-polling session locks to prevent double-booking. AeroSeat enforces strict relational/in-memory concurrency locks with FIFO waitlisting upon conflict. |
| **Security & Safety Rules** | • Extra Legroom seats have legal safety restrictions (exit row clearance).<br>• Infants require bassinet-adjacent seats.<br>• Unaccompanied minors require front-of-cabin placement near galley. | Safety constraints act as hard filters (pruning candidate sets) before soft preference optimization algorithms run. |

---

## 3. Detailed Workflow Mapping

### Workflow A: Flight Selection & Passenger Onboarding
1. User searches/selects flight origin, destination, departure date, and cabin class.
2. User provides passenger manifest (e.g., Lead Passenger name, seat preferences: Window/Aisle/Legroom/Near Front/Avoid Middle, and group requirements).
3. System verifies flight availability and initializes reservation draft.

### Workflow B: Cabin Map Navigation & Seat Selection
1. Aircraft cabin renders dynamically with fuselage frame, wings, exit doors, galleys, and lavatories.
2. Seat status indicator states:
   - **Available** (`#168C78` emerald teal)
   - **Selected** (`#2563EB` royal electric blue with glowing outline)
   - **Occupied** (`#A5AFBA` muted cool grey with padlock/crossed state)
   - **Preferred / Extra Legroom** (`#C7A66A` aviation gold border/badge)
3. Selection rules:
   - Selecting an available seat transitions it to *Selected* and assigns it to the currently highlighted passenger.
   - Clicking another passenger re-assigns active focus.
   - Re-clicking the selected seat unselects it.
   - Occupied seats trigger an informative toast: *"Seat XX is occupied. Enqueue for waitlist?"*

### Workflow C: Explainable Recommendation Engine
1. User toggles "Recommend Best Seat".
2. System evaluates available seats against user preferences (Window, Aisle, Extra Legroom, Low Pitch, Front Row) and outputs:
   - Top candidate seat number.
   - Total score (0–100%) and breakdown of weighted factors.
   - Ranked alternative seats.
   - Explanation cards (e.g., *"Matched: Window seat (+30), Front cabin row 12 (+20), Exit row legroom (+25)"*).

### Workflow D: Booking Confirmation & Undo Capability
1. User confirms reservation -> PNR (6-character booking code) is generated and added to the BST index and persistent SQLite database.
2. Operational History Stack pushes reservation snapshot.
3. User can trigger "Undo Last Operation" to revert reservation or swap seats safely without state corruption.

---

## 4. Technical Constraints & Boundary Definition
- **Commercial Boundary**: Live Emirates booking requires authentication, Skywards membership, payment gateway processing, Sabre/Amadeus GDS communication, and e-ticket issuance. These are omitted in favor of fictional, robust local simulated transactions.
- **Academic Focus**: aeroSeat prioritizes algorithm transparency, deterministic execution profiling, clean architectural separation, and intuitive visual data structure inspection.
