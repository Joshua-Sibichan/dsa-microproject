import React from 'react';
import { Plane, Compass, Layers, ShieldCheck, Ticket, RotateCcw } from 'lucide-react';
import { Flight } from '../types';

interface NavbarProps {
  activeTab: 'book' | 'manage' | 'dsa' | 'arena';
  setActiveTab: (tab: 'book' | 'manage' | 'dsa' | 'arena') => void;
  selectedFlight: Flight | null;
  undoCount: number;
  onTriggerUndo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedFlight,
  undoCount,
  onTriggerUndo
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#10243A] text-white border-b border-navy-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Airline Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('book')}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0B1726] to-[#1A3654] border border-[#C7A66A]/40 flex items-center justify-center shadow-md">
              <Plane className="w-6 h-6 text-[#C7A66A] transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif tracking-widest text-lg font-bold text-white uppercase">AeroSeat</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-[#C7A66A]/20 text-[#C7A66A] border border-[#C7A66A]/30">INTELLIGENCE</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide">Academic Reservation & DSA Benchmark System</p>
            </div>
          </div>

          {/* Active Flight Badge */}
          {selectedFlight && (
            <div className="hidden lg:flex items-center space-x-3 bg-[#1A3654]/70 px-4 py-2 rounded-xl border border-navy-700/60">
              <span className="font-mono text-xs font-bold text-[#C7A66A]">{selectedFlight.flight_number}</span>
              <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-medium">
                <span>{selectedFlight.origin}</span>
                <span className="text-slate-500">→</span>
                <span>{selectedFlight.destination}</span>
              </div>
              <div className="h-3 w-px bg-slate-600"></div>
              <span className="text-[11px] text-emerald-400 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span>
                {selectedFlight.available_seats} Seats Left
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('book')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'book'
                  ? 'bg-[#C7A66A] text-[#10243A] font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-[#1A3654]'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Seat Selection</span>
            </button>

            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'manage'
                  ? 'bg-[#C7A66A] text-[#10243A] font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-[#1A3654]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Manage Booking</span>
            </button>

            <button
              onClick={() => setActiveTab('dsa')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'dsa'
                  ? 'bg-[#C7A66A] text-[#10243A] font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-[#1A3654]'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>DSA Hub</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold border border-emerald-500/30">
                CO1–CO5
              </span>
            </button>

            <button
              onClick={() => setActiveTab('arena')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'arena'
                  ? 'bg-[#C7A66A] text-[#10243A] font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-[#1A3654]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Algorithm Arena</span>
            </button>

            {/* Undo trigger shortcut */}
            {undoCount > 0 && (
              <button
                onClick={onTriggerUndo}
                title="Undo last booking action (LIFO Stack)"
                className="flex items-center space-x-1.5 ml-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-mono border border-amber-500/40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo ({undoCount})</span>
              </button>
            )}
          </nav>

        </div>
      </div>
    </header>
  );
};
