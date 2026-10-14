import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Map, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { roadmapApi } from '@/services/api';
import { cn, formatDate, formatHours, getStatusColor } from '@/lib/utils';
import type { Roadmap } from '@/types';
import toast from 'react-hot-toast';

export default function RoadmapsPage() {
  const queryClient = useQueryClient();
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editGoal, setEditGoal] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: () => roadmapApi.list(),
  });

  const roadmaps = (data?.data?.data as Roadmap[] | undefined) || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roadmapApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
      toast.success('Roadmap deleted.');
    },
    onError: () => toast.error('Could not delete this roadmap. Please try again.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title, goal }: { id: string; title: string; goal: string }) =>
      roadmapApi.update(id, { title, goal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      setEditingRoadmap(null);
      toast.success('Roadmap updated.');
    },
    onError: () => toast.error('Could not update this roadmap. Please try again.'),
  });

  const beginEdit = (roadmap: Roadmap) => {
    setEditingRoadmap(roadmap);
    setEditTitle(roadmap.title);
    setEditGoal(roadmap.goal);
  };

  const saveEdit = () => {
    if (!editingRoadmap || !editTitle.trim() || !editGoal.trim()) {
      toast.error('Please enter a title and learning goal.');
      return;
    }
    updateMutation.mutate({
      id: editingRoadmap.id,
      title: editTitle.trim(),
      goal: editGoal.trim(),
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-display font-bold">My Roadmaps</h1>
          <p className="text-sm text-muted-foreground">Your learning plans, progress, and next steps.</p>
        </div>
        <Link to="/app/generate" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New Roadmap
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="skeleton h-56 rounded-2xl" />)}
        </div>
      ) : isError ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-destructive">Roadmaps could not be loaded. Check that the backend is running and try again.</p>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="card py-16 text-center">
          <Map className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="mb-2 text-lg font-semibold">No roadmaps yet</h2>
          <p className="mb-6 text-sm text-muted-foreground">Create a learning plan from your goal and syllabus.</p>
          <Link to="/app/generate" className="btn-primary">
            <Sparkles className="h-4 w-4" /> Create My First Roadmap
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map((roadmap, index) => {
            const topics = roadmap.phases?.flatMap((phase) => phase.topics || []) || [];
            const complete = topics.filter((topic) => topic.is_completed).length;
            const percent = topics.length ? Math.round((complete / topics.length) * 100) : 0;

            return (
              <motion.article
                key={roadmap.id}
                className="card flex min-w-0 flex-col p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500">
                    <Map className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => beginEdit(roadmap)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label={`Edit ${roadmap.title}`}
                      title="Edit roadmap"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete "${roadmap.title}"? This cannot be undone.`)) {
                          deleteMutation.mutate(roadmap.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${roadmap.title}`}
                      title="Delete roadmap"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className={cn('badge capitalize', getStatusColor(roadmap.status))}>{roadmap.status}</span>
                  <span className="text-xs capitalize text-muted-foreground">{roadmap.current_level}</span>
                </div>
                <h2 className="mb-2 line-clamp-2 text-base font-semibold">{roadmap.title}</h2>
                <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">{roadmap.description}</p>

                <div className="mb-4 rounded-xl bg-muted/50 p-3">
                  <div className="mb-2 flex justify-between gap-2 text-xs">
                    <span className="font-medium">Your progress</span>
                    <span className="text-muted-foreground">{complete}/{topics.length} topics · {percent}%</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-secondary"
                    role="progressbar"
                    aria-label="Roadmap progress"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatHours(roadmap.total_estimated_hours)}</span>
                  <span>{roadmap.total_estimated_weeks} weeks</span>
                  {roadmap.target_date && <span>Due {formatDate(roadmap.target_date, 'MMM dd')}</span>}
                </div>

                <Link to={`/app/roadmaps/${roadmap.id}`} className="btn-primary h-10 w-full text-sm">
                  Open Roadmap <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.article>
            );
          })}
        </div>
      )}

      {editingRoadmap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-roadmap-title">
          <div className="card w-full max-w-lg space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 id="edit-roadmap-title" className="text-lg font-semibold">Edit Roadmap</h2>
              <button type="button" onClick={() => setEditingRoadmap(null)} className="btn-ghost px-2">Close</button>
            </div>
            <label className="block text-sm font-medium">
              Roadmap title
              <input className="input mt-1.5" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={200} />
            </label>
            <label className="block text-sm font-medium">
              Learning goal
              <textarea className="textarea mt-1.5 min-h-24" value={editGoal} onChange={(event) => setEditGoal(event.target.value)} maxLength={500} />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingRoadmap(null)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={saveEdit} disabled={updateMutation.isPending} className="btn-primary">
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
