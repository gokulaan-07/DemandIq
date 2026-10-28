import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { RiskCategory } from '../../types/index.ts';

interface RiskBadgeProps {
  score: number;
  category: RiskCategory;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, category, showScore = true }) => {
  if (category === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>High Risk</span>
        {showScore && <span className="font-mono tabular-nums text-slate-500 font-normal">({score})</span>}
      </span>
    );
  }

  if (category === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Review Needed</span>
        {showScore && <span className="font-mono tabular-nums text-slate-500 font-normal">({score})</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-800">
      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
      <span>Low Risk</span>
      {showScore && <span className="font-mono tabular-nums text-slate-500 font-normal">({score})</span>}
    </span>
  );
};
