import React from 'react';
import { Plane, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Flight } from '../types';

interface FlightSelectorProps {
  flights: Flight[];
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight) => void;
}

export const FlightSelector: React.FC<FlightSelectorProps> = ({
  flights,
  selectedFlight,
  onSelectFlight
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-[#C7A66A] uppercase">Demonstration Flight Manifest</span>
          <h2 className="text-xl font-bold text-[#10243A]">Select Scheduled Service</h2>
        </div>
        <div className="flex items-center text-xs text-slate-500 space-x-4">
          <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" /> Daily Operations</span>
          <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Scheduled On-Time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {flights.map((flight) => {
          const isSelected = selectedFlight?.id === flight.id;
          return (
            <div
              key={flight.id}
              onClick={() => onSelectFlight(flight)}
              className={`relative p-5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                isSelected
                  ? 'border-[#2563EB] bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-[#2563EB]">
                  <CheckCircle2 className="w-5 h-5 fill-current text-white" />
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm font-bold text-[#10243A] bg-slate-100 px-2.5 py-1 rounded-md">
                  {flight.flight_number}
                </span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {flight.available_seats} Available
                </span>
              </div>

              {/* Route */}
              <div className="flex items-center justify-between my-2">
                <div>
                  <div className="text-lg font-bold text-slate-800">{flight.origin}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[80px]">{flight.origin_city}</div>
                </div>

                <div className="flex flex-col items-center px-2">
                  <Plane className="w-4 h-4 text-[#C7A66A] transform rotate-90 my-1" />
                  <div className="w-12 h-px bg-slate-300"></div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-slate-800">{flight.destination}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[80px]">{flight.destination_city}</div>
                </div>
              </div>

              {/* Schedule & Aircraft */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{flight.departure_time} - {flight.arrival_time}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-[100px]">{flight.aircraft_type}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
