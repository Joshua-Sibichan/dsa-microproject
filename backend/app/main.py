"""
AeroSeat Intelligence — FastAPI Application Entry Point
Exposes core reservation workflows, seat intelligence, and real-time DSA hub instrumentation.
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import random
import string
import json
import time
import os
from typing import Any, Dict, List, Optional

from app.database import init_db, get_db_connection
from app.models import (
    FlightModel, SeatModel, ReservationCreateRequest, ReservationResponse,
    RecommendationRequest, GroupSeatingRequest, WaitlistRequest,
    BSTActionRequest, GraphRouteRequest, BenchmarkRequest
)
from app.dsa.queue_waitlist import WaitlistQueue
from app.dsa.stack_undo import UndoStack
from app.dsa.bst_index import BookingBST
from app.dsa.airport_graph import AirportGraph
from app.dsa.seat_recommender import SeatRecommender
from app.dsa.benchmark_runner import BenchmarkRunner

# Global in-memory DSA instances
bst_index = BookingBST()
undo_stack = UndoStack(max_capacity=50)
waitlist_queue = WaitlistQueue(max_capacity=50)
airport_graph = AirportGraph()
recommender = SeatRecommender()
benchmark_runner = BenchmarkRunner()

def setup_airport_network(graph: AirportGraph) -> None:
    airports = [
        ("DXB", "Dubai International", "Dubai", "UAE", 25.2532, 55.3657),
        ("LHR", "London Heathrow", "London", "UK", 51.4700, -0.4543),
        ("JFK", "John F. Kennedy Intl", "New York", "USA", 40.6413, -73.7781),
        ("SIN", "Singapore Changi", "Singapore", "Singapore", 1.3644, 103.9915),
        ("SYD", "Sydney Kingsford Smith", "Sydney", "Australia", -33.9399, 151.1753),
        ("HND", "Tokyo Haneda", "Tokyo", "Japan", 35.5494, 139.7798),
        ("CDG", "Paris Charles de Gaulle", "Paris", "France", 49.0097, 2.5479),
        ("FRA", "Frankfurt Airport", "Frankfurt", "Germany", 50.0379, 8.5622),
        ("BOM", "Chhatrapati Shivaji Intl", "Mumbai", "India", 19.0896, 72.8656),
        ("SFO", "San Francisco Intl", "San Francisco", "USA", 37.6213, -122.3790)
    ]
    for code, name, city, country, lat, lng in airports:
        graph.add_airport(code, name, city, country, lat, lng)

    # Routes (Corridors)
    routes = [
        ("DXB", "LHR", "EK-001", 7.5, 650.0),
        ("DXB", "JFK", "EK-201", 14.0, 950.0),
        ("DXB", "SIN", "EK-354", 7.5, 480.0),
        ("DXB", "BOM", "EK-500", 3.5, 280.0),
        ("DXB", "CDG", "EK-073", 7.0, 620.0),
        ("DXB", "FRA", "EK-045", 6.5, 590.0),
        ("DXB", "SYD", "EK-414", 14.0, 1150.0),
        ("DXB", "HND", "EK-318", 9.5, 820.0),
        ("LHR", "JFK", "BA-175", 8.0, 720.0),
        ("LHR", "CDG", "AF-1681", 1.2, 160.0),
        ("FRA", "CDG", "LH-1034", 1.3, 170.0),
        ("JFK", "SFO", "DL-420", 6.0, 310.0),
        ("SIN", "SYD", "SQ-211", 7.8, 620.0),
        ("SIN", "HND", "SQ-638", 7.0, 580.0),
        ("HND", "SFO", "JL-002", 9.5, 890.0),
        ("BOM", "SIN", "AI-380", 5.2, 350.0),
        ("LHR", "BOM", "AI-130", 9.0, 710.0),
    ]
    for u, v, fl, dur, prc in routes:
        graph.add_route(u, v, fl, dur, prc, bidirectional=True)


def sync_bst_from_db() -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.pnr, r.flight_id, r.seat_number, r.passenger_name, r.passenger_email,
               r.created_at, r.status, f.flight_number, f.origin, f.destination, s.cabin_class
        FROM reservations r
        JOIN flights f ON r.flight_id = f.id
        JOIN seats s ON r.flight_id = s.flight_id AND r.seat_number = s.seat_number
        WHERE r.status = 'CONFIRMED'
    """)
    rows = cursor.fetchall()
    for row in rows:
        val = {
            "pnr": row["pnr"],
            "flight_id": row["flight_id"],
            "flight_number": row["flight_number"],
            "origin": row["origin"],
            "destination": row["destination"],
            "seat_number": row["seat_number"],
            "cabin_class": row["cabin_class"],
            "passenger_name": row["passenger_name"],
            "passenger_email": row["passenger_email"],
            "created_at": row["created_at"],
            "status": row["status"]
        }
        bst_index.insert(row["pnr"], val)
    conn.close()


