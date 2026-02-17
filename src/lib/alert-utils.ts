import { Alert, AlertSeverity, UserRole } from '@/types/atm';

/**
 * Severity Color Mapping
 */
export const severityColorMap: Record<AlertSeverity, string> = {
  LOW: '#10B981', // Green
  MEDIUM: '#F59E0B', // Amber
  HIGH: '#EF4444', // Red
  CRITICAL: '#991B1B', // Dark Red
};

export const severityBgMap: Record<AlertSeverity, string> = {
  LOW: 'bg-green-50 dark:bg-green-950',
  MEDIUM: 'bg-amber-50 dark:bg-amber-950',
  HIGH: 'bg-red-50 dark:bg-red-950',
  CRITICAL: 'bg-red-100 dark:bg-red-900',
};

export const severityBadgeMap: Record<AlertSeverity, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  HIGH: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  CRITICAL: 'bg-red-900 text-red-100 dark:bg-red-700 dark:text-red-100',
};

export const severityBorderMap: Record<AlertSeverity, string> = {
  LOW: 'border-green-200 dark:border-green-800',
  MEDIUM: 'border-amber-200 dark:border-amber-800',
  HIGH: 'border-red-200 dark:border-red-800',
  CRITICAL: 'border-red-600 dark:border-red-500',
};

export const severityTextMap: Record<AlertSeverity, string> = {
  LOW: 'text-green-700 dark:text-green-300',
  MEDIUM: 'text-amber-700 dark:text-amber-300',
  HIGH: 'text-red-700 dark:text-red-300',
  CRITICAL: 'text-red-900 dark:text-red-100',
};

/**
 * Get severity label
 */
export function getSeverityLabel(severity: AlertSeverity): string {
  const labels: Record<AlertSeverity, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };
  return labels[severity];
}

/**
 * Get severity order (for sorting)
 */
export function getSeverityOrder(severity: AlertSeverity): number {
  const order: Record<AlertSeverity, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };
  return order[severity];
}

/**
 * Filter alerts by severity for user role
 */
export function filterAlertsByRole(alerts: Alert[], userRole: UserRole): Alert[] {
  const roleSeverityMap: Record<UserRole, AlertSeverity[]> = {
    operator: ['LOW', 'MEDIUM'],
    user: ['LOW', 'MEDIUM'],
    supervisor: ['MEDIUM', 'HIGH'],
    security_team: ['HIGH', 'CRITICAL'],
    admin: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  };

  const visibleSeverities = roleSeverityMap[userRole] || ['LOW', 'MEDIUM'];
  return alerts.filter((alert) => visibleSeverities.includes(alert.severity));
}

/**
 * Sort alerts by severity and timestamp
 */
export function sortAlerts(alerts: Alert[], sortBy: 'newest' | 'oldest' | 'severity' = 'newest'): Alert[] {
  const sorted = [...alerts];

  if (sortBy === 'newest') {
    return sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  if (sortBy === 'oldest') {
    return sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  if (sortBy === 'severity') {
    return sorted.sort((a, b) => getSeverityOrder(a.severity) - getSeverityOrder(b.severity));
  }

  return sorted;
}

/**
 * Filter alerts by status
 */
export function filterAlertsByStatus(alerts: Alert[], status: 'all' | 'unacknowledged' | 'acknowledged'): Alert[] {
  if (status === 'all') return alerts;
  if (status === 'unacknowledged') return alerts.filter((a) => !a.acknowledged);
  if (status === 'acknowledged') return alerts.filter((a) => a.acknowledged);
  return alerts;
}

/**
 * Get severity count distribution
 */
export function getSeverityDistribution(alerts: Alert[]): Record<AlertSeverity, number> {
  const distribution: Record<AlertSeverity, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  alerts.forEach((alert) => {
    distribution[alert.severity]++;
  });

  return distribution;
}

/**
 * Get unacknowledged count
 */
export function getUnacknowledgedCount(alerts: Alert[]): number {
  return alerts.filter((a) => !a.acknowledged).length;
}

/**
 * Format timestamp
 */
export function formatTimestamp(timestamp: string | number): string {
  const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get threat score color
 */
export function getThreatScoreColor(score: number): string {
  if (score >= 8) return 'text-red-600 dark:text-red-400';
  if (score >= 6) return 'text-orange-600 dark:text-orange-400';
  if (score >= 4) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

/**
 * Get thread score background
 */
export function getThreatScoreBg(score: number): string {
  if (score >= 8) return 'bg-red-100 dark:bg-red-900';
  if (score >= 6) return 'bg-orange-100 dark:bg-orange-900';
  if (score >= 4) return 'bg-yellow-100 dark:bg-yellow-900';
  return 'bg-green-100 dark:bg-green-900';
}

/**
 * Should play sound alert?
 */
export function shouldPlaySound(severity: AlertSeverity): boolean {
  return severity === 'CRITICAL' || severity === 'HIGH';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    admin: 'Administrator',
    operator: 'Operator',
    user: 'User',
    supervisor: 'Supervisor',
    security_team: 'Security Team',
  };
  return names[role] || role;
}
