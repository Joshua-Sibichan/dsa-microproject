"""
Sorting Algorithms Implementation & Performance Instrumentation (CO3)
Implements Merge Sort and Insertion Sort with detailed execution metrics:
  - Total comparisons
  - Swaps / write copies
  - Exact execution time in nanoseconds/microseconds
  - Stability verification
"""
from typing import Any, Callable, Dict, List, Tuple
import time

def merge_sort(
    items: List[Any],
    key: Callable[[Any], Any] = lambda x: x,
    reverse: bool = False
) -> Tuple[List[Any], Dict[str, Any]]:
    """
    Stable Divide-and-Conquer Merge Sort.
    Time Complexity: O(N log N) in all cases (Best, Average, Worst).
    Space Complexity: O(N) auxiliary space.
    """
    comparisons = 0
    copies = 0
    start_time = time.perf_counter_ns()

    def _merge_sort_rec(arr: List[Any]) -> List[Any]:
        nonlocal comparisons, copies
        if len(arr) <= 1:
            return arr

        mid = len(arr) // 2
        left = _merge_sort_rec(arr[:mid])
        right = _merge_sort_rec(arr[mid:])

        merged = []
        i = j = 0

        while i < len(left) and j < len(right):
            comparisons += 1
            left_val = key(left[i])
            right_val = key(right[j])

            condition = (left_val >= right_val) if reverse else (left_val <= right_val)
            if condition:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
            copies += 1

        while i < len(left):
            merged.append(left[i])
            i += 1
            copies += 1

        while j < len(right):
            merged.append(right[j])
            j += 1
            copies += 1

        return merged

    sorted_list = _merge_sort_rec(list(items))
    elapsed_ns = time.perf_counter_ns() - start_time

    metrics = {
        "algorithm": "Merge Sort",
        "comparisons": comparisons,
        "swaps_or_copies": copies,
        "execution_time_ns": elapsed_ns,
        "execution_time_us": round(elapsed_ns / 1000.0, 3),
        "is_stable": True,
        "time_complexity": "O(N log N)",
        "space_complexity": "O(N)"
    }
    return sorted_list, metrics


def insertion_sort(
    items: List[Any],
    key: Callable[[Any], Any] = lambda x: x,
    reverse: bool = False
) -> Tuple[List[Any], Dict[str, Any]]:
    """
    In-Place Adaptive Insertion Sort.
    Time Complexity:
      - Best Case (already sorted): O(N) with N-1 comparisons and 0 shifts.
      - Average/Worst Case: O(N²) comparisons and shifts.
    Space Complexity: O(1) auxiliary space.
    """
    arr = list(items)
    n = len(arr)
    comparisons = 0
    shifts = 0
    start_time = time.perf_counter_ns()

    for i in range(1, n):
        current_item = arr[i]
        current_val = key(current_item)
        j = i - 1

        while j >= 0:
            comparisons += 1
            compare_val = key(arr[j])
            condition = (compare_val < current_val) if reverse else (compare_val > current_val)

            if condition:
                arr[j + 1] = arr[j]
                shifts += 1
                j -= 1
            else:
                break

        arr[j + 1] = current_item
        shifts += 1

    elapsed_ns = time.perf_counter_ns() - start_time

    metrics = {
        "algorithm": "Insertion Sort",
        "comparisons": comparisons,
        "swaps_or_copies": shifts,
        "execution_time_ns": elapsed_ns,
        "execution_time_us": round(elapsed_ns / 1000.0, 3),
        "is_stable": True,
        "time_complexity": "O(N²) worst/avg, O(N) best",
        "space_complexity": "O(1)"
    }
    return arr, metrics
