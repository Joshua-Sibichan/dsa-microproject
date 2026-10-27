import React from 'react';

export type BookingStepId = 'search' | 'results' | 'passengers' | 'seats' | 'confirm';

const STEPS: { id: BookingStepId; label: string; num: string }[] = [
  { id: 'search', label: 'Search', num: '1' },
  { id: 'results', label: 'Flights', num: '2' },
  { id: 'passengers', label: 'Passengers', num: '3' },
  { id: 'seats', label: 'Seats', num: '4' },
  { id: 'confirm', label: 'Confirm', num: '5' },
];

interface BookingStepperProps {
  current: BookingStepId;
  onJump?: (step: BookingStepId) => void;
  unlockedThrough: BookingStepId;
}

const order = STEPS.map((s) => s.id);

export const BookingStepper: React.FC<BookingStepperProps> = ({
  current,
  onJump,
  unlockedThrough,
}) => {
  const currentIdx = order.indexOf(current);
  const unlockedIdx = order.indexOf(unlockedThrough);

  return (
    <div className="w-full bg-slate-navy text-surface-container-lowest px-4 sm:px-6 py-2.5 rounded-xl shadow-md border border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav aria-label="Booking steps" className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
          {STEPS.map((step, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            const reachable = idx <= unlockedIdx;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  disabled={!reachable || !onJump}
                  onClick={() => reachable && onJump?.(step.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    active
                      ? 'bg-primary-container text-white shadow font-bold'
                      : done
                        ? 'bg-surface-container-lowest/15 text-gold-light hover:bg-surface-container-lowest/25 cursor-pointer'
                        : reachable
                          ? 'text-charcoal-muted hover:text-white cursor-pointer'
                          : 'text-charcoal-muted/50 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      active
                        ? 'bg-white text-primary-container'
                        : done
                          ? 'bg-gold-metallic text-slate-navy'
                          : 'bg-white/10 text-charcoal-muted'
                    }`}
                  >
                    {done ? '✓' : step.num}
                  </span>
                  <span>{step.label}</span>
                </button>

                {idx < STEPS.length - 1 && (
                  <span className="material-symbols-outlined text-[14px] text-charcoal-muted shrink-0">
                    chevron_right
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
