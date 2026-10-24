"""
FIFO Queue Implementation for Waitlist Management (CO1)
Follows strict First-In, First-Out discipline for waitlist allocation.
"""
from typing import Any, Dict, List, Optional
import time

class WaitlistNode:
    def __init__(self, data: Dict[str, Any]):
        self.data: Dict[str, Any] = data
        self.next: Optional['WaitlistNode'] = None

class WaitlistQueue:
    """
    Linked-list based FIFO Queue ensuring O(1) enqueue and O(1) dequeue operations.
    Maintains complete audit history of all operations for visualization and verification.
    """
    def __init__(self, max_capacity: int = 50):
        self.head: Optional[WaitlistNode] = None
        self.tail: Optional[WaitlistNode] = None
        self._size: int = 0
        self.max_capacity: int = max_capacity
        self.operation_history: List[Dict[str, Any]] = []

    def enqueue(self, passenger: Dict[str, Any]) -> bool:
        """
        Add a passenger to the rear of the waitlist.
        Time Complexity: O(1)
        """
        if self._size >= self.max_capacity:
            self._log_op("ENQUEUE_REJECTED", passenger, False, "Queue capacity reached")
            return False

        # Ensure timestamp exists
        if "timestamp" not in passenger:
            passenger["timestamp"] = time.time()

        new_node = WaitlistNode(passenger)
        if self.tail is None:
            self.head = new_node
            self.tail = new_node
        else:
            self.tail.next = new_node
            self.tail = new_node

        self._size += 1
        self._log_op("ENQUEUE", passenger, True, f"Passenger enqueued at position {self._size}")
        return True

    def dequeue(self) -> Optional[Dict[str, Any]]:
        """
        Remove and return the passenger at the front of the waitlist.
        Time Complexity: O(1)
        """
        if self.head is None:
            self._log_op("DEQUEUE_FAILED", {}, False, "Queue is empty")
            return None

        dequeued_node = self.head
        self.head = self.head.next
        if self.head is None:
            self.tail = None

        self._size -= 1
        passenger = dequeued_node.data
        self._log_op("DEQUEUE", passenger, True, f"Passenger dequeued from front. Remaining size: {self._size}")
        return passenger

    def peek(self) -> Optional[Dict[str, Any]]:
        """
        Inspect the front element without removing it.
        Time Complexity: O(1)
        """
        if self.head is None:
            return None
        return self.head.data

    def is_empty(self) -> bool:
        return self._size == 0

    def size(self) -> int:
        return self._size

    def to_list(self) -> List[Dict[str, Any]]:
        """
        Return all waitlisted items from front to rear.
        Time Complexity: O(N)
        """
        items = []
        curr = self.head
        pos = 1
        while curr:
            item_copy = dict(curr.data)
            item_copy["queue_position"] = pos
            items.append(item_copy)
            curr = curr.next
            pos += 1
        return items

    def clear(self) -> None:
        self.head = None
        self.tail = None
        self._size = 0
        self._log_op("CLEAR", {}, True, "Queue cleared")

    def _log_op(self, op_type: str, item: Dict[str, Any], success: bool, message: str) -> None:
        self.operation_history.append({
            "operation": op_type,
            "item": item,
            "success": success,
            "message": message,
            "timestamp": time.time(),
            "resulting_size": self._size
        })
        # Keep recent 100 history records
        if len(self.operation_history) > 100:
            self.operation_history.pop(0)
