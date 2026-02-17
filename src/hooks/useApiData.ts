import { useQuery } from '@tanstack/react-query';
import { atmApi, telemetryApi, alertsApi, activityApi } from '@/services/api';
import { POLLING_INTERVAL } from '@/config/api';

/* =====================================================
   COMMON QUERY OPTIONS
===================================================== */

const baseOptions = {
  refetchInterval: POLLING_INTERVAL,
  refetchOnWindowFocus: true,
  staleTime: 0, // always consider data stale
  placeholderData: (prev: any) => prev,
};

/* =====================================================
   ATMs
===================================================== */

export const useATMs = () =>
  useQuery({
    queryKey: ['atms'],
    queryFn: atmApi.getAll,
    ...baseOptions,
  });

/* =====================================================
   ATM DETAIL
===================================================== */

export const useATMDetail = (deviceId: string) =>
  useQuery({
    queryKey: ['atm', deviceId],
    queryFn: () => atmApi.getOne(deviceId),
    enabled: !!deviceId,
    ...baseOptions,
  });

/* =====================================================
   TELEMETRY (Raw stream)
===================================================== */

export const useTelemetry = (deviceId?: string) =>
  useQuery({
    queryKey: ['telemetry', deviceId],
    queryFn: () => telemetryApi.get(deviceId),
    enabled: true,
    refetchInterval: POLLING_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: 0,
    placeholderData: (prev: any) => prev,
  });

/* =====================================================
   ALERTS (Important for dashboard state)
===================================================== */

export const useAlerts = (deviceId?: string) =>
  useQuery({
    queryKey: ['alerts', deviceId],
    queryFn: () => alertsApi.get(deviceId),
    enabled: true,
    refetchInterval: POLLING_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: 0,
    placeholderData: (prev: any) => prev,
  });

/* =====================================================
   ADMIN ACTIVITY
===================================================== */

export const useActivityLogs = () =>
  useQuery({
    queryKey: ['activity-logs'],
    queryFn: activityApi.get,
    refetchInterval: POLLING_INTERVAL * 2, // less aggressive
    refetchOnWindowFocus: true,
    staleTime: 0,
    placeholderData: (prev: any) => prev,
  });
