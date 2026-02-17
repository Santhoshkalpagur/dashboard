import { ATMKit } from '@/types/atm';
import { StatusBadge } from './StatusBadge';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ATMCardProps {
  atm: ATMKit;
}

const cardGlow: Record<string, string> = {
  Normal: '',
  Suspicious: 'glow-warning',
  Critical: 'glow-danger',
  Offline: '',
};

export const ATMCard = ({ atm }: ATMCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/atm/${atm.device_id}`)}
      className={cn(
        'group w-full rounded-lg border border-border bg-card p-5 text-left transition-all duration-300',
        'hover:border-primary/40 hover:bg-card/80',
        cardGlow[atm.currentState]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-mono text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {atm.device_id}
          </h3>
          {atm.location && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {atm.location.branch}{atm.location.city ? `, ${atm.location.city}` : ''}
            </div>
          )}
        </div>
        <StatusBadge state={atm.currentState} size="sm" />
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {atm.lastHeartbeat || atm.timestamp
            ? formatDistanceToNow(new Date(atm.lastHeartbeat || (typeof atm.timestamp === 'number' ? atm.timestamp * 1000 : atm.timestamp!)), { addSuffix: true })
            : 'N/A'}
        </span>
        <span className="flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          {atm.currentState === 'Offline' ? 'Disconnected' : 'Connected'}
        </span>
      </div>
    </button>
  );
};
