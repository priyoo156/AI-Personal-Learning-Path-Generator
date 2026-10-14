import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle, Loader2,
  Target, Clock, Calendar, BookOpen, Globe, Brain
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { profileApi } from '@/services/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Little to no experience' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience, want to go deeper' },
  { value: 'advanced', label: 'Advanced', desc: 'Experienced, targeting mastery' },
];

const METHODS = [
  { value: 'videos', label: '🎥 Videos', desc: 'YouTube, courses, tutorials' },
  { value: 'reading', label: '📖 Reading', desc: 'Articles, books, docs' },
  { value: 'hands-on', label: '💻 Hands-on', desc: 'Projects, practice, labs' },
  { value: 'mixed', label: '⚡ Mixed', desc: 'Combination of all' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const LANGUAGES = [
  { value: 'en', label: '🇬🇧 English' },
  { value: 'ta', label: '🇮🇳 Tamil' },
  { value: 'hi', label: '🇮🇳 Hindi' },
];

interface OnboardingData {
  goal: string;
  current_level: string;
  prior_experience: string;
  target_outcome: string;
  target_date: string;
  daily_hours: number;
  preferred_days: string[];
  preferred_language: string;
  preferred_methods: string[];
  constraints: string;
  weak_areas: string;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    goal: '',
    current_level: 'beginner',
    prior_experience: '',
    target_outcome: '',
    target_date: '',
    daily_hours: 1,
    preferred_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    preferred_language: 'en',
    preferred_methods: ['mixed'],
    constraints: '',
    weak_areas: '',
  });

  const steps = [
    {
      title: 'What do you want to learn?',
      subtitle: 'Describe your learning goal in plain language — any domain, any level.',
      icon: Target,
    },
    {
      title: 'What\'s your current level?',
      subtitle: 'This helps Pathora personalize your starting point.',
      icon: Brain,
    },
    {
      title: 'How much time can you dedicate?',
      subtitle: 'We\'ll build a realistic schedule based on your availability.',
      icon: Clock,
    },
    {
      title: 'Learning preferences',
      subtitle: 'Help Pathora recommend the right resources for you.',
      icon: BookOpen,
    },
  ];

  const update = (key: keyof OnboardingData, value: unknown) =>
    setData((d) => ({ ...d, [key]: value }));

  const toggleDay = (day: string) => {
    setData((d) => ({
      ...d,
      preferred_days: d.preferred_days.includes(day)
        ? d.preferred_days.filter((x) => x !== day)
        : [...d.preferred_days, day],
    }));
  };

  const toggleMethod = (method: string) => {
    setData((d) => ({
      ...d,
      preferred_methods: d.preferred_methods.includes(method)
        ? d.preferred_methods.filter((x) => x !== method)
        : [...d.preferred_methods, method],
    }));
  };

  const canNext = () => {
    if (step === 0) return data.goal.trim().length > 10;
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await profileApi.updatePreferences({
        ...data,
        weak_areas: data.weak_areas ? data.weak_areas.split(',').map((s) => s.trim()) : [],
      }).catch(() => {}); // Profile may not exist yet, continue anyway
      toast.success('Profile set up! Generating your first roadmap…');
      navigate('/app/generate', { state: { goal: data.goal } });
    } catch {
      navigate('/app/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L4 20 12 16 20 20 12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display font-bold gradient-text">Pathora AI</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Welcome, {user?.full_name?.split(' ')[0] || 'Learner'} 👋 Let's set up your learning profile
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all duration-300',
              i <= step ? 'bg-brand-500' : 'bg-secondary')} />
          ))}
        </div>

        {/* Step card */}
        <div className="card p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                  <StepIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg">{currentStep.title}</h2>
                  <p className="text-sm text-muted-foreground">{currentStep.subtitle}</p>
                </div>
              </div>

              {/* Step 0: Goal */}
              {step === 0 && (
                <div className="space-y-4">
                  <textarea
                    value={data.goal}
                    onChange={(e) => update('goal', e.target.value)}
                    className="textarea h-28"
                    placeholder="e.g., I want to learn Python for data science and become job-ready in 6 months. I'm a complete beginner."
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Target outcome (optional)</label>
                    <input type="text" value={data.target_outcome}
                      onChange={(e) => update('target_outcome', e.target.value)}
                      className="input" placeholder="e.g., Get a data analyst job, pass GATE, build a portfolio" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Target date (optional)</label>
                    <input type="date" value={data.target_date}
                      onChange={(e) => update('target_date', e.target.value)}
                      className="input" min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Be specific. "Learn Python for data science in 6 months as a beginner" is better than just "Learn Python".
                  </p>
                </div>
              )}

              {/* Step 1: Level */}
              {step === 1 && (
                <div className="space-y-3">
                  {LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => update('current_level', level.value)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200',
                        data.current_level === level.value
                          ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-border hover:border-brand-200 hover:bg-accent/50'
                      )}
                    >
                      <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        data.current_level === level.value ? 'border-brand-500 bg-brand-500' : 'border-border')}>
                        {data.current_level === level.value && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{level.label}</p>
                        <p className="text-xs text-muted-foreground">{level.desc}</p>
                      </div>
                    </button>
                  ))}
                  <div className="pt-2">
                    <label className="block text-sm font-medium mb-1.5">Prior experience (optional)</label>
                    <textarea value={data.prior_experience}
                      onChange={(e) => update('prior_experience', e.target.value)}
                      className="textarea h-20" placeholder="Briefly describe what you already know about this topic..." />
                  </div>
                </div>
              )}

              {/* Step 2: Time */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Daily study hours: <span className="text-brand-500 font-bold">{data.daily_hours}h</span>
                    </label>
                    <input type="range" min={0.5} max={8} step={0.5}
                      value={data.daily_hours}
                      onChange={(e) => update('daily_hours', parseFloat(e.target.value))}
                      className="w-full accent-brand-500" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>30 min</span><span>2h (ideal)</span><span>8h</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3">Preferred study days</label>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map((day) => (
                        <button key={day} onClick={() => toggleDay(day)}
                          className={cn('px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                            data.preferred_days.includes(day)
                              ? 'bg-brand-500 border-brand-500 text-white'
                              : 'border-border text-muted-foreground hover:border-brand-300')}>
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Known weak areas (optional)</label>
                    <input type="text" value={data.weak_areas}
                      onChange={(e) => update('weak_areas', e.target.value)}
                      className="input" placeholder="e.g., mathematics, networking, system design (comma-separated)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Constraints or notes (optional)</label>
                    <textarea value={data.constraints}
                      onChange={(e) => update('constraints', e.target.value)}
                      className="textarea h-16" placeholder="e.g., No weekends, exam on March 20, learning after work..." />
                  </div>
                </div>
              )}

              {/* Step 3: Preferences */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Preferred language</label>
                    <div className="flex gap-3 flex-wrap">
                      {LANGUAGES.map((lang) => (
                        <button key={lang.value} onClick={() => update('preferred_language', lang.value)}
                          className={cn('px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                            data.preferred_language === lang.value
                              ? 'bg-brand-500 border-brand-500 text-white'
                              : 'border-border text-muted-foreground hover:border-brand-300')}>
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3">Preferred learning methods (select all that apply)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {METHODS.map((method) => (
                        <button key={method.value} onClick={() => toggleMethod(method.value)}
                          className={cn('flex flex-col items-start p-4 rounded-xl border text-left transition-all',
                            data.preferred_methods.includes(method.value)
                              ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-border hover:border-brand-200')}>
                          <span className="font-medium text-sm">{method.label}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">{method.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="btn-ghost">
                  <ArrowLeft className="w-4 h-4" />Back
                </button>
              )}
              {step > 0 && (
                <button onClick={() => navigate('/app/dashboard')} className="btn-ghost text-muted-foreground text-xs">
                  Skip setup
                </button>
              )}
            </div>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="btn-primary"
              >
                Continue<ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={loading} className="btn-primary">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Setting up…</>
                  : <><Sparkles className="w-4 h-4" />Generate My Roadmap</>
                }
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Step {step + 1} of {steps.length} · You can update preferences later in Settings
        </p>
      </div>
    </div>
  );
}
