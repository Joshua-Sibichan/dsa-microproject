# X Airways — Flight Booking & Seat Reservation System

Full-stack flight-booking application (search → results → passengers → seats → confirmation), integrated with an interactive Data Structures & Algorithms (DSA) Hub.

---

## Features

### Booking wizard
1. **Search** — Return / one-way, airports, dates, adults / children / infants (max 9), cabin class, client-side validation.
2. **Flight results** — Duration, aircraft, availability, fare brands (Special / Saver / Flex / Flex Plus), “Book this itinerary”.
3. **Passenger details** — Title, names, email, DOB, gender, optional frequent-flyer; back navigation keeps data.
4. **Seat map** — Cabin layout, categories (Regular / Preferred / Twin / Extra Legroom), multi-passenger assign/deselect, conflict prevention, preference + group tools.
5. **Confirmation** — Fare + seat fee summary, confirm locks seats (SQLite), PNR references; **no payment gateway**.

### Also preserved
- Manage booking (PNR + last name), waitlist, undo stack.
- DSA Hub (CO1–CO5) and Algorithm Arena.

---

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Lucide |
| Backend | Python 3.14, FastAPI, Pydantic v2, Uvicorn |
| DB | SQLite (WAL, FKs, unique seat constraint, atomic `AVAILABLE → RESERVED`) |
| Tests | Pytest (24 tests) |

---

## Install & run

### Backend
```bash
cd aeroseat-intelligence/backend
source ../venv/bin/activate   # or: python3 -m venv ../venv && pip install -r requirements.txt
PYTHONPATH=. pytest -v -p no:cacheprovider
PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Optional env: `AEROSEAT_DB_PATH` (default `/tmp/aeroseat.db`).

### Frontend (dev or production build)
```bash
cd aeroseat-intelligence/frontend
npm install
npm run build          # served by FastAPI at http://127.0.0.1:8000
# or: npm run dev      # Vite HMR (set API proxy / BASE_URL as needed)
```

App URL: **http://127.0.0.1:8000**

---

## Testing

```bash
cd backend && source ../venv/bin/activate
PYTHONPATH=. pytest -v -p no:cacheprovider
```

Covered: flight search APIs, seat maps, reservation lifecycle, **409 on double-book**, batch bookings, duplicate-seat rejection, waitlist, undo, BST/graph/sort/search DSA, seat grid.

Manual UI: search validation → itinerary → multi-passenger forms → seat select/deselect → confirm → manage PNR.

---

## Research notes

- REA browser automation against emirates.com hit **WAF access-restricted** pages (evidence under `research/emirates-rea/`).
- Public help / seat-selection docs were used for workflow and seat-category behaviour (`research/OBSERVED_WORKFLOW.md`).
- Implementation plan: `CLONE_IMPLEMENTATION_PLAN.md`
- Final report: `FINAL_REPORT.md`

---

## Disclaimer

Simulated reservations with mock schedules and seat maps. Do not use for real travel. Emirates is a trademark of its respective owners.
