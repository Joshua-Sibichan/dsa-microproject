# AeroSeat Intelligence — Course Outcome (CO) Mapping

## Comprehensive Alignment Matrix

This document establishes the precise academic mapping between standard College Data Structures & Algorithms Course Outcomes (CO1 through CO5) and the concrete implementations within **AeroSeat Intelligence**.

---

### Course Outcome 1 (CO1): Stacks and Queues
*“Understand, implement, and analyze linear data structures (Stacks and Queues) for real-world scheduling, buffering, and backtracking systems.”*

| Real-World Feature | Underlying DSA Implementation | Technical Details & Invariants | Demonstration Interface |
| :--- | :--- | :--- | :--- |
| **Waitlist Processing** | **FIFO Queue** (`WaitlistQueue`) | • Strict First-In First-Out order.<br>• Operations: `enqueue(passenger)`, `dequeue()`, `peek()`, `size()`, `is_empty()`.<br>• Enqueues unfulfilled seat requests; upon cancellation/seat release, automatically dequeues next eligible passenger in O(1) time. | **DSA Hub — Module 1**: Interactive queue pipeline showing passengers queued, head/tail pointers, and real-time dequeue upon flight seat release. |
| **Reservation Undo & Backtracking** | **LIFO Stack** (`UndoStack`) | • Strict Last-In First-Out order.<br>• Operations: `push(state_delta)`, `pop()`, `peek()`, `clear()`.<br>• Pushes reversible actions (Seat Select, Seat Swap, Passenger Update).<br>• Invariant: Rollback must not corrupt current active bookings or violate seat uniqueness constraints. | **DSA Hub — Module 2**: Visual undo stack tray displaying operations stacked upwards, with live rollback triggering visual updates on the cabin map. |

---

### Course Outcome 2 (CO2): Data Structure Selection & Trade-offs
*“Evaluate and select appropriate data structures based on time/space complexity, access patterns, and hardware memory hierarchies.”*

| Domain Scenario | Data Structure Candidates | Complexity Trade-off Comparison | Concrete Application |
| :--- | :--- | :--- | :--- |
| **Seat Inventory Storage vs. Lookup** | **Contiguous Array / List** vs. **Hash Table** | • **Array**: O(1) index access by row/column, cache-friendly contiguous memory, trivial 2D spatial iteration for adjacent group seating, but O(N) lookup by random seat code or passenger name.<br>• **Hash Map**: O(1) average lookup by PNR or seat ID, but higher memory overhead, lack of spatial locality, and undefined ordering. | **DSA Hub — Module 6**: Interactive comparison workbench measuring execution time and memory footprint of array iterations vs hash lookups over thousands of seat queries. |

---

### Course Outcome 3 (CO3): Searching and Sorting
*“Implement, analyze, and compare fundamental searching and sorting algorithms, profiling their asymptotic complexity against empirical execution.”*

| Feature | Implemented Algorithms | Analysis & Profiling Metrics | Demonstration Interface |
| :--- | :--- | :--- | :--- |
| **Seat Preference Ranking** | **Merge Sort** (O(N log N) stable) vs. **Insertion Sort** (O(N²) adaptive) | • Stable sorting preserves original cabin row order for ties.<br>• In-flight ranking of seats by multi-criteria score (window, legroom, front row proximity).<br>• Benchmarks measure actual comparisons, swaps, and execution time (microseconds). | **DSA Hub — Module 5 & Algorithm Arena**: Live slider to adjust seat count (10 to 500) and compare sorting passes, memory allocations, and stability in real time. |
| **Inventory Search** | **Linear Search** (O(N)) vs. **Binary Search** (O(log N)) | • Linear search inspects unsorted manifest.<br>• Binary search operates on pre-sorted seat coordinates or passenger PNR index.<br>• Comparison counter tracks iterations for found vs. not-found scenarios. | Real-time performance chart graphing search step counts as dataset scale expands. |

---

### Course Outcome 4 (CO4): Trees and Hierarchical Structures
*“Apply non-linear hierarchical data structures (Binary Search Trees) for ordered storage, rapid retrieval, and recursive traversals.”*

| Feature | Implemented Tree Structure | Algorithmic Operations | Demonstration Interface |
| :--- | :--- | :--- | :--- |
| **Booking Reference (PNR) Directory** | **Binary Search Tree (BST)** (`BookingBST`) | • **Insertion**: `insert(pnr, reservation_data)` in O(log N) average, O(N) worst-case.<br>• **Search**: `search(pnr)` returning full reservation or null.<br>• **Deletion**: `delete(pnr)` handling 0, 1, and 2 children (finding inorder successor).<br>• **Traversals**: Recursive & iterative Inorder (alphabetical PNR list), Preorder (serialization), and Postorder (deletion tree cleanup). | **DSA Hub — Module 3**: Canvas-rendered interactive binary tree with node insertion, deletion, and animated traversal step-by-step playback with colorized visitor cues. |

---

### Course Outcome 5 (CO5): Graphs and Shortest Path / Network Analysis
*“Model interconnected relational systems using Graphs and apply traversal techniques (BFS, DFS) to find reachability and minimal path segments.”*

| Feature | Graph Representation | Algorithms & Invariants | Demonstration Interface |
| :--- | :--- | :--- | :--- |
| **Global Airport Flight Route Network** | **Adjacency List Graph** (`AirportGraph`) | • Vertices: Airports (DXB, LHR, JFK, SIN, SYD, HND, CDG, FRA, BOM, etc.).<br>• Edges: Scheduled non-stop flight corridors.<br>• **Breadth-First Search (BFS)**: Explores connectivity layer-by-layer using an internal queue.<br>• Computes the **fewest-flight-segment route** between any two hubs.<br>• Clearly demonstrates why BFS on an unweighted graph guarantees minimum edge count (fewest layovers), contrasting with weighted Dijkstra for flight duration or ticket price. | **DSA Hub — Module 4**: Interactive airport network map with clickable nodes, visual frontier wave expansion during BFS, and highlighted shortest segment connection path. |
