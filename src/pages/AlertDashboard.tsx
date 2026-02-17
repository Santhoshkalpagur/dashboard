import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/hooks/useApiData';
import { AppLayout } from '@/components/AppLayout';
import { AlertCard } from '@/components/AlertCard';
import { AlertStats } from '@/components/AlertStats';
import { StatusBar } from '@/components/StatusBar';
import { AlertFilters } from '@/components/AlertFilters';
import { Alert, AlertSeverity, AlertType } from '@/types/atm';
import { mockAlerts } from '@/data/mockData';
import {
  filterAlertsByRole,
  filterAlertsByStatus,
  sortAlerts,
  getUnacknowledgedCount,
} from '@/lib/alert-utils';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const AlertDashboard = () => {
  // Auth & Data
  const { user } = useAuth();
  const { data: apiAlerts, isLoading } = useAlerts();

  // Use mock alerts for demo, fallback to API
  const allAlerts = useMemo(
    () => (apiAlerts && apiAlerts.length > 0 ? apiAlerts : mockAlerts),
    [apiAlerts]
  );

  // Role-based filtering
  const roleFilteredAlerts = useMemo(
    () => filterAlertsByRole(allAlerts, user?.role || 'operator'),
    [allAlerts, user?.role]
  );

  // Filter and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'oldest' | 'severity'>('newest');
  const [selectedType, setSelectedType] = useState<AlertType | 'ALL'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Apply all filters
  const filteredAlerts = useMemo(() => {
    let result = roleFilteredAlerts;

    // Severity filter
    if (selectedSeverity !== 'ALL') {
      const severityLevels: Record<AlertSeverity, AlertSeverity[]> = {
        LOW: ['LOW'],
        MEDIUM: ['MEDIUM', 'LOW'],
        HIGH: ['HIGH', 'MEDIUM', 'LOW'],
        CRITICAL: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      };
      const visibleSeverities = severityLevels[selectedSeverity as AlertSeverity];
      result = result.filter((a) => visibleSeverities.includes(a.severity));
    }

    // Status filter
    result = filterAlertsByStatus(result, selectedStatus);

    // Type filter
    if (selectedType !== 'ALL') {
      result = result.filter((a) => a.alert_type === selectedType);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.message.toLowerCase().includes(query) ||
          a.device_id.toLowerCase().includes(query) ||
          a.alert_type.toLowerCase().includes(query)
      );
    }

    // Sort
    return sortAlerts(result, selectedSort);
  }, [
    roleFilteredAlerts,
    selectedSeverity,
    selectedStatus,
    selectedSort,
    selectedType,
    searchQuery,
  ]);

  // Calculate stats
  const unreadCount = useMemo(
    () => getUnacknowledgedCount(filteredAlerts),
    [filteredAlerts]
  );

  const currentThreatScore = useMemo(() => {
    if (filteredAlerts.length === 0) return 0;
    const avg =
      filteredAlerts.reduce((sum, a) => sum + a.threat_score, 0) /
      filteredAlerts.length;
    return parseFloat(avg.toFixed(1));
  }, [filteredAlerts]);

  const currentEngineState = useMemo(() => {
    if (currentThreatScore >= 8) return 'CRITICAL_HAZARD' as const;
    if (currentThreatScore >= 6) return 'CONFIRMED_INTRUSION' as const;
    if (currentThreatScore >= 4) return 'SUSPICIOUS' as const;
    if (currentThreatScore > 0) return 'OBSERVING' as const;
    return 'SAFE' as const;
  }, [currentThreatScore]);

  // Audio alert for CRITICAL
  useEffect(() => {
    const newCriticalAlerts = filteredAlerts.filter(
      (a) => a.severity === 'CRITICAL' && !a.acknowledged
    );

    if (newCriticalAlerts.length > 0 && soundEnabled) {
      // Play notification sound
      const audio = new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj=='
      );
      audio.play().catch(() => {
        // Fallback: toast notification
        toast.error('🚨 CRITICAL Alert!', {
          description: newCriticalAlerts[0]?.message,
          duration: 5000,
        });
      });
    }
  }, [filteredAlerts, soundEnabled]);

  // Handle acknowledge
  const handleAcknowledge = useCallback((alertId: string) => {
    // Implement API call here
    console.log('Acknowledged alert:', alertId);
    toast.success('Alert acknowledged');
  }, []);

  // Handle archive
  const handleArchive = useCallback((alertId: string) => {
    // Implement API call here
    console.log('Archived alert:', alertId);
    toast.success('Alert archived');
  }, []);

  // Loading state
  if (isLoading && allAlerts.length === 0) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Alert Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Role-based alert management and monitoring system
          </p>
        </div>

        {/* Status Bar */}
        <StatusBar
          currentState={currentEngineState}
          threatScore={currentThreatScore}
          unreadCount={unreadCount}
          userRole={user?.role || 'operator'}
        />

        {/* Alert Controls */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">
            Showing {filteredAlerts.length} of {roleFilteredAlerts.length} alerts
          </p>
          <Button
            variant={soundEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-2"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                Sound On
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                Sound Off
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <AlertFilters
          onSearchChange={setSearchQuery}
          onSeverityChange={setSelectedSeverity}
          onStatusChange={setSelectedStatus}
          onSortChange={setSelectedSort}
          onTypeChange={setSelectedType}
          searchQuery={searchQuery}
          selectedSeverity={selectedSeverity}
          selectedStatus={selectedStatus}
          selectedSort={selectedSort}
          selectedType={selectedType}
        />

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Alerts List */}
          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground">
              Active Alerts
            </h2>

            {filteredAlerts.length > 0 ? (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={handleAcknowledge}
                      onArchive={handleArchive}
                    />
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border border-dashed bg-card p-8 text-center"
              >
                <p className="text-lg font-semibold text-foreground">
                  No alerts to display
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || selectedSeverity !== 'ALL' || selectedStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Your system is operating normally'}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right: Statistics */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Statistics
            </h2>
            <AlertStats alerts={filteredAlerts} unreadCount={unreadCount} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
