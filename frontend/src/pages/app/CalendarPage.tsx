import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock,
  CheckCircle2, Circle, Sparkles, Flame, Play, BookOpen, Plus
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { StudyTask } from '@/types';
import toast from 'react-hot-toast';

// Generate current month days
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // Mock task calendar entries
  const [tasks, setTasks] = useState<StudyTask[]>([
    {
      id: 'cal-1',
      roadmap_id: 'demo-fullstack-ai',
      topic_id: 't1',
      user_id: 'demo',
      title: 'Prompt Engineering & System Instructions',
      description: 'Master few-shot and delimiters for reliable responses',
      task_type: 'study',
      scheduled_date: today.toISOString().split('T')[0],
      start_time: '09:00 AM',
      duration_minutes: 60,
      status: 'completed',
      phase_title: 'Phase 1: Foundation of LLMs',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cal-2',
      roadmap_id: 'demo-fullstack-ai',
      topic_id: 't2',
      user_id: 'demo',
      title: 'Build Tool-Calling Function Playground',
      description: 'Implement structured schema outputs with error correction',
      task_type: 'practice',
      scheduled_date: today.toISOString().split('T')[0],
      start_time: '07:00 PM',
      duration_minutes: 90,
      status: 'pending',
      phase_title: 'Phase 1: Foundation of LLMs',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cal-3',
      roadmap_id: 'demo-fullstack-ai',
      topic_id: 't3',
      user_id: 'demo',
      title: 'Document Processing & Recursive Chunking',
      description: 'Deep dive into boundary preservation and token sizing',
      task_type: 'study',
      scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      start_time: '10:00 AM',
      duration_minutes: 60,
      status: 'pending',
      phase_title: 'Phase 2: RAG',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cal-4',
      roadmap_id: 'demo-fullstack-ai',
      topic_id: 't4',
      user_id: 'demo',
      title: 'Vector Databases Benchmarks',
      description: 'Deploy pgvector with HNSW indexing',
      task_type: 'practice',
      scheduled_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      start_time: '02:00 PM',
      duration_minutes: 120,
      status: 'pending',
      phase_title: 'Phase 2: RAG',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cal-5',
      roadmap_id: 'demo-fullstack-ai',
      topic_id: 't3',
      user_id: 'demo',
      title: 'Assessment: RAG Architecture',
      description: 'Evaluate comprehension on vector similarity search',
      task_type: 'assessment',
      scheduled_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      start_time: '08:00 PM',
      duration_minutes: 30,
      status: 'pending',
      phase_title: 'Phase 2: RAG',
      created_at: new Date().toISOString(),
    },
  ]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newStatus = t.status === 'completed' ? 'pending' : 'completed';
          toast.success(newStatus === 'completed' ? 'Great job finishing this study task! 🔥' : 'Marked as pending');
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const selectedDayTasks = tasks.filter((t) => t.scheduled_date === selectedDateStr);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Learning Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your daily learning consistency, review scheduled sessions, and maintain your streak.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>5 Day Streak</span>
          </div>
          <button onClick={goToToday} className="btn-secondary text-xs">
            Today
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Day Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="card p-6 lg:col-span-2 border-border space-y-4">
          {/* Month Navigator */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-foreground">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Labels */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground py-2 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty cells before month starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[85px] rounded-lg p-1.5 opacity-20 bg-muted/20" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const monthStr = String(currentMonth + 1).padStart(2, '0');
              const dayStr = String(dayNum).padStart(2, '0');
              const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

              const isSelected = selectedDateStr === dateStr;
              const isToday =
                today.getFullYear() === currentYear &&
                today.getMonth() === currentMonth &&
                today.getDate() === dayNum;

              const dayTasks = tasks.filter((t) => t.scheduled_date === dateStr);
              const allDone = dayTasks.length > 0 && dayTasks.every((t) => t.status === 'completed');

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={cn(
                    'min-h-[70px] sm:min-h-[85px] rounded-xl p-1.5 sm:p-2 border cursor-pointer transition-all flex flex-col justify-between select-none',
                    isSelected
                      ? 'border-brand-500 bg-brand-500/10 shadow-sm'
                      : isToday
                      ? 'border-brand-500/50 bg-card'
                      : 'border-border/60 hover:bg-accent/40 bg-card'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center',
                        isToday
                          ? 'bg-brand-500 text-white'
                          : isSelected
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-foreground'
                      )}
                    >
                      {dayNum}
                    </span>
                    {allDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>

                  {/* Tasks indicators */}
                  <div className="space-y-1 mt-1">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={cn(
                          'text-[10px] truncate px-1.5 py-0.5 rounded font-medium',
                          t.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 line-through'
                            : t.task_type === 'practice'
                            ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                            : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        )}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-muted-foreground block pl-1">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Drawer */}
        <div className="card p-6 border-border space-y-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Daily Agenda
              </p>
              <h3 className="text-base font-display font-bold text-foreground mt-0.5">
                {formatDate(selectedDateStr)}
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 font-medium">
              {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'Session' : 'Sessions'}
            </span>
          </div>

          {/* Agenda items */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-muted-foreground/40" />
                <p className="text-xs">No learning tasks scheduled for this day.</p>
                <Link
                  to="/app/scheduler"
                  className="btn-secondary text-xs inline-flex items-center gap-1.5 mt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Schedule Session
                </Link>
              </div>
            ) : (
              selectedDayTasks.map((t) => {
                const isDone = t.status === 'completed';
                return (
                  <div
                    key={t.id}
                    className={cn(
                      'p-4 rounded-xl border border-border transition-all space-y-2.5',
                      isDone ? 'bg-muted/20 opacity-80' : 'bg-card hover:border-brand-500/30'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleTask(t.id)}
                        className="mt-0.5 text-muted-foreground hover:text-brand-500 transition-colors flex-shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-muted-foreground/60 hover:text-brand-500" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h4
                          className={cn(
                            'text-sm font-semibold',
                            isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                          )}
                        >
                          {t.title}
                        </h4>
                        {t.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        {t.start_time || 'Flexible'} • {t.duration_minutes} min
                      </span>

                      <Link
                        to={`/app/mentor?prompt=${encodeURIComponent(`I am beginning my study session: "${t.title}". Let's start with a 5-minute refresher and exercises.`)}`}
                        className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium text-[11px]"
                      >
                        <Play className="w-3 h-3" /> Study with AI
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
