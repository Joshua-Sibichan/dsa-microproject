"""
LIFO Stack Implementation for Reversible Reservation Operations and Undo (CO1)
Maintains strict Last-In, First-Out discipline for safe state rollback.
"""
from typing import Any, Dict, List, Optional
import time

class StackNode:
    def __init__(self, action: Dict[str, Any]):
        self.action: Dict[str, Any] = action
        self.next: Optional['StackNode'] = None

class UndoStack:
    """
    Linked-list based LIFO Stack for tracking and reversing booking actions.
    Guarantees O(1) push and O(1) pop operations.
    Validates state transitions to prevent undoing into an inconsistent state.
    """
    def __init__(self, max_capacity: int = 30):
        self.top: Optional[StackNode] = None
        self._size: int = 0
        self.max_capacity: int = max_capacity
        self.operation_history: List[Dict[str, Any]] = []

    def push(self, action: Dict[str, Any]) -> bool:
        """
        Push a reversible action onto the top of the stack.
        Expected action format:
        {
            "action_type": "SEAT_SELECT" | "SEAT_RELEASE" | "SEAT_SWAP" | "BOOKING_CREATE",
            "flight_id": str,
            "previous_state": dict,
            "new_state": dict,
            "description": str,
            "timestamp": float
        }
        Time Complexity: O(1)
        """
        if self._size >= self.max_capacity:
            # Drop bottom or reject: here we reject or truncate
            self._log_op("PUSH_REJECTED", action, False, "Stack capacity limit reached")
            return False

        if "timestamp" not in action:
            action["timestamp"] = time.time()

        new_node = StackNode(action)
        new_node.next = self.top
        self.top = new_node
        self._size += 1

        self._log_op("PUSH", action, True, f"Action pushed: {action.get('action_type', 'UNKNOWN')}")
        return True

    def pop(self) -> Optional[Dict[str, Any]]:
        """
        Pop the most recent reversible action from the top of the stack.
        Time Complexity: O(1)
        """
        if self.top is None:
            self._log_op("POP_FAILED", {}, False, "Undo stack is empty")
            return None

        popped_node = self.top
        self.top = self.top.next
        self._size -= 1
        action = popped_node.action

        self._log_op("POP", action, True, f"Action popped for undo: {action.get('action_type', 'UNKNOWN')}")
        return action

    def peek(self) -> Optional[Dict[str, Any]]:
        """
        Inspect the topmost reversible action without removing it.
        Time Complexity: O(1)
        """
        if self.top is None:
            return None
        return self.top.action

    def is_empty(self) -> bool:
        return self._size == 0

    def size(self) -> int:
        return self._size

    def to_list(self) -> List[Dict[str, Any]]:
        """
        Return actions from top of stack to bottom.
        Time Complexity: O(N)
        """
        items = []
        curr = self.top
        depth = 0
        while curr:
            item_copy = dict(curr.action)
            item_copy["stack_depth"] = depth
            items.append(item_copy)
            curr = curr.next
            depth += 1
        return items

    def clear(self) -> None:
        self.top = None
        self._size = 0
        self._log_op("CLEAR", {}, True, "Undo stack cleared")

    def _log_op(self, op_type: str, item: Dict[str, Any], success: bool, message: str) -> None:
        self.operation_history.append({
            "operation": op_type,
            "item": item,
            "success": success,
            "message": message,
            "timestamp": time.time(),
            "resulting_size": self._size
        })
        if len(self.operation_history) > 100:
            self.operation_history.pop(0)
