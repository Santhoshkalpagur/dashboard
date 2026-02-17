import { AppLayout } from '@/components/AppLayout';
import { mockUsers, mockATMs } from '@/data/mockData';
import { Users, Shield, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const UserManagement = () => {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage operators and ATM assignments</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {mockUsers.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{u.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">@{u.username}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
                  <Shield className="h-3 w-3" />
                  {u.role}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Assigned ATMs</p>
                <div className="flex flex-wrap gap-2">
                  {u.assignedATMs.map((atmId) => {
                    const atm = mockATMs.find((a) => a.device_id === atmId);
                    return (
                      <span
                        key={atmId}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs text-foreground"
                      >
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {atmId}
                        {atm && <span className="text-muted-foreground">({atm.location.city})</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};
