import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Loader2, Info, ChevronDown,
  Clock, Target, Calendar, Brain, Lightbulb
} from 'lucide-react';
import { roadmapApi, extractErrorMessage } from '@/services/api';
import toast from 'react-hot-toast';
import { cn, detectDomainCategory } from '@/lib/utils';
import type { Roadmap } from '@/types';

const EXAMPLE_GOALS = [
  { text: 'Learn Python for data science from scratch in 6 months', domain: 'Programming' },
  { text: 'Prepare for GATE Computer Science 2025 exam', domain: 'Exam Prep' },
  { text: 'Master UI/UX Design with Figma and get freelance clients', domain: 'Design' },
  { text: 'Learn digital marketing and grow a business online', domain: 'Business' },
  { text: 'Improve spoken English for job interviews', domain: 'Languages' },
  { text: 'Learn machine learning and build AI projects', domain: 'AI/ML' },
  { text: 'Become a full-stack web developer and get hired', domain: 'Programming' },
  { text: 'Learn acoustic guitar from zero to playing songs', domain: 'Music' },
];

interface GenerationState {
  phase: 'idle' | 'analyzing' | 'researching' | 'generating' | 'validating' | 'done' | 'error';
  message: string;
  progress: number;
}

const GEN_PHASES: GenerationState[] = [
  { phase: 'analyzing', message: 'Analyzing your goal and domain…', progress: 15 },
  { phase: 'researching', message: 'Researching real-world resources and materials…', progress: 40 },
  { phase: 'generating', message: 'Generating your personalized roadmap…', progress: 70 },
  { phase: 'validating', message: 'Validating structure and prerequisites…', progress: 90 },
];

