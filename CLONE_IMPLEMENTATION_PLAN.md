# Implementation Plan — Emirates Seat Reservation Clone Branch

**Branch:** `feature/emirates-seat-reservation-clone`  
**Base:** Existing AeroSeat Intelligence (React 18 + Vite + Tailwind + FastAPI + SQLite)

## Goals
1. Multi-step booking wizard matching documented Emirates flow: **Search → Results → Passengers → Seats → Confirmation**.
2. Functional validation, multi-passenger state, seat map interaction, no double-booking.
3. Preserve Manage Booking + DSA Hub.
4. Document REA limits; use mock inventory.

## Work packages
| # | Package | Approach |
| - | --- | --- |
| A | Research docs | `research/OBSERVED_WORKFLOW.md` + update REVERSE_ENGINEERING.md |
| B | Booking chrome | Red airline header strip, stepper, trip type (one-way/return), adults/children/infants, cabin, date validation |
| C | Results | Fare cards (Special/Saver/Flex/Flex Plus multipliers), duration, aircraft, select CTA |
| D | Passengers | Per-passenger title/first/last/email/DOB/gender forms; preserve on back navigation |
| E | Seats | Reuse CabinMap; passenger tabs; live summary; category fees |
| F | Confirm | PNR list, seats, charges, edit/back, simulated reservation success (no payment gateway) |
| G | Backend | Atomic `UPDATE … WHERE status='AVAILABLE'`; concurrent conflict test |
| H | Docs/tests | README, FINAL_REPORT, pytest |

## Non-goals
Hotels, loyalty dashboards, real payment, Skywards login, live Emirates APIs.
