# Emirates Booking Workflow — Investigation Report

**Evidence IDs (REA):**
- `ev_8134adc7a673f640449b5035e5be0abc122b81928145aa383bcbc35fb5002637` (homepage launch)
- `ev_f9a5c21b9acd933622d5726d467d637530c024c7bff030382e98f44eac555139` (seating-charts / seat-selection / book pages)

**Method:** REA `capture_browser_scenario` (Chrome headless), Cursor `WebFetch` / `WebSearch` of public Emirates help and booking documentation. Screenshots of WAF restriction pages saved under `research/emirates-rea/`.

---

## 1. Access limitations (verified)

Automated Chromium sessions to `https://www.emirates.com/` and deep experience URLs were redirected to:

`https://www.emirates.com/error/accessrestricted.html`

Accessibility tree (observed): Emirates logo banner, “We’re Sorry”, “The page you’re trying to access is restricted.”, links to Search flights (`fly2.emirates.com/CAB/IBE.aspx`), Manage booking (`fly2.emirates.com/CAB/MYB.aspx`), Contact us, Twitter, cookie consent dialog.

**Inference:** Bot / WAF (likely Akamai) blocks headless automation from exercising the live IBE seat map. Live inventory APIs and authenticated seat maps were **not** observed.

**Fallback (verified via public docs, not live IBE):** WebFetch of seat-selection, seating-charts, book, FAQ, manage-booking, and online check-in pages.

---

## 2. Observed / documented booking workflow

| Step | Public observation | Confidence |
| :--- | :--- | :--- |
| 1. Search | Enter departure city, destination, travel dates, travel class; trip modes include return / one-way style booking on the commercial site. Passenger categories include adults, children, infants (docs: up to nine on a booking for check-in). | High (docs + prior public widget description) |
| 2. Select flights / fares | Search results → pick itinerary → “Book this Itinerary”. Fare families referenced: Economy Special / Saver / Flex / Flex Plus (and Business equivalents). | High (FAQ + book online) |
| 3. Passenger details | Guided flow: ticketing option → passenger personal details → payment. Each traveller receives an e-ticket / confirmation email. | High (FAQ) |
| 4. Seat selection | Optional during booking or later via Manage Booking / online check-in / app. Categories: Regular, Preferred, Twin, Extra Legroom. First / Business Flex / Premium Economy often complimentary. Economy fees vary by fare & Skywards tier (USD ranges published). Families seating policy described publicly. | High (seat-selection page) |
| 5. Manage / confirm | Retrieve with **booking reference (PNR) + last name**. Seat change until check-in; online check-in 48h–90m before departure. | High |
| 6. Live seat map UI | Immersive 3D seat map referenced publicly; cabin charts for A380 / A350 / B777. Exact interactive layout, prices, and availability require live booking session — **not captured** due to WAF. | Partial |

---

## 3. Visual / UX cues for recreation (mix of verified + design inference)

**Verified from restricted-page + public brand assets:** Emirates logo treatment, red corporate identity (public OG / brand materials), privacy cookie banner, footer copyright “The Emirates Group”.

**Design inference (not pixel-verified against live IBE in this session):** Horizontal booking strip (From / To / Dates / Passengers / Class), red primary CTA, step progress through flights → passengers → seats → review, white content cards on light grey, dense fare rows with duration and aircraft type.

---

## 4. Technology notes (publicly observable only)

- Marketing site and help content are HTML/JS behind CDN/WAF.
- Booking engine URLs under `fly2.emirates.com` (classic ASPX IBE paths observed on restriction fallback links).
- No private source, proprietary algorithms, or authenticated APIs were accessed.

---

## 5. Recreation boundary

Rebuild uses **original** React/FastAPI code, mock schedules/fares/seat maps, and SQLite uniqueness constraints. It reproduces the **observable workflow and seat-category behaviour**, not Emirates proprietary assets, logos as trademarks for commercial use, or live inventory.
