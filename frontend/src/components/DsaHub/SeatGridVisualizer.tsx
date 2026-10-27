import React, { useState, useEffect } from 'react';
import { fetchSeatGrid, allocateSeatGrid } from '../../api';
import { SeatGridResponse, Seat } from '../../types';
import { Grid, Eye, CheckCircle2, Cpu, Zap, ArrowRight, Layers, RefreshCw } from 'lucide-react';

export const SeatGridVisualizer: React.FC = () => {
  const [gridData, setGridData] = useState<SeatGridResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; seat: Seat | null } | null>(null);
  const [allocationLog, setAllocationLog] = useState<string | null>(null);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(15);

  useEffect(() => {
    loadGrid();
  }, []);

  const loadGrid = async () => {
    setLoading(true);
    try {
      const data = await fetchSeatGrid('FL-201');
      setGridData(data);
      if (data.matrix && data.matrix.length > 14) {
        // default select row 15
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
      
      {/* Title & Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-[#C7A66A] uppercase flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> Course Outcome CO2: Spatial Array Structures
          </span>
          <h2 className="text-2xl font-bold text-[#10243A]">2D Array Seat Allocation Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates row-major 2D matrix indexing `grid[row_idx][col_idx]`, direct O(1) coordinate allocation, and spatial layout memory contiguous layout.
          </p>
        </div>

        <button
          onClick={loadGrid}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Matrix</span>
        </button>
      </div>

      {/* Metrics Banner */}
      {gridData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#10243A] text-white">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Matrix Dimension</span>
            <span className="text-base font-bold font-mono text-[#C7A66A]">
              {gridData.metrics.matrix_dimensions}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Grid Cells</span>
            <span className="text-base font-bold font-mono text-white">
              {gridData.metrics.total_matrix_cells} Cells
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Configured Seats</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {gridData.metrics.configured_seats} Active
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Coordinate Access</span>
            <span className="text-base font-bold font-mono text-blue-400">
              O(1) Constant Time
            </span>
          </div>
        </div>
      )}

      {/* Interactive Matrix Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 2D Matrix Grid (8 cols) */}
        <div className="lg:col-span-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 overflow-x-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Cabin Matrix (Rows 1–26 x Columns A–K)</span>
            <span className="text-[11px] font-mono text-slate-500">grid[r][c] address model</span>
          </div>

          {gridData && (
            <div className="space-y-1.5 min-w-[500px]">
              {/* Column Letters Header */}
              <div className="flex items-center justify-center space-x-1 pl-8">
                {gridData.columns.map((col) => (
                  <div key={`col-hdr-${col}`} className="w-8 text-center font-mono font-bold text-xs text-slate-500">
                    {col}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {gridData.matrix.map((rowCells, rIdx) => {
                const rowNum = gridData.min_row + rIdx;
                return (
                  <div key={`matrix-row-${rowNum}`} className="flex items-center justify-center space-x-1">
                    <span className="w-7 text-right font-mono text-xs font-bold text-slate-400 pr-1">
                      {rowNum}
                    </span>

                    {rowCells.map((cell, cIdx) => {
                      const colLetter = gridData.columns[cIdx];
                      const isSelected = selectedCell?.row === rowNum && selectedCell?.col === colLetter;
                      const isOccupied = cell?.status === 'RESERVED' || cell?.status === 'BLOCKED';

                      let cellBg = 'bg-white border-slate-200 text-slate-700 hover:border-blue-400';
                      if (!cell) {
                        cellBg = 'bg-slate-200/40 border-dashed border-slate-300 text-transparent';
                      } else if (isSelected) {
                        cellBg = 'bg-[#2563EB] text-white border-blue-600 ring-2 ring-blue-300';
                      } else if (isOccupied) {
                        cellBg = 'bg-slate-300 border-slate-400 text-slate-500 line-through';
                      } else {
                        cellBg = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                      }

                      return (
                        <button
                          key={`cell-${rowNum}-${colLetter}`}
                          type="button"
                          disabled={!cell}
                          onClick={() => handleCellClick(rowNum, colLetter, cell)}
                          className={`w-8 h-8 rounded-lg text-[10px] font-mono font-bold border transition-all flex items-center justify-center ${cellBg}`}
                        >
                          {cell ? colLetter : ''}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Cell Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-mono font-bold text-[#C7A66A] uppercase">O(1) Cell Address</span>
            <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-800">
              {selectedCell ? `${selectedCell.row}${selectedCell.col}` : 'None'}
            </span>
          </div>

          {selectedCell && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 font-mono">
                <div className="text-slate-500 text-[10px]">Matrix Array Index:</div>
                <div className="text-sm font-bold text-[#10243A]">
                  grid[{selectedCell.row - (gridData?.min_row || 1)}][{gridData?.columns.indexOf(selectedCell.col)}]
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold">
                  Memory Lookup: Direct Memory Offset (O(1))
                </div>
              </div>

              {selectedCell.seat ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cabin Class:</span>
                    <span className="font-bold text-slate-800">{selectedCell.seat.cabin_class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      selectedCell.seat.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedCell.seat.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seat Pitch:</span>
                    <span className="font-bold text-slate-800">{selectedCell.seat.pitch_inches}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Position:</span>
                    <span className="font-bold text-slate-800">
                      {selectedCell.seat.is_window ? 'Window' : selectedCell.seat.is_aisle ? 'Aisle' : 'Middle'}
                    </span>
                  </div>

                  {selectedCell.seat.status === 'AVAILABLE' && (
                    <button
                      type="button"
                      onClick={handleAllocateCell}
                      className="w-full mt-2 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow"
                    >
                      Allocate via O(1) Matrix Set
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  Aisle or Structural Void (No Seat Configured)
                </div>
              )}

              {allocationLog && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-mono">
                  {allocationLog}
                </div>
              )}
            </div>
          )}

          {/* Theoretical Complexity Summary */}
          <div className="p-4 bg-[#10243A] text-white rounded-2xl text-xs space-y-2">
            <span className="text-[11px] font-mono text-[#C7A66A] font-bold uppercase block">
              CO2 Complexity Analysis
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>Contiguous 2D Arrays</strong> excel at direct coordinate lookups by row and column in <span className="text-emerald-400 font-mono">O(1)</span> time. They leverage CPU L1/L2 cache locality for spatial 2D row sweeps to identify contiguous blocks of 2 to 4 adjacent seats.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
