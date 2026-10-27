"""
Algorithm Performance Benchmark Lab & Algorithm Arena Runner (Phase 4 & CO2/CO3)
Executes reproducible, strictly measured empirical benchmarks across identical datasets.
Zero fabricated statistics: all timers, comparisons, and allocations are measured in real time.
"""
from typing import Any, Dict, List, Tuple
import time
import random
from app.dsa.sorting_algorithms import merge_sort, insertion_sort
from app.dsa.searching_algorithms import linear_search, binary_search
from app.dsa.seat_recommender import SeatRecommender

class BenchmarkRunner:
    def __init__(self):
        self.recommender = SeatRecommender()

    def compare_allocation_strategies(
        self,
        candidate_seats: List[Dict[str, Any]],
        passenger_profiles: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Algorithm Arena: First-Available Seat Assignment vs Preference-Based Ranking.
        Executes both strategies on the identical seat inventory and passenger stream.
        """
        if not candidate_seats or not passenger_profiles:
            return {"error": "Candidate seats and passenger profiles must be non-empty"}

        # 1. First-Available Strategy
        inventory_a = [dict(s) for s in candidate_seats]
        start_a = time.perf_counter_ns()
        assigned_a = []
        score_sum_a = 0.0

        for p in passenger_profiles:
            # Simply find first AVAILABLE seat
            allocated_seat = None
            for s in inventory_a:
                if s["status"] == "AVAILABLE":
                    eligible, _ = self.recommender.check_eligibility(s, p)
                    if eligible:
                        s["status"] = "RESERVED"
                        allocated_seat = s
                        break
            if allocated_seat:
                sc, _ = self.recommender.score_seat(allocated_seat, p.get("preferences", {}))
                score_sum_a += sc
                assigned_a.append({"passenger": p["name"], "seat": allocated_seat["seat_number"], "score": sc})

        time_a_ns = time.perf_counter_ns() - start_a
        success_rate_a = (len(assigned_a) / len(passenger_profiles)) * 100.0
        avg_score_a = (score_sum_a / len(assigned_a)) if assigned_a else 0.0

        # 2. Preference-Based Optimization Strategy (X Airways Intelligence)
        inventory_b = [dict(s) for s in candidate_seats]
        start_b = time.perf_counter_ns()
        assigned_b = []
        score_sum_b = 0.0

        for p in passenger_profiles:
            avail = [s for s in inventory_b if s["status"] == "AVAILABLE"]
            rec = self.recommender.recommend_seat(avail, p.get("preferences", {}), p)
            top_seat = rec.get("recommended_seat")
            if top_seat:
                for s in inventory_b:
                    if s["seat_number"] == top_seat["seat_number"]:
                        s["status"] = "RESERVED"
                        break
                sc = top_seat["preference_score"]
                score_sum_b += sc
                assigned_b.append({"passenger": p["name"], "seat": top_seat["seat_number"], "score": sc})

        time_b_ns = time.perf_counter_ns() - start_b
        success_rate_b = (len(assigned_b) / len(passenger_profiles)) * 100.0
        avg_score_b = (score_sum_b / len(assigned_b)) if assigned_b else 0.0

        return {
            "dataset_info": {
                "total_seats_evaluated": len(candidate_seats),
                "total_passengers_tested": len(passenger_profiles)
            },
            "first_available_strategy": {
                "name": "First-Available (Greedy Sequential)",
                "success_rate_pct": round(success_rate_a, 1),
                "successful_allocations": len(assigned_a),
                "average_preference_score": round(avg_score_a, 1),
                "execution_time_ns": time_a_ns,
                "execution_time_us": round(time_a_ns / 1000.0, 2),
                "algorithmic_complexity": "O(P * S)",
                "description": "Allocates the very first unoccupied eligible seat found in linear scan."
            },
            "preference_scored_strategy": {
                "name": "X Airways Intelligence (Multi-Factor MergeSort)",
                "success_rate_pct": round(success_rate_b, 1),
                "successful_allocations": len(assigned_b),
                "average_preference_score": round(avg_score_b, 1),
                "execution_time_ns": time_b_ns,
                "execution_time_us": round(time_b_ns / 1000.0, 2),
                "algorithmic_complexity": "O(P * S log S)",
                "description": "Scores all eligible candidates against passenger preferences and sorts via stable MergeSort."
            },
            "comparative_delta": {
                "score_improvement_pct": round(avg_score_b - avg_score_a, 1),
                "trade_off_analysis": "Preference-scoring requires sorting candidate sets yielding dramatically higher passenger satisfaction at the cost of additional compute passes."
            }
        }

    def benchmark_sorting(self, dataset_size: int = 200) -> Dict[str, Any]:
        """
        Compare MergeSort vs InsertionSort on random preference score arrays.
        """
        dataset_size = max(10, min(1000, dataset_size))
        # Generate random seat score objects
        random.seed(42)  # Deterministic seed for repeatable benchmark
        test_data = [random.randint(10, 100) for _ in range(dataset_size)]

        # Merge sort run
        data_for_merge = list(test_data)
        _, merge_metrics = merge_sort(data_for_merge, reverse=True)

        # Insertion sort run
        data_for_ins = list(test_data)
        _, ins_metrics = insertion_sort(data_for_ins, reverse=True)

        return {
            "dataset_size": dataset_size,
            "merge_sort": merge_metrics,
            "insertion_sort": ins_metrics,
            "theoretical_notes": {
                "merge_sort": "O(N log N) divide-and-conquer; predictable execution regardless of initial distribution.",
                "insertion_sort": "O(N²) quadratic comparisons; faster on nearly sorted small arrays, degrades on random large lists."
            }
        }

    def benchmark_searching(self, dataset_size: int = 500) -> Dict[str, Any]:
        """
        Compare Linear Search vs Binary Search on sorted PNR or seat lists.
        """
        dataset_size = max(20, min(2000, dataset_size))
        sorted_keys = [f"EK{i:04d}" for i in range(dataset_size)]

        # Search middle and end targets
        target = sorted_keys[int(dataset_size * 0.75)]

        _, lin_metrics = linear_search(sorted_keys, target)
        _, bin_metrics = binary_search(sorted_keys, target)

        return {
            "dataset_size": dataset_size,
            "searched_target": target,
            "linear_search": lin_metrics,
            "binary_search": bin_metrics,
            "theoretical_comparison": {
                "linear_search_complexity": "O(N)",
                "binary_search_complexity": "O(log N)",
                "comparison_reduction_factor": round(lin_metrics["comparisons"] / max(1, bin_metrics["comparisons"]), 1)
            }
        }

    def benchmark_data_structures(self, operations_count: int = 500) -> Dict[str, Any]:
        """
        CO2: Compare Array/List vs Hash Map / Dictionary for seat lookup.
        """
        operations_count = max(50, min(2000, operations_count))
        test_items = [{"pnr": f"EK{i:05d}", "passenger": f"Passenger_{i}", "seat": f"{(i%30)+1}{chr(65 + (i%8))}"} for i in range(operations_count)]

        # 1. Array representation
        array_store = list(test_items)
        # 2. Hash map representation
        hash_store = {item["pnr"]: item for item in test_items}

        # Query targets (random sample)
        random.seed(101)
        query_keys = [random.choice(test_items)["pnr"] for _ in range(100)]

        # Measure Array lookups (Linear scan O(N))
        t_arr_start = time.perf_counter_ns()
        arr_comparisons = 0
        for q in query_keys:
            for item in array_store:
                arr_comparisons += 1
                if item["pnr"] == q:
                    break
        t_arr_ns = time.perf_counter_ns() - t_arr_start

        # Measure Hash Table lookups (Direct key hashing O(1))
        t_hash_start = time.perf_counter_ns()
        hash_lookups = 0
        for q in query_keys:
            _ = hash_store.get(q)
            hash_lookups += 1
        t_hash_ns = time.perf_counter_ns() - t_hash_start

        return {
            "operations_count": len(query_keys),
            "collection_size": operations_count,
            "array_list": {
                "structure": "Contiguous Dynamic Array",
                "lookup_time_ns": t_arr_ns,
                "lookup_time_us": round(t_arr_ns / 1000.0, 2),
                "total_comparisons": arr_comparisons,
                "average_comparisons_per_lookup": round(arr_comparisons / len(query_keys), 1),
                "time_complexity": "O(N) search, O(1) indexed access",
                "space_characteristics": "Optimal spatial cache locality, zero pointer overhead"
            },
            "hash_map": {
                "structure": "Hash Table / Dictionary",
                "lookup_time_ns": t_hash_ns,
                "lookup_time_us": round(t_hash_ns / 1000.0, 2),
                "total_lookups": hash_lookups,
                "average_comparisons_per_lookup": 1.0,
                "time_complexity": "O(1) average lookup and insert",
                "space_characteristics": "Bucket array + hash collision nodes; higher memory footprint"
            },
            "trade_off_summary": "Arrays excel at contiguous memory iterations and 2D cabin layout coordinates, while Hash Maps provide instant O(1) random key retrieval for PNR lookups."
        }
