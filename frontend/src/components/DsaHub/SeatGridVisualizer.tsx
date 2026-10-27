import React, { useState, useEffect } from 'react';
import { fetchSeatGrid, allocateSeatGrid } from '../../api';
import { SeatGridResponse, Seat } from '../../types';
import { RefreshCw } from 'lucide-react';

export const SeatGridVisualizer: React.FC = () => {
  const [gridData, setGridData] = useState<SeatGridResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; seat: Seat | null } | null>(null);
  const [allocationLog, setAllocationLog] = useState<string | null>(null);

  useEffect(() => {
    loadGrid();
  }, []);

  const loadGrid = async () => {
    setLoading(true);
    try {
      const data = await fetchSeatGrid('FL-201');
      setGridData(data);
      if (data.matrix && data.matrix.length > 14) {
        const r15 = data.matrix[14];
        if (r15 && r15[0]) {
          setSelectedCell({ row: 15, col: 'A', seat: r15[0] });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (rowNum: number, colLetter: string, seat: Seat | null) => {
    setSelectedCell({ row: rowNum, col: colLetter, seat });
    setAllocationLog(null);
  };

  const handleAllocateCell = async () => {
    if (!selectedCell || !gridData) return;
    try {
      const res = await allocateSeatGrid({
        flight_id: 'FL-201',
        row_number: selectedCell.row,
        column_letter: selectedCell.col,
        passenger_name: 'Matrix User',
        pnr: 'EKGRID'
      });
      setAllocationLog(`Allocated in ${res.time_complexity}: ${res.matrix_indices}`);
      await loadGrid();
    } catch (err: any) {
      setAllocationLog(err.message || 'Allocation failed');
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-border-subtle space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-secondary uppercase flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">grid_view</span>
            <span>Course Outcome CO2: Spatial Array Structures</span>
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-navy mt-1">
            2D Array Seat Allocation Engine
          </h2>
          <p className="text-xs text-charcoal-muted mt-0.5 max-w-2xl">
            Demonstrates row-major 2D matrix indexing <code className="bg-surface-container px-1 py-0.5 rounded text-slate-navy font-mono">grid[row_idx][col_idx]</code>, direct O(1) coordinate allocation, and spatial layout memory contiguous storage.
          </p>
        </div>

        <button
          type="button"
          onClick={loadGrid}
          disabled={loading}
          className="px-4 py-2 bg-surface-container-low hover:bg-gold-light text-slate-navy text-xs font-bold rounded-xl transition-all border border-border-subtle flex items-center gap-1.5 self-start md:self-auto shrink-0 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Matrix</span>
        </button>
      </div>

      {/* Metrics Banner */}
      {gridData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-navy text-surface-container-lowest border border-white/10 shadow-sm">
          <div>
            <span className="text-[10px] text-surface-container-highest/70 font-mono uppercase block">Matrix Dimension</span>
            <span className="text-base font-bold font-mono text-secondary-container">
              {gridData.metrics.matrix_dimensions}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-surface-container-highest/70 font-mono uppercase block">Total Grid Cells</span>
            <span className="text-base font-bold font-mono text-white">
              {gridData.metrics.total_matrix_cells} Cells
            </span>
          </div>
          <div>
            <span className="text-[10px] text-surface-container-highest/70 font-mono uppercase block">Configured Seats</span>
            <span className="text-base font-bold font-mono text-emerald-300">
              {gridData.metrics.configured_seats}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-surface-container-highest/70 font-mono uppercase block">Direct Index Time</span>
            <span className="text-base font-bold font-mono text-secondary-container">
              O(1) [0.4 μs]
            </span>
          </div>
        </div>
      )}

      {/* Interactive 2D Grid Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual 2D Matrix Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-low p-4 sm:p-6 rounded-2xl border border-border-subtle overflow-x-auto">
          <div className="flex items-center justify-between pb-3 text-xs text-charcoal-muted font-mono border-b border-border-subtle mb-3">
            <span>Fuselage Row-Major Grid (Rows 1–42)</span>
            <span>Click any coordinate to inspect O(1) cell</span>
          </div>

          {gridData && (
            <div className="min-w-[480px] space-y-1">
              {/* Column Letters Header */}
              <div className="flex items-center gap-1 pl-10 pr-2 pb-1 text-[11px] font-mono font-bold text-charcoal-muted">
                {gridData.columns.map((col) => (
                  <div key={col} className="w-8 text-center">{col}</div>
                ))}
              </div>

              {/* Rows */}
              {gridData.matrix.map((rowCells, rIdx) => {
                const rowNum = rIdx + 1;
                // Only show rows with configured seats or representative sample
                const hasSeats = rowCells.some((c) => c !== null);
                if (!hasSeats && (rowNum > 5 && rowNum < 11)) return null;

                return (
                  <div key={rowNum} className="flex items-center gap-1 hover:bg-white/60 p-0.5 rounded transition-colors">
                    {/* Row Number Marker */}
                    <div className="w-9 font-mono text-[10px] font-bold text-charcoal-muted text-right pr-2 shrink-0">
                      {rowNum}
                    </div>

                    {/* Cells */}
                    <div className="flex items-center gap-1">
                      {rowCells.map((cell, cIdx) => {
                        const colLetter = gridData.columns[cIdx];
                        const isSelected = selectedCell?.row === rowNum && selectedCell?.col === colLetter;

                        if (!cell) {
                          return (
                            <div
                              key={cIdx}
                              onClick={() => handleCellClick(rowNum, colLetter, null)}
                              className="w-8 h-8 rounded bg-surface-container/40 border border-dashed border-border-subtle flex items-center justify-center text-[9px] font-mono text-charcoal-muted/40 cursor-pointer hover:bg-surface-container"
                              title={`Coordinate [${rowNum - 1}][${cIdx}]: Aisle / Galley void`}
                            >
                              ·
                            </div>
                          );
                        }

                        const isOccupied = cell.status !== 'AVAILABLE';

                        return (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => handleCellClick(rowNum, colLetter, cell)}
                            className={`w-8 h-8 rounded text-[9px] font-mono font-bold flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-primary text-white ring-2 ring-primary ring-offset-1 scale-105 z-10 shadow'
                                : isOccupied
                                  ? 'bg-seat-occupied text-charcoal-muted border border-border-subtle'
                                  : 'bg-white hover:bg-gold-light text-slate-navy border border-border-subtle shadow-sm'
                            }`}
                            title={`Seat ${cell.seat_number} • [${rowNum - 1}][${cIdx}] • ${cell.status}`}
                          >
                            {cell.seat_number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Coordinate Inspector & O(1) Action (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-border-subtle shadow-sm space-y-4">
            <h4 className="font-serif text-sm font-bold text-slate-navy border-b border-border-subtle pb-3">
              Cell Coordinate Inspector
            </h4>

            {selectedCell ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Row Index:</span>
                  <span className="font-mono font-bold text-slate-navy">
                    {selectedCell.row - 1} (Row #{selectedCell.row})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Column Index:</span>
                  <span className="font-mono font-bold text-slate-navy">
                    {gridData?.columns.indexOf(selectedCell.col)} (Col {selectedCell.col})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Matrix Pointer:</span>
                  <span className="font-mono font-bold text-secondary">
                    grid[{selectedCell.row - 1}][{gridData?.columns.indexOf(selectedCell.col)}]
                  </span>
                </div>

                {selectedCell.seat ? (
                  <div className="p-3 rounded-xl bg-gold-light/40 border border-gold-metallic/30 space-y-1.5 mt-2">
                    <div className="flex justify-between font-bold text-slate-navy">
                      <span>Seat {selectedCell.seat.seat_number}</span>
                      <span className="font-mono text-primary">${selectedCell.seat.price}</span>
                    </div>
                    <div className="text-[11px] text-charcoal-muted">
                      Cabin: <strong className="text-slate-navy">{selectedCell.seat.cabin_class}</strong>
                    </div>
                    <div className="text-[11px] text-charcoal-muted">
                      Status: <strong className="text-slate-navy">{selectedCell.seat.status}</strong>
                    </div>
                    <div className="text-[11px] text-charcoal-muted">
                      Category: <strong className="text-slate-navy">{selectedCell.seat.category}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-surface-container-low text-charcoal-muted text-[11px] italic">
                    This coordinate represents an aisle void or galley partition in the fuselage.
                  </div>
                )}

                {selectedCell.seat && selectedCell.seat.status === 'AVAILABLE' && (
                  <button
                    type="button"
                    onClick={handleAllocateCell}
                    className="w-full py-2.5 px-3 bg-primary-container hover:bg-crimson-deep text-white font-serif font-bold text-xs rounded-xl shadow transition-all active:scale-95"
                  >
                    Allocate via O(1) Matrix Index
                  </button>
                )}

                {allocationLog && (
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-mono border border-emerald-300">
                    {allocationLog}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-charcoal-muted italic">Click any coordinate in the matrix to inspect.</p>
            )}
          </div>

          {/* Technical Note Card */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle text-xs text-charcoal-muted space-y-1">
            <span className="text-[10px] font-bold text-slate-navy uppercase block">Hardware Locality Advantage</span>
            <p className="text-[11px] leading-relaxed">
              Row-major layout stores contiguous rows consecutively in memory buffers, maximizing L1/L2 CPU cache hits during contiguous seat window scans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
