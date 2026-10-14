import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { roadmapApi, scheduleApi } from '@/services/api';
import { formatDate } from '@/lib/utils';
import type { Roadmap, StudyTask } from '@/types';

type Reminder = { task: StudyTask; roadmapTitle: string };

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all');
  const today = localDateString(new Date());

  const roadmapsQuery = useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      const response = await roadmapApi.list();
      return (response.data.data as Roadmap[] | undefined) || [];
    },
  });
  const roadmaps = roadmapsQuery.data || [];
  const remindersQuery = useQuery({
    queryKey: ['notification-reminders', roadmaps.map((roadmap) => roadmap.id)],
    enabled: roadmaps.length > 0,
    queryFn: async () => {
      const taskLists = await Promise.all(roadmaps.map(async (roadmap) => {
        const response = await scheduleApi.getTasks(roadmap.id);
        return ((response.data.data as StudyTask[] | undefined) || [])
          .filter((task) => task.status !== 'completed')
          .map((task) => ({ task, roadmapTitle: roadmap.title }));
      }));
      return taskLists.flat().sort((left, right) =>
        left.task.scheduled_date.localeCompare(right.task.scheduled_date)
      );
    },
  });
  const reminders: Reminder[] = remindersQuery.data || [];
  const filteredReminders = reminders.filter(({ task }) => {
    if (filter === 'upcoming') return task.scheduled_date >= today;
    if (filter === 'overdue') return task.scheduled_date < today;
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Study Reminders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upcoming and overdue sessions from your real roadmap schedules.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {(['all', 'upcoming', 'overdue'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize ${filter === value ? 'bg-brand-500/10 text-brand-600' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {value}
          </button>
        ))}
      </div>

      {roadmapsQuery.isLoading || remindersQuery.isLoading ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">Loading scheduled reminders…</div>
      ) : roadmapsQuery.isError || remindersQuery.isError ? (
        <div role="alert" className="card p-8 text-center text-sm text-destructive">Could not load study reminders. Refresh and try again.</div>
      ) : !roadmaps.length ? (
        <div className="card space-y-3 p-8 text-center">
          <Bell className="mx-auto h-9 w-9 text-muted-foreground" />
          <p className="font-medium">No roadmap reminders yet.</p>
          <Link to="/app/generate" className="btn-primary mx-auto w-fit">Create a roadmap</Link>
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">
          No {filter === 'all' ? '' : `${filter} `}study reminders. Build or update your schedule from the Scheduler.
          <Link to="/app/scheduler" className="mt-3 inline-block text-brand-500 hover:underline">Open Scheduler</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map(({ task, roadmapTitle }) => (
            <article key={task.id} className="card flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="font-semibold">{task.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{roadmapTitle}{task.topic_title ? ` · ${task.topic_title}` : ''}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(task.scheduled_date)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{task.start_time || 'Flexible'} · {task.duration_minutes} min</span>
                </div>
              </div>
              <Link to={`/app/scheduler/${task.roadmap_id}`} className="btn-secondary shrink-0 text-xs">Open schedule</Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
