import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCircle2, Clock, Sparkles, Flame, BookOpen,
  Calendar, Check, Trash2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NotificationItem {
  id: string;
  type: 'reminder' | 'streak' | 'ai_nudge' | 'quiz';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'streak',
    title: '5-Day Study Streak Active! 🔥',
    message: 'You have logged study sessions for 5 consecutive days. Complete today\'s 45-minute task to hit 6 days.',
    time: '2 hours ago',
    read: false,
    actionUrl: '/app/scheduler',
    actionText: 'View Today\'s Task',
  },
  {
    id: 'notif-2',
    type: 'reminder',
    title: 'Scheduled Study Session Coming Up',
    message: 'Your study session "Structured Output & Tool Calling" is scheduled for today at 7:00 PM.',
    time: '4 hours ago',
    read: false,
    actionUrl: '/app/scheduler',
    actionText: 'Open Scheduler',
  },
  {
    id: 'notif-3',
    type: 'ai_nudge',
    title: 'AI Recommendation: Time for a Quick Quiz',
    message: 'It has been 3 days since you reviewed Vector Databases. A 5-minute quiz will reinforce retention.',
    time: 'Yesterday',
    read: true,
    actionUrl: '/app/quizzes',
    actionText: 'Take 3-Min Quiz',
  },
  {
    id: 'notif-4',
    type: 'reminder',
    title: 'Phase 1 Milestone Completed! 🏆',
    message: 'Congratulations! You successfully finished all topics in Phase 1: Foundation of LLMs.',
    time: '2 days ago',
    read: true,
    actionUrl: '/app/roadmaps',
    actionText: 'Review Milestone',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('Notifications cleared');
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'streak':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'ai_nudge':
        return <Sparkles className="w-4 h-4 text-brand-500" />;
      case 'quiz':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      default:
        return <Calendar className="w-4 h-4 text-violet-500" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500 text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with study schedule alerts, AI nudges, and milestone achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-secondary text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="btn-secondary text-xs flex items-center gap-1.5 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
            filter === 'all'
              ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
            filter === 'unread'
              ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-muted-foreground space-y-2">
            <Bell className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">You're all caught up!</p>
            <p className="text-xs">No notifications to display.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              className={cn(
                'card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all',
                !item.read
                  ? 'border-brand-500/30 bg-brand-500/5'
                  : 'border-border bg-card opacity-85'
              )}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  {getIcon(item.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[11px] text-muted-foreground/75 mt-1.5 block">
                    {item.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto flex-shrink-0 pt-2 sm:pt-0">
                {item.actionUrl && (
                  <Link
                    to={item.actionUrl}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    {item.actionText || 'View'} <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
                <button
                  onClick={() => toggleRead(item.id)}
                  className="btn-secondary text-xs py-1.5 px-2.5"
                  title={item.read ? 'Mark as unread' : 'Mark as read'}
                >
                  <Check className={cn('w-3.5 h-3.5', item.read ? 'text-muted-foreground' : 'text-emerald-500')} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
