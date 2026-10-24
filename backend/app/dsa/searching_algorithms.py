"""
Searching Algorithms Implementation & Instrumentation (CO3)
Implements Linear Search and Binary Search with exact operation traces.
"""
from typing import Any, Callable, Dict, List, Optional, Tuple
import time

def linear_search(
    items: List[Any],
    target: Any,
    key: Callable[[Any], Any] = lambda x: x
) -> Tuple[int, Dict[str, Any]]:
    """
    Linear Search: inspects elements sequentially from index 0 to N-1.
    Time Complexity:
      - Best: O(1)
      - Worst/Average: O(N)
    """
    comparisons = 0
    start_time = time.perf_counter_ns()
    found_index = -1
    steps_trace: List[Dict[str, Any]] = []

    for i, item in enumerate(items):
        comparisons += 1
        val = key(item)
        steps_trace.append({
            "index": i,
            "inspected_value": val,
            "target": target,
            "match": (val == target)
        })

        if val == target:
            found_index = i
            break

    elapsed_ns = time.perf_counter_ns() - start_time
    metrics = {
        "algorithm": "Linear Search",
        "found": (found_index != -1),
        "index": found_index,
        "comparisons": comparisons,
        "dataset_size": len(items),
        "execution_time_ns": elapsed_ns,
        "execution_time_us": round(elapsed_ns / 1000.0, 3),
        "time_complexity": "O(N)",
        "trace": steps_trace[:20]  # First 20 steps to prevent oversized payload
    }
    return found_index, metrics


def binary_search(
    sorted_items: List[Any],
    target: Any,
    key: Callable[[Any], Any] = lambda x: x
) -> Tuple[int, Dict[str, Any]]:
    """
    Binary Search on sorted items: repeatedly halves search interval.
    Time Complexity: O(log N)
    Requires: items sorted in ascending order by key.
    """
    comparisons = 0
    start_time = time.perf_counter_ns()
    low = 0
    high = len(sorted_items) - 1
    found_index = -1
    steps_trace: List[Dict[str, Any]] = []

    while low <= high:
        mid = (low + high) // 2
        mid_val = key(sorted_items[mid])
        comparisons += 1

        step_record = {
            "low": low,
            "mid": mid,
            "high": high,
            "mid_value": mid_val,
            "target": target
        }

        if mid_val == target:
            step_record["action"] = "MATCH_FOUND"
            steps_trace.append(step_record)
            found_index = mid
            break
        elif mid_val < target:
            step_record["action"] = "SEARCH_RIGHT"
            steps_trace.append(step_record)
            low = mid + 1
        else:
            step_record["action"] = "SEARCH_LEFT"
            steps_trace.append(step_record)
            high = mid - 1

    elapsed_ns = time.perf_counter_ns() - start_time
    metrics = {
        "algorithm": "Binary Search",
        "found": (found_index != -1),
        "index": found_index,
        "comparisons": comparisons,
        "dataset_size": len(sorted_items),
        "execution_time_ns": elapsed_ns,
        "execution_time_us": round(elapsed_ns / 1000.0, 3),
        "time_complexity": "O(log N)",
        "trace": steps_trace
    }
    return found_index, metrics
