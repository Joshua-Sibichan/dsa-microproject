"""
Integration Tests for AeroSeat Intelligence API Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db_connection

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_test_seats():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE seats SET status = 'AVAILABLE' WHERE flight_id = 'FL-201' AND seat_number NOT IN ('1A', '6E', '15B', '26A', '18F')")
    cursor.execute("DELETE FROM reservations WHERE pnr NOT IN ('EK9X2B', 'EK4M7K', 'EK2A9F', 'EK8R3T', 'EK5P1Q')")
    conn.commit()
    conn.close()
    yield

def test_get_flights():
    response = client.get("/api/flights")
    assert response.status_code == 200
    flights = response.json()
    assert len(flights) >= 4
    assert any(f["flight_number"] == "EK-201" for f in flights)

def test_get_flight_seats():
    response = client.get("/api/flights/FL-201/seats")
    assert response.status_code == 200
    seats = response.json()
    assert len(seats) > 50
    # Verify seat data structure
    s = seats[0]
    assert "seat_number" in s
    assert "cabin_class" in s
    assert "status" in s

def test_reservation_lifecycle_and_concurrency():
    # 1. Create a reservation for an available seat
    payload = {
        "flight_id": "FL-201",
        "seat_number": "19A",
        "passenger_name": "Dr. Alan Turing",
        "passenger_email": "alan@enigma.ac.uk",
        "preferences": {
            "window": True,
            "avoid_middle": True
        }
    }
    create_res = client.post("/api/reservations", json=payload)
    assert create_res.status_code == 200
    data = create_res.json()
    pnr = data["pnr"]
    assert pnr.startswith("EK")
    assert data["seat_number"] == "19A"

    # 2. Strict Double-Booking Prevention: Attempting to book the SAME seat MUST fail with 409 Conflict
    conflict_res = client.post("/api/reservations", json={
        "flight_id": "FL-201",
        "seat_number": "19A",
        "passenger_name": "Imposter",
        "passenger_email": "imposter@fake.com"
    })
    assert conflict_res.status_code == 409
    assert "already reserved" in conflict_res.json()["detail"].lower()

    # 3. Retrieve reservation via PNR (Manage Booking)
    get_res = client.get(f"/api/reservations/{pnr}?last_name=Turing")
    assert get_res.status_code == 200
    assert get_res.json()["passenger_name"] == "Dr. Alan Turing"
    assert "bst_lookup_path" in get_res.json()

    # 4. Cancel reservation and verify seat is released
    cancel_res = client.post(f"/api/reservations/{pnr}/cancel")
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "CANCELLED"
    assert cancel_res.json()["seat_released"] == "19A"

    # 5. Seat 19A should now be bookable again
    rebook_res = client.post("/api/reservations", json={
        "flight_id": "FL-201",
        "seat_number": "19A",
        "passenger_name": "Ada Lovelace",
        "passenger_email": "ada@lovelace.io"
    })
    assert rebook_res.status_code == 200
    assert rebook_res.json()["seat_number"] == "19A"

def test_undo_operation():
    # Create a reservation to ensure undo stack has an action
    client.post("/api/reservations", json={
        "flight_id": "FL-201",
        "seat_number": "20A",
        "passenger_name": "Undo Test User",
        "passenger_email": "undo@test.org"
    })

    history_res = client.get("/api/undo/history")
    assert history_res.status_code == 200
    assert history_res.json()["current_size"] >= 1

    undo_res = client.post("/api/undo")
    assert undo_res.status_code == 200
    assert "undone_action" in undo_res.json()

def test_waitlist_flow():
    # Enqueue passenger
    enq_res = client.post("/api/waitlist/enqueue", json={
        "flight_id": "FL-201",
        "passenger_name": "Grace Hopper",
        "passenger_email": "grace@navy.mil",
        "preferred_category": "EXTRA_LEGROOM"
    })
    assert enq_res.status_code == 200
    assert enq_res.json()["success"] is True

    # Inspect waitlist
    wl_res = client.get("/api/waitlist")
    assert wl_res.status_code == 200
    assert wl_res.json()["current_size"] >= 1

    # Dequeue passenger
    deq_res = client.post("/api/waitlist/dequeue")
    assert deq_res.status_code == 200
    assert deq_res.json()["passenger"]["passenger_name"] == "Grace Hopper"

def test_bst_endpoints():
    bst_summary = client.get("/api/dsa/bst")
    assert bst_summary.status_code == 200
    assert "inorder_traversal" in bst_summary.json()
    assert "preorder_traversal" in bst_summary.json()
    assert "postorder_traversal" in bst_summary.json()

    # Operate BST: Insert and Search
    ins_res = client.post("/api/dsa/bst/operate", json={
        "action": "INSERT",
        "pnr": "EK7777",
        "passenger_name": "Claude Shannon",
        "seat_number": "1A"
    })
    assert ins_res.status_code == 200

    search_res = client.post("/api/dsa/bst/operate", json={
        "action": "SEARCH",
        "pnr": "EK7777"
    })
    assert search_res.status_code == 200
    assert search_res.json()["found"] is True

def test_airport_graph_endpoints():
    graph_res = client.get("/api/dsa/graph")
    assert graph_res.status_code == 200
    assert len(graph_res.json()["nodes"]) == 10

    # BFS from DXB
    bfs_res = client.post("/api/dsa/graph/bfs", json={"origin": "DXB"})
    assert bfs_res.status_code == 200
    assert bfs_res.json()["start_node"] == "DXB"

    # Route from DXB to SFO
    route_res = client.post("/api/dsa/graph/route", json={"origin": "DXB", "destination": "SFO"})
    assert route_res.status_code == 200
    assert route_res.json()["segments_count"] > 0
    assert route_res.json()["path"][0] == "DXB"
    assert route_res.json()["path"][-1] == "SFO"

def test_benchmark_endpoints():
    arena_res = client.post("/api/dsa/benchmarks/arena")
    assert arena_res.status_code == 200
    assert "first_available_strategy" in arena_res.json()
    assert "preference_scored_strategy" in arena_res.json()

    sort_res = client.post("/api/dsa/benchmarks/sorting", json={"dataset_size": 100})
    assert sort_res.status_code == 200
    assert "merge_sort" in sort_res.json()
    assert "insertion_sort" in sort_res.json()

    search_res = client.post("/api/dsa/benchmarks/searching", json={"dataset_size": 200})
    assert search_res.status_code == 200
    assert "linear_search" in search_res.json()
    assert "binary_search" in search_res.json()
