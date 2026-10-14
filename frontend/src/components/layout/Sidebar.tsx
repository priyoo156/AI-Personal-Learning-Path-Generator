import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sparkles, Map, Calendar, CalendarDays,
  MessageCircle, FileText, BookOpen, Library, BarChart3,
  Bell, Settings, ChevronLeft, ChevronRight, LogOut, User
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
  { id: 'generate', label: 'Generate Path', icon: Sparkles, path: '/app/generate' },
  { id: 'roadmaps', label: 'My Roadmaps', icon: Map, path: '/app/roadmaps' },
  { id: 'scheduler', label: 'Scheduler', icon: Calendar, path: '/app/scheduler' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, path: '/app/calendar' },
  { id: 'mentor', label: 'AI Mentor', icon: MessageCircle, path: '/app/mentor' },
  { id: 'notes', label: 'AI Notes', icon: FileText, path: '/app/notes' },
  { id: 'quizzes', label: 'Quizzes', icon: BookOpen, path: '/app/quizzes' },
  { id: 'resources', label: 'Resources', icon: Library, path: '/app/resources' },
  { id: 'progress', label: 'Progress', icon: BarChart3, path: '/app/progress' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/app/notifications' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/app/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebarCollapsed, sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, signOut } = useAuthStore();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 lg:relative lg:inset-auto lg:h-full',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        )}
        initial={false}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-border flex-shrink-0 px-4',
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        )}>
          <Link to="/app/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg gradient-brand flex-shrink-0 flex items-center justify-center shadow glow-brand-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L4 20 12 16 20 20 12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  className="font-display font-bold gradient-text text-sm whitespace-nowrap overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Pathora AI
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
                  sidebarCollapsed ? 'justify-center' : '',
                  active
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-800/30'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  active ? 'text-brand-600 dark:text-brand-400' : 'group-hover:text-foreground'
                )} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      className="whitespace-nowrap overflow-hidden"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r"
                    layoutId="activeIndicator"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border px-2 py-3 space-y-0.5">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
                  sidebarCollapsed ? 'justify-center' : '',
                  active ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* User section */}
          <div className={cn(
            'flex items-center rounded-xl px-3 py-2.5 gap-3 mt-1',
            sidebarCollapsed ? 'justify-center' : ''
          )}>
            <div className="w-7 h-7 rounded-full gradient-brand flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name?.charAt(0) ?? user?.email?.charAt(0) ?? <User className="w-3.5 h-3.5" />}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-xs font-medium truncate text-foreground">
                    {user?.full_name || 'Learner'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!sidebarCollapsed && (
              <button
                onClick={signOut}
                className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebarCollapsed}
          className="absolute -right-3 top-20 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-accent lg:flex"
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-3 h-3 text-muted-foreground" />
            : <ChevronLeft className="w-3 h-3 text-muted-foreground" />
          }
        </button>
      </motion.aside>
    </>
  );
}
