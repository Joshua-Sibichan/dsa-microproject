"""
Binary Search Tree (BST) Implementation for Booking Reference (PNR) Index (CO4)
Supports insertion, search, deletion (0, 1, 2 children), and standard traversals.
"""
from typing import Any, Dict, List, Optional, Tuple

class BSTNode:
    def __init__(self, key: str, value: Dict[str, Any]):
        self.key: str = key.upper()  # PNR string, e.g. "EK789A"
        self.value: Dict[str, Any] = value
        self.left: Optional['BSTNode'] = None
        self.right: Optional['BSTNode'] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "key": self.key,
            "value": self.value,
            "left": self.left.to_dict() if self.left else None,
            "right": self.right.to_dict() if self.right else None
        }

class BookingBST:
    """
    Binary Search Tree indexing reservations by unique 6-character PNR.
    Average Case Time Complexity:
      - Search: O(log N)
      - Insert: O(log N)
      - Delete: O(log N)
    Worst Case (unbalanced): O(N)
    """
    def __init__(self):
        self.root: Optional[BSTNode] = None
        self._size: int = 0

    def insert(self, key: str, value: Dict[str, Any]) -> bool:
        """
        Insert a new PNR and associated booking record.
        Returns True if inserted, False if key already exists.
        """
        key = key.strip().upper()
        if not key:
            return False

        if self.root is None:
            self.root = BSTNode(key, value)
            self._size += 1
            return True

        curr = self.root
        while curr:
            if key == curr.key:
                # Key already exists, update value or reject
                curr.value = value
                return False
            elif key < curr.key:
                if curr.left is None:
                    curr.left = BSTNode(key, value)
                    self._size += 1
                    return True
                curr = curr.left
            else:
                if curr.right is None:
                    curr.right = BSTNode(key, value)
                    self._size += 1
                    return True
                curr = curr.right
        return False

    def search(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Search for a reservation by PNR.
        Returns value dict or None.
        """
        key = key.strip().upper()
        curr = self.root
        while curr:
            if key == curr.key:
                return curr.value
            elif key < curr.key:
                curr = curr.left
            else:
                curr = curr.right
        return None

    def search_with_path(self, key: str) -> Tuple[Optional[Dict[str, Any]], List[str]]:
        """
        Search for a reservation and track the comparison path (nodes visited).
        Used for step-by-step visualizer animation.
        """
        key = key.strip().upper()
        curr = self.root
        path: List[str] = []
        while curr:
            path.append(curr.key)
            if key == curr.key:
                return curr.value, path
            elif key < curr.key:
                curr = curr.left
            else:
                curr = curr.right
        return None, path

    def delete(self, key: str) -> bool:
        """
        Delete a PNR node from the BST.
        Handles:
          - Leaf nodes (0 children)
          - Nodes with 1 child
          - Nodes with 2 children (replaces with inorder successor)
        """
        key = key.strip().upper()
        initial_size = self._size
        self.root = self._delete_rec(self.root, key)
        return self._size < initial_size

    def _delete_rec(self, node: Optional[BSTNode], key: str) -> Optional[BSTNode]:
        if node is None:
            return None

        if key < node.key:
            node.left = self._delete_rec(node.left, key)
        elif key > node.key:
            node.right = self._delete_rec(node.right, key)
        else:
            # Node to delete found
            self._size -= 1

            # Case 1: Leaf node
            if node.left is None and node.right is None:
                return None

            # Case 2: One child
            if node.left is None:
                return node.right
            elif node.right is None:
                return node.left

            # Case 3: Two children
            # Find in-order successor (smallest node in right subtree)
            successor = self._min_value_node(node.right)
            node.key = successor.key
            node.value = successor.value
            # Now delete the duplicate successor from the right subtree
            # Adjust size back because recursive call will decrement size again
            self._size += 1
            node.right = self._delete_rec(node.right, successor.key)

        return node

    def _min_value_node(self, node: BSTNode) -> BSTNode:
        curr = node
        while curr.left is not None:
            curr = curr.left
        return curr

    def inorder_traversal(self) -> List[Dict[str, Any]]:
        """
        Left -> Root -> Right (Produces strictly ascending alphabetical order).
        """
        result: List[Dict[str, Any]] = []
        def _inorder(node: Optional[BSTNode]):
            if node:
                _inorder(node.left)
                result.append({"key": node.key, "value": node.value})
                _inorder(node.right)
        _inorder(self.root)
        return result

    def preorder_traversal(self) -> List[Dict[str, Any]]:
        """
        Root -> Left -> Right (Useful for tree cloning and serialization).
        """
        result: List[Dict[str, Any]] = []
        def _preorder(node: Optional[BSTNode]):
            if node:
                result.append({"key": node.key, "value": node.value})
                _preorder(node.left)
                _preorder(node.right)
        _preorder(self.root)
        return result

    def postorder_traversal(self) -> List[Dict[str, Any]]:
        """
        Left -> Right -> Root (Useful for bottom-up tree destruction/evaluation).
        """
        result: List[Dict[str, Any]] = []
        def _postorder(node: Optional[BSTNode]):
            if node:
                _postorder(node.left)
                _postorder(node.right)
                result.append({"key": node.key, "value": node.value})
        _postorder(self.root)
        return result

    def size(self) -> int:
        return self._size

    def height(self) -> int:
        def _height(node: Optional[BSTNode]) -> int:
            if not node:
                return 0
            return 1 + max(_height(node.left), _height(node.right))
        return _height(self.root)

    def to_tree_dict(self) -> Optional[Dict[str, Any]]:
        return self.root.to_dict() if self.root else None
