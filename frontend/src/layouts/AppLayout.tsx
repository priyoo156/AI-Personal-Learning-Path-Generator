import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0 transition-all duration-300',
        sidebarCollapsed ? 'ml-0' : 'ml-0'
      )}>
        {/* Top bar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 overflow-auto scrollbar-thin">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
