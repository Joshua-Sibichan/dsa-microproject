"""
Comprehensive Unit Tests for Core DSA Engines (CO1 to CO5)
"""
import pytest
from app.dsa.queue_waitlist import WaitlistQueue
from app.dsa.stack_undo import UndoStack
from app.dsa.bst_index import BookingBST
from app.dsa.airport_graph import AirportGraph
from app.dsa.sorting_algorithms import merge_sort, insertion_sort
from app.dsa.searching_algorithms import linear_search, binary_search
from app.dsa.seat_recommender import SeatRecommender

# ==========================================
# CO1: FIFO QUEUE TESTS
# ==========================================

def test_waitlist_fifo_queue():
    q = WaitlistQueue(max_capacity=5)
    assert q.is_empty()
    assert q.size() == 0

    p1 = {"name": "Alice", "pnr_desired": "14A"}
    p2 = {"name": "Bob", "pnr_desired": "14B"}
    p3 = {"name": "Charlie", "pnr_desired": "14C"}

    assert q.enqueue(p1) is True
    assert q.enqueue(p2) is True
    assert q.enqueue(p3) is True
    assert q.size() == 3
    assert q.peek()["name"] == "Alice"

    # Strict FIFO dequeue order
    d1 = q.dequeue()
    assert d1["name"] == "Alice"
    assert q.size() == 2

    d2 = q.dequeue()
    assert d2["name"] == "Bob"

    d3 = q.dequeue()
    assert d3["name"] == "Charlie"
    assert q.is_empty()
    assert q.dequeue() is None


def test_queue_capacity_limit():
    q = WaitlistQueue(max_capacity=2)
    assert q.enqueue({"name": "P1"}) is True
    assert q.enqueue({"name": "P2"}) is True
    assert q.enqueue({"name": "P3"}) is False  # Capacity exceeded
    assert q.size() == 2


# ==========================================
# CO1: LIFO UNDO STACK TESTS
# ==========================================

def test_undo_stack_lifo():
    s = UndoStack(max_capacity=5)
    assert s.is_empty()
    assert s.size() == 0

    action1 = {"action_type": "SEAT_SELECT", "seat": "12A"}
    action2 = {"action_type": "SEAT_SWAP", "seat": "14C"}
    action3 = {"action_type": "BOOKING_CONFIRM", "pnr": "EK9999"}

    s.push(action1)
    s.push(action2)
    s.push(action3)
    assert s.size() == 3
    assert s.peek()["action_type"] == "BOOKING_CONFIRM"

    # LIFO Pop order
    popped3 = s.pop()
    assert popped3["action_type"] == "BOOKING_CONFIRM"

    popped2 = s.pop()
    assert popped2["action_type"] == "SEAT_SWAP"

    popped1 = s.pop()
    assert popped1["action_type"] == "SEAT_SELECT"
    assert s.is_empty()
    assert s.pop() is None


# ==========================================
# CO4: BINARY SEARCH TREE TESTS
# ==========================================

def test_bst_insert_and_search():
    bst = BookingBST()
    assert bst.size() == 0

    # Insert out-of-order PNRs
    bst.insert("EK5000", {"passenger": "Five"})
    bst.insert("EK2000", {"passenger": "Two"})
    bst.insert("EK8000", {"passenger": "Eight"})
    bst.insert("EK1000", {"passenger": "One"})
    bst.insert("EK3000", {"passenger": "Three"})

    assert bst.size() == 5

    # Search existing keys
    res, path = bst.search_with_path("EK3000")
    assert res is not None
    assert res["passenger"] == "Three"
    assert path == ["EK5000", "EK2000", "EK3000"]

    # Search non-existent key
    res_none, path_none = bst.search_with_path("EK9999")
    assert res_none is None
    assert "EK8000" in path_none


def test_bst_traversals():
    bst = BookingBST()
    pnr_keys = ["EK50", "EK20", "EK70", "EK10", "EK30", "EK60", "EK80"]
    for k in pnr_keys:
        bst.insert(k, {"pnr": k})

    # Inorder: strictly sorted
    inorder = [item["key"] for item in bst.inorder_traversal()]
    assert inorder == sorted(pnr_keys)

    # Preorder: root first
    preorder = [item["key"] for item in bst.preorder_traversal()]
    assert preorder[0] == "EK50"

    # Postorder: root last
    postorder = [item["key"] for item in bst.postorder_traversal()]
    assert postorder[-1] == "EK50"


