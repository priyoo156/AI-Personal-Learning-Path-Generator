import { useLocation } from 'react-router-dom';
import { Bell, Search, Moon, Sun, Menu } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const ROUTE_TITLES: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/generate': 'Generate Learning Path',
  '/app/roadmaps': 'My Roadmaps',
  '/app/scheduler': 'Roadmap Scheduler',
  '/app/calendar': 'Calendar',
  '/app/mentor': 'AI Study Mentor',
  '/app/notes': 'AI Notes',
  '/app/quizzes': 'Quizzes & Practice',
  '/app/resources': 'Learning Resources',
  '/app/progress': 'Progress Analytics',
  '/app/notifications': 'Notifications',
  '/app/settings': 'Settings',
};

export default function TopBar() {
  const location = useLocation();
  const { theme, setTheme, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const title = Object.entries(ROUTE_TITLES).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] ?? 'Pathora AI';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-20">
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
        {title === 'Dashboard' && user && (
          <p className="text-xs text-muted-foreground">
            {greeting()}, {user.full_name?.split(' ')[0] || 'Learner'} 👋
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-muted-foreground text-xs hover:bg-accent transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span>Search…</span>
          <kbd className="text-[10px] bg-muted px-1 rounded">⌘K</kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
        </button>
      </div>
    </header>
  );
}