export default function GenerateRoadmapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialGoal = (location.state as { goal?: string })?.goal || '';

  const [goal, setGoal] = useState(initialGoal);
  const [syllabus, setSyllabus] = useState('');
  const [level, setLevel] = useState('beginner');
  const [dailyHours, setDailyHours] = useState(1.5);
  const [targetDate, setTargetDate] = useState('');
  const [language, setLanguage] = useState('en');
  const [priorExp, setPriorExp] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [genState, setGenState] = useState<GenerationState>({ phase: 'idle', message: '', progress: 0 });

  // Auto-detect domain from goal
  const detectedDomain = goal ? detectDomainCategory(goal) : '';

  const handleGenerate = async () => {
    if (!goal.trim() || goal.trim().length < 10) {
      toast.error('Please describe your goal in more detail (at least 10 characters)');
      return;
    }

    // Simulate phased progress while waiting for API
    setGenState(GEN_PHASES[0]);
    let phaseIdx = 0;
    const progressInterval = setInterval(() => {
      phaseIdx = Math.min(phaseIdx + 1, GEN_PHASES.length - 1);
      setGenState(GEN_PHASES[phaseIdx]);
    }, 3500);

    try {
      const res = await roadmapApi.generate({
        goal: goal.trim(),
        syllabus: syllabus.trim(),
        current_level: level,
        prior_experience: priorExp,
        target_date: targetDate || undefined,
        daily_hours: dailyHours,
        preferred_language: language,
      });

      clearInterval(progressInterval);
      setGenState({ phase: 'done', message: 'Roadmap generated!', progress: 100 });

      const roadmap = res.data?.data as Roadmap;
      if (roadmap?.id) {
        toast.success('Your personalized roadmap is ready! 🎉');
        setTimeout(() => navigate(`/app/roadmaps/${roadmap.id}`), 800);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      clearInterval(progressInterval);
      const msg = extractErrorMessage(err);
      setGenState({ phase: 'error', message: msg, progress: 0 });
      toast.error('Failed to generate roadmap: ' + msg);
    }
  };

  const isGenerating = ['analyzing', 'researching', 'generating', 'validating'].includes(genState.phase);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow glow-brand-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">Generate Learning Path</h1>
            <p className="text-sm text-muted-foreground">Enter any goal — Pathora AI creates your personalized roadmap</p>
          </div>
        </div>
      </motion.div>

      {/* Main form */}
      <motion.div
        className="card p-6 lg:p-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Goal input */}
        <div>
          <label className="block font-semibold text-sm mb-2">
            What do you want to learn? <span className="text-destructive">*</span>
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={isGenerating}
            className="textarea h-32 text-sm"
            placeholder="Describe your goal in plain language. Be specific about what you want to achieve.&#10;&#10;e.g., 'I want to learn data analytics using Python and SQL, land a data analyst job in 6 months. I'm a complete beginner with basic math knowledge.'"
          />
          {detectedDomain && (
            <div className="flex items-center gap-2 mt-2">
              <Lightbulb className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-xs text-muted-foreground">
                Detected domain: <strong className="text-foreground">{detectedDomain}</strong> — or describe your custom domain
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block font-semibold text-sm mb-2">
            Syllabus or topics to cover <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            disabled={isGenerating}
            className="textarea min-h-28 text-sm"
            placeholder={'Paste your syllabus, chapters, or topics here. One item per line works best.\n\nExample:\n1. Python basics\n   - Variables and data types\n   - Loops and functions\n2. Data analysis\n   - NumPy\n   - Pandas'}
            maxLength={12000}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            The AI will organize your topics and subtopics into a step-by-step roadmap.
          </p>
        </div>

        {/* Level + Hours */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-sm mb-2">Current level</label>
            <div className="grid grid-cols-3 gap-2">
              {['beginner', 'intermediate', 'advanced'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  disabled={isGenerating}
                  className={cn(
                    'py-2 rounded-xl border text-xs font-medium capitalize transition-all',
                    level === l
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'border-border text-muted-foreground hover:border-brand-200'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-sm mb-2">
              Daily study time: <span className="text-brand-500">{dailyHours}h</span>
            </label>
            <input
              type="range" min={0.5} max={6} step={0.5}
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              disabled={isGenerating}
              className="w-full accent-brand-500 mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>30m</span><span>3h</span><span>6h</span>
            </div>
          </div>
        </div>

        {/* Target date */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-sm mb-2">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
              Target completion date (optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              disabled={isGenerating}
              className="input text-sm"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block font-semibold text-sm mb-2">
              <Brain className="w-3.5 h-3.5 inline mr-1.5" />
              Response language
            </label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              disabled={isGenerating} className="input text-sm">
              <option value="en">🇬🇧 English</option>
              <option value="ta">🇮🇳 Tamil</option>
              <option value="hi">🇮🇳 Hindi</option>
            </select>
          </div>
        </div>

        {/* Advanced options */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={cn('w-4 h-4 transition-transform', showAdvanced && 'rotate-180')} />
            Advanced options
          </button>
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <label className="block font-semibold text-sm mb-2">Prior experience with this topic</label>
                  <textarea
                    value={priorExp}
                    onChange={(e) => setPriorExp(e.target.value)}
                    disabled={isGenerating}
                    className="textarea h-20 text-sm"
                    placeholder="Briefly describe what you already know about this topic..."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Generation progress */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              className="rounded-xl border border-brand-200 dark:border-brand-800/50 bg-brand-50/50 dark:bg-brand-900/10 p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300">{genState.message}</span>
              </div>
              <div className="h-2 rounded-full bg-brand-100 dark:bg-brand-900/30 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                  animate={{ width: `${genState.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="mt-2 text-xs text-brand-600 dark:text-brand-400">
                ✨ AI is researching real-world resources and building your personalized plan…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        {genState.phase === 'error' && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{genState.message}</p>
            <p className="text-xs text-muted-foreground mt-1">Please check your API configuration and try again.</p>
          </div>
        )}

        {/* Info note */}
        <div className="flex gap-2.5 rounded-xl bg-accent/50 border border-border/50 p-4">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pathora generates a personalized roadmap using AI reasoning. When a research API is configured, real-world resources are retrieved from authoritative sources. Resources are clearly labeled if live search is unavailable.
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !goal.trim()}
          className="btn-primary w-full h-12 text-base"
        >
          {isGenerating
            ? <><Loader2 className="w-5 h-5 animate-spin" />Generating…</>
            : <><Sparkles className="w-5 h-5" />Generate My Learning Path<ArrowRight className="w-5 h-5" /></>
          }
        </button>
      </motion.div>

      {/* Example goals */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Example goals — click to try
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {EXAMPLE_GOALS.map((eg) => (
            <button
              key={eg.text}
              onClick={() => setGoal(eg.text)}
              disabled={isGenerating}
              className="text-left p-3 rounded-xl border border-border bg-card hover:border-brand-200 hover:bg-accent/50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs font-medium text-foreground leading-snug">{eg.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{eg.domain}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