def test_bst_deletion():
    bst = BookingBST()
    for k in ["M", "B", "Q", "A", "C", "Z"]:
        bst.insert(k, {"val": k})

    # 1. Delete leaf node 'A'
    assert bst.delete("A") is True
    assert bst.search("A") is None
    assert bst.size() == 5

    # 2. Delete node with 1 child 'Q' (has right child 'Z')
    assert bst.delete("Q") is True
    assert bst.search("Q") is None
    assert bst.search("Z") is not None
    assert bst.size() == 4

    # 3. Delete root node 'M' (has 2 children 'B' and 'Z')
    assert bst.delete("M") is True
    assert bst.search("M") is None
    assert bst.search("B") is not None
    assert bst.search("C") is not None
    assert bst.size() == 3


# ==========================================
# CO5: AIRPORT GRAPH & BFS TESTS
# ==========================================

def test_airport_graph_bfs():
    g = AirportGraph()
    airports = ["DXB", "LHR", "JFK", "SIN", "SYD"]
    for a in airports:
        g.add_airport(a, a, a, "World", 0.0, 0.0)

    # DXB connects to LHR, JFK, SIN
    g.add_route("DXB", "LHR", "EK1")
    g.add_route("DXB", "JFK", "EK2")
    g.add_route("DXB", "SIN", "EK3")
    # LHR connects to JFK
    g.add_route("LHR", "JFK", "BA1")
    # SIN connects to SYD
    g.add_route("SIN", "SYD", "SQ1")

    bfs_res = g.bfs_traversal("DXB")
    assert bfs_res["start_node"] == "DXB"
    assert bfs_res["total_visited"] == 5
    assert bfs_res["traversal_order"][0] == "DXB"
    # Level 1 should be LHR, JFK, SIN in some order
    assert set(bfs_res["levels"][1]) == {"LHR", "JFK", "SIN"}
    # Level 2 should be SYD
    assert bfs_res["levels"][2] == ["SYD"]

    # Fewest segments route: DXB to SYD should go through SIN (2 segments)
    route = g.find_fewest_segments_route("DXB", "SYD")
    assert route["path"] == ["DXB", "SIN", "SYD"]
    assert route["segments_count"] == 2
    assert route["stops"] == 1


# ==========================================
# CO3: SORTING ALGORITHMS TESTS
# ==========================================

def test_sorting_algorithms():
    raw_data = [45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 99]

    # Test Merge Sort ascending
    m_sorted, m_metrics = merge_sort(raw_data)
    assert m_sorted == sorted(raw_data)
    assert m_metrics["comparisons"] > 0
    assert m_metrics["is_stable"] is True

    # Test Insertion Sort ascending
    i_sorted, i_metrics = insertion_sort(raw_data)
    assert i_sorted == sorted(raw_data)
    assert i_metrics["comparisons"] > 0

    # Test Reverse (descending for preference ranking)
    rev_sorted, _ = merge_sort(raw_data, reverse=True)
    assert rev_sorted == sorted(raw_data, reverse=True)


# ==========================================
# CO3: SEARCHING ALGORITHMS TESTS
# ==========================================

def test_searching_algorithms():
    dataset = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

    # Linear Search
    idx, lin_m = linear_search(dataset, 70)
    assert idx == 6
    assert lin_m["found"] is True
    assert lin_m["comparisons"] == 7

    # Binary Search
    idx_b, bin_m = binary_search(dataset, 70)
    assert idx_b == 6
    assert bin_m["found"] is True
    assert bin_m["comparisons"] <= 4  # log2(10) ≈ 3.32

    # Not found
    idx_nf, bin_nf = binary_search(dataset, 999)
    assert idx_nf == -1
    assert bin_nf["found"] is False


# ==========================================
# SEAT RECOMMENDER & GROUP SEATING TESTS
# ==========================================

