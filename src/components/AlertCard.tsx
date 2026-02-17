import { Alert, AlertSeverity } from '@/types/atm';
import {
  severityBadgeMap,
  severityBorderMap,
  severityTextMap,
  getThreatScoreBg,
  getThreatScoreColor,
  formatTimestamp,
  getSeverityLabel,
} from '@/lib/alert-utils';
import { AlertCircle, Archive, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (alertId: string) => void;
  onArchive?: (alertId: string) => void;
  isLoading?: boolean;
}

export const AlertCard = ({
  alert,
  onAcknowledge,
  onArchive,
  isLoading,
}: AlertCardProps) => {
  const isCritical = alert.severity === 'CRITICAL';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        rounded-lg border p-4 transition-all duration-300
        ${severityBorderMap[alert.severity]}
        ${!alert.acknowledged ? `bg-card shadow-md hover:shadow-lg` : 'bg-muted/30'}
      `}
    >
      {/* Animation overlay for critical alerts */}
      {isCritical && !alert.acknowledged && (
        <div className="absolute inset-0 rounded-lg border-2 border-red-600 dark:border-red-500 animate-pulse" />
      )}

      <div className="space-y-3">
        {/* Header Row - Severity + Type + Time */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`
                  font-semibold uppercase tracking-wider text-xs
                  ${severityBadgeMap[alert.severity]}
                  ${isCritical && 'animate-pulse'}
                `}
              >
                {getSeverityLabel(alert.severity)}
              </Badge>

              <Badge variant="outline" className="text-xs font-mono">
                {alert.alert_type}
              </Badge>
            </div>

            {/* Message */}
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {alert.message}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex flex-shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
            <time className="font-mono">{formatTimestamp(alert.timestamp)}</time>
          </div>
        </div>

        {/* Threat Score + State */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {/* Threat Score */}
          <div className={`rounded px-3 py-2 ${getThreatScoreBg(alert.threat_score)}`}>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Threat
            </p>
            <p className={`text-lg font-bold ${getThreatScoreColor(alert.threat_score)}`}>
              {alert.threat_score.toFixed(1)}/10
            </p>
          </div>

          {/* Engine State */}
          <div className="rounded bg-muted px-3 py-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              State
            </p>
            <p
              className={`text-sm font-mono font-semibold ${severityTextMap[alert.severity]}`}
            >
              {alert.state}
            </p>
          </div>

          {/* Signals */}
          <div className="rounded bg-muted px-3 py-2 md:col-span-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Signals
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {alert.signal_types.length > 0 ? (
                alert.signal_types.map((signal) => (
                  <Badge
                    key={signal}
                    variant="secondary"
                    className="text-xs font-mono capitalize"
                  >
                    {signal}
                  </Badge>
                ))
              ) : (
                <span className="text-xs italic text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Acknowledgement Info */}
        {alert.acknowledged && alert.acknowledged_at && (
          <div className="flex items-center gap-2 rounded bg-green-50 px-3 py-2 text-xs text-green-700 dark:bg-green-950 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>
              Acknowledged{alert.acknowledged_by && ` by user ${alert.acknowledged_by}`}
              {' • '}
              {formatTimestamp(alert.acknowledged_at)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!alert.acknowledged && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onAcknowledge?.(alert.id)}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Acknowledge
            </Button>
          )}

          {!alert.archived && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onArchive?.(alert.id)}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          )}

          {!alert.acknowledged && !onAcknowledge && (
            <Button
              size="sm"
              variant="ghost"
              disabled
              className="flex-1"
            >
              <AlertCircle className="h-4 w-4" />
              No Action Available
            </Button>
          )}
        </div>

        {/* Device ID */}
        <div className="border-t border-border pt-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Device:</span>{' '}
            <span className="font-mono">{alert.device_id}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};
