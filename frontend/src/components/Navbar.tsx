import React, { useState } from 'react';
import { Flight } from '../types';
import { RotateCcw } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-slate-navy/95 backdrop-blur-xl border-b border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.18)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-center py-2.5 sm:py-3">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Airline Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveTab('book')}
          >
            <div className="h-9 w-9 rounded-lg bg-primary-container flex items-center justify-center shadow-md border border-white/10 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-white text-[20px]">flight_takeoff</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                  X Airways
                </span>
              </div>
              <p className="text-[11px] text-surface-container-highest/70 font-sans tracking-wide hidden sm:block">
                Flight Booking &amp; Aircraft Seat Intelligence
              </p>
            </div>
          </div>

          {/* Active Flight Badge (Visible on Desktop) */}
          {selectedFlight && (
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-lowest/10 rounded-full border border-white/10 text-white text-xs">
              <span className="material-symbols-outlined text-[15px] text-secondary-container animate-pulse">
                airplanemode_active
              </span>
              <span className="font-mono font-bold text-secondary-container">
                {selectedFlight.flight_number}
              </span>
              <span className="text-white/40">•</span>
              <span className="font-medium text-surface-container-lowest">
                {selectedFlight.origin} → {selectedFlight.destination}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-[11px] text-surface-container-highest/80">
                {selectedFlight.aircraft_type}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-[11px] text-emerald-300 font-semibold">
                {selectedFlight.available_seats} seats
              </span>
            </div>
          )}

          {/* Right Action Utilities & Tabs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Undo Action Pill */}
            {undoCount > 0 && (
              <button
                type="button"
                onClick={onTriggerUndo}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-metallic/20 text-secondary-container border border-gold-metallic/40 hover:bg-gold-metallic/30 transition-all"
                title="Undo last reservation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Undo ({undoCount})</span>
              </button>
            )}

            {/* Main Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('book')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'book'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-surface-container-highest/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Book
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'manage'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-surface-container-highest/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Manage Booking
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dsa')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'dsa'
                    ? 'bg-secondary-container text-slate-navy font-bold shadow-sm'
                    : 'text-surface-container-highest/80 hover:text-white hover:bg-white/10'
                }`}
              >
                DSA Hub
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('arena')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'arena'
                    ? 'bg-secondary-container text-slate-navy font-bold shadow-sm'
                    : 'text-surface-container-highest/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Arena
              </button>
            </nav>

            {/* Profile Avatar Pill */}
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-xs font-bold shadow-sm border border-white/20">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
