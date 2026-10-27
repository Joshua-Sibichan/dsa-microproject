"""
SQLite Persistence Layer & Aircraft Cabin Seed Data (Milestone 2)
Provides transactional ACID database operations, foreign keys, and unique constraints.
"""
import sqlite3
import os
import json
from typing import Any, Dict, List, Optional, Tuple

DB_PATH = os.environ.get("AEROSEAT_DB_PATH", "/tmp/aeroseat.db")

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

def init_db() -> None:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS flights (
        id TEXT PRIMARY KEY,
        flight_number TEXT NOT NULL,
        origin TEXT NOT NULL,
        origin_city TEXT NOT NULL,
        destination TEXT NOT NULL,
        destination_city TEXT NOT NULL,
        departure_time TEXT NOT NULL,
        arrival_time TEXT NOT NULL,
        duration TEXT NOT NULL DEFAULT '7h 15m',
        aircraft_type TEXT NOT NULL,
        base_fare REAL NOT NULL DEFAULT 450.0,
        departure_date TEXT NOT NULL DEFAULT '2026-11-15',
        total_seats INTEGER NOT NULL,
        available_seats INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'ON_TIME'
    );

    CREATE TABLE IF NOT EXISTS seats (
        id TEXT PRIMARY KEY,
        flight_id TEXT NOT NULL,
        seat_number TEXT NOT NULL,
        cabin_class TEXT NOT NULL,
        category TEXT NOT NULL,
        row_number INTEGER NOT NULL,
        column_letter TEXT NOT NULL,
        is_window BOOLEAN NOT NULL DEFAULT 0,
        is_aisle BOOLEAN NOT NULL DEFAULT 0,
        is_exit_row BOOLEAN NOT NULL DEFAULT 0,
        has_bassinet BOOLEAN NOT NULL DEFAULT 0,
        pitch_inches INTEGER NOT NULL DEFAULT 32,
        price REAL NOT NULL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        FOREIGN KEY(flight_id) REFERENCES flights(id) ON DELETE CASCADE,
        UNIQUE(flight_id, seat_number)
    );

    CREATE TABLE IF NOT EXISTS reservations (
        pnr TEXT PRIMARY KEY,
        flight_id TEXT NOT NULL,
        seat_number TEXT NOT NULL,
        passenger_name TEXT NOT NULL,
        passenger_email TEXT NOT NULL,
        preferences_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'CONFIRMED',
        FOREIGN KEY(flight_id) REFERENCES flights(id) ON DELETE CASCADE,
        FOREIGN KEY(flight_id, seat_number) REFERENCES seats(flight_id, seat_number)
    );

    CREATE TABLE IF NOT EXISTS waitlist_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flight_id TEXT NOT NULL,
        passenger_name TEXT NOT NULL,
        passenger_email TEXT NOT NULL,
        preferred_category TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'WAITING',
        FOREIGN KEY(flight_id) REFERENCES flights(id) ON DELETE CASCADE
    );
    """)

    # Check and perform migrations for existing SQLite databases
    cursor.execute("PRAGMA table_info(flights)")
    columns = [col["name"] for col in cursor.fetchall()]
    if "duration" not in columns:
        cursor.execute("ALTER TABLE flights ADD COLUMN duration TEXT NOT NULL DEFAULT '7h 15m'")
    if "base_fare" not in columns:
        cursor.execute("ALTER TABLE flights ADD COLUMN base_fare REAL NOT NULL DEFAULT 450.0")
    if "departure_date" not in columns:
        cursor.execute("ALTER TABLE flights ADD COLUMN departure_date TEXT NOT NULL DEFAULT '2026-11-15'")

    conn.commit()
    seed_demo_data(conn)
    conn.close()


def seed_demo_data(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()

    flights = [
        ("FL-201", "EK-201", "DXB", "Dubai", "JFK", "New York", "08:30", "14:25", "14h 25m", "Boeing 777-300ER", 920.0, "2026-11-15", 120, 110, "ON_TIME"),
        ("FL-001", "EK-001", "DXB", "Dubai", "LHR", "London Heathrow", "14:15", "18:40", "7h 25m", "Airbus A380-800", 680.0, "2026-11-15", 120, 108, "ON_TIME"),
        ("FL-384", "EK-384", "DXB", "Dubai", "BKK", "Bangkok", "22:30", "07:50", "6h 20m", "Boeing 777-300ER", 540.0, "2026-11-16", 120, 115, "ON_TIME"),
        ("FL-500", "EK-500", "DXB", "Dubai", "BOM", "Mumbai", "10:00", "14:45", "3h 15m", "Boeing 777-300ER", 310.0, "2026-11-15", 120, 112, "ON_TIME"),
        ("FL-318", "EK-318", "DXB", "Dubai", "HND", "Tokyo Haneda", "02:50", "17:35", "9h 45m", "Boeing 777-300ER", 830.0, "2026-11-16", 120, 116, "ON_TIME"),
        ("FL-073", "EK-073", "DXB", "Dubai", "CDG", "Paris Charles de Gaulle", "08:20", "13:30", "7h 10m", "Airbus A380-800", 710.0, "2026-11-16", 120, 114, "ON_TIME"),
        ("FL-414", "EK-414", "DXB", "Dubai", "SYD", "Sydney", "02:15", "22:05", "13h 50m", "Airbus A380-800", 1150.0, "2026-11-17", 120, 118, "ON_TIME"),
        ("FL-354", "EK-354", "DXB", "Dubai", "SIN", "Singapore", "03:15", "14:40", "7h 25m", "Boeing 777-300ER", 490.0, "2026-11-15", 120, 113, "ON_TIME"),
        ("FL-002", "XA-002", "LHR", "London Heathrow", "DXB", "Dubai", "20:45", "06:30", "6h 45m", "Airbus A380-800", 680.0, "2026-11-15", 120, 112, "ON_TIME"),
        ("FL-202", "XA-202", "JFK", "New York", "DXB", "Dubai", "16:30", "11:45", "12h 15m", "Boeing 777-300ER", 920.0, "2026-11-15", 120, 110, "ON_TIME"),
        ("FL-385", "XA-385", "BKK", "Bangkok", "DXB", "Dubai", "09:30", "13:15", "6h 45m", "Boeing 777-300ER", 540.0, "2026-11-15", 120, 114, "ON_TIME"),
        ("FL-501", "XA-501", "BOM", "Mumbai", "DXB", "Dubai", "16:15", "18:30", "3h 15m", "Boeing 777-300ER", 310.0, "2026-11-15", 120, 115, "ON_TIME"),
        ("FL-319", "XA-319", "HND", "Tokyo Haneda", "DXB", "Dubai", "19:20", "02:00", "9h 40m", "Boeing 777-300ER", 830.0, "2026-11-15", 120, 118, "ON_TIME"),
        ("FL-074", "XA-074", "CDG", "Paris Charles de Gaulle", "DXB", "Dubai", "15:35", "00:20", "6h 45m", "Airbus A380-800", 710.0, "2026-11-15", 120, 116, "ON_TIME"),
        ("FL-415", "XA-415", "SYD", "Sydney", "DXB", "Dubai", "06:00", "13:20", "14h 20m", "Airbus A380-800", 1150.0, "2026-11-15", 120, 117, "ON_TIME"),
        ("FL-355", "XA-355", "SIN", "Singapore", "DXB", "Dubai", "09:15", "12:40", "7h 25m", "Boeing 777-300ER", 490.0, "2026-11-15", 120, 114, "ON_TIME"),
        ("FL-801", "XA-801", "DXB", "Dubai", "SFO", "San Francisco", "08:45", "13:00", "15h 15m", "Boeing 777-300ER", 980.0, "2026-11-15", 120, 111, "ON_TIME"),
        ("FL-802", "XA-802", "SFO", "San Francisco", "DXB", "Dubai", "15:45", "19:25", "14h 40m", "Boeing 777-300ER", 980.0, "2026-11-15", 120, 113, "ON_TIME")
    ]

    for fl in flights:
        cursor.execute("SELECT COUNT(*) as count FROM flights WHERE id = ?", (fl[0],))
        if cursor.fetchone()["count"] == 0:
            cursor.execute("""
                INSERT INTO flights (id, flight_number, origin, origin_city, destination, destination_city, departure_time, arrival_time, duration, aircraft_type, base_fare, departure_date, total_seats, available_seats, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, fl)
            generate_cabin_seats(cursor, fl[0])
        else:
            # Update duration, base_fare, departure_date if missing
            cursor.execute("""
                UPDATE flights
                SET duration = ?, base_fare = ?, departure_date = ?
                WHERE id = ?
            """, (fl[8], fl[10], fl[11], fl[0]))

    # Pre-seed sample reservations to populate the cabin map and BST
    sample_reservations = [
        ("EK9X2B", "FL-201", "1A", "Lord Arthur Sterling", "sterling@aero.org", json.dumps({"window": True})),
        ("EK4M7K", "FL-201", "6E", "Elena Rostova", "elena@voyager.com", json.dumps({"aisle": True})),
        ("EK2A9F", "FL-201", "15B", "Carlos Mendez", "carlos@tech.io", json.dumps({"avoid_middle": False})),
        ("EK8R3T", "FL-201", "26A", "Sarah Jenkins", "sarah@travels.com", json.dumps({"extra_legroom": True, "window": True})),
        ("EK5P1Q", "FL-201", "18F", "Hiroshi Tanaka", "hiroshi@kyoto.jp", json.dumps({"prefer_front": True}))
    ]

    for pnr, fl_id, s_num, name, email, prefs in sample_reservations:
        cursor.execute("SELECT COUNT(*) as count FROM reservations WHERE pnr = ?", (pnr,))
        if cursor.fetchone()["count"] == 0:
            cursor.execute("UPDATE seats SET status = 'RESERVED' WHERE flight_id = ? AND seat_number = ?", (fl_id, s_num))
            cursor.execute("""
                INSERT INTO reservations (pnr, flight_id, seat_number, passenger_name, passenger_email, preferences_json, status)
                VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
            """, (pnr, fl_id, s_num, name, email, prefs))

    # Update available counts
    cursor.execute("""
        UPDATE flights SET available_seats = (
            SELECT COUNT(*) FROM seats WHERE seats.flight_id = flights.id AND status = 'AVAILABLE'
        )
    """)

    conn.commit()


