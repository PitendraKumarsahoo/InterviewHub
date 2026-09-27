import React from 'react';
import { CheckCircle2, XCircle, Clock, HelpCircle, Sparkles } from 'lucide-react';
import { InterviewResult } from '../types';

export type ApplicantStatusType = 'selected' | 'rejected' | 'waiting' | 'other';

export interface ApplicantStatusConfig {
  type: ApplicantStatusType;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotBg: string;
  progressColor: string;
  progressTrack: string;
  progressLabel: string;
}

export function parseApplicantStatus(result?: string | InterviewResult): ApplicantStatusConfig {
  if (!result) {
    return {
      type: 'other',
      label: 'Outcome Unknown',
      shortLabel: 'Unknown',
      badgeBg: 'bg-slate-50',
      badgeText: 'text-slate-600',
      badgeBorder: 'border-slate-200',
      dotBg: 'bg-slate-400',
      progressColor: 'bg-slate-400',
      progressTrack: 'bg-slate-100',
      progressLabel: 'Status not specified',
    };
  }

  const normalized = result.toLowerCase().trim();

  // Selected / Offer received
  if (
    normalized.includes('select') ||
    normalized.includes('offer') ||
    normalized.includes('hired') ||
    normalized.includes('accept')
  ) {
    return {
      type: 'selected',
      label: 'Selected',
      shortLabel: 'Selected',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      badgeText: 'text-emerald-700 dark:text-emerald-300 font-semibold',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
      dotBg: 'bg-emerald-500',
      progressColor: 'bg-emerald-500',
      progressTrack: 'bg-emerald-100 dark:bg-emerald-900/30',
      progressLabel: 'Selected · Offer Extended',
    };
  }

  // Rejected / Not Selected
  if (
    normalized.includes('not select') ||
    normalized.includes('reject') ||
    normalized.includes('denied') ||
    normalized.includes('declined')
  ) {
    return {
      type: 'rejected',
      label: 'Not Selected',
      shortLabel: 'Rejected',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
      badgeText: 'text-rose-700 dark:text-rose-300 font-semibold',
      badgeBorder: 'border-rose-200 dark:border-rose-800',
      dotBg: 'bg-rose-500',
      progressColor: 'bg-rose-500',
      progressTrack: 'bg-rose-100 dark:bg-rose-900/30',
      progressLabel: 'Not Selected · Concluded',
    };
  }

  // Still Waiting / Waitlisted / Pending / In Review
  if (
    normalized.includes('wait') ||
    normalized.includes('pend') ||
    normalized.includes('progress') ||
    normalized.includes('review') ||
    normalized.includes('process')
  ) {
    return {
      type: 'waiting',
      label: result === 'Waitlisted' ? 'Waitlisted' : 'Still Waiting',
      shortLabel: 'Waiting',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
      badgeText: 'text-amber-800 dark:text-amber-300 font-semibold',
      badgeBorder: 'border-amber-200 dark:border-amber-800',
      dotBg: 'bg-amber-500',
      progressColor: 'bg-amber-500',
      progressTrack: 'bg-amber-100 dark:bg-amber-900/30',
      progressLabel: 'Awaiting Result · In Progress',
    };
  }

  // Neutral / Prefer not to say
  return {
    type: 'other',
    label: result || 'Prefer not to say',
    shortLabel: result || 'Undisclosed',
    badgeBg: 'bg-slate-50 dark:bg-slate-800/40',
    badgeText: 'text-slate-600 dark:text-slate-400 font-medium',
    badgeBorder: 'border-slate-200 dark:border-slate-700',
    dotBg: 'bg-slate-400',
    progressColor: 'bg-slate-400',
    progressTrack: 'bg-slate-100 dark:bg-slate-800',
    progressLabel: result || 'Status undisclosed',
  };
}

interface StatusTagProps {
  result?: string | InterviewResult;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDot?: boolean;
  showPulse?: boolean;
  className?: string;
  customLabel?: string;
}

export const StatusTag: React.FC<StatusTagProps> = ({
  result,
  size = 'sm',
  showIcon = true,
  showDot = false,
  showPulse = true,
  className = '',
  customLabel,
}) => {
  const config = parseApplicantStatus(result);

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  }[size];

  const renderIcon = () => {
    switch (config.type) {
      case 'selected':
        return <CheckCircle2 className={`${iconSizes} text-emerald-600 dark:text-emerald-400 shrink-0`} />;
      case 'rejected':
        return <XCircle className={`${iconSizes} text-rose-600 dark:text-rose-400 shrink-0`} />;
      case 'waiting':
        return <Clock className={`${iconSizes} text-amber-600 dark:text-amber-400 shrink-0`} />;
      default:
        return <HelpCircle className={`${iconSizes} text-slate-400 shrink-0`} />;
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border shadow-2xs tracking-wide transition-colors ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} ${sizeClasses} ${className}`}
    >
      {/* Animated pulsing dot for waiting status or when explicitly requested */}
      {showDot && (
        <span className="relative flex h-2 w-2 mr-0.5">
          {showPulse && config.type === 'waiting' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          )}
          {showPulse && config.type === 'selected' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotBg}`} />
        </span>
      )}

      {showIcon && renderIcon()}

      <span>{customLabel || config.label}</span>
    </span>
  );
};

