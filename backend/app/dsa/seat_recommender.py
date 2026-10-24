"""
Explainable Seat Recommendation & Optimization Engine (Phase 4)
Computes deterministic multi-factor preference scoring and contiguous group seat allocation.
Ranks candidate seats using MergeSort to guarantee algorithmic stability.
"""
from typing import Any, Dict, List, Optional, Tuple
from app.dsa.sorting_algorithms import merge_sort

class SeatRecommender:
    def __init__(self):
        # Default weight coefficients for scoring factors
        self.weights = {
            "window_match": 35.0,
            "aisle_match": 30.0,
            "avoid_middle_bonus": 25.0,
            "extra_legroom_match": 25.0,
            "front_row_proximity": 20.0,
            "preferred_category_match": 15.0,
            "middle_seat_penalty": -40.0
        }

    def score_seat(self, seat: Dict[str, Any], preferences: Dict[str, Any]) -> Tuple[float, List[Dict[str, Any]]]:
        """
        Compute deterministic score (0.0 to 100.0) and human-readable explanation factors.
        """
        score = 0.0
        reasons: List[Dict[str, Any]] = []

        is_window = seat.get("is_window", False)
        is_aisle = seat.get("is_aisle", False)
        is_middle = (not is_window) and (not is_aisle)
        category = seat.get("category", "REGULAR")
        row_number = seat.get("row_number", 15)
        cabin_class = seat.get("cabin_class", "ECONOMY")

        want_window = preferences.get("window", False)
        want_aisle = preferences.get("aisle", False)
        avoid_middle = preferences.get("avoid_middle", True)
        want_legroom = preferences.get("extra_legroom", False)
        prefer_front = preferences.get("prefer_front", False)

        # 1. Window evaluation
        if want_window and is_window:
            score += self.weights["window_match"]
            reasons.append({"factor": "Window Seat Match", "delta": +self.weights["window_match"], "description": "Seat has scenic window view"})
        elif want_window and not is_window:
            reasons.append({"factor": "Missing Window", "delta": 0, "description": "Seat is not by a window"})

        # 2. Aisle evaluation
        if want_aisle and is_aisle:
            score += self.weights["aisle_match"]
            reasons.append({"factor": "Aisle Seat Match", "delta": +self.weights["aisle_match"], "description": "Easy aisle access for mobility"})

        # 3. Middle seat avoidance
        if avoid_middle:
            if is_middle:
                score += self.weights["middle_seat_penalty"]
                reasons.append({"factor": "Middle Seat Penalty", "delta": self.weights["middle_seat_penalty"], "description": "Middle seat between two passengers"})
            else:
                score += self.weights["avoid_middle_bonus"]
                reasons.append({"factor": "Direct Corridor/Window", "delta": +self.weights["avoid_middle_bonus"], "description": "Not stuck in a middle seat"})

        # 4. Extra legroom
        if category == "EXTRA_LEGROOM":
            if want_legroom:
                score += self.weights["extra_legroom_match"]
                reasons.append({"factor": "Extra Legroom Exit Row", "delta": +self.weights["extra_legroom_match"], "description": "Spacious emergency exit row (+7cm)"})
            else:
                score += 10.0
                reasons.append({"factor": "Bonus Legroom", "delta": +10.0, "description": "Extended pitch seat"})

        # 5. Front row proximity (Early disembarkation)
        if prefer_front or category == "PREFERRED":
            # Higher score for lower row numbers
            if row_number <= 15:
                front_bonus = max(5.0, self.weights["front_row_proximity"] - (row_number * 0.8))
                score += front_bonus
                reasons.append({"factor": "Front Cabin Proximity", "delta": round(front_bonus, 1), "description": f"Row {row_number} allows rapid disembarkation"})

        # Base cabin comfort adjustment
        if cabin_class == "FIRST":
            score += 30.0
            reasons.append({"factor": "First Class Suite", "delta": +30.0, "description": "Private suite with lay-flat bed"})
        elif cabin_class == "BUSINESS":
            score += 20.0
            reasons.append({"factor": "Business Class Flatbed", "delta": +20.0, "description": "Lie-flat seating with direct aisle access"})

        final_score = max(0.0, min(100.0, score))
        return round(final_score, 1), reasons

    def check_eligibility(self, seat: Dict[str, Any], passenger: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Hard safety and operational rules pruning ineligible seats.
        """
        category = seat.get("category", "REGULAR")
        status = seat.get("status", "AVAILABLE")

        if status != "AVAILABLE":
            return False, f"Seat {seat.get('seat_number')} is currently {status.lower()}"

        # Emergency exit row safety requirements (FAA/ICAO compliance)
        if category == "EXTRA_LEGROOM" or seat.get("is_exit_row", False):
            age = passenger.get("age", 25)
            has_infant = passenger.get("traveling_with_infant", False)
            requires_assistance = passenger.get("requires_wheelchair", False)

            if age < 16:
                return False, "Passengers under 16 years cannot occupy emergency exit rows"
            if has_infant:
                return False, "Passengers traveling with infants cannot occupy emergency exit rows"
            if requires_assistance:
                return False, "Passengers requiring mobility assistance cannot occupy emergency exit rows"

        # Bassinet seat requirements
        if passenger.get("traveling_with_infant", False) and not seat.get("has_bassinet", False):
            # Prefer bassinet, but not strictly ineligible unless specified
            pass

        return True, None

    def recommend_seat(
        self,
        available_seats: List[Dict[str, Any]],
        preferences: Dict[str, Any],
        passenger: Dict[str, Any],
        limit: int = 5
    ) -> Dict[str, Any]:
        """
        Produce ranked recommendations with factor breakdowns using MergeSort.
        """
        # Step 1: Filter eligible seats
        eligible_candidates = []
        for s in available_seats:
            eligible, reason = self.check_eligibility(s, passenger)
            if eligible:
                candidate = dict(s)
                sc, reasons = self.score_seat(candidate, preferences)
                candidate["preference_score"] = sc
                candidate["score_breakdown"] = reasons
                eligible_candidates.append(candidate)

        if not eligible_candidates:
            return {
                "recommended_seat": None,
                "alternatives": [],
                "message": "No eligible seats found matching safety criteria or availability in this cabin.",
                "total_candidates": 0
            }

        # Step 2: Algorithmic ranking via Merge Sort (CO3)
        ranked_seats, sort_metrics = merge_sort(
            eligible_candidates,
            key=lambda x: x["preference_score"],
            reverse=True
        )

        top_choice = ranked_seats[0]
        alternatives = ranked_seats[1:limit]

        return {
            "recommended_seat": top_choice,
            "alternatives": alternatives,
            "sorting_metrics": sort_metrics,
            "total_candidates_evaluated": len(eligible_candidates),
            "message": f"Optimal seat {top_choice['seat_number']} identified with {top_choice['preference_score']}% preference match."
        }

    def find_group_seats(
        self,
        all_seats: List[Dict[str, Any]],
        group_size: int,
        preferred_class: str = "ECONOMY"
    ) -> Dict[str, Any]:
        """
        Identify contiguous adjacent available seats in the same row for a traveling group.
        Time Complexity: O(R * C) where R is rows and C is columns.
        """
        if group_size <= 1:
            return {"found": False, "message": "Group size must be at least 2"}

        # Group available seats by row
        rows: Dict[int, List[Dict[str, Any]]] = {}
        for s in all_seats:
            if s.get("cabin_class") == preferred_class:
                r_num = s.get("row_number", 0)
                if r_num not in rows:
                    rows[r_num] = []
                rows[r_num].append(s)

        # Standard seat column order
        col_order = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"]
        col_index = {c: i for i, c in enumerate(col_order)}

        for r_num in sorted(rows.keys()):
            row_seats = rows[r_num]
            # Map column letter to seat
            seat_by_col = {s.get("column_letter"): s for s in row_seats}

            # Check consecutive available blocks
            # Blocks within 3-seater (A,B,C), 4-seater (D,E,F,G), or 3-seater (H,J,K)
            sub_sections = [
                ["A", "B", "C"],
                ["D", "E", "F", "G"],
                ["H", "J", "K"]
            ]

            for section in sub_sections:
                if len(section) >= group_size:
                    for i in range(len(section) - group_size + 1):
                        window = section[i:i + group_size]
                        # Check if all seats in window exist and are AVAILABLE
                        candidate_block = []
                        all_free = True
                        for col in window:
                            s = seat_by_col.get(col)
                            if s and s.get("status") == "AVAILABLE":
                                candidate_block.append(s)
                            else:
                                all_free = False
                                break

                        if all_free and len(candidate_block) == group_size:
                            seat_nums = [s["seat_number"] for s in candidate_block]
                            return {
                                "found": True,
                                "row": r_num,
                                "section": "".join(window),
                                "seats": candidate_block,
                                "seat_numbers": seat_nums,
                                "message": f"Found {group_size} contiguous seats in Row {r_num} ({', '.join(seat_nums)})"
                            }

        return {
            "found": False,
            "seats": [],
            "message": f"Unable to find {group_size} adjacent contiguous seats in {preferred_class}. Consider split seating or joining waitlist."
        }
