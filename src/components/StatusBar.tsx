import { EngineState, AlertSeverity } from '@/types/atm';
import { AlertCircle, Heart, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusBarProps {
  currentState: EngineState;
  threatScore: number;
  unreadCount: number;
  userRole: string;
}

export const StatusBar = ({
  currentState,
  threatScore,
  unreadCount,
  userRole,
}: StatusBarProps) => {
  const getStateColor = (state: EngineState) => {
    switch (state) {
      case 'SAFE':
        return { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', icon: Shield };
      case 'OBSERVING':
        return { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', icon: Zap };
      case 'SUSPICIOUS':
        return { bg: 'bg-yellow-100 dark:bg-yellow-950', text: 'text-yellow-700 dark:text-yellow-300', icon: AlertCircle };
      case 'CONFIRMED_INTRUSION':
        return { bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300', icon: AlertCircle };
      case 'CRITICAL_HAZARD':
        return { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-700 dark:text-red-300', icon: Heart };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-950', text: 'text-gray-700 dark:text-gray-300', icon: Shield };
    }
  };

  const getThreatStatus = (score: number): AlertSeverity | 'SAFE' => {
    if (score < 2) return 'SAFE';
    if (score < 4) return 'LOW';
    if (score < 6) return 'MEDIUM';
    if (score < 8) return 'HIGH';
    return 'CRITICAL';
  };

  const stateInfo = getStateColor(currentState);
  const StateIcon = stateInfo.icon;
  const threatStatus = getThreatStatus(threatScore);

  const threatColors: Record<string, string> = {
    SAFE: 'from-green-400 to-green-600',
    LOW: 'from-blue-400 to-blue-600',
    MEDIUM: 'from-yellow-400 to-yellow-600',
    HIGH: 'from-orange-400 to-orange-600',
    CRITICAL: 'from-red-400 to-red-600',
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      {/* Top Row - State and Role */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Current State */}
        <div className={`rounded-lg p-4 ${stateInfo.bg}`}>
          <div className="flex items-center gap-3">
            <StateIcon className={`h-5 w-5 ${stateInfo.text}`} />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                System State
              </p>
              <p className={`text-lg font-bold ${stateInfo.text}`}>
                {currentState.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* User Role */}
        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            User Role
          </p>
          <p className="text-lg font-bold capitalize text-foreground">
            {userRole.replace(/_/g, ' ')}
          </p>
        </div>

        {/* Unread Count */}
        {unreadCount > 0 && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-lg bg-orange-100 p-4 dark:bg-orange-950"
          >
            <p className="text-xs font-semibold uppercase text-orange-700 dark:text-orange-300">
              Unread Alerts
            </p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {unreadCount}
            </p>
          </motion.div>
        )}
      </div>

      {/* Threat Score Gauge */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Current Threat Level</p>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${threatStatus === 'SAFE' ? 'text-green-600 dark:text-green-400' : threatStatus === 'LOW' ? 'text-blue-600 dark:text-blue-400' : threatStatus === 'MEDIUM' ? 'text-yellow-600 dark:text-yellow-400' : threatStatus === 'HIGH' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
              {threatScore.toFixed(1)}/10
            </span>
            <span className={`text-xs font-semibold uppercase ${ threatStatus === 'SAFE' ? 'text-green-600 dark:text-green-400' : threatStatus === 'LOW' ? 'text-blue-600 dark:text-blue-400' : threatStatus === 'MEDIUM' ? 'text-yellow-600 dark:text-yellow-400' : threatStatus === 'HIGH' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
              {threatStatus}
            </span>
          </div>
        </div>

        {/* Threat Bar */}
        <div className="relative h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={`h-full bg-gradient-to-r ${threatColors[threatStatus]}`}
            initial={{ width: 0 }}
            animate={{ width: `${(threatScore / 10) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {threatScore >= 8 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Risk Indicators */}
        <div className="grid gap-2 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((level) => {
            const isActive = threatScore >= level * 2;
            const getLevelColor = (l: number) => {
              if (l <= 2) return 'bg-green-400 dark:bg-green-600';
              if (l <= 3) return 'bg-yellow-400 dark:bg-yellow-600';
              if (l <= 4) return 'bg-orange-400 dark:bg-orange-600';
              return 'bg-red-500 dark:bg-red-600';
            };

            return (
              <motion.div
                key={level}
                className={`h-1 rounded-full transition-all ${
                  isActive ? getLevelColor(level) : 'bg-muted'
                }`}
                animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.3 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            );
          })}
        </div>

        {/* Threat Text */}
        <p className="text-xs text-muted-foreground">
          {threatScore < 2 && 'System is operating normally. No immediate threats detected.'}
          {threatScore >= 2 && threatScore < 4 && 'Low threat level. Monitor for any unusual activity.'}
          {threatScore >= 4 && threatScore < 6 && 'Moderate threat level. Investigate alerts promptly.'}
          {threatScore >= 6 && threatScore < 8 && 'High threat level. Escalate to supervisor immediately.'}
          {threatScore >= 8 && 'Critical threat level. Emergency response required. Contact security immediately.'}
        </p>
      </div>
    </div>
  );
};
