import { Alert, AlertSeverity } from '@/types/atm';
import { getSeverityDistribution } from '@/lib/alert-utils';
import { AlertCircle, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AlertStatsProps {
  alerts: Alert[];
  unreadCount: number;
}

export const AlertStats = ({ alerts, unreadCount }: AlertStatsProps) => {
  const distribution = getSeverityDistribution(alerts);
  const totalAlerts = alerts.length;
  const last24Hours = alerts.filter((a) => {
    const alertTime = new Date(a.timestamp).getTime();
    const now = new Date().getTime();
    return now - alertTime < 86400000; // 24 hours
  });

  // Calculate max severity
  const maxThreatScore =
    alerts.length > 0
      ? Math.max(...alerts.map((a) => a.threat_score))
      : 0;

  const statCards = [
    {
      label: 'Total Alerts',
      value: totalAlerts,
      icon: AlertCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Unread Alerts',
      value: unreadCount,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      label: 'Last 24h',
      value: last24Hours.length,
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      label: 'Max Threat',
      value: maxThreatScore.toFixed(1),
      icon: BarChart3,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg border border-border p-4 ${card.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p className={`mt-2 text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                </div>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Severity Distribution */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Alerts by Severity
        </h3>

        <div className="space-y-3">
          {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((severity) => {
            const count = distribution[severity];
            const percentage =
              totalAlerts > 0
                ? Math.round((count / totalAlerts) * 100)
                : 0;

            const colors: Record<AlertSeverity, string> = {
              CRITICAL: 'bg-red-900 dark:bg-red-700',
              HIGH: 'bg-red-500 dark:bg-red-600',
              MEDIUM: 'bg-amber-500 dark:bg-amber-600',
              LOW: 'bg-green-500 dark:bg-green-600',
            };

            const labelColors: Record<AlertSeverity, string> = {
              CRITICAL: 'text-red-900 dark:text-red-300',
              HIGH: 'text-red-600 dark:text-red-400',
              MEDIUM: 'text-amber-600 dark:text-amber-400',
              LOW: 'text-green-600 dark:text-green-400',
            };

            return (
              <div key={severity}>
                <div className="mb-1 flex items-center justify-between">
                  <span className={`text-sm font-semibold ${labelColors[severity]}`}>
                    {severity} Severity
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full ${colors[severity]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert Type Distribution */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Alerts by Type
        </h3>

        <div className="space-y-2">
          {alerts.length > 0 ? (
            Object.entries(
              alerts.reduce(
                (acc, alert) => {
                  acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>
              )
            )
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const percentage = Math.round((count / totalAlerts) * 100);
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {type}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No alerts to display
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
