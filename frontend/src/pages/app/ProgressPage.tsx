import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, BookOpen, CheckCircle2, Clock, Flame, Plus, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { progressApi, roadmapApi, extractErrorMessage } from '@/services/api';
import type { ProgressSummary, Roadmap } from '@/types';

export default function ProgressPage() {
  const queryClient = useQueryClient();
  const [roadmapId, setRoadmapId] = useState('');
  const [isLoggingSession, setIsLoggingSession] = useState(false);
  const [logTopic, setLogTopic] = useState('');
  const [logHours, setLogHours] = useState('');

  const roadmapsQuery = useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      const response = await roadmapApi.list();
      return (response.data.data as Roadmap[] | undefined) || [];
    },
  });
  const roadmaps = roadmapsQuery.data || [];
  const selectedRoadmap = roadmaps.find((roadmap) => roadmap.id === roadmapId);

  useEffect(() => {
    if (!roadmapId && roadmaps.length) setRoadmapId(roadmaps[0].id);
  }, [roadmaps, roadmapId]);

  const progressQuery = useQuery({
    queryKey: ['progress', roadmapId],
    enabled: Boolean(roadmapId),
    queryFn: async () => {
      const response = await progressApi.getSummary(roadmapId);
      return response.data.data as ProgressSummary;
    },
  });
  const progress = progressQuery.data;

  const logSessionMutation = useMutation({
    mutationFn: () => progressApi.logSession({
      roadmap_id: roadmapId,
      topic: logTopic.trim(),
      hours: Number(logHours),
    }),
    onSuccess: () => {
      toast.success('Study time saved.');
      setIsLoggingSession(false);
      setLogTopic('');
      setLogHours('');
      queryClient.invalidateQueries({ queryKey: ['progress', roadmapId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const maxWeeklyHours = Math.max(1, ...(progress?.week_activity || []).map((day) => day.hours));
  const allTopics = selectedRoadmap?.phases.flatMap((phase) => phase.topics) || [];
  const nextTopics = allTopics.filter((topic) => !topic.is_completed).slice(0, 3);

  if (!roadmapsQuery.isLoading && !roadmaps.length) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-display font-bold">Learning Progress</h1>
        <p className="mt-2 text-sm text-muted-foreground">Progress will appear after you create a roadmap and complete study sessions.</p>
        <Link to="/app/generate" className="btn-primary mx-auto mt-5 w-fit">Create a roadmap</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-display font-bold">Learning Progress</h1>
          <p className="mt-1 text-sm text-muted-foreground">Metrics are calculated from your roadmap and completed study sessions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="input min-w-48 text-sm"
            aria-label="Select roadmap progress"
            value={roadmapId}
            onChange={(event) => setRoadmapId(event.target.value)}
          >
            {roadmaps.map((roadmap) => <option key={roadmap.id} value={roadmap.id}>{roadmap.title}</option>)}
          </select>
          <button type="button" onClick={() => setIsLoggingSession(true)} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Log study time
          </button>
        </div>
      </div>

      {roadmapsQuery.isError || progressQuery.isError ? (
        <div role="alert" className="card p-5 text-sm text-destructive">Could not load progress from the server. Refresh and try again.</div>
      ) : progressQuery.isLoading || !progress ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">Loading your progress…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard icon={Target} label="Roadmap progress" value={`${progress.overall_percentage}%`} detail={selectedRoadmap?.title || ''} />
            <MetricCard icon={CheckCircle2} label="Topics finished" value={`${progress.topics_completed}/${progress.topics_total}`} detail="From your roadmap" />
            <MetricCard icon={Clock} label="Study hours" value={`${progress.study_hours_actual}h`} detail={`${progress.study_hours_planned}h scheduled`} />
            <MetricCard icon={Award} label="Milestones" value={`${progress.milestones_reached}/${progress.milestones_total}`} detail={progress.quiz_accuracy_avg == null ? 'Quiz score: not measured yet' : `Quiz accuracy: ${progress.quiz_accuracy_avg}%`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card space-y-5 p-5 sm:p-6">
              <div>
                <h2 className="font-display text-lg font-bold">Study time — last 7 days</h2>
                <p className="text-xs text-muted-foreground">Hours from completed tasks and manually logged sessions.</p>
              </div>
              <div className="flex h-48 items-end justify-between gap-2">
                {progress.week_activity.map((day) => {
                  const height = Math.round((day.hours / maxWeeklyHours) * 100);
                  return (
                    <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <span className="text-[11px] text-muted-foreground">{day.hours}h</span>
                      <div className="flex h-32 w-full max-w-9 items-end rounded-t-md bg-muted">
                        <div className="w-full rounded-t-md bg-brand-500" style={{ height: `${height}%` }} />
                      </div>
                      <span className="text-[11px] text-muted-foreground">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-500" />
                <h2 className="font-display text-lg font-bold">Next topics</h2>
              </div>
              {nextTopics.length ? nextTopics.map((topic) => (
                <div key={topic.id} className="rounded-xl border border-border p-3">
                  <p className="font-medium">{topic.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{topic.completion_percentage}% complete · {topic.estimated_hours} estimated hours</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">All roadmap topics are marked complete.</p>}
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Flame className="h-4 w-4 text-amber-500" /> Current study streak: {progress.streak_days} {progress.streak_days === 1 ? 'day' : 'days'}
              </p>
            </section>
          </div>

          <section className="card space-y-3 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">Completed topics</h2>
            {progress.strong_topics.length ? progress.strong_topics.map((topic) => (
              <p key={topic} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {topic}
              </p>
            )) : <p className="text-sm text-muted-foreground">Completed topics will appear here as you finish the roadmap.</p>}
          </section>
        </>
      )}

      {isLoggingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              logSessionMutation.mutate();
            }}
            className="card w-full max-w-md space-y-4 p-6"
          >
            <h2 className="font-display text-lg font-bold">Log study session</h2>
            <label className="block text-sm">
              Topic studied
              <input className="input mt-1" value={logTopic} onChange={(event) => setLogTopic(event.target.value)} maxLength={300} required />
            </label>
            <label className="block text-sm">
              Time spent (hours)
              <input className="input mt-1" type="number" min="0.1" max="24" step="0.1" value={logHours} onChange={(event) => setLogHours(event.target.value)} required />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setIsLoggingSession(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={logSessionMutation.isPending || !roadmapId}>
                {logSessionMutation.isPending ? 'Saving…' : 'Save session'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: {
  icon: typeof Target;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="card space-y-2 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4 text-brand-500" />{label}</div>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="truncate text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}
