import { ATMState } from '@/types/atm';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  state: ATMState;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const stateStyles: Record<ATMState, string> = {
  Normal: 'bg-status-normal/15 text-status-normal border-status-normal/30',
  Suspicious: 'bg-status-suspicious/15 text-status-suspicious border-status-suspicious/30',
  Critical: 'bg-status-critical/15 text-status-critical border-status-critical/30',
  Offline: 'bg-status-offline/15 text-status-offline border-status-offline/30',
};

const dotStyles: Record<ATMState, string> = {
  Normal: 'bg-status-normal',
  Suspicious: 'bg-status-suspicious',
  Critical: 'bg-status-critical',
  Offline: 'bg-status-offline',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export const StatusBadge = ({ state, size = 'md', pulse = true }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-mono font-medium',
        stateStyles[state],
        sizeStyles[size],
        pulse && state === 'Critical' && 'status-pulse-critical',
        pulse && state === 'Suspicious' && 'status-pulse-suspicious'
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', dotStyles[state])} />
      {state}
    </span>
  );
};
