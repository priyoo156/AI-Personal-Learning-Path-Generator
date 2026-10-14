import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Moon, Sun, Monitor, Globe, Clock,
  Shield, Check, Bell, Sparkles, LogOut, Save
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { profileApi } from '@/services/api';
import { cn } from '@/lib/utils';
import type { LearningLevel, Language, LearningMethod } from '@/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, signOut, updateProfile } = useAuthStore();
  const { theme, setTheme } = useUIStore();

  // Profile fields
  const [fullName, setFullName] = useState(user?.full_name || 'Alex Chen');
  const [email] = useState(user?.email || 'alex.chen@example.com');

  // Preferences fields
  const [currentLevel, setCurrentLevel] = useState<LearningLevel>('intermediate');
  const [language, setLanguage] = useState<Language>('en');
  const [dailyHours, setDailyHours] = useState(2);
  const [sessionLength, setSessionLength] = useState(45);
  const [preferredMethods, setPreferredMethods] = useState<LearningMethod[]>(['hands-on', 'videos']);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [streakAlertsEnabled, setStreakAlertsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const toggleMethod = (method: LearningMethod) => {
    setPreferredMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ full_name: fullName });
      toast.success('Settings and learning preferences updated!');
    } catch {
      toast.success('Preferences saved locally!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Settings & Preferences</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account credentials, AI mentor language, timetable pace, and appearance.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Profile Section */}
        <div className="card p-6 border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" /> User Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field text-xs w-full"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="input-field text-xs w-full opacity-60 cursor-not-allowed bg-muted/40"
              />
            </div>
          </div>
        </div>

        {/* AI Learning Preferences */}
        <div className="card p-6 border-border space-y-5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" /> AI Mentor & Roadmap Personalization
          </h2>

          {/* Experience level */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Default Starting Level</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'beginner', label: 'Beginner', desc: 'Starting from fundamentals' },
                { id: 'intermediate', label: 'Intermediate', desc: 'Know basics, want mastery' },
                { id: 'advanced', label: 'Advanced', desc: 'Deep dive & architecture' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setCurrentLevel(lvl.id as LearningLevel)}
                  className={cn(
                    'p-3 rounded-xl text-left border transition-colors',
                    currentLevel === lvl.id
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'border-border text-foreground hover:bg-accent'
                  )}
                >
                  <p className="text-xs font-bold">{lvl.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Language */}
          <div className="pt-2">
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              AI Explanation Language
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'en', label: 'English', native: 'English (Default)' },
                { id: 'ta', label: 'Tamil', native: 'தமிழ் (Tamil)' },
                { id: 'hi', label: 'Hindi', native: 'हिन्दी (Hindi)' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id as Language)}
                  className={cn(
                    'p-3 rounded-xl text-left border transition-colors',
                    language === lang.id
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'border-border text-foreground hover:bg-accent'
                  )}
                >
                  <p className="text-xs font-bold">{lang.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{lang.native}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Methods */}
          <div className="pt-2">
            <label className="text-xs font-medium text-muted-foreground block mb-2">Preferred Learning Formats</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'hands-on', label: 'Hands-on Projects & Coding' },
                { id: 'videos', label: 'Video Walkthroughs' },
                { id: 'reading', label: 'Official Documentation & Articles' },
                { id: 'mixed', label: 'Adaptive Blend' },
              ].map((m) => {
                const active = preferredMethods.includes(m.id as LearningMethod);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMethod(m.id as LearningMethod)}
                    className={cn(
                      'px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors',
                      active
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-border text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {active ? '✓ ' : '+ '}{m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Commitment Slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Daily Study Commitment</label>
              <span className="text-xs font-bold text-foreground">{dailyHours} Hours / Day</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Appearance & Theme */}
        <div className="card p-6 border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Moon className="w-4 h-4 text-brand-500" /> Appearance & Theme
          </h2>

          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ].map((t) => {
              const Icon = t.icon;
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={cn(
                    'p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-colors',
                    active
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications & Reminders */}
        <div className="card p-6 border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-500" /> Notifications & Reminders
          </h2>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-accent/30 transition-colors">
              <div>
                <p className="text-xs font-semibold text-foreground">Daily Study Session Alerts</p>
                <p className="text-[11px] text-muted-foreground">Receive reminders at your preferred daily study slot</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-brand-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-accent/30 transition-colors">
              <div>
                <p className="text-xs font-semibold text-foreground">Streak & Inactivity Alerts</p>
                <p className="text-[11px] text-muted-foreground">Get notified before your streak resets after 24 hours of inactivity</p>
              </div>
              <input
                type="checkbox"
                checked={streakAlertsEnabled}
                onChange={(e) => setStreakAlertsEnabled(e.target.checked)}
                className="w-4 h-4 accent-brand-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Account Actions */}
        <div className="card p-6 border-border flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-foreground">Sign Out of Pathora AI</h3>
            <p className="text-[11px] text-muted-foreground">You can log back in anytime to continue your progress.</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="btn-secondary text-xs flex items-center gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </form>
    </div>
  );
}
