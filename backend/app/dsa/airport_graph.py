"""
Airport Network Graph & Breadth-First Search (BFS) Implementation (CO5)
Models airports as vertices and direct flight routes as edges in an Adjacency List.
Demonstrates:
  1. BFS Traversal order from any origin node.
  2. Fewest-flight-segment route (unweighted shortest path) via BFS queue and parent tracking.
  3. Clear differentiation between fewest segments vs minimum-cost/time routes.
"""
from typing import Any, Dict, List, Optional, Set, Tuple
from collections import deque

class AirportGraph:
    def __init__(self):
        # Adjacency list: airport_code -> list of neighbor airport codes
        self.adj_list: Dict[str, List[str]] = {}
        # Node metadata: airport_code -> { "name": str, "city": str, "country": str, "coordinates": (lat, lng) }
        self.nodes: Dict[str, Dict[str, Any]] = {}
        # Edge metadata: (u, v) -> { "flight_number": str, "flight_duration_hrs": float, "base_price": float }
        self.edges: Dict[Tuple[str, str], Dict[str, Any]] = {}

    def add_airport(self, code: str, name: str, city: str, country: str, lat: float, lng: float) -> None:
        code = code.upper().strip()
        if code not in self.adj_list:
            self.adj_list[code] = []
            self.nodes[code] = {
                "code": code,
                "name": name,
                "city": city,
                "country": country,
                "lat": lat,
                "lng": lng
            }

    def add_route(self, origin: str, destination: str, flight_number: str = "", duration_hrs: float = 0.0, price: float = 0.0, bidirectional: bool = True) -> None:
        u = origin.upper().strip()
        v = destination.upper().strip()
        if u in self.adj_list and v in self.adj_list:
            if v not in self.adj_list[u]:
                self.adj_list[u].append(v)
            self.edges[(u, v)] = {
                "flight_number": flight_number,
                "duration_hrs": duration_hrs,
                "price": price
            }

            if bidirectional:
                if u not in self.adj_list[v]:
                    self.adj_list[v].append(u)
                self.edges[(v, u)] = {
                    "flight_number": flight_number,
                    "duration_hrs": duration_hrs,
                    "price": price
                }

    def bfs_traversal(self, start_node: str) -> Dict[str, Any]:
        """
        Execute Breadth-First Search (BFS) from start_node.
        Returns:
          - traversal_order: List of visited node codes in BFS sequence
          - levels: Dict mapping level (hop count) -> list of nodes discovered
          - exploration_steps: Step-by-step history of queue state and visited set for animation
        Time Complexity: O(V + E)
        Space Complexity: O(V)
        """
        start = start_node.upper().strip()
        if start not in self.adj_list:
            return {"error": f"Airport {start} not found in network"}

        visited: Set[str] = set([start])
        queue: deque = deque([(start, 0)]) # (node, level)
        traversal_order: List[str] = []
        levels: Dict[int, List[str]] = {}
        exploration_steps: List[Dict[str, Any]] = []

        step_counter = 1
        while queue:
            # Snapshot of queue before popping
            current_queue_snapshot = [node for node, lvl in queue]
            curr, level = queue.popleft()
            traversal_order.append(curr)

            if level not in levels:
                levels[level] = []
            levels[level].append(curr)

            neighbors_to_visit = []
            for neighbor in sorted(self.adj_list.get(curr, [])):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, level + 1))
                    neighbors_to_visit.append(neighbor)

            exploration_steps.append({
                "step": step_counter,
                "current_node": curr,
                "current_level": level,
                "queue_before_pop": current_queue_snapshot,
                "visited_so_far": list(traversal_order),
                "neighbors_enqueued": neighbors_to_visit
            })
            step_counter += 1

        return {
            "start_node": start,
            "traversal_order": traversal_order,
            "levels": levels,
            "total_visited": len(traversal_order),
            "steps": exploration_steps
        }

    def find_fewest_segments_route(self, origin: str, destination: str) -> Dict[str, Any]:
        """
        Find route with minimum flight segments (stops) using unweighted BFS.
        Guarantees optimal fewest hops because BFS explores all distance k nodes
        before distance k+1.
        Contrast note: Fewest segments != shortest flight time or cheapest price.
        """
        start = origin.upper().strip()
        target = destination.upper().strip()

        if start not in self.adj_list:
            return {"error": f"Origin airport {start} not found"}
        if target not in self.adj_list:
            return {"error": f"Destination airport {target} not found"}

        if start == target:
            return {
                "origin": start,
                "destination": target,
                "path": [start],
                "segments_count": 0,
                "stops": 0,
                "route_details": []
            }

        queue: deque = deque([start])
        visited: Set[str] = set([start])
        parent: Dict[str, Optional[str]] = {start: None}

        found = False
        while queue:
            curr = queue.popleft()
            if curr == target:
                found = True
                break

            for neighbor in self.adj_list.get(curr, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent[neighbor] = curr
                    queue.append(neighbor)

        if not found:
            return {
                "origin": start,
                "destination": target,
                "path": [],
                "segments_count": -1,
                "message": f"No flight connection found between {start} and {target}"
            }

        # Backtrack path from target to start
        path = []
        curr_back = target
        while curr_back is not None:
            path.append(curr_back)
            curr_back = parent[curr_back]
        path.reverse()

        # Build segment details
        route_details = []
        total_duration = 0.0
        total_price = 0.0

        for i in range(len(path) - 1):
            u_seg = path[i]
            v_seg = path[i+1]
            edge_meta = self.edges.get((u_seg, v_seg), {})
            dur = edge_meta.get("duration_hrs", 3.5)
            prc = edge_meta.get("price", 250.0)
            fl_num = edge_meta.get("flight_number", f"EK-{u_seg}{v_seg}")

            total_duration += dur
            total_price += prc
            route_details.append({
                "from": u_seg,
                "to": v_seg,
                "flight_number": fl_num,
                "duration_hrs": dur,
                "price": prc
            })

        return {
            "origin": start,
            "destination": target,
            "path": path,
            "segments_count": len(path) - 1,
            "stops": max(0, len(path) - 2),
            "total_estimated_duration_hrs": round(total_duration, 1),
            "total_estimated_price": round(total_price, 2),
            "route_details": route_details,
            "algorithm": "Breadth-First Search (BFS)",
            "optimality_guarantee": "Strictly minimal flight hops (segments) on unweighted graph"
        }

    def get_network_representation(self) -> Dict[str, Any]:
        """
        Return the full graph data structure for rendering in UI.
        """
        nodes_list = list(self.nodes.values())
        links_list = []
        seen_edges = set()

        for (u, v), meta in self.edges.items():
            edge_key = tuple(sorted([u, v]))
            if edge_key not in seen_edges:
                seen_edges.add(edge_key)
                links_list.append({
                    "source": u,
                    "target": v,
                    "flight_number": meta.get("flight_number", ""),
                    "duration_hrs": meta.get("duration_hrs", 0),
                    "price": meta.get("price", 0)
                })

        return {
            "nodes": nodes_list,
            "edges": links_list,
            "adjacency_list": self.adj_list
        }
