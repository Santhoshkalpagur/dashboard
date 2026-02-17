import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  ClipboardList,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Alert Dashboard', path: '/alert-dashboard', icon: AlertTriangle },
  { label: 'Alert Console', path: '/alerts', icon: AlertTriangle },
  { label: 'User Management', path: '/users', icon: Users, adminOnly: true },
  { label: 'Activity Logs', path: '/logs', icon: ClipboardList, adminOnly: true },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-sidebar transition-all duration-300',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <Shield className="h-7 w-7 shrink-0 text-primary" />
          {!collapsed && (
            <span className="font-mono text-sm font-bold tracking-wider text-foreground">
              ATM GUARD
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-2 mt-2">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && item.label}
                </button>
              );
            })}
        </nav>

        {/* User + Collapse */}
        <div className="border-t border-border p-3">
          {!collapsed && (
            <div className="mb-2 rounded-md bg-muted p-2.5">
              <p className="text-xs font-semibold text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && 'Logout'}
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
