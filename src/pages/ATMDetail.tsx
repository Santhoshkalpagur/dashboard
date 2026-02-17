import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useATMDetail, useTelemetry } from "@/hooks/useApiData";
import { buzzerApi } from "@/services/api";
import { normalizeState } from "@/types/atm";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  AlertTriangle,
  Flame,
  Video,
  Vibrate,
  Shield,
  Loader2,
  Phone,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ATM_METADATA: Record<string, { lat: number; lng: number; police: { name: string; phone: string; distance: string } }> = {
  ATM_001: {
    lat: 17.4156, lng: 78.4347,
    police: { name: "Banjara Hills Police Station", phone: "04023354852", distance: "1.2 km" },
  },
  ATM_003: {
    lat: 17.5326, lng: 78.4871,
    police: { name: "Kompally Police Station", phone: "04027840100", distance: "0.8 km" },
  },
};

export const ATMDetail = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [buzzerOn, setBuzzerOn] = useState(false);
  const [buzzerLoading, setBuzzerLoading] = useState(false);

  const { data: atm, isLoading } = useATMDetail(deviceId || "");
  const { data: rawTelemetry } = useTelemetry(deviceId);

  /* ================================
     Derive State From Latest Telemetry
  ================================= */
  const normalizedAtm = useMemo(() => {
    if (!atm) return null;

    let latestState = atm.currentState;

    if (rawTelemetry && rawTelemetry.length > 0) {
      const latest = [...rawTelemetry]
        .filter((t: any) => t.device_id === deviceId)
        .sort(
          (a: any, b: any) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        )[0];

      if (latest?.state) {
        latestState = latest.state;
      }
    }

    return {
      ...atm,
      currentState: normalizeState(latestState),
    };
  }, [atm, rawTelemetry, deviceId]);

  /* ================================
     Access Control
  ================================= */
  const hasAccess =
    isAdmin ||
    !user?.assignedATMs?.length ||
    user.assignedATMs.includes(deviceId || "");

  /* ================================
     Telemetry List
  ================================= */
  const telemetry = useMemo(() => {
    if (!rawTelemetry) return [];

    return (rawTelemetry as any[])
      .filter((t) => t.device_id === deviceId)
      .map((t) => ({
        ...t,
        state: normalizeState(t.state),
      }))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      );
  }, [rawTelemetry, deviceId]);

  /* ================================
     Buzzer Handler
  ================================= */
  const handleBuzzer = async (status: boolean) => {
    if (!deviceId) return;

    setBuzzerLoading(true);
    try {
      await buzzerApi.trigger(deviceId, status);
      setBuzzerOn(status);
    } catch (e) {
      console.error("Buzzer trigger failed:", e);
    } finally {
      setBuzzerLoading(false);
    }
  };

  /* ================================
     Loading
  ================================= */
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  /* ================================
     Access Denied
  ================================= */
  if (!normalizedAtm || !hasAccess) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center flex-col gap-3">
          <Shield className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg">Access Denied</p>
        </div>
      </AppLayout>
    );
  }

  /* ================================
     Control Logic
  ================================= */
  const canControlBuzzer =
    normalizedAtm.currentState === "Suspicious" ||
    normalizedAtm.currentState === "Critical";

  const meta = ATM_METADATA[normalizedAtm.device_id];

  const handleCallPolice = async () => {
    if (meta?.police?.phone) {
      window.open(`tel:${meta.police.phone}`);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="rounded-lg border border-border p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>

          <div>
            <h1 className="font-mono text-2xl font-bold">
              {normalizedAtm.device_id}
            </h1>
            <StatusBadge state={normalizedAtm.currentState} />
          </div>
        </div>

        {/* ================================
           MAP & EMERGENCY CONTROLS
        ================================= */}
        {meta && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  ATM Location
                </h2>
              </div>
              <div className="h-64">
                <MapContainer
                  center={[meta.lat, meta.lng]}
                  zoom={15}
                  className="h-full w-full"
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[meta.lat, meta.lng]}>
                    <Popup>{normalizedAtm.device_id}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4 text-destructive" />
                Emergency Contact
              </h2>
              <div className="space-y-3 text-sm">
                <p><span className="text-muted-foreground">Station:</span> {meta.police.name}</p>
                <p><span className="text-muted-foreground">Phone:</span> {meta.police.phone}</p>
                <p><span className="text-muted-foreground">Distance:</span> {meta.police.distance}</p>
              </div>
              <button
                onClick={handleCallPolice}
                className="mt-4 flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition"
              >
                <Phone className="h-4 w-4" />
                Call Police
              </button>
            </div>
          </div>
        )}

        {/* ================================
           BUZZER CONTROL
        ================================= */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-status-suspicious" />
            Buzzer Control
          </h2>

          <div className="flex gap-3">
            <button
              disabled={!canControlBuzzer || buzzerLoading}
              onClick={() => handleBuzzer(true)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                canControlBuzzer
                  ? "border border-status-suspicious text-status-suspicious hover:bg-status-suspicious/10"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Volume2 className="h-4 w-4" />
              Activate Buzzer
            </button>

            <button
              disabled={!canControlBuzzer || buzzerLoading}
              onClick={() => handleBuzzer(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                canControlBuzzer
                  ? "border border-border hover:bg-muted"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <VolumeX className="h-4 w-4" />
              Stop Buzzer
            </button>
          </div>

          {!canControlBuzzer && (
            <p className="text-xs text-muted-foreground mt-3">
              Buzzer enabled only in Suspicious or Critical state.
            </p>
          )}
        </div>

        {/* ================================
           TELEMETRY TABLE
        ================================= */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-4 py-3 flex justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-suspicious" />
              Telemetry History
            </h2>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">State</th>
                <th className="px-4 py-2 text-left">Vibration</th>
                <th className="px-4 py-2 text-left">Fire</th>
                <th className="px-4 py-2 text-left">Camera</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.map((t) => (
                <tr key={t.id} className="border-b border-border/30">
                  <td className="px-4 py-2 text-xs font-mono">
                    {new Date(t.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge state={t.state} size="sm" />
                  </td>
                  <td className="px-4 py-2">
                    {t.vibration ? (
                      <Vibrate className="h-4 w-4 text-status-critical" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {t.fire_detected ? (
                      <Flame className="h-4 w-4 text-status-critical" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {t.camera_blocked ? (
                      <Video className="h-4 w-4 text-status-suspicious" />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}

              {telemetry.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No telemetry data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </AppLayout>
  );
};