def test_seat_recommender():
    recommender = SeatRecommender()
    available_seats = [
        {"seat_number": "15A", "is_window": True, "is_aisle": False, "category": "PREFERRED", "row_number": 15, "cabin_class": "ECONOMY", "status": "AVAILABLE"},
        {"seat_number": "15B", "is_window": False, "is_aisle": False, "category": "PREFERRED", "row_number": 15, "cabin_class": "ECONOMY", "status": "AVAILABLE"},
        {"seat_number": "15C", "is_window": False, "is_aisle": True, "category": "PREFERRED", "row_number": 15, "cabin_class": "ECONOMY", "status": "AVAILABLE"},
        {"seat_number": "26A", "is_window": True, "is_aisle": False, "category": "EXTRA_LEGROOM", "row_number": 26, "cabin_class": "ECONOMY", "status": "AVAILABLE", "is_exit_row": True}
    ]

    passenger = {"name": "Test Passenger", "age": 30, "traveling_with_infant": False, "requires_wheelchair": False}
    prefs = {"window": True, "extra_legroom": True, "avoid_middle": True}

    rec = recommender.recommend_seat(available_seats, prefs, passenger)
    assert rec["recommended_seat"] is not None
    # 26A matches both window and extra legroom
    assert rec["recommended_seat"]["seat_number"] == "26A"
    assert rec["recommended_seat"]["preference_score"] > 70.0


def test_group_seating_finder():
    recommender = SeatRecommender()
    seats = [
        {"seat_number": "18A", "row_number": 18, "column_letter": "A", "cabin_class": "ECONOMY", "status": "AVAILABLE"},
        {"seat_number": "18B", "row_number": 18, "column_letter": "B", "cabin_class": "ECONOMY", "status": "AVAILABLE"},
        {"seat_number": "18C", "row_number": 18, "column_letter": "C", "cabin_class": "ECONOMY", "status": "RESERVED"}, # Blocked
        {"seat_number": "19A", "row_number": 19, "column_letter": "A", "cabin_class": "ECONOMY", "status": "AVAILABLE"},
        {"seat_number": "19B", "row_number": 19, "column_letter": "B", "cabin_class": "ECONOMY", "status": "AVAILABLE"},
        {"seat_number": "19C", "row_number": 19, "column_letter": "C", "cabin_class": "ECONOMY", "status": "AVAILABLE"}  # Block of 3 available
    ]

    res = recommender.find_group_seats(seats, group_size=3, preferred_class="ECONOMY")
    assert res["found"] is True
    assert res["row"] == 19
    assert res["seat_numbers"] == ["19A", "19B", "19C"]


# ==========================================
# CO2: 2D ARRAY SEAT GRID TESTS
# ==========================================

def test_seat_grid_2d_operations():
    from app.dsa.seat_grid_2d import SeatGrid2D
    grid = SeatGrid2D(min_row=1, max_row=26)

    # Initialize seats
    grid.set_seat(15, "A", {"seat_number": "15A", "status": "AVAILABLE", "cabin_class": "ECONOMY"})
    grid.set_seat(15, "B", {"seat_number": "15B", "status": "AVAILABLE", "cabin_class": "ECONOMY"})
    grid.set_seat(15, "C", {"seat_number": "15C", "status": "AVAILABLE", "cabin_class": "ECONOMY"})

    # O(1) Lookup
    seat_15a = grid.get_seat(15, "A")
    assert seat_15a is not None
    assert seat_15a["status"] == "AVAILABLE"

    # O(1) Allocation
    allocated = grid.allocate(15, "A", "John Doe", "EKTEST1")
    assert allocated is True
    assert grid.get_seat(15, "A")["status"] == "RESERVED"

    # Cannot double-allocate
    assert grid.allocate(15, "A", "Jane Doe", "EKTEST2") is False

    # O(1) Deallocation
    deallocated = grid.deallocate(15, "A")
    assert deallocated is True
    assert grid.get_seat(15, "A")["status"] == "AVAILABLE"

    # Contiguous block search on 2D array
    block = grid.find_contiguous_block(group_size=2, cabin_class="ECONOMY")
    assert block is not None
    assert len(block) == 2
    assert [s["seat_number"] for s in block] == ["15A", "15B"]

    # Metrics
    metrics = grid.get_metrics()
    assert metrics["configured_seats"] == 3
    assert metrics["occupied_seats"] == 0