# Initialize database and graph at startup
init_db()
setup_airport_network(airport_graph)
sync_bst_from_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    if not airport_graph.nodes:
        setup_airport_network(airport_graph)
    sync_bst_from_db()
    yield
    # Shutdown

app = FastAPI(
    title="AeroSeat Intelligence API",
    description="Full-stack airline seat-reservation and Data Structures & Algorithms demonstration engine.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_pnr() -> str:
    # 6-character alphanumeric PNR starting with EK
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"EK{suffix}"


# ==========================================
# FLIGHTS & CABIN SEATS ENDPOINTS
# ==========================================

@app.get("/api/flights", response_model=List[FlightModel])
def get_flights():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM flights ORDER BY flight_number")
    flights = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return flights


@app.get("/api/flights/{flight_id}", response_model=FlightModel)
def get_flight(flight_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM flights WHERE id = ?", (flight_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Flight not found")
    return dict(row)


@app.get("/api/flights/{flight_id}/seats", response_model=List[SeatModel])
def get_flight_seats(flight_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM seats
        WHERE flight_id = ?
        ORDER BY row_number ASC, column_letter ASC
    """, (flight_id,))
    rows = cursor.fetchall()
    conn.close()
    if not rows:
        raise HTTPException(status_code=404, detail="No seats found for this flight")
    return [dict(row) for row in rows]


# ==========================================
# SEAT INTELLIGENCE & RECOMMENDATIONS
# ==========================================

@app.post("/api/recommendations")
def get_recommendation(req: RecommendationRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM seats WHERE flight_id = ? AND status = 'AVAILABLE'"
    params = [req.flight_id]
    if req.cabin_class:
        query += " AND cabin_class = ?"
        params.append(req.cabin_class)

    cursor.execute(query, tuple(params))
    avail_seats = [dict(row) for row in cursor.fetchall()]
    conn.close()

    passenger_dict = req.passenger.model_dump()
    preferences_dict = req.passenger.preferences.model_dump()

    result = recommender.recommend_seat(
        available_seats=avail_seats,
        preferences=preferences_dict,
        passenger=passenger_dict,
        limit=5
    )
    return result


@app.post("/api/group-seating")
def find_group_seating(req: GroupSeatingRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM seats WHERE flight_id = ?", (req.flight_id,))
    seats = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return recommender.find_group_seats(
        all_seats=seats,
        group_size=req.group_size,
        preferred_class=req.cabin_class
    )


# ==========================================
# RESERVATIONS & BOOKINGS
# ==========================================

@app.post("/api/reservations", response_model=ReservationResponse)
def create_reservation(req: ReservationCreateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Step 1: Check seat availability with strict concurrency constraint
    cursor.execute("SELECT * FROM seats WHERE flight_id = ? AND seat_number = ?", (req.flight_id, req.seat_number))
    seat = cursor.fetchone()
    if not seat:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Seat {req.seat_number} not found on this flight")

    if seat["status"] != "AVAILABLE":
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Seat {req.seat_number} is already {seat['status'].lower()}. Please select another seat or join the waitlist."
        )

    # Step 2: Generate unique PNR and insert
    pnr = generate_pnr()
    # Ensure PNR collision prevention
    while bst_index.search(pnr) is not None:
        pnr = generate_pnr()

    prefs_str = json.dumps(req.preferences.model_dump()) if req.preferences else "{}"

    cursor.execute("UPDATE seats SET status = 'RESERVED' WHERE flight_id = ? AND seat_number = ?", (req.flight_id, req.seat_number))
    cursor.execute("""
        INSERT INTO reservations (pnr, flight_id, seat_number, passenger_name, passenger_email, preferences_json, status)
        VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
    """, (pnr, req.flight_id, req.seat_number, req.passenger_name, req.passenger_email, prefs_str))

    cursor.execute("UPDATE flights SET available_seats = available_seats - 1 WHERE id = ?", (req.flight_id,))

    cursor.execute("""
        SELECT r.*, f.flight_number, f.origin, f.destination, f.departure_time, s.cabin_class
        FROM reservations r
        JOIN flights f ON r.flight_id = f.id
        JOIN seats s ON r.flight_id = s.flight_id AND r.seat_number = s.seat_number
        WHERE r.pnr = ?
    """, (pnr,))
    row = cursor.fetchone()
    conn.commit()
    conn.close()

    res_dict = dict(row)

    # Step 3: Synchronize with BST (CO4)
    bst_index.insert(pnr, res_dict)

    # Step 4: Record onto Undo Stack (CO1)
    undo_stack.push({
        "action_type": "BOOKING_CREATE",
        "pnr": pnr,
        "flight_id": req.flight_id,
        "seat_number": req.seat_number,
        "passenger_name": req.passenger_name,
        "description": f"Created reservation {pnr} for {req.passenger_name} in seat {req.seat_number}"
    })

    return res_dict


@app.get("/api/reservations/{pnr}")
def get_reservation(pnr: str, last_name: Optional[str] = None):
    pnr_clean = pnr.strip().upper()

    # Step 1: Rapid BST Lookup O(log N)
    bst_res, path = bst_index.search_with_path(pnr_clean)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.*, f.flight_number, f.origin, f.origin_city, f.destination, f.destination_city, f.departure_time, f.arrival_time, f.aircraft_type, s.cabin_class, s.category, s.pitch_inches, s.price
        FROM reservations r
        JOIN flights f ON r.flight_id = f.id
        JOIN seats s ON r.flight_id = s.flight_id AND r.seat_number = s.seat_number
        WHERE r.pnr = ?
    """, (pnr_clean,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"Booking reference {pnr_clean} not found.")

    res_data = dict(row)
    if last_name:
        p_name = res_data["passenger_name"].lower()
        if last_name.lower().strip() not in p_name:
            raise HTTPException(status_code=400, detail="Passenger last name does not match reservation record.")

    res_data["bst_lookup_path"] = path
    return res_data


@app.post("/api/reservations/{pnr}/cancel")
def cancel_reservation(pnr: str):
    pnr_clean = pnr.strip().upper()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM reservations WHERE pnr = ?", (pnr_clean,))
    res = cursor.fetchone()
    if not res:
        conn.close()
        raise HTTPException(status_code=404, detail="Reservation not found")

    if res["status"] == "CANCELLED":
        conn.close()
        raise HTTPException(status_code=400, detail="Reservation is already cancelled")

    flight_id = res["flight_id"]
    seat_number = res["seat_number"]

    # Mark reservation cancelled and release seat back to AVAILABLE
    cursor.execute("UPDATE reservations SET status = 'CANCELLED' WHERE pnr = ?", (pnr_clean,))
    cursor.execute("UPDATE seats SET status = 'AVAILABLE' WHERE flight_id = ? AND seat_number = ?", (flight_id, seat_number))
    cursor.execute("UPDATE flights SET available_seats = available_seats + 1 WHERE id = ?", (flight_id,))

    conn.commit()
    conn.close()

    # Update BST (Delete node or mark cancelled)
    bst_index.delete(pnr_clean)

    # Push to undo stack
    undo_stack.push({
        "action_type": "BOOKING_CANCEL",
        "pnr": pnr_clean,
        "flight_id": flight_id,
        "seat_number": seat_number,
        "passenger_name": res["passenger_name"],
        "description": f"Cancelled reservation {pnr_clean} and released seat {seat_number}"
    })

    # FIFO Waitlist Auto-Allocation check (CO1):
    waitlist_promoted = None
    if not waitlist_queue.is_empty():
        next_passenger = waitlist_queue.dequeue()
        waitlist_promoted = {
            "passenger": next_passenger,
            "allocated_seat": seat_number,
            "flight_id": flight_id,
            "message": f"Waitlisted passenger {next_passenger.get('passenger_name')} was automatically dequeued for released seat {seat_number}."
        }

    return {
        "pnr": pnr_clean,
        "status": "CANCELLED",
        "seat_released": seat_number,
        "waitlist_promoted": waitlist_promoted,
        "message": f"Reservation {pnr_clean} successfully cancelled. Seat {seat_number} has been released."
    }


# ==========================================
# UNDO STACK ENDPOINTS (CO1)
# ==========================================

@app.post("/api/undo")
def undo_last_operation():
    """
    Pops the most recent action from UndoStack and safely reverts the database & BST state.
    """
    if undo_stack.is_empty():
        raise HTTPException(status_code=400, detail="Undo stack is empty. No operations to revert.")

    last_action = undo_stack.pop()
    action_type = last_action.get("action_type")
    conn = get_db_connection()
    cursor = conn.cursor()

    if action_type == "BOOKING_CREATE":
        pnr = last_action["pnr"]
        flight_id = last_action["flight_id"]
        seat_number = last_action["seat_number"]

        # Rollback: mark cancelled and release seat
        cursor.execute("UPDATE reservations SET status = 'CANCELLED' WHERE pnr = ?", (pnr,))
        cursor.execute("UPDATE seats SET status = 'AVAILABLE' WHERE flight_id = ? AND seat_number = ?", (flight_id, seat_number))
        cursor.execute("UPDATE flights SET available_seats = available_seats + 1 WHERE id = ?", (flight_id,))
        conn.commit()

        # Revert BST
        bst_index.delete(pnr)
        conn.close()

        return {
            "undone_action": last_action,
            "message": f"Successfully rolled back creation of booking {pnr}. Seat {seat_number} is now Available.",
            "current_stack_size": undo_stack.size()
        }

    elif action_type == "BOOKING_CANCEL":
        pnr = last_action["pnr"]
        flight_id = last_action["flight_id"]
        seat_number = last_action["seat_number"]

        # Check if seat is still available to be re-reserved
        cursor.execute("SELECT status FROM seats WHERE flight_id = ? AND seat_number = ?", (flight_id, seat_number))
        seat_row = cursor.fetchone()
        if not seat_row or seat_row["status"] != "AVAILABLE":
            conn.close()
            # Push back to stack to prevent state corruption
            undo_stack.push(last_action)
            raise HTTPException(status_code=409, detail=f"Cannot undo cancellation: Seat {seat_number} has been re-booked.")

        cursor.execute("UPDATE reservations SET status = 'CONFIRMED' WHERE pnr = ?", (pnr,))
        cursor.execute("UPDATE seats SET status = 'RESERVED' WHERE flight_id = ? AND seat_number = ?", (flight_id, seat_number))
        cursor.execute("UPDATE flights SET available_seats = available_seats - 1 WHERE id = ?", (flight_id,))
        conn.commit()

        # Re-insert into BST
        cursor.execute("""
            SELECT r.*, f.flight_number, f.origin, f.destination, s.cabin_class
            FROM reservations r
            JOIN flights f ON r.flight_id = f.id
            JOIN seats s ON r.flight_id = s.flight_id AND r.seat_number = s.seat_number
            WHERE r.pnr = ?
        """, (pnr,))
        re_row = cursor.fetchone()
        conn.close()

        if re_row:
            bst_index.insert(pnr, dict(re_row))

        return {
            "undone_action": last_action,
            "message": f"Successfully reversed cancellation of booking {pnr}. Seat {seat_number} is restored to Reserved.",
            "current_stack_size": undo_stack.size()
        }

    conn.close()
    return {"message": "Action not recognized for rollback", "action": last_action}


@app.get("/api/undo/history")
def get_undo_history():
    return {
        "current_size": undo_stack.size(),
        "max_capacity": undo_stack.max_capacity,
        "stack_contents": undo_stack.to_list(),
        "recent_logs": undo_stack.operation_history[-20:]
    }


# ==========================================
# WAITLIST FIFO QUEUE ENDPOINTS (CO1)
# ==========================================

@app.post("/api/waitlist/enqueue")
def enqueue_waitlist(req: WaitlistRequest):
    item = {
        "flight_id": req.flight_id,
        "passenger_name": req.passenger_name,
        "passenger_email": req.passenger_email,
        "preferred_category": req.preferred_category,
        "enqueued_at": time.time()
    }
    success = waitlist_queue.enqueue(item)
    if not success:
        raise HTTPException(status_code=400, detail="Waitlist queue is at maximum capacity.")

    return {
        "success": True,
        "position": waitlist_queue.size(),
        "item": item,
        "message": f"{req.passenger_name} added to waitlist queue at position {waitlist_queue.size()}."
    }


@app.post("/api/waitlist/dequeue")
def dequeue_waitlist():
    if waitlist_queue.is_empty():
        raise HTTPException(status_code=400, detail="Waitlist queue is empty.")

    passenger = waitlist_queue.dequeue()
    return {
        "success": True,
        "passenger": passenger,
        "remaining_size": waitlist_queue.size(),
        "message": f"{passenger.get('passenger_name')} removed from front of waitlist."
    }


@app.get("/api/waitlist")
def get_waitlist():
    return {
        "current_size": waitlist_queue.size(),
        "max_capacity": waitlist_queue.max_capacity,
        "queue": waitlist_queue.to_list(),
        "operation_history": waitlist_queue.operation_history[-20:]
    }


# ==========================================
# BST PNR INDEX ENDPOINTS (CO4)
# ==========================================

@app.get("/api/dsa/bst")
def get_bst_summary():
    return {
        "size": bst_index.size(),
        "height": bst_index.height(),
        "inorder_traversal": bst_index.inorder_traversal(),
        "preorder_traversal": bst_index.preorder_traversal(),
        "postorder_traversal": bst_index.postorder_traversal(),
        "tree_hierarchy": bst_index.to_tree_dict()
    }


@app.post("/api/dsa/bst/operate")
def operate_bst(req: BSTActionRequest):
    pnr = req.pnr.strip().upper()
    action = req.action.upper()

    if action == "SEARCH":
        res, path = bst_index.search_with_path(pnr)
        return {
            "action": "SEARCH",
            "pnr": pnr,
            "found": res is not None,
            "result": res,
            "comparison_path": path,
            "comparisons_count": len(path)
        }
    elif action == "INSERT":
        val = {
            "pnr": pnr,
            "passenger_name": req.passenger_name or "Test Passenger",
            "seat_number": req.seat_number or "12A",
            "flight_id": req.flight_id or "FL-201",
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        success = bst_index.insert(pnr, val)
        return {
            "action": "INSERT",
            "pnr": pnr,
            "inserted": success,
            "new_size": bst_index.size(),
            "message": f"PNR {pnr} inserted into BST" if success else f"PNR {pnr} already exists"
        }
    elif action == "DELETE":
        deleted = bst_index.delete(pnr)
        return {
            "action": "DELETE",
            "pnr": pnr,
            "deleted": deleted,
            "new_size": bst_index.size(),
            "message": f"PNR {pnr} deleted from BST" if deleted else f"PNR {pnr} not found in BST"
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid BST action. Must be SEARCH, INSERT, or DELETE.")


# ==========================================
# AIRPORT GRAPH & BFS ENDPOINTS (CO5)
# ==========================================

@app.get("/api/dsa/graph")
def get_graph_network():
    return airport_graph.get_network_representation()


@app.post("/api/dsa/graph/bfs")
def run_bfs(req: Dict[str, str]):
    start = req.get("origin", "DXB")
    return airport_graph.bfs_traversal(start)


@app.post("/api/dsa/graph/route")
def calculate_graph_route(req: GraphRouteRequest):
    return airport_graph.find_fewest_segments_route(req.origin, req.destination)


# ==========================================
# BENCHMARK RUNNER & ALGORITHM ARENA (CO2/CO3)
# ==========================================

@app.post("/api/dsa/benchmarks/arena")
def run_algorithm_arena():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM seats WHERE flight_id = 'FL-201'")
    seats = [dict(row) for row in cursor.fetchall()]
    conn.close()

    # Generate 30 synthetic passenger requests with varied preferences
    passengers = []
    names = ["Alex", "Sophia", "David", "Zara", "Liam", "Emma", "Noah", "Olivia", "Ethan", "Ava", "Lucas", "Mia"]
    for i in range(30):
        passengers.append({
            "name": f"{random.choice(names)}_{i+1}",
            "age": random.randint(18, 65),
            "traveling_with_infant": (i % 8 == 0),
            "requires_wheelchair": (i % 12 == 0),
            "preferences": {
                "window": (i % 3 == 0),
                "aisle": (i % 4 == 0),
                "avoid_middle": (i % 2 == 0),
                "extra_legroom": (i % 5 == 0),
                "prefer_front": (i % 3 == 1)
            }
        })

    return benchmark_runner.compare_allocation_strategies(seats, passengers)


@app.post("/api/dsa/benchmarks/sorting")
def benchmark_sorting(req: BenchmarkRequest):
    return benchmark_runner.benchmark_sorting(req.dataset_size)


@app.post("/api/dsa/benchmarks/searching")
def benchmark_searching(req: BenchmarkRequest):
    return benchmark_runner.benchmark_searching(req.dataset_size)


@app.post("/api/dsa/benchmarks/data-structures")
def benchmark_data_structures(req: BenchmarkRequest):
    return benchmark_runner.benchmark_data_structures(req.dataset_size)

# Mount frontend production build if available
frontend_dist_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../frontend/dist")
)
if os.path.exists(frontend_dist_path):
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="frontend")

