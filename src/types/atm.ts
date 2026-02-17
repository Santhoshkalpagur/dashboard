export type ATMState = 'Normal' | 'Suspicious' | 'Critical' | 'Offline';

export interface TelemetryRecord {
  id: string | number;
  device_id: string;
  timestamp: string | number;
  pir: boolean | number;
  vibration: boolean | number;
  fire_model: boolean;
  cam_blocking: boolean;
  person_count: number;
  state: ATMState;
  buzzer_status: boolean;
}

export interface ATMKit {
  id?: string | number;
  device_id: string;
  state?: string;
  currentState: ATMState;
  timestamp?: string | number;
  person_count?: number;
  fire_detected?: boolean;
  camera_blocked?: boolean;
  location?: {
    city: string;
    branch: string;
    lat?: number;
    lng?: number;
  };
  nearestPoliceStation?: {
    name: string;
    phone: string;
    distance: string;
  };
  lastHeartbeat?: string;
  buzzerEnabled?: boolean;
}

export type UserRole = 'admin' | 'user' | 'operator' | 'supervisor' | 'security_team';

// Alert Severity Levels
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Alert Types
export type AlertType = 'MOTION' | 'VIBRATION' | 'FIRE' | 'CAMERA_TAMPER' | 'HUMAN_DETECTED' | 'UNKNOWN';

// Engine States
export type EngineState = 'OBSERVING' | 'SUSPICIOUS' | 'CONFIRMED_INTRUSION' | 'CRITICAL_HAZARD' | 'SAFE';

// Signal Types
export type SignalType = 'motion' | 'vibration' | 'fire' | 'camera_tamper' | 'human_detected';

// Alert Record
export interface Alert {
  id: string;
  device_id: string;
  timestamp: string | number;
  severity: AlertSeverity;
  alert_type: AlertType;
  message: string;
  state: EngineState;
  threat_score: number; // 0-10
  signal_types: SignalType[];
  acknowledged?: boolean;
  archived?: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string | number;
}

// Dashboard Response
export interface DashboardResponse {
  visible_alerts: Alert[];
  current_engine_state: EngineState;
  current_threat_score: number;
  system_stats: {
    total_alerts: number;
    severity_distribution: Record<AlertSeverity, number>;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  assignedATMs: string[];
  name: string;
}

export interface AuditLog {
  id: string | number;
  user_id?: string;
  userId?: string;
  userName?: string;
  action: string;
  device_id?: string;
  target?: string;
  timestamp: string | number;
}

// Alert visibility based on user role
export function getVisibleAlerts(alerts: Alert[], userRole: UserRole): Alert[] {
  if (userRole === 'admin') return alerts;
  
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

// Normalize state strings (API may return uppercase)
export function normalizeState(state: string): 'Normal' | 'Suspicious' | 'Critical' | 'Offline' {
  const lower = state?.toLowerCase() || 'offline';
  if (lower === 'normal' || lower === 'safe') return 'Normal';
  if (lower.includes('suspicious') || lower.includes('intrusion')) return 'Suspicious';
  if (lower.includes('critical') || lower.includes('hazard')) return 'Critical';
  return 'Offline';
}
