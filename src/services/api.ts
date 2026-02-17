import { API_BASE_URL } from "@/config/api";
import {
  ATMKit,
  TelemetryRecord,
  AuditLog,
  Alert,
  DashboardResponse,
} from "@/types/atm";

/* =====================================================
   TOKEN MANAGEMENT
===================================================== */

const TOKEN_KEY = "atm_guard_token";

let accessToken: string | null =
  localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string | null) => {
  accessToken = token;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getToken = () => accessToken;

/* =====================================================
   API ERROR CLASS
===================================================== */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/* =====================================================
   BASE FETCH WRAPPER
===================================================== */

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 🔐 Auto logout if token expired
  if (response.status === 401) {
    setToken(null);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new ApiError(
      response.status,
      errorText || response.statusText
    );
  }

  return response.json();
}

/* =====================================================
   AUTH API
===================================================== */

export interface LoginResponse {
  access_token: string;
  token_type: string; // usually "bearer"
}

export const authApi = {
  login: async (
    username: string,
    password: string
  ): Promise<LoginResponse> => {
    const data = await apiFetch<LoginResponse>(
      "/api/login",
      {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    if (!data.access_token) {
      throw new Error("Invalid login response");
    }

    setToken(data.access_token);

    return data;
  },

  logout: () => {
    setToken(null);
  },
};

/* =====================================================
   ATM APIs
===================================================== */

/* Map raw DB row from `atms` table to ATMKit */
function mapAtmRow(row: any): ATMKit {
  const locationStr = row.location || '';
  const parts = locationStr.split(',').map((s: string) => s.trim());
  return {
    id: row.id,
    device_id: row.atm_id || row.device_id,
    currentState: row.status === 'online' ? 'Normal' : 'Offline',
    location: locationStr
      ? { city: parts.slice(1).join(', ') || parts[0], branch: parts[0] }
      : undefined,
    lastHeartbeat: row.last_heartbeat || row.lastHeartbeat,
    timestamp: row.created_at,
  };
}

export const atmApi = {
  getAll: async (): Promise<ATMKit[]> => {
    const rows = await apiFetch<any[]>("/api/atms");
    return rows.map(mapAtmRow);
  },

  getOne: async (deviceId: string): Promise<ATMKit> => {
    // Try single endpoint, fall back to filtering all
    try {
      const row = await apiFetch<any>(`/api/atms/${deviceId}`);
      if (Array.isArray(row)) {
        const match = row.find((r: any) => (r.atm_id || r.device_id) === deviceId);
        return mapAtmRow(match || row[0]);
      }
      return mapAtmRow(row);
    } catch {
      const all = await apiFetch<any[]>("/api/atms");
      const match = all.find((r: any) => (r.atm_id || r.device_id) === deviceId);
      if (!match) throw new ApiError(404, 'ATM not found');
      return mapAtmRow(match);
    }
  },
};

/* =====================================================
   TELEMETRY
===================================================== */

export const telemetryApi = {
  get: (deviceId?: string) => {
    const query = deviceId
      ? `?device_id=${deviceId}`
      : "";
    return apiFetch<TelemetryRecord[]>(
      `/api/telemetry${query}`
    );
  },
};

/* =====================================================
   ALERTS
===================================================== */

export const alertsApi = {
  // Get all alerts or filtered by device
  get: (deviceId?: string): Promise<Alert[]> => {
    const query = deviceId
      ? `?device_id=${deviceId}`
      : "";
    return apiFetch<Alert[]>(
      `/api/alerts${query}`
    );
  },

  // Get dashboard data for a specific role
  getDashboard: (role: string): Promise<DashboardResponse> => {
    return apiFetch<DashboardResponse>(
      `/api/dashboard/${role}`
    );
  },

  // Acknowledge an alert
  acknowledge: (alertId: string): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(
      `/api/alerts/${alertId}/acknowledge`,
      { method: "POST" }
    );
  },

  // Archive an alert
  archive: (alertId: string): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(
      `/api/alerts/${alertId}/archive`,
      { method: "POST" }
    );
  },
};

/* =====================================================
   BUZZER CONTROL
===================================================== */

export const buzzerApi = {
  trigger: (deviceId: string, status: boolean) =>
    apiFetch<{ success: boolean }>(
      status
        ? `/api/control/buzzer/${deviceId}`
        : `/api/control/buzzer/stop/${deviceId}`,
      { method: "POST" }
    ),
};

/* =====================================================
   ADMIN ACTIVITY
===================================================== */

export const activityApi = {
  get: () =>
    apiFetch<AuditLog[]>("/api/user-activity"),
};