def generate_cabin_seats(cursor: sqlite3.Cursor, flight_id: str) -> None:
    """
    Constructs an aviation-accurate Boeing 777 / A380 cabin layout:
    - First Class: Rows 1-2 (1-2-1 layout: A, E, F, K)
    - Business Class: Rows 6-8 (1-2-1 layout: A, E, F, K)
    - Premium Economy: Rows 12-14 (2-4-2 layout: A, B, D, E, F, G, J, K)
    - Economy Class: Rows 15-26 (3-4-3 layout: A, B, C, D, E, F, G, H, J, K)
      - Row 15: Preferred Bassinet seats
      - Rows 16-18: Preferred Front Cabin seats
      - Rows 19-25: Regular Economy seats
      - Row 26: Extra Legroom Exit Row seats
    """
    # 1. First Class (Rows 1-2)
    for r in [1, 2]:
        for col in ["A", "E", "F", "K"]:
            seat_num = f"{r}{col}"
            is_win = col in ["A", "K"]
            is_ais = True
            cursor.execute("""
                INSERT OR IGNORE INTO seats (id, flight_id, seat_number, cabin_class, category, row_number, column_letter, is_window, is_aisle, is_exit_row, has_bassinet, pitch_inches, price, status)
                VALUES (?, ?, ?, 'FIRST', 'REGULAR', ?, ?, ?, ?, 0, ?, 78, 2500.0, 'AVAILABLE')
            """, (f"{flight_id}_{seat_num}", flight_id, seat_num, r, col, is_win, is_ais, 1 if (r == 1 and col in ["E", "F"]) else 0))

    # 2. Business Class (Rows 6-8)
    for r in [6, 7, 8]:
        for col in ["A", "E", "F", "K"]:
            seat_num = f"{r}{col}"
            is_win = col in ["A", "K"]
            is_ais = True
            cursor.execute("""
                INSERT OR IGNORE INTO seats (id, flight_id, seat_number, cabin_class, category, row_number, column_letter, is_window, is_aisle, is_exit_row, has_bassinet, pitch_inches, price, status)
                VALUES (?, ?, ?, 'BUSINESS', 'REGULAR', ?, ?, ?, ?, 0, ?, 60, 1200.0, 'AVAILABLE')
            """, (f"{flight_id}_{seat_num}", flight_id, seat_num, r, col, is_win, is_ais, 1 if (r == 6 and col in ["E", "F"]) else 0))

    # 3. Premium Economy (Rows 12-14) (2-4-2)
    for r in [12, 13, 14]:
        for col in ["A", "B", "D", "E", "F", "G", "J", "K"]:
            seat_num = f"{r}{col}"
            is_win = col in ["A", "K"]
            is_ais = col in ["B", "D", "G", "J"]
            cat = "PREFERRED" if r == 12 else "REGULAR"
            cursor.execute("""
                INSERT OR IGNORE INTO seats (id, flight_id, seat_number, cabin_class, category, row_number, column_letter, is_window, is_aisle, is_exit_row, has_bassinet, pitch_inches, price, status)
                VALUES (?, ?, ?, 'PREMIUM_ECONOMY', ?, ?, ?, ?, ?, 0, ?, 38, 450.0, 'AVAILABLE')
            """, (f"{flight_id}_{seat_num}", flight_id, seat_num, cat, r, col, is_win, is_ais, 1 if r == 12 and col in ["D", "G"] else 0))

    # 4. Economy Class (Rows 15-26) (3-4-3)
    for r in range(15, 27):
        for col in ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"]:
            seat_num = f"{r}{col}"
            is_win = col in ["A", "K"]
            is_ais = col in ["C", "D", "G", "H"]
            is_exit = (r == 26)
            has_bas = (r == 15 and col in ["E", "F"])

            if is_exit:
                category = "EXTRA_LEGROOM"
                pitch = 38
                price = 180.0
            elif r <= 18:
                category = "PREFERRED"
                pitch = 33
                price = 140.0
            else:
                category = "REGULAR"
                pitch = 32
                price = 95.0

            cursor.execute("""
                INSERT OR IGNORE INTO seats (id, flight_id, seat_number, cabin_class, category, row_number, column_letter, is_window, is_aisle, is_exit_row, has_bassinet, pitch_inches, price, status)
                VALUES (?, ?, ?, 'ECONOMY', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
            """, (f"{flight_id}_{seat_num}", flight_id, seat_num, category, r, col, is_win, is_ais, is_exit, has_bas, pitch, price))
