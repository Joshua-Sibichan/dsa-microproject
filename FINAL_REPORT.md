# Final Report — Emirates Seat Reservation Clone

**Branch:** `feature/emirates-seat-reservation-clone`  
**Repo:** `aeroseat-intelligence`  
**Date:** 2026-10-27

---

## 1. Observed workflow (investigation)

### Tooling
- REA `capture_browser_scenario` with Google Chrome (headless).
- Evidence: `ev_8134adc7…`, `ev_f9a5c21b…` (see `research/OBSERVED_WORKFLOW.md`).
- Screenshots of WAF restriction pages: `research/emirates-rea/*.png`.
- Public documentation via WebFetch / WebSearch (seat selection, seating charts, book online, FAQ, manage booking, online check-in).

### Verified limitation
Automated sessions to `emirates.com` were redirected to **access restricted** error pages (bot/WAF). Live IBE search, fare matrix, passenger forms, and interactive seat maps were **not** exercised in-browser.

### Documented workflow (public sources)
1. Enter origin, destination, dates, class → search.  
2. Choose itinerary / fare → “Book this Itinerary”.  
3. Enter passenger details (then payment on the real site — **out of scope** here).  
4. Optional seat selection: Regular, Preferred, Twin, Extra Legroom; fees depend on fare / loyalty.  
5. Manage booking via PNR + last name; online check-in seat changes 48h–90m before departure.

### Distinguishing evidence types
| Claim | Type |
| --- | --- |
| WAF restriction page content | Observed (REA a11y + screenshots) |
| Seat categories & fee ranges | Observed (public seat-selection page) |
| Exact live seat-map pixels / inventory | Unknown (blocked) |
| Red booking chrome / stepper UI | Design inference + public brand cues |

---

## 2. Implemented features

| Requirement | Implementation |
| --- | --- |
| Flight search | `FlightSearchPanel` — trip type, airports, dates, adults/children/infants, cabin, validation |
| Results & fares | `FlightResultsPanel` — mock flights + Special/Saver/Flex/Flex Plus |
| Passenger forms | `PassengerDetailsForm` — validation, multi-pax, state preserved on back |
| Seat map | Existing `CabinMap` + assignment rules in `App` |
| Summary & confirm | `ConfirmationPanel` + batch reservation API; stops before payment |
| No double-book | Atomic `UPDATE … WHERE status='AVAILABLE'` + 409; unique DB constraint |
| Progress / nav | `BookingStepper`; edit/back between steps |
| DSA / manage | Preserved |

---

## 3. Technology stack

React 18 + TypeScript + Vite + Tailwind · FastAPI + Pydantic · SQLite WAL · Pytest.

---

## 4. Tests performed

**Automated (24 passed):**
- Flight & seat APIs  
- Reservation create / cancel / rebook  
- Concurrent claim conflict (409)  
- Batch multi-passenger + duplicate seat rejection  
- Waitlist, undo, BST, graph/BFS, sort/search, seat grid, recommender  

**Frontend:** `npm run build` (TypeScript + Vite) succeeded.

**Manual checklist recommended:** invalid search → valid search → 2 adults passenger validation → seat select/deselect → confirm PNRs → manage booking retrieve.

---

## 5. Limitations

- No live Emirates inventory or authenticated seat map.  
- Return trip is annotated as mirrored mock (outbound inventory shown).  
- No payment, Skywards login, hotels, or loyalty dashboard.  
- Visual fidelity is workflow-faithful with airline-red chrome; not a pixel-perfect asset clone.  
- Headless REA cannot bypass Emirates WAF; further visual tuning would need a human browser session.

---

## 6. How to run

See `README.md`. Branch: `feature/emirates-seat-reservation-clone`.
