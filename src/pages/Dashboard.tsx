import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ATMCard } from '@/components/ATMCard';
import { AppLayout } from '@/components/AppLayout';
import { Shield, AlertTriangle, Activity, Wifi, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeState } from '@/types/atm';
import { useATMs, useAlerts, useTelemetry } from '@/hooks/useApiData';
import { StatusBadge } from '@/components/StatusBadge';

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const { data: allATMs, isLoading: atmsLoading } = useATMs();
  const { data: telemetryData } = useTelemetry();
  const { data: alertData } = useAlerts();

  /* ============================================
     FILTER ATMs BASED ON USER ROLE
  ============================================ */

  const visibleATMs = useMemo(() => {
    if (!allATMs) return [];

    if (isAdmin) return allATMs;

    if (!user?.assignedATMs?.length) return allATMs;

    return allATMs.filter((a) =>
      user.assignedATMs.includes(a.device_id)
    );
  }, [allATMs, user, isAdmin]);

  /* ============================================
     ENRICH ATM STATE FROM LATEST TELEMETRY
  ============================================ */

  const enrichedATMs = useMemo(() => {
    if (!telemetryData || !visibleATMs.length)
      return visibleATMs;

    return visibleATMs.map((atm) => {
      const latest = telemetryData
        .filter((t) => t.device_id === atm.device_id)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        )[0];

      if (!latest) {
        return { ...atm, currentState: 'Offline' };
      }

      return {
        ...atm,
        currentState: normalizeState(latest.state),
      };
    });
  }, [visibleATMs, telemetryData]);

  /* ============================================
     STATS
  ============================================ */

  const stats = useMemo(() => {
    const counts = {
      Normal: 0,
      Suspicious: 0,
      Critical: 0,
      Offline: 0,
    };

    enrichedATMs.forEach((a) => {
      counts[a.currentState] =
        (counts[a.currentState] || 0) + 1;
    });

    return counts;
  }, [enrichedATMs]);

  /* ============================================
     RECENT ALERTS (FROM alerts TABLE)
  ============================================ */

  const recentAlerts = useMemo(() => {
    if (!alertData) return [];

    return alertData
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      )
      .slice(0, 10);
  }, [alertData]);

  /* ============================================
     STAT CARDS
  ============================================ */

  const statCards = [
    {
      label: 'Total ATMs',
      value: enrichedATMs.length,
      icon: Shield,
      color: 'text-primary',
    },
    {
      label: 'Critical',
      value: stats.Critical,
      icon: AlertTriangle,
      color: 'text-status-critical',
    },
    {
      label: 'Suspicious',
      value: stats.Suspicious,
      icon: Activity,
      color: 'text-status-suspicious',
    },
    {
      label: 'Online',
      value: enrichedATMs.length - stats.Offline,
      icon: Wifi,
      color: 'text-status-normal',
    },
  ];

  /* ============================================
     LOADING
  ============================================ */

  if (atmsLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  /* ============================================
     UI
  ============================================ */

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {isAdmin ? 'Global Overview' : 'My ATMs'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time monitoring • {enrichedATMs.length} ATM
            {enrichedATMs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className={`mt-2 font-mono text-3xl font-bold ${s.color}`}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ATM Cards */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            ATM Stations
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrichedATMs.map((atm, i) => (
              <motion.div
                key={atm.device_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <ATMCard atm={atm as any} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alerts Table */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Recent Alerts
          </h2>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Device
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Alert
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-foreground">
                      {alert.device_id}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        state={normalizeState(alert.state)}
                        size="sm"
                      />
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {[alert.pir && 'Motion', alert.vibration && 'Vibration', alert.fire_model && 'Fire'].filter(Boolean).join(', ') || alert.state}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {new Date(typeof alert.timestamp === 'number' ? alert.timestamp * 1000 : alert.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}

                {recentAlerts.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No recent alerts
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};
