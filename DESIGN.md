# AeroSeat Intelligence — Design System Specification

## 1. Visual Philosophy
AeroSeat Intelligence adopts an **Aviation Luxury & Engineering Clarity** aesthetic. It bridges the prestige feel of premier international flag-carriers (deep night-sky navy, warm alabaster white, brushed aviation gold) with the precision and data-density required for an academic Data Structures and Algorithms workbench.

---

## 2. Color Palette & Design Tokens

### Core Brand & Surface Tokens
| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `--color-navy-950` | `#0B1726` | Deepest atmospheric background, navigation header, terminal chrome |
| `--color-navy-900` | `#10243A` | Primary brand color, hero sections, card borders, active headings |
| `--color-navy-800` | `#1A3654` | Elevated navy card containers, secondary surface backings |
| `--color-gold-500` | `#C7A66A` | Aviation gold accent, premium cabin badges, high-score indicators |
| `--color-gold-400` | `#D8B97C` | Hover state for gold buttons and glowing markers |
| `--color-bg-warm` | `#F7F9FC` | Primary application canvas background, soft off-white |
| `--color-surface` | `#FFFFFF` | Primary content panels, interactive modal bodies |
| `--color-surface-dim` | `#EEF2F6` | Secondary inset panels, disabled inputs, aisle tracks |

### Functional State Tokens (Seat Map & Status)
| State Token | Hex Code | Visual Styling & Semantics |
| :--- | :--- | :--- |
| `--seat-available` | `#168C78` | Deep Teal; available for reservation, high contrast on white |
| `--seat-selected` | `#2563EB` | Electric Sapphire Blue; currently active passenger selection with pulse |
| `--seat-occupied` | `#94A3B8` | Cool Slate Gray; already booked, non-interactive, diagonally hatched |
| `--seat-extra-leg` | `#D97706` | Amber/Gold pip; exit row or bulk-head extra legroom (+7cm) |
| `--seat-preferred` | `#8B5CF6` | Royal Violet pip; front cabin priority disembarkation |
| `--color-success` | `#059669` | Operation confirmed, booking saved, node visited |
| `--color-warning` | `#D97706` | Waitlist enqueued, undo step warning |
| `--color-danger` | `#DC2626` | Seat conflict, booking cancellation, queue overflow |

---

## 3. Typography Hierarchy

- **Font Family Primary**: `Inter, system-ui, -apple-system, sans-serif` (clean, exceptionally legible at micro scales for seat numbers and coordinate labels).
- **Font Family Display**: `Cinzel, Georgia, serif` (optional accent for airline crest & boarding pass headings).
- **Font Family Monospace**: `JetBrains Mono, Menlo, monospace` (for PNR references, runtime complexity metrics, memory footprint, tree traversals).

### Typographic Scale
- **Display 1**: `2.25rem (36px) / 1.2 / Bold 700` — Hero headlines, airport arrival boards
- **Heading 1**: `1.75rem (28px) / 1.3 / SemiBold 600` — Section headers, cabin selector
- **Heading 2**: `1.25rem (20px) / 1.4 / SemiBold 600` — Modal titles, visualizer card headers
- **Body Large**: `1.0rem (16px) / 1.5 / Regular 400` — Narrative explanations, preference form labels
- **Body Small**: `0.875rem (14px) / 1.4 / Regular 400` — Legend captions, node details
- **Mono / Micro**: `0.75rem (12px) / 1.2 / Medium 500` — Seat coordinates (e.g., `14K`), PNR codes (`EK9A2B`)

---

## 4. Component Design Patterns

### 4.1 Cabin & Seat Map Matrix
- **Fuselage Structure**: Rounded SVG aircraft nose, tapered tail, lateral wing silhouettes with animated wingtip lights.
- **Row Anatomy**:
  - Row number badge centered in aisle (e.g., `[ 12 ]`).
  - Columns separated into standard wide-body configurations:
    - Business: `1 - 2 - 1` (A \| E F \| K)
    - Economy: `3 - 4 - 3` (A B C \| D E F G \| H J K) (note: aviation convention skips 'I' to avoid confusion with '1').
  - Seat node: `36px x 38px` rounded pill (`border-radius: 6px`) with headrest indentation, seat number watermark, and status border.
- **Accessibility**: Keyboard navigable via Arrow keys, `Tab`, `Space`, and `Enter`. `aria-label` exposes complete status (e.g., *"Seat 14A, Window, Economy Preferred, Available, Price $45"*).

### 4.2 Interactive Summary Bar (Drawer / Sticky Panel)
- Sticky bottom or right-hand rail displaying:
  - Selected Seat(s) & Passenger Assignment
  - Real-time Preference Match Score Gauge (0–100%)
  - Total Fare Breakdown
  - Primary Action Button: "Confirm Reservation" with immediate visual feedback

### 4.3 Algorithm Performance & Visualizer Canvas
- Dark or high-contrast container with terminal aesthetics for DSA visualizers.
- Dynamic animated transitions (CSS transforms, Spring animations) for:
  - Queue enqueue/dequeue shifts
  - Stack push/pop layer sliding
  - Binary Search Tree branch highlights during search traversal
  - BFS queue frontier expansion and node coloring
