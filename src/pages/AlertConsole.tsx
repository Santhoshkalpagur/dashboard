import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useATMs, useAlerts } from '@/hooks/useApiData';
import { normalizeState } from '@/types/atm';
import { AlertTriangle, Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const AlertConsole = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stateFilter, setStateFilter] = useState<string>('all');
  const { data: allATMs } = useATMs();
  const { data: alertData, isLoading } = useAlerts();

  const visibleDeviceIds = useMemo(() => {
    if (isAdmin && allATMs) return allATMs.map((a) => a.device_id);
    return user?.assignedATMs || [];
  }, [user, isAdmin, allATMs]);

  const alerts = useMemo(() => {
    if (!alertData) return [];
    let records = alertData
      .filter((t) => visibleDeviceIds.includes(t.device_id))
      .map((t) => ({ ...t, state: normalizeState(t.state) }));
    if (stateFilter !== 'all') records = records.filter((t) => t.state === stateFilter);
    return records;
  }, [alertData, visibleDeviceIds, stateFilter]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-status-suspicious" />
              Alert Console
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{alerts.length} alerts across {visibleDeviceIds.length} ATMs</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {['all', 'Suspicious', 'Critical'].map((f) => (
              <button
                key={f}
                onClick={() => setStateFilter(f)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  stateFilter === f ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground border border-transparent'
                )}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => navigate(`/atm/${alert.device_id}`)}
              className={cn(
                'cursor-pointer rounded-lg border bg-card p-4 transition-all hover:bg-muted/30',
                alert.state === 'Critical' ? 'border-status-critical/20' : 'border-border'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-foreground">{alert.device_id}</span>
                  <StatusBadge state={alert.state} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {[alert.pir && 'Motion', alert.vibration && 'Vibration', alert.fire_model && 'Fire', alert.cam_blocking && 'Camera Blocked'].filter(Boolean).join(' • ') || 'No sensors'}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(typeof alert.timestamp === 'number' ? alert.timestamp * 1000 : alert.timestamp).toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
          {alerts.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No alerts found
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
