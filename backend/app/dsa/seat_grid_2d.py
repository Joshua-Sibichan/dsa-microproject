"""
2D Array Matrix for Aircraft Cabin Seat Allocation (Course Outcome CO2)
Provides direct O(1) row/column coordinate lookup, spatial contiguous block scanning,
and in-memory seat allocation.
"""
from typing import Any, Dict, List, Optional, Tuple

COLUMN_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"]
COL_TO_INDEX = {col: idx for idx, col in enumerate(COLUMN_LETTERS)}
INDEX_TO_COL = {idx: col for idx, col in enumerate(COLUMN_LETTERS)}


class SeatGrid2D:
    """
    2D Matrix representing aircraft cabin seating:
    grid[row_index][col_index] provides O(1) constant-time direct indexing.
    """
    def __init__(self, min_row: int = 1, max_row: int = 26, columns: Optional[List[str]] = None):
        self.min_row = min_row
        self.max_row = max_row
        self.columns = columns or COLUMN_LETTERS
        self.num_rows = (max_row - min_row) + 1
        self.num_cols = len(self.columns)
        self.col_to_idx = {c: i for i, c in enumerate(self.columns)}
        self.idx_to_col = {i: c for i, c in enumerate(self.columns)}

        # Allocate 2D matrix: List of Lists initialized to None
        self.grid: List[List[Optional[Dict[str, Any]]]] = [
            [None for _ in range(self.num_cols)] for _ in range(self.num_rows)
        ]
        self._seat_count = 0
        self._occupied_count = 0

    def _coords_to_indices(self, row_number: int, column_letter: str) -> Tuple[int, int]:
        if not (self.min_row <= row_number <= self.max_row):
            raise IndexError(f"Row {row_number} is out of bounds [{self.min_row}, {self.max_row}]")
        col_letter_upper = column_letter.upper().strip()
        if col_letter_upper not in self.col_to_idx:
            raise IndexError(f"Column '{column_letter}' is not a valid aircraft seat column")
        row_idx = row_number - self.min_row
        col_idx = self.col_to_idx[col_letter_upper]
        return row_idx, col_idx

    def set_seat(self, row_number: int, column_letter: str, seat_data: Dict[str, Any]) -> None:
        """Initialize or update seat node at coordinates (row, col) in O(1) time."""
        r_idx, c_idx = self._coords_to_indices(row_number, column_letter)
        existing = self.grid[r_idx][c_idx]
        if existing is None:
            self._seat_count += 1
            if seat_data.get("status") in ["RESERVED", "BLOCKED"]:
                self._occupied_count += 1
        else:
            old_status = existing.get("status")
            new_status = seat_data.get("status")
            if old_status == "AVAILABLE" and new_status in ["RESERVED", "BLOCKED"]:
                self._occupied_count += 1
            elif old_status in ["RESERVED", "BLOCKED"] and new_status == "AVAILABLE":
                self._occupied_count -= 1

        self.grid[r_idx][c_idx] = dict(seat_data)

    def get_seat(self, row_number: int, column_letter: str) -> Optional[Dict[str, Any]]:
        """Direct O(1) array coordinate access."""
        r_idx, c_idx = self._coords_to_indices(row_number, column_letter)
        return self.grid[r_idx][c_idx]

    def allocate(self, row_number: int, column_letter: str, passenger_name: str, pnr: str) -> bool:
        """
        Allocate seat to passenger in O(1) time.
        Returns True if allocation succeeds, False if seat is occupied or does not exist.
        """
        r_idx, c_idx = self._coords_to_indices(row_number, column_letter)
        seat = self.grid[r_idx][c_idx]
        if seat is None or seat.get("status") != "AVAILABLE":
            return False

        seat["status"] = "RESERVED"
        seat["passenger_name"] = passenger_name
        seat["pnr"] = pnr
        self._occupied_count += 1
        return True

    def deallocate(self, row_number: int, column_letter: str) -> bool:
        """
        Deallocate seat back to AVAILABLE in O(1) time.
        """
        r_idx, c_idx = self._coords_to_indices(row_number, column_letter)
        seat = self.grid[r_idx][c_idx]
        if seat is None or seat.get("status") == "AVAILABLE":
            return False

        seat["status"] = "AVAILABLE"
        seat.pop("passenger_name", None)
        seat.pop("pnr", None)
        self._occupied_count = max(0, self._occupied_count - 1)
        return True

    def find_contiguous_block(
        self,
        group_size: int,
        cabin_class: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """
        2D Array sweep: scan each row for contiguous available adjacent seats.
        Time Complexity: O(R * C) where R is row count and C is column count.
        """
        if group_size <= 1:
            return None

        # Sections that cannot cross aisles:
        # Left wing (A,B,C), Center block (D,E,F,G), Right wing (H,J,K)
        sub_sections = [
            ["A", "B", "C"],
            ["D", "E", "F", "G"],
            ["H", "J", "K"]
        ]

        for r_num in range(self.min_row, self.max_row + 1):
            r_idx = r_num - self.min_row
            row_cells = self.grid[r_idx]

            for section in sub_sections:
                if len(section) < group_size:
                    continue
                for start_i in range(len(section) - group_size + 1):
                    target_cols = section[start_i:start_i + group_size]
                    candidate_block = []
                    valid = True

                    for col in target_cols:
                        if col not in self.col_to_idx:
                            valid = False
                            break
                        c_idx = self.col_to_idx[col]
                        cell = row_cells[c_idx]
                        if cell is None or cell.get("status") != "AVAILABLE":
                            valid = False
                            break
                        if cabin_class and cell.get("cabin_class") != cabin_class:
                            valid = False
                            break
                        candidate_block.append(cell)

                    if valid and len(candidate_block) == group_size:
                        return candidate_block

        return None

    def get_metrics(self) -> Dict[str, Any]:
        """Calculate spatial memory layout metrics."""
        total_cells = self.num_rows * self.num_cols
        density = (self._occupied_count / max(1, self._seat_count)) * 100.0 if self._seat_count > 0 else 0.0
        return {
            "matrix_dimensions": f"{self.num_rows} rows x {self.num_cols} columns",
            "total_matrix_cells": total_cells,
            "configured_seats": self._seat_count,
            "occupied_seats": self._occupied_count,
            "available_seats": self._seat_count - self._occupied_count,
            "occupancy_rate_percent": round(density, 1),
            "theoretical_time_complexity": "O(1) coordinate lookup grid[r][c], O(R*C) contiguous sweep",
            "memory_layout": "Contiguous row-major array indexing"
        }

    def to_matrix_representation(self) -> List[List[Optional[Dict[str, Any]]]]:
        """Return full matrix representation for visual rendering."""
        return self.grid
