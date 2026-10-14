import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';

// Public pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// App pages
import DashboardPage from '@/pages/app/DashboardPage';
import GenerateRoadmapPage from '@/pages/app/GenerateRoadmapPage';
import RoadmapsPage from '@/pages/app/RoadmapsPage';
import RoadmapDetailPage from '@/pages/app/RoadmapDetailPage';
import SchedulerPage from '@/pages/app/SchedulerPage';
import CalendarPage from '@/pages/app/CalendarPage';
import AIMentorPage from '@/pages/app/AIMentorPage';
import NotesPage from '@/pages/app/NotesPage';
import QuizzesPage from '@/pages/app/QuizzesPage';
import ResourcesPage from '@/pages/app/ResourcesPage';
import ProgressPage from '@/pages/app/ProgressPage';
import NotificationsPage from '@/pages/app/NotificationsPage';
import SettingsPage from '@/pages/app/SettingsPage';
import OnboardingPage from '@/pages/app/OnboardingPage';

// Guards
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function App() {
  const { initialize, isLoading } = useAuthStore();
  const { theme } = useUIStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Onboarding (authenticated but not in main layout) */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* Protected app routes */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/dashboard" element={<DashboardPage />} />
        <Route path="/app/generate" element={<GenerateRoadmapPage />} />
        <Route path="/app/roadmaps" element={<RoadmapsPage />} />
        <Route path="/app/roadmaps/:id" element={<RoadmapDetailPage />} />
        <Route path="/app/scheduler" element={<SchedulerPage />} />
        <Route path="/app/scheduler/:roadmapId" element={<SchedulerPage />} />
        <Route path="/app/calendar" element={<CalendarPage />} />
        <Route path="/app/mentor" element={<AIMentorPage />} />
        <Route path="/app/mentor/:sessionId" element={<AIMentorPage />} />
        <Route path="/app/notes" element={<NotesPage />} />
        <Route path="/app/quizzes" element={<QuizzesPage />} />
        <Route path="/app/resources" element={<ResourcesPage />} />
        <Route path="/app/progress" element={<ProgressPage />} />
        <Route path="/app/notifications" element={<NotificationsPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
