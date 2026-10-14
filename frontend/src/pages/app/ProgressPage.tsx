import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart3, Flame, Clock, Target, Award, CheckCircle2,
  TrendingUp, AlertTriangle, Sparkles, Calendar, BookOpen, Plus
} from 'lucide-react';
import { progressApi } from '@/services/api';
import { cn, formatHours } from '@/lib/utils';
import type { ProgressSummary } from '@/types';
import toast from 'react-hot-toast';

const MOCK_PROGRESS: ProgressSummary = {
  roadmap_id: 'demo-fullstack-ai',
  overall_percentage: 35,
  topics_completed: 6,
  topics_total: 18,
  study_hours_planned: 84,
  study_hours_actual: 28.5,
  quiz_accuracy_avg: 88,
  milestones_reached: 2,
  milestones_total: 6,
  streak_days: 5,
  week_activity: [
    { date: 'Mon', hours: 2.5 },
    { date: 'Tue', hours: 1.5 },
    { date: 'Wed', hours: 3.0 },
    { date: 'Thu', hours: 2.0 },
    { date: 'Fri', hours: 2.5 },
    { date: 'Sat', hours: 4.0 },
    { date: 'Sun', hours: 1.0 },
  ],
  strong_topics: [
    'Prompt Engineering & Structured JSON Output',
    'OpenAI & Gemini API Streaming Calls',
    'Recursive Document Chunking Algorithms'
  ],
  weak_topics: [
    'Vector Index Tuning (HNSW vs IVFFlat parameter tradeoffs)',
    'Asynchronous Memory Buffering in Multi-agent Loops'
  ],
  next_recommendations: [
    'Complete the pgvector indexing practice project before starting Phase 3 agents.',
    'Retake the Vector Database assessment to boost concept confidence above 90%.',
    'You are currently 2 days ahead of your planned completion schedule!'
  ]
};

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressSummary>(MOCK_PROGRESS);
  const [isLoggingSession, setIsLoggingSession] = useState(false);
  const [logTopic, setLogTopic] = useState('Vector Similarity Benchmarking');
  const [logHours, setLogHours] = useState('1.5');

  const maxWeeklyHours = Math.max(...progress.week_activity.map((d) => d.hours), 4);

  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = parseFloat(logHours) || 1;
    setProgress((prev) => ({
      ...prev,
      study_hours_actual: prev.study_hours_actual + hoursNum,
      week_activity: prev.week_activity.map((day, idx) =>
        idx === 6 ? { ...day, hours: day.hours + hoursNum } : day
      ),
    }));
    setIsLoggingSession(false);
    toast.success(`Logged ${hoursNum} hours of study! 🚀`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Learning Analytics & Progress</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time tracking of study consistency, retention, strengths, and AI recommendations.
          </p>
        </div>

        <button
          onClick={() => setIsLoggingSession(true)}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Log Study Time
        </button>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5 border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground mt-2">{progress.streak_days} Days</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Keep it going!</p>
        </div>

        <div className="card p-5 border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Hours Completed</span>
            <Clock className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground mt-2">
            {progress.study_hours_actual} <span className="text-xs font-normal text-muted-foreground">/ {progress.study_hours_planned}h</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {Math.round((progress.study_hours_actual / progress.study_hours_planned) * 100)}% of goal
          </p>
        </div>

        <div className="card p-5 border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quiz Accuracy</span>
            <Award className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground mt-2">{progress.quiz_accuracy_avg}%</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Mastery level</p>
        </div>

        <div className="card p-5 border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Milestones Reached</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground mt-2">
            {progress.milestones_reached} <span className="text-xs font-normal text-muted-foreground">/ {progress.milestones_total}</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Next: PDF RAG System</p>
        </div>
      </div>

      {/* Middle Row: Weekly Activity Chart + AI Advisor Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="card p-6 border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-display font-bold text-foreground">Weekly Study Time</h2>
              <p className="text-xs text-muted-foreground">Hours committed per day this week</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600">
              {progress.week_activity.reduce((acc, d) => acc + d.hours, 0)} hrs total
            </span>
          </div>

          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between gap-3 h-48 px-2">
              {progress.week_activity.map((item, idx) => {
                const heightPct = Math.round((item.hours / maxWeeklyHours) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                      {item.hours}h
                    </span>
                    <motion.div
                      className="w-full max-w-[36px] rounded-t-lg gradient-brand shadow-sm"
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.08 }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">{item.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Learning Advisor Insights */}
        <div className="card p-6 border-border space-y-4 bg-gradient-to-br from-card via-card to-brand-950/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-foreground">AI Mentor Recommendations</h2>
              <p className="text-xs text-muted-foreground">Adaptive insights tailored to your learning pace</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {progress.next_recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-card border border-border/80 flex items-start gap-3 shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs text-foreground leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Strengths vs Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="card p-6 border-border space-y-3">
          <h2 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mastered & Strong Topics
          </h2>
          <p className="text-xs text-muted-foreground">High retention and accurate quiz completion scores</p>
          <div className="space-y-2 pt-1">
            {progress.strong_topics.map((t, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas Needing Revision */}
        <div className="card p-6 border-border space-y-3">
          <h2 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Focus Areas for Revision
          </h2>
          <p className="text-xs text-muted-foreground">Recommended for a quick 15-minute review session</p>
          <div className="space-y-2 pt-1">
            {progress.weak_topics.map((t, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-foreground flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Session Modal */}
      {isLoggingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 space-y-4 border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-display font-bold text-foreground">Log Study Session</h3>
              <button onClick={() => setIsLoggingSession(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <form onSubmit={handleLogSession} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Topic Studied</label>
                <input
                  type="text"
                  required
                  value={logTopic}
                  onChange={(e) => setLogTopic(e.target.value)}
                  className="input-field text-xs w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Time Spent (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  required
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  className="input-field text-xs w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button type="button" onClick={() => setIsLoggingSession(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Confirm & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