interface VisualProgressTrackerProps {
  result?: string | InterviewResult;
  roundsCount?: number;
  rounds?: Array<{ roundName: string }>;
  compact?: boolean;
  className?: string;
}

export const VisualProgressTracker: React.FC<VisualProgressTrackerProps> = ({
  result,
  roundsCount = 3,
  rounds = [],
  compact = false,
  className = '',
}) => {
  const config = parseApplicantStatus(result);
  const totalRounds = Math.max(1, rounds.length || roundsCount);

  // Determine stage progression:
  // If Selected -> 100% finished and cleared
  // If Waiting -> all rounds completed (or in final deliberation) waiting for verdict
  // If Rejected -> reached through rounds and concluded
  const isSelected = config.type === 'selected';
  const isWaiting = config.type === 'waiting';
  const isRejected = config.type === 'rejected';

  if (compact) {
    // Ultra-clean visual multi-step progress bar on card
    return (
      <div className={`space-y-1.5 ${className}`}>
        {/* Step indicator header */}
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className="text-slate-500 flex items-center gap-1">
            <span>Interview Pipeline</span>
            <span className="text-slate-400">({totalRounds} {totalRounds === 1 ? 'round' : 'rounds'})</span>
          </span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              isSelected
                ? 'text-emerald-600'
                : isRejected
                ? 'text-rose-600'
                : isWaiting
                ? 'text-amber-700'
                : 'text-slate-500'
            }`}
          >
            {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            {isRejected && <XCircle className="w-3 h-3 text-rose-500" />}
            {isWaiting && (
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
              </span>
            )}
            <span>
              {isSelected ? 'Cleared & Selected' : isRejected ? 'Concluded' : isWaiting ? 'Awaiting Verdict' : 'Completed'}
            </span>
          </span>
        </div>

        {/* Segmented Progress Bar */}
        <div className="flex items-center gap-1 w-full h-1.5">
          {Array.from({ length: totalRounds }).map((_, idx) => {
            // For rounds:
            let segmentClass = 'bg-slate-100';
            if (isSelected) {
              segmentClass = 'bg-emerald-500';
            } else if (isWaiting) {
              // candidate completed rounds, awaiting final result
              segmentClass = idx === totalRounds - 1 ? 'bg-amber-400 animate-pulse' : 'bg-amber-500';
            } else if (isRejected) {
              // all rounds up to end or final stage
              segmentClass = idx === totalRounds - 1 ? 'bg-rose-400' : 'bg-slate-300';
            } else {
              segmentClass = 'bg-slate-200';
            }

            return (
              <div
                key={idx}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${segmentClass}`}
                title={`Round ${idx + 1}`}
              />
            );
          })}

          {/* Outcome final pill */}
          <div
            className={`h-full w-2.5 rounded-full transition-all ${
              isSelected
                ? 'bg-emerald-600'
                : isRejected
                ? 'bg-rose-500'
                : isWaiting
                ? 'bg-amber-400 animate-pulse'
                : 'bg-slate-300'
            }`}
            title={`Final Decision: ${config.label}`}
          />
        </div>
      </div>
    );
  }

  // Expanded detailed progress flow (for modal or rich cards)
  return (
    <div className={`p-3.5 rounded-xl border ${config.badgeBg} ${config.badgeBorder} space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSelected && <Sparkles className="w-4 h-4 text-emerald-600" />}
          {isRejected && <XCircle className="w-4 h-4 text-rose-600" />}
          {isWaiting && <Clock className="w-4 h-4 text-amber-600" />}
          <span className="text-xs font-bold text-slate-800">
            Interview Process & Status
          </span>
        </div>

        <StatusTag result={result} size="xs" showPulse={true} showDot={true} />
      </div>

      {/* Visual Rounds Pipeline */}
      <div className="relative pt-1 pb-1">
        <div className="flex items-center justify-between relative z-10">
          {rounds.map((round, idx) => {
            const isLastRound = idx === rounds.length - 1;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center text-center relative group">
                {/* Connecting track line between steps */}
                {idx < rounds.length - 1 && (
                  <div
                    className={`absolute top-3 left-1/2 w-full h-0.5 -z-10 ${
                      isSelected
                        ? 'bg-emerald-300'
                        : isWaiting
                        ? 'bg-amber-300'
                        : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Node icon */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isWaiting
                      ? isLastRound
                        ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300/60 animate-pulse'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                      : isRejected
                      ? isLastRound
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Round Label */}
                <span className="text-[11px] font-medium text-slate-700 mt-1 max-w-[85px] truncate">
                  {round.roundName}
                </span>
              </div>
            );
          })}

          {/* Final outcome node */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-2xs border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isRejected
                  ? 'bg-rose-600 text-white border-rose-600'
                  : isWaiting
                  ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300/60'
                  : 'bg-slate-300 text-slate-700 border-slate-300'
              }`}
            >
              {isSelected ? '✓' : isRejected ? '✕' : isWaiting ? '◷' : '?'}
            </div>
            <span className="text-[11px] font-semibold text-slate-800 mt-1">
              {config.shortLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 flex items-center justify-between">
        <span>Outcome Summary:</span>
        <span className="font-semibold text-slate-800">
          {config.progressLabel}
        </span>
      </div>
    </div>
  );
};
