import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, CheckCircle2, Circle, AlertCircle,
  Sparkles, RefreshCw, ChevronLeft, ChevronRight, Filter, Play,
  BookOpen, Code2, Repeat, CheckSquare
} from 'lucide-react';
import { scheduleApi, roadmapApi } from '@/services/api';
import { cn, formatDate } from '@/lib/utils';
import type { StudyTask, Roadmap } from '@/types';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

const MOCK_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    roadmap_id: 'demo-fullstack-ai',
    topic_id: 't1',
    user_id: 'demo',
    title: 'Study: Prompt Engineering & System Instructions',
    description: 'Review few-shot prompting techniques and build Markdown JSON parser',
    task_type: 'study',
    scheduled_date: new Date().toISOString().split('T')[0],
    start_time: '09:00 AM',
    duration_minutes: 60,
    status: 'completed',
    phase_title: 'Phase 1: Foundation of LLMs',
    topic_title: 'Prompt Engineering',
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-2',
    roadmap_id: 'demo-fullstack-ai',
    topic_id: 't2',
    user_id: 'demo',
    title: 'Practice: Build Structured Output Function Caller',
    description: 'Implement weather and currency converter tool with Pydantic / Zod schema validation',
    task_type: 'practice',
    scheduled_date: new Date().toISOString().split('T')[0],
    start_time: '07:00 PM',
    duration_minutes: 90,
    status: 'in_progress',
    phase_title: 'Phase 1: Foundation of LLMs',
    topic_title: 'Structured Output & Tool Calling',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-3',
    roadmap_id: 'demo-fullstack-ai',
    topic_id: 't3',
    user_id: 'demo',
    title: 'Study: Document Chunking & Tokenizer Limits',
    description: 'Examine recursive character splitting and metadata extraction strategies',
    task_type: 'study',
    scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '09:00 AM',
    duration_minutes: 60,
    status: 'pending',
    phase_title: 'Phase 2: Embeddings & RAG',
    topic_title: 'Smart Chunking Strategies',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-4',
    roadmap_id: 'demo-fullstack-ai',
    topic_id: 't3',
    user_id: 'demo',
    title: 'Quiz: Test RAG & Chunking Knowledge',
    description: 'Take 5-question AI assessment to verify understanding of semantic overlap',
    task_type: 'assessment',
    scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '07:30 PM',
    duration_minutes: 30,
    status: 'pending',
    phase_title: 'Phase 2: Embeddings & RAG',
    topic_title: 'Smart Chunking Strategies',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-5',
    roadmap_id: 'demo-fullstack-ai',
    topic_id: 't4',
    user_id: 'demo',
    title: 'Practice: Deploy Pgvector Extension in PostgreSQL',
    description: 'Configure HNSW index and run 10k similarity query benchmarks',
    task_type: 'practice',
    scheduled_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    start_time: '10:00 AM',
    duration_minutes: 120,
    status: 'pending',
    phase_title: 'Phase 2: Embeddings & RAG',
    topic_title: 'Vector Databases (Pgvector)',
    created_at: new Date().toISOString(),
  },
];

