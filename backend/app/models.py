"""
Pydantic v2 Models & API Request/Response Schemas
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class FlightModel(BaseModel):
    id: str
    flight_number: str
    origin: str
    origin_city: str
    destination: str
    destination_city: str
    departure_time: str
    arrival_time: str
    duration: str = "7h 15m"
    aircraft_type: str
    base_fare: float = 450.0
    departure_date: str = "2026-11-15"
    total_seats: int
    available_seats: int
    status: str

class SeatModel(BaseModel):
    id: str
    flight_id: str
    seat_number: str
    cabin_class: str
    category: str
    row_number: int
    column_letter: str
    is_window: bool
    is_aisle: bool
    is_exit_row: bool
    has_bassinet: bool
    pitch_inches: int
    price: float
    status: str

class PassengerPreferences(BaseModel):
    window: bool = False
    aisle: bool = False
    avoid_middle: bool = True
    extra_legroom: bool = False
    prefer_front: bool = False

class PassengerProfile(BaseModel):
    name: str = "Passenger"
    email: str = "passenger@airline.aero"
    age: int = 28
    traveling_with_infant: bool = False
    requires_wheelchair: bool = False
    preferences: PassengerPreferences = Field(default_factory=PassengerPreferences)

class ReservationCreateRequest(BaseModel):
    flight_id: str
    seat_number: str
    passenger_name: str
    passenger_email: str
    preferences: Optional[PassengerPreferences] = None

class MultiPassengerReservationRequest(BaseModel):
    flight_id: str
    items: List[ReservationCreateRequest]

class ModifySeatRequest(BaseModel):
    new_seat_number: str

class ReservationResponse(BaseModel):
    pnr: str
    flight_id: str
    flight_number: Optional[str] = None
    origin: Optional[str] = None
    origin_city: Optional[str] = None
    destination: Optional[str] = None
    destination_city: Optional[str] = None
    departure_time: Optional[str] = None
    arrival_time: Optional[str] = None
    duration: Optional[str] = None
    aircraft_type: Optional[str] = None
    seat_number: str
    cabin_class: Optional[str] = None
    passenger_name: str
    passenger_email: str
    created_at: str
    status: str

class RecommendationRequest(BaseModel):
    flight_id: str
    cabin_class: Optional[str] = "ECONOMY"
    passenger: PassengerProfile

class GroupSeatingRequest(BaseModel):
    flight_id: str
    group_size: int = 2
    cabin_class: str = "ECONOMY"

class WaitlistRequest(BaseModel):
    flight_id: str
    passenger_name: str
    passenger_email: str
    preferred_category: str = "REGULAR"

class BSTActionRequest(BaseModel):
    action: str  # "INSERT" | "SEARCH" | "DELETE"
    pnr: str
    passenger_name: Optional[str] = None
    seat_number: Optional[str] = None
    flight_id: Optional[str] = None

class GraphRouteRequest(BaseModel):
    origin: str
    destination: str

class BenchmarkRequest(BaseModel):
    dataset_size: int = 100
