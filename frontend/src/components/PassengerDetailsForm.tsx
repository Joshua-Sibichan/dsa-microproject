import React, { useState } from 'react';
import { PassengerBookingItem } from '../types';

interface PassengerDetailsFormProps {
  passengers: PassengerBookingItem[];
  onChange: (next: PassengerBookingItem[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const nameOk = (v: string) => v.trim().length >= 2;

export const PassengerDetailsForm: React.FC<PassengerDetailsFormProps> = ({
  passengers,
  onChange,
  onBack,
  onContinue,
}) => {
  const [errors, setErrors] = useState<Record<number, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const update = (idx: number, patch: Partial<PassengerBookingItem>) => {
    const next = passengers.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    onChange(next);
  };

  const validateAll = (): boolean => {
    const nextErrs: Record<number, string[]> = {};
    let ok = true;
    passengers.forEach((p, idx) => {
      const errs: string[] = [];
      if (!p.title) errs.push('Select a title.');
      if (!nameOk(p.firstName || '')) errs.push('Enter a valid first name (minimum 2 characters).');
      if (!nameOk(p.lastName || '')) errs.push('Enter a valid last name (minimum 2 characters).');
      if (!emailOk(p.email || '')) errs.push('Enter a valid contact email address.');
      if (!p.dateOfBirth) errs.push('Enter date of birth.');
      if (!p.gender) errs.push('Select gender.');
      if (p.type === 'infant' && p.dateOfBirth) {
        const ageYears =
          (Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000);
        if (ageYears >= 2) errs.push('Infant must be under 2 years of age on travel date.');
      }
      if (errs.length) {
        nextErrs[idx] = errs;
        ok = false;
      }
    });
    setErrors(nextErrs);
    setFormError(ok ? null : 'Please complete all required fields for each passenger.');
    return ok;
  };

  const handleContinue = () => {
    if (!validateAll()) return;
    // Sync full display name for seat assignment
    const synced = passengers.map((p) => ({
      ...p,
      name: `${p.firstName?.trim()} ${p.lastName?.trim()}`.trim(),
    }));
    onChange(synced);
    onContinue();
  };

  return (
    <section className="space-y-6">
      {/* Navigation Header */}
      <div className="bg-surface-container-low p-4 sm:px-6 rounded-xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-crimson-deep transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Flight Results</span>
        </button>

        <p className="text-xs text-charcoal-muted">
          Please enter traveler information exactly matching government-issued passports.
        </p>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-crimson-light/90 border border-primary/30 text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      {/* Passenger Cards */}
      <div className="space-y-4">
        {passengers.map((p, idx) => {
          const pErrors = errors[idx] || [];

          return (
            <div
              key={p.passengerIndex}
              className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm overflow-hidden"
            >
              {/* Header Strip with Initials Avatar */}
              <div className="bg-slate-navy text-surface-container-lowest px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center">
                    {p.firstName ? p.firstName[0].toUpperCase() : idx + 1}
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                      <span>Passenger {idx + 1}</span>
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-lowest/15 text-gold-light border border-white/10">
                        {p.type || 'adult'}
                      </span>
                    </h3>
                  </div>
                </div>

                <span className="text-[11px] text-surface-container-highest/60 font-mono">
                  Primary Traveler {idx === 0 ? '(Contact)' : ''}
                </span>
              </div>

              {pErrors.length > 0 && (
                <div className="mx-5 mt-4 p-3 rounded-lg bg-crimson-light text-error text-xs space-y-0.5 border border-primary/20">
                  {pErrors.map((err, eIdx) => (
                    <div key={eIdx} className="flex items-center gap-1">
                      <span>•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Form Grid */}
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1">
                    Title *
                  </label>
                  <select
                    value={p.title || ''}
                    onChange={(e) => update(idx, { title: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-slate-navy focus:outline-none focus:border-slate-navy cursor-pointer"
                  >
                    <option value="">Select title...</option>
                    <option value="Mr">Mr.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Mrs">Mrs.</option>
                    <option value="Dr">Dr.</option>
                    <option value="Master">Master</option>
                    <option value="Miss">Miss</option>
                  </select>
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1">
                    First &amp; Middle Name *
                  </label>
                  <input
                    type="text"
                    value={p.firstName || ''}
                    onChange={(e) => update(idx, { firstName: e.target.value })}
                    placeholder="e.g. Alexander"
                    className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-slate-navy focus:outline-none focus:border-slate-navy"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1">
                    Last Name / Surname *
                  </label>
                  <input
                    type="text"
                    value={p.lastName || ''}
                    onChange={(e) => update(idx, { lastName: e.target.value })}
                    placeholder="e.g. Wright"
                    className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-slate-navy focus:outline-none focus:border-slate-navy"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={p.email || ''}
                    onChange={(e) => update(idx, { email: e.target.value })}
                    placeholder="e.g. alexander.wright@xairways.com"
                    className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-slate-navy focus:outline-none focus:border-slate-navy"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={p.dateOfBirth || ''}
                    onChange={(e) => update(idx, { dateOfBirth: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-slate-navy focus:outline-none focus:border-slate-navy"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1">
                    Gender *
                  </label>
                  <select
                    value={p.gender || ''}
                    onChange={(e) => update(idx, { gender: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-slate-navy focus:outline-none focus:border-slate-navy cursor-pointer"
                  >
                    <option value="">Select gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Undisclosed">Undisclosed</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Ribbon */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-border-subtle text-slate-navy text-xs font-bold hover:bg-surface-container-low transition-colors"
        >
          ← Back to Flight Selection
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full sm:w-auto px-8 py-3.5 bg-primary-container hover:bg-crimson-deep text-white font-serif font-bold text-sm sm:text-base rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span>Continue to Aircraft Seat Selection</span>
          <span className="material-symbols-outlined text-[18px]">airline_seat_recline_extra</span>
        </button>
      </div>
    </section>
  );
};
