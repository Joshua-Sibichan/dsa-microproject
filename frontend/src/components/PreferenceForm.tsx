import React, { useState } from 'react';
import { Sparkles, Users, User, Mail, Baby, Accessibility, Check, Shield } from 'lucide-react';
import { PassengerProfile, RecommendationResult, GroupSeatingResult } from '../types';

interface PreferenceFormProps {
  passenger: PassengerProfile;
  setPassenger: React.Dispatch<React.SetStateAction<PassengerProfile>>;
  onGetRecommendation: () => void;
  onFindGroupSeats: (size: number) => void;
  recommendation: RecommendationResult | null;
  groupResult: GroupSeatingResult | null;
  loadingRec: boolean;
}

export const PreferenceForm: React.FC<PreferenceFormProps> = ({
  passenger,
  setPassenger,
  onGetRecommendation,
  onFindGroupSeats,
  recommendation,
  groupResult,
  loadingRec
}) => {
  const [groupSize, setGroupSize] = useState<number>(2);

  const togglePreference = (key: keyof PassengerProfile['preferences']) => {
    setPassenger(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
      <div>
        <span className="text-xs font-mono font-bold tracking-wider text-[#C7A66A] uppercase">Seat Intelligence</span>
        <h2 className="text-xl font-bold text-[#10243A]">Passenger & Seat Preferences</h2>
        <p className="text-xs text-slate-500 mt-0.5">Algorithmically optimizes seat assignment via multi-factor scoring</p>
      </div>

      {/* Passenger Basic Info */}
      <div className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Passenger Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={passenger.name}
              onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="e.g. Eleanor Vance"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email for Booking Confirmation</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              value={passenger.email}
              onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="e.g. eleanor@airline.aero"
            />
          </div>
        </div>
      </div>

      {/* Preference Toggles Grid */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
          Scoring Factors & Seating Rules
        </label>
        
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => togglePreference('window')}
            className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
              passenger.preferences.window
                ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <span>🪟 Window Seat</span>
            {passenger.preferences.window && <Check className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => togglePreference('aisle')}
            className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
              passenger.preferences.aisle
                ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <span>🚶 Aisle Access</span>
            {passenger.preferences.aisle && <Check className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => togglePreference('avoid_middle')}
            className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
              passenger.preferences.avoid_middle
                ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <span>🚫 Avoid Middle</span>
            {passenger.preferences.avoid_middle && <Check className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => togglePreference('extra_legroom')}
            className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
              passenger.preferences.extra_legroom
                ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <span>🦵 Extra Legroom</span>
            {passenger.preferences.extra_legroom && <Check className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => togglePreference('prefer_front')}
            className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between col-span-2 ${
              passenger.preferences.prefer_front
                ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <span>⚡ Front Cabin Rows (Early Disembarkation)</span>
            {passenger.preferences.prefer_front && <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Regulatory Constraints / Special Needs */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={passenger.traveling_with_infant}
            onChange={(e) => setPassenger({ ...passenger, traveling_with_infant: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <Baby className="w-3.5 h-3.5 text-slate-500" />
          <span>Infant in arms</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={passenger.requires_wheelchair}
            onChange={(e) => setPassenger({ ...passenger, requires_wheelchair: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <Accessibility className="w-3.5 h-3.5 text-slate-500" />
          <span>Mobility assistance</span>
        </label>
      </div>

      {/* Recommend Seat CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGetRecommendation}
          disabled={loadingRec}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-[#10243A] to-[#1A3654] hover:from-[#0B1726] hover:to-[#10243A] text-white rounded-2xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all border border-[#C7A66A]/30"
        >
          <Sparkles className="w-4 h-4 text-[#C7A66A]" />
          <span>{loadingRec ? 'Evaluating Seats (MergeSort)...' : 'Recommend Best Seat via DSA'}</span>
        </button>
      </div>

      {/* Contiguous Group Seating Form */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Users className="w-4 h-4 text-[#C7A66A]" />
            <span>Traveling in Group?</span>
          </div>
          <span className="text-[11px] text-slate-500">Contiguous Adjacent Seats</span>
        </div>

        <div className="flex items-center space-x-2">
          {[2, 3, 4].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => { setGroupSize(size); onFindGroupSeats(size); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                groupSize === size
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {size} Passengers
            </button>
          ))}
        </div>

        {groupResult && (
          <div className={`p-3 rounded-xl text-xs ${groupResult.found ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
            <p className="font-semibold">{groupResult.message}</p>
          </div>
        )}
      </div>

      {/* Recommendation Results Explainer Panel */}
      {recommendation?.recommended_seat && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-200/80 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">Algorithm Top Match</span>
            </div>
            <span className="text-xs font-mono font-bold bg-[#2563EB] text-white px-2.5 py-0.5 rounded-full">
              {recommendation.recommended_seat.preference_score}% Match
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-[#10243A]">Seat {recommendation.recommended_seat.seat_number}</span>
              <span className="ml-2 text-xs text-slate-600 font-medium">{recommendation.recommended_seat.cabin_class} ({recommendation.recommended_seat.category})</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#10243A]">
              {recommendation.recommended_seat.price > 0 ? `$${recommendation.recommended_seat.price.toFixed(2)}` : 'Complimentary'}
            </span>
          </div>

          {/* Explainable Factor Breakdown */}
          <div className="space-y-1 pt-2 border-t border-blue-200/50">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Factor Breakdown:</span>
            {recommendation.recommended_seat.score_breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs py-0.5">
                <span className="text-slate-700">{item.description}</span>
                <span className={`font-mono font-semibold ${item.delta > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {item.delta > 0 ? `+${item.delta}` : item.delta}
                </span>
              </div>
            ))}
          </div>

          {/* Algorithmic Sorting Metric Badge */}
          {recommendation.sorting_metrics && (
            <div className="mt-3 pt-2 border-t border-blue-200/50 flex justify-between items-center text-[11px] font-mono text-slate-500">
              <span>Stable MergeSort:</span>
              <span>{recommendation.sorting_metrics.comparisons} comparisons ({recommendation.sorting_metrics.execution_time_us}μs)</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
