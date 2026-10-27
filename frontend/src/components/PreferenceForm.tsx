import React, { useState } from 'react';
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
  loadingRec,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [groupSize, setGroupSize] = useState<number>(2);

  const togglePreference = (key: keyof PassengerProfile['preferences']) => {
    setPassenger((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key],
      },
    }));
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-border-subtle space-y-4">
      {/* Header with Expand Trigger */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            <span>X Airways DSA Engine</span>
          </span>
          <h3 className="font-serif text-lg font-bold text-slate-navy">
            Smart Seating Preferences &amp; Group Allocation
          </h3>
        </div>
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-slate-navy hover:bg-gold-light transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-border-subtle">
          <p className="text-xs text-charcoal-muted">
            Configure seating rules. The engine uses multi-factor algorithmic scoring to assign the optimal seat or find contiguous group seating blocks.
          </p>

          {/* Scoring Factor Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: 'window', label: 'Window Seat', icon: 'border_left' },
              { key: 'aisle', label: 'Aisle Seat', icon: 'view_column' },
              { key: 'avoid_middle', label: 'Avoid Middle', icon: 'block' },
              { key: 'extra_legroom', label: 'Extra Legroom', icon: 'star' },
              { key: 'prefer_front', label: 'Forward Cabin', icon: 'arrow_upward' },
            ].map(({ key, label, icon }) => {
              const active = passenger.preferences[key as keyof PassengerProfile['preferences']];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePreference(key as keyof PassengerProfile['preferences'])}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    active
                      ? 'bg-gold-light border-gold-metallic text-secondary shadow-sm'
                      : 'bg-white border-border-subtle text-slate-navy hover:bg-surface-container-low'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">{icon}</span>
                    <span>{label}</span>
                  </span>
                  {active && (
                    <span className="material-symbols-outlined text-secondary text-[14px]">check</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Accessibility & Infant Checkboxes */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-navy font-medium">
              <input
                type="checkbox"
                checked={passenger.traveling_with_infant}
                onChange={(e) => setPassenger({ ...passenger, traveling_with_infant: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">child_friendly</span>
                <span>Traveling with Infant (Bassinet priority)</span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-navy font-medium">
              <input
                type="checkbox"
                checked={passenger.requires_wheelchair}
                onChange={(e) => setPassenger({ ...passenger, requires_wheelchair: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">accessible</span>
                <span>Requires Wheelchair Assistance</span>
              </span>
            </label>
          </div>

          {/* Action Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={loadingRec}
              onClick={onGetRecommendation}
              className="px-4 py-2.5 rounded-xl bg-slate-navy hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary-container">
                auto_awesome
              </span>
              <span>{loadingRec ? 'Scoring Seats...' : 'Smart Recommend Seat'}</span>
            </button>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={2}
                max={6}
                value={groupSize}
                onChange={(e) => setGroupSize(Math.max(2, parseInt(e.target.value) || 2))}
                className="w-14 px-2 py-2 text-xs font-bold bg-surface-container-low rounded-xl border border-border-subtle text-center focus:outline-none"
                title="Group Size"
              />
              <button
                type="button"
                disabled={loadingRec}
                onClick={() => onFindGroupSeats(groupSize)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gold-light hover:bg-gold-light/80 text-secondary border border-gold-metallic/50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px]">groups</span>
                <span>Find {groupSize} Contiguous Seats</span>
              </button>
            </div>
          </div>

          {/* Recommendation & Group Results Feedback */}
          {recommendation && (
            <div className="p-3.5 rounded-xl bg-gold-light/40 border border-gold-metallic/30 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-secondary">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>
                    Recommendation Score: {recommendation.recommended_seat?.preference_score ?? 95}/100
                  </span>
                </span>
                <span className="font-mono bg-white px-2 py-0.5 rounded text-primary">
                  {recommendation.recommended_seat ? `Seat ${recommendation.recommended_seat.seat_number}` : 'None'}
                </span>
              </div>
              <p className="text-charcoal-muted text-[11px]">{recommendation.message}</p>
            </div>
          )}

          {groupResult && (
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-navy">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">group_work</span>
                  <span>Contiguous Group Block</span>
                </span>
                <span className="font-mono text-primary font-bold">
                  {groupResult.seat_numbers?.join(', ') || 'No block'}
                </span>
              </div>
              <p className="text-charcoal-muted text-[11px]">{groupResult.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
