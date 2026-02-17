import { ATMKit, TelemetryRecord, User, AuditLog, ATMState, Alert, AlertSeverity, AlertType, EngineState, SignalType } from '@/types/atm';

export const mockUsers: User[] = [
  {
    id: 'u1',
    username: 'operator1',
    email: 'operator1@example.com',
    role: 'operator',
    assignedATMs: ['ATM_001'],
    name: 'Shreya',
  },
  {
    id: 'u3',
    username: 'operator2',
    email: 'operator2@example.com',
    role: 'operator',
    assignedATMs: ['ATM_003'],
    name: 'Diya',
  },
  {
    id: 'u2',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    assignedATMs: ['ATM_001', 'ATM_003'],
    name: 'Madhura',
  },
  {
    id: 'u4',
    username: 'supervisor',
    email: 'supervisor@example.com',
    role: 'supervisor',
    assignedATMs: ['ATM_001', 'ATM_003'],
    name: 'Rajesh',
  },
  {
    id: 'u5',
    username: 'security',
    email: 'security@example.com',
    role: 'security_team',
    assignedATMs: ['ATM_001', 'ATM_003'],
    name: 'Vikram',
  },
];

export const mockATMs: ATMKit[] = [
  {
    id: '3',
    device_id: 'ATM_003',
    location: { city: 'Hyderabad', branch: 'Kompally', lat: 17.5410, lng: 78.4823 },
    nearestPoliceStation: { name: 'Kompally Police Station', phone: '+919490617229', distance: '0.8 km' },
    currentState: 'Normal',
    lastHeartbeat: new Date(Date.now() - 15000).toISOString(),
    buzzerEnabled: false,
  },
  {
    id: '1',
    device_id: 'ATM_001',
    location: { city: 'Hyderabad', branch: 'Banjara Hills', lat: 17.4156, lng: 78.4347 },
    nearestPoliceStation: { name: 'Banjara Hills PS', phone: '+914023550444', distance: '1.1 km' },
    currentState: 'Offline',
    lastHeartbeat: new Date(Date.now() - 300000).toISOString(),
    buzzerEnabled: false,
  },
];

const states: ATMState[] = ['Normal', 'Suspicious', 'Critical'];

function generateTelemetry(): TelemetryRecord[] {
  const records: TelemetryRecord[] = [];
  const now = Date.now();

  mockATMs.forEach((atm) => {
    for (let i = 0; i < 20; i++) {
      const state = i < 2 ? atm.currentState : states[Math.floor(Math.random() * 3)];
      const isCritical = state === 'Critical';
      const isSuspicious = state === 'Suspicious';

      records.push({
        id: `${atm.device_id}-${i}`,
        device_id: atm.device_id,
        timestamp: new Date(now - i * 300000).toISOString(),
        pir: isSuspicious || isCritical || Math.random() > 0.7,
        vibration: isCritical || Math.random() > 0.85,
        fire_model: isCritical && Math.random() > 0.5,
        cam_blocking: isCritical && Math.random() > 0.6,
        person_count: isCritical ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 2),
        state,
        buzzer_status: isCritical && i < 3,
      });
    }
  });

  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const mockTelemetry: TelemetryRecord[] = generateTelemetry();

export const mockAuditLogs: AuditLog[] = [
  { id: 'a1', userId: 'u1', userName: 'Shreya', action: 'Viewed ATM', target: 'ATM_001', timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: 'a4', userId: 'u2', userName: 'Diya', action: 'Login', target: 'System', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 'a5', userId: 'u2', userName: 'Diya', action: 'Viewed ATM', target: 'ATM_003', timestamp: new Date(Date.now() - 360000).toISOString() },
];

// Generate Mock Alerts
function generateMockAlerts(): Alert[] {
  const now = Date.now();
  const alerts: Alert[] = [
    // CRITICAL alerts
    {
      id: 'alrt_001',
      device_id: 'ATM_001',
      timestamp: new Date(now - 120000).toISOString(),
      severity: 'CRITICAL',
      alert_type: 'CAMERA_TAMPER',
      message: 'Camera tampering detected - Security breach risk',
      state: 'CRITICAL_HAZARD',
      threat_score: 9.5,
      signal_types: ['camera_tamper'],
      acknowledged: false,
    },
    {
      id: 'alrt_002',
      device_id: 'ATM_003',
      timestamp: new Date(now - 300000).toISOString(),
      severity: 'CRITICAL',
      alert_type: 'HUMAN_DETECTED',
      message: 'Unauthorized person detected inside ATM chamber',
      state: 'CRITICAL_HAZARD',
      threat_score: 9.8,
      signal_types: ['human_detected', 'motion'],
      acknowledged: false,
    },
    // HIGH alerts
    {
      id: 'alrt_003',
      device_id: 'ATM_001',
      timestamp: new Date(now - 600000).toISOString(),
      severity: 'HIGH',
      alert_type: 'VIBRATION',
      message: 'Suspicious vibration pattern - Potential forced entry',
      state: 'CONFIRMED_INTRUSION',
      threat_score: 7.8,
      signal_types: ['vibration'],
      acknowledged: true,
      acknowledged_by: 'u4',
      acknowledged_at: new Date(now - 400000).toISOString(),
    },
    {
      id: 'alrt_004',
      device_id: 'ATM_003',
      timestamp: new Date(now - 900000).toISOString(),
      severity: 'HIGH',
      alert_type: 'FIRE',
      message: 'Fire detected in ATM chamber - Emergency evacuation recommended',
      state: 'CRITICAL_HAZARD',
      threat_score: 8.9,
      signal_types: ['fire'],
      acknowledged: true,
      acknowledged_by: 'u5',
      acknowledged_at: new Date(now - 700000).toISOString(),
    },
    // MEDIUM alerts
    {
      id: 'alrt_005',
      device_id: 'ATM_001',
      timestamp: new Date(now - 1200000).toISOString(),
      severity: 'MEDIUM',
      alert_type: 'MOTION',
      message: 'Motion detected after hours - Normal movement expected',
      state: 'SUSPICIOUS',
      threat_score: 4.2,
      signal_types: ['motion'],
      acknowledged: true,
      acknowledged_by: 'u1',
      acknowledged_at: new Date(now - 1100000).toISOString(),
    },
    {
      id: 'alrt_006',
      device_id: 'ATM_003',
      timestamp: new Date(now - 1500000).toISOString(),
      severity: 'MEDIUM',
      alert_type: 'VIBRATION',
      message: 'Slight vibration detected - Verify maintenance activity',
      state: 'SUSPICIOUS',
      threat_score: 3.5,
      signal_types: ['vibration'],
      acknowledged: false,
    },
    // LOW alerts
    {
      id: 'alrt_007',
      device_id: 'ATM_001',
      timestamp: new Date(now - 1800000).toISOString(),
      severity: 'LOW',
      alert_type: 'MOTION',
      message: 'Minor motion detected - Likely environment sensor noise',
      state: 'OBSERVING',
      threat_score: 1.5,
      signal_types: ['motion'],
      acknowledged: false,
    },
    {
      id: 'alrt_008',
      device_id: 'ATM_003',
      timestamp: new Date(now - 2100000).toISOString(),
      severity: 'LOW',
      alert_type: 'UNKNOWN',
      message: 'Unidentified signal detected - Low confidence',
      state: 'OBSERVING',
      threat_score: 0.8,
      signal_types: [],
      acknowledged: true,
      acknowledged_by: 'u3',
      acknowledged_at: new Date(now - 2000000).toISOString(),
    },
  ];

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const mockAlerts: Alert[] = generateMockAlerts();