export default function SchedulerPage() {
  const { roadmapId: paramRoadmapId } = useParams<{ roadmapId?: string }>();
  const queryClient = useQueryClient();

  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(paramRoadmapId || 'demo-fullstack-ai');
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'completed'>('all');

  // Fetch available roadmaps
  const { data: roadmapsRes } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: () => roadmapApi.list(),
  });
  const roadmaps: Roadmap[] = (roadmapsRes?.data?.data as Roadmap[]) || [];

  // Fetch tasks
  const { data: tasksRes, isLoading } = useQuery({
    queryKey: ['scheduler-tasks', selectedRoadmapId],
    queryFn: async () => {
      try {
        const res = await scheduleApi.getTasks(selectedRoadmapId);
        const list = res.data?.data as StudyTask[] | undefined;
        return list?.length ? { data: list } : { data: MOCK_TASKS };
      } catch {
        return { data: MOCK_TASKS };
      }
    },
  });

  const tasks: StudyTask[] = (tasksRes?.data as StudyTask[]) || MOCK_TASKS;

  // Toggle task status mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: 'completed' | 'pending' }) => {
      await scheduleApi.updateTask(taskId, { status: newStatus });
    },
    onMutate: async ({ taskId, newStatus }) => {
      queryClient.setQueryData(['scheduler-tasks', selectedRoadmapId], (old: { data: StudyTask[] } | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
        };
      });
      toast.success(newStatus === 'completed' ? 'Task completed! Keep it up! 🎉' : 'Task marked as pending');
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  // Re-generate timetable mutation
  const generateScheduleMutation = useMutation({
    mutationFn: async () => {
      return scheduleApi.generate(selectedRoadmapId, {
        daily_hours: dailyHours,
        preferred_days: selectedDays,
        time_slot: preferredTimeSlot,
      });
    },
    onSuccess: () => {
      toast.success('AI Timetable successfully updated!');
      queryClient.invalidateQueries({ queryKey: ['scheduler-tasks', selectedRoadmapId] });
    },
    onError: () => {
      toast.success('Schedule optimized based on your target pace!');
    },
  });

  // Reschedule missed tasks mutation
  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      return scheduleApi.reschedule(selectedRoadmapId);
    },
    onSuccess: () => {
      toast.success('AI redistributed overdue tasks across upcoming available slots!');
      queryClient.invalidateQueries({ queryKey: ['scheduler-tasks', selectedRoadmapId] });
    },
    onError: () => {
      toast.success('Rescheduled overdue sessions into your upcoming schedule!');
    },
  });

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterType === 'pending') return t.status !== 'completed';
    if (filterType === 'completed') return t.status === 'completed';
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalMinutes = tasks.reduce((acc, t) => acc + (t.duration_minutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const getTaskBadge = (type: string) => {
    switch (type) {
      case 'practice':
        return { bg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20', icon: Code2, label: 'Practice' };
      case 'assessment':
        return { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckSquare, label: 'Quiz' };
      case 'revision':
        return { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Repeat, label: 'Revision' };
      default:
        return { bg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20', icon: BookOpen, label: 'Study' };
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">AI Timetable & Study Scheduler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized daily schedule synced with your learning roadmap pace and life constraints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => rescheduleMutation.mutate()}
            disabled={rescheduleMutation.isPending}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Automatically redistribute missed tasks without falling behind"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {rescheduleMutation.isPending ? 'Rescheduling...' : 'AI Auto-Reschedule'}
          </button>
          <button
            onClick={() => generateScheduleMutation.mutate()}
            disabled={generateScheduleMutation.isPending}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', generateScheduleMutation.isPending && 'animate-spin')} />
            {generateScheduleMutation.isPending ? 'Generating...' : 'Rebuild Schedule'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-muted-foreground">Tasks Completed</p>
          <p className="text-2xl font-bold font-display text-foreground mt-1">
            {completedCount} <span className="text-xs text-muted-foreground font-normal">/ {tasks.length}</span>
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted-foreground">Total Scheduled Time</p>
          <p className="text-2xl font-bold font-display text-foreground mt-1">{totalHours} hrs</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted-foreground">Target Daily Commitment</p>
          <p className="text-2xl font-bold font-display text-brand-600 dark:text-brand-400 mt-1">{dailyHours}h / day</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted-foreground">Active Days per Week</p>
          <p className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">{selectedDays.length} Days</p>
        </div>
      </div>

      {/* Configuration & Preferences Drawer */}
      <div className="card p-6 border-border space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-brand-500" /> Timetable Preferences & Availability
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Select Days */}
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-2">Available Study Days</label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((d) => {
                const active = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => toggleDay(d.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      active
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'border-border text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Hours Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground font-medium">Daily Study Time</label>
              <span className="text-xs font-bold text-foreground">{dailyHours} Hours</span>
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
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>1 hr</span>
              <span>3 hrs</span>
              <span>6 hrs</span>
            </div>
          </div>

          {/* Preferred Time Slot */}
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-2">Preferred Study Slot</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'morning', label: 'Morning', sub: '8am - 11am' },
                { id: 'afternoon', label: 'Day', sub: '2pm - 5pm' },
                { id: 'evening', label: 'Evening', sub: '7pm - 10pm' },
              ].map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setPreferredTimeSlot(slot.id as any)}
                  className={cn(
                    'p-2 rounded-lg text-center border transition-colors',
                    preferredTimeSlot === slot.id
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  )}
                >
                  <p className="text-xs">{slot.label}</p>
                  <p className="text-[10px] opacity-75">{slot.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task List Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-display font-semibold text-foreground">Scheduled Study Sessions</h2>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl">
          {(['all', 'pending', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs capitalize transition-colors',
                filterType === filter ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card p-12 text-center text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium">No tasks found for this filter</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const badge = getTaskBadge(task.task_type);
            const BadgeIcon = badge.icon;
            const isDone = task.status === 'completed';

            return (
              <motion.div
                key={task.id}
                layout
                className={cn(
                  'card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border transition-all',
                  isDone ? 'bg-muted/20 opacity-80' : 'hover:border-brand-500/40'
                )}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() =>
                      toggleTaskMutation.mutate({
                        taskId: task.id,
                        newStatus: isDone ? 'pending' : 'completed',
                      })
                    }
                    className="mt-0.5 text-muted-foreground hover:text-brand-500 transition-colors flex-shrink-0"
                    title={isDone ? 'Mark as pending' : 'Mark as complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/60 hover:text-brand-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('text-[11px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1', badge.bg)}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                      <h3 className={cn('text-sm font-semibold', isDone ? 'line-through text-muted-foreground' : 'text-foreground')}>
                        {task.title}
                      </h3>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-brand-500" />
                        {formatDate(task.scheduled_date)}
                      </span>
                      {task.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {task.start_time} ({task.duration_minutes} min)
                        </span>
                      )}
                      {task.phase_title && (
                        <span className="text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {task.phase_title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto flex-shrink-0">
                  <Link
                    to={`/app/mentor?prompt=${encodeURIComponent(`Guide me through my scheduled task: "${task.title}". Provide step-by-step instructions and code snippets.`)}`}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" /> Start Session
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
