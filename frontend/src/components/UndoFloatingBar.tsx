import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { UndoAction } from '../types';

interface UndoFloatingBarProps {
  topAction: UndoAction | null;
  stackSize: number;
  onTriggerUndo: () => void;
  loading: boolean;
}

export const UndoFloatingBar: React.FC<UndoFloatingBarProps> = ({
  topAction,
  stackSize,
  onTriggerUndo,
  loading
}) => {
  if (stackSize === 0 || !topAction) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-slate-navy text-white px-5 py-3 rounded-full shadow-2xl border border-white/20 flex items-center space-x-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center space-x-2 text-xs">
        <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
        <span className="text-surface-container-highest/80">Last action:</span>
        <span className="font-bold text-white max-w-[200px] sm:max-w-xs truncate">
          {topAction.description}
        </span>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={onTriggerUndo}
        className="px-3.5 py-1.5 bg-primary-container hover:bg-crimson-deep text-white rounded-full text-xs font-bold uppercase transition-all shadow-md flex items-center space-x-1.5 flex-shrink-0"
      >
        <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        <span>Undo ({stackSize})</span>
      </button>
    </div>
  );
};
