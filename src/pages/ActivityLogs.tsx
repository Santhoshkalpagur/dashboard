import { AppLayout } from '@/components/AppLayout';
import { useActivityLogs } from '@/hooks/useApiData';
import { ClipboardList, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ActivityLogs = () => {
  const { data: logs, isLoading } = useActivityLogs();

  // 🔥 Mock logs for demo
  const mockLogs = [
    {
      id: 1,
      timestamp: Date.now(),
      userName: 'Shreya',
      action: 'Logged In',
      target: 'System'
    },
    {
      id: 2,
      timestamp: Date.now() - 1000 * 60 * 5,
      userName: 'Diya',
      action: 'Called Police',
      target: 'ATM_003'
    },
    {
      id: 3,
      timestamp: Date.now() - 1000 * 60 * 10,
      userName: 'Shreya',
      action: 'Used Emergency Buzzer',
      target: 'ATM_001'
    },
    {
      id: 4,
      timestamp: Date.now() - 1000 * 60 * 20,
      userName: 'Admin',
      action: 'Updated ATM Location',
      target: 'ATM_003'
    },
    {
      id: 5,
      timestamp: Date.now() - 1000 * 60 * 30,
      userName: 'Security Guard',
      action: 'Acknowledged Alert',
      target: 'ATM_002'
    }
  ];

  const displayLogs = logs && (logs as any[]).length > 0 ? (logs as any[]) : mockLogs;

  if (isLoading) {
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
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Activity Logs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit trail of all user actions
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Target
                </th>
              </tr>
            </thead>
            <tbody>
              {displayLogs.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {new Date(
                      typeof log.timestamp === 'number'
                        ? log.timestamp
                        : log.timestamp
                    ).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {log.userName || log.user_id || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">
                    {log.target || log.device_id || '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};
