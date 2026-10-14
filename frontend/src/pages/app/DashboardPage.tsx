import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Map, Clock, Target, CheckCircle,
  TrendingUp, MessageCircle, Calendar, BookOpen, Zap
} from 'lucide-react';
import { roadmapApi, scheduleApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatDate, formatHours } from '@/lib/utils';
import type { Roadmap, StudyTask } from '@/types';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ComponentType<{className?: string}>; color: string }) {
  return (
    <div className="card p-5">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color)}>
        <Icon className="w-4.5 h-4.5 text-white" />
      </div>
      <p className="text-2xl font-display font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: roadmapsRes, isLoading: loadingRoadmaps } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: () => roadmapApi.list(),
  });

  const roadmaps: Roadmap[] = (roadmapsRes?.data?.data as Roadmap[]) || [];
  const activeRoadmap = roadmaps.find((r) => r.status === 'active') || roadmaps[0];
  const allTopics = roadmaps.flatMap((roadmap) =>
    roadmap.phases?.flatMap((phase) => phase.topics || []) || []
  );
  const completedTopics = allTopics.filter((topic) => topic.is_completed).length;
  const overallProgress = allTopics.length ? Math.round((completedTopics / allTopics.length) * 100) : 0;
  const activeTopics = activeRoadmap?.phases?.flatMap((phase) => phase.topics || []) || [];
  const activeCompletedTopics = activeTopics.filter((topic) => topic.is_completed).length;
  const activeProgress = activeTopics.length ? Math.round((activeCompletedTopics / activeTopics.length) * 100) : 0;

  const { data: tasksRes } = useQuery({
    queryKey: ['today-tasks'],
    queryFn: () => activeRoadmap
      ? scheduleApi.getTasks(activeRoadmap.id, new Date().toISOString().split('T')[0])
      : Promise.resolve(null),
    enabled: !!activeRoadmap,
  });

  const todayTasks: StudyTask[] = (tasksRes?.data?.data as StudyTask[]) || [];
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;

  const stats = [
    { label: 'Active Roadmaps', value: roadmaps.filter((r) => r.status === 'active').length, icon: Map, color: 'bg-brand-500' },
    { label: 'Topics Finished', value: `${completedTopics}/${allTopics.length}`, icon: CheckCircle, color: 'bg-emerald-600' },
    { label: "Today's Tasks Done", value: `${completedToday}/${todayTasks.length}`, icon: Calendar, color: 'bg-emerald-700' },
    { label: 'Overall Progress', value: `${overallProgress}%`, icon: TrendingUp, color: 'bg-brand-500' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome banner */}
      <motion.div
        className="relative rounded-2xl overflow-hidden gradient-brand p-6 lg:p-8 shadow-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `radial-gradient(circle at 80% 50%, white, transparent 60%)` }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Learner'} 👋
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {activeRoadmap
                ? `You have finished ${activeCompletedTopics} of ${activeTopics.length} topics in "${activeRoadmap.title}".`
                : 'Ready to start your learning journey?'
              }
            </p>
          </div>
          {activeRoadmap ? (
            <Link
              to={`/app/roadmaps/${activeRoadmap.id}`}
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:shadow-lg transition-all flex-shrink-0"
            >
              Continue Learning
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/app/generate"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:shadow-lg transition-all flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Generate My Path
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's tasks */}
        <motion.div
          className="lg:col-span-2 card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-500" />
              <h3 className="font-semibold">Today's Schedule</h3>
              <span className="text-xs text-muted-foreground">{formatDate(new Date())}</span>
            </div>
            {activeRoadmap && (
              <Link to={`/app/scheduler/${activeRoadmap.id}`} className="text-xs text-brand-500 hover:text-brand-600">
                View full schedule →
              </Link>
            )}
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-12">
              {activeRoadmap ? (
                <>
                  <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No tasks scheduled for today</p>
                  <Link to={`/app/scheduler/${activeRoadmap.id}`} className="btn-primary mt-4 text-sm">
                    Set Up Schedule
                  </Link>
                </>
              ) : (
                <>
                  <Sparkles className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">No active roadmap yet</p>
                  <Link to="/app/generate" className="btn-primary mt-2 text-sm">
                    <Sparkles className="w-4 h-4" />Generate My First Roadmap
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className={cn(
                  'flex items-center gap-4 p-3 rounded-xl border transition-colors',
                  task.status === 'completed'
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                    : 'border-border hover:bg-accent/30'
                )}>
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    task.status === 'completed' ? 'bg-emerald-500' : 'bg-secondary'
                  )}>
                    {task.status === 'completed'
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : <BookOpen className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', task.status === 'completed' && 'line-through text-muted-foreground')}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{task.phase_title} · {formatHours(task.duration_minutes / 60)}</p>
                  </div>
                  <span className={cn('badge flex-shrink-0',
                    task.status === 'completed' ? 'badge-success' :
                    task.status === 'in_progress' ? 'badge-brand' : 'bg-secondary text-muted-foreground')}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: Sparkles, label: 'Generate New Roadmap', to: '/app/generate', color: 'text-brand-500' },
                { icon: MessageCircle, label: 'Ask AI Mentor', to: '/app/mentor', color: 'text-violet-500' },
                { icon: BookOpen, label: 'Practice Quizzes', to: '/app/quizzes', color: 'text-electric-500' },
                { icon: TrendingUp, label: 'View Progress', to: '/app/progress', color: 'text-emerald-500' },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors group"
                >
                  <action.icon className={cn('w-4.5 h-4.5', action.color)} />
                  <span className="text-sm font-medium">{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Active roadmap card */}
          {activeRoadmap && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Map className="w-4 h-4 text-brand-500" />
                <h3 className="font-semibold text-sm">Active Roadmap</h3>
              </div>
              <p className="text-sm font-medium line-clamp-2 mb-3">{activeRoadmap.title}</p>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progress</span>
                  <span>{activeCompletedTopics} of {activeTopics.length} topics · {activeProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${activeProgress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatHours(activeRoadmap.total_estimated_hours)} total · {activeRoadmap.total_estimated_weeks}w</span>
              </div>
              <Link to={`/app/roadmaps/${activeRoadmap.id}`} className="btn-primary w-full mt-4 text-sm h-9">
                Continue Learning<ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
