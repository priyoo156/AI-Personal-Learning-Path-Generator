import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Map, Calendar, MessageCircle, FileText, BarChart3,
  BookOpen, Globe, RefreshCw, Brain, ArrowRight, CheckCircle,
  Play, ChevronDown, Star, Zap, Shield, Users, Clock,
  GraduationCap, Code, Palette, TrendingUp, Music, Languages,
  Menu, X, ExternalLink
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

// ─── Feature data ─────────────────────────────────────────────
const FEATURES = [
  {
    icon: Map,
    color: 'from-brand-500 to-violet-500',
    title: 'Universal Learning Paths',
    desc: 'Personalized roadmaps for any domain — programming, design, languages, music, exams, business, and beyond.',
  },
  {
    icon: Globe,
    color: 'from-electric-500 to-cyan-500',
    title: 'AI Research Assistant',
    desc: 'Real-world resources sourced from official docs, reputable courses, and authoritative references — not hallucinations.',
  },
  {
    icon: Calendar,
    color: 'from-emerald-500 to-teal-500',
    title: 'Smart Roadmap Scheduler',
    desc: 'Turn any roadmap into daily and weekly study sessions based on your available hours, deadlines, and priorities.',
  },
  {
    icon: MessageCircle,
    color: 'from-rose-500 to-pink-500',
    title: 'Personal AI Teacher',
    desc: 'Ask any doubt, get step-by-step explanations, examples, and analogies adapted to your skill level.',
  },
  {
    icon: Brain,
    color: 'from-amber-500 to-orange-500',
    title: 'AI Motivation Mentor',
    desc: 'Stay consistent with actionable recovery plans, encouragement, and study guidance tailored to your goals.',
  },
  {
    icon: Zap,
    color: 'from-violet-500 to-brand-500',
    title: 'Adaptive Learning',
    desc: 'Recommendations evolve based on your performance — weak topics get more focus, strong ones advance faster.',
  },
  {
    icon: FileText,
    color: 'from-cyan-500 to-electric-500',
    title: 'AI Notes & Quizzes',
    desc: 'Generate summaries, flashcards, and practice questions for any topic. Review and test yourself interactively.',
  },
  {
    icon: BarChart3,
    color: 'from-teal-500 to-emerald-500',
    title: 'Progress Intelligence',
    desc: 'Track completion, study hours, quiz accuracy, milestones, and consistency with beautiful visual dashboards.',
  },
  {
    icon: RefreshCw,
    color: 'from-pink-500 to-rose-500',
    title: 'Flexible Rescheduling',
    desc: 'Miss a session? The AI intelligently redistributes tasks without overloading you or breaking your deadline.',
  },
  {
    icon: Languages,
    color: 'from-orange-500 to-amber-500',
    title: 'Multilingual Learning',
    desc: 'Study and interact in English, Tamil, or Hindi. Your AI mentor responds in your preferred language.',
  },
];

const DOMAINS = [
  { icon: Code, label: 'Programming', desc: 'Python, JS, React, and more', color: 'text-electric-500' },
  { icon: Brain, label: 'AI & ML', desc: 'Machine Learning, Gen AI, LLMs', color: 'text-brand-500' },
  { icon: Palette, label: 'UI/UX Design', desc: 'Figma, design systems, UX', color: 'text-violet-500' },
  { icon: TrendingUp, label: 'Data Analytics', desc: 'SQL, Python, Tableau, BI', color: 'text-emerald-500' },
  { icon: GraduationCap, label: 'Exam Prep', desc: 'GATE, UPSC, JEE, NEET', color: 'text-amber-500' },
  { icon: Globe, label: 'Languages', desc: 'English, Tamil, Hindi, more', color: 'text-cyan-500' },
  { icon: BarChart3, label: 'Finance & Business', desc: 'Finance, marketing, MBA', color: 'text-rose-500' },
  { icon: Music, label: 'Creative Skills', desc: 'Music, art, photography', color: 'text-pink-500' },
];

const STEPS = [
  {
    number: '01',
    title: 'Tell Pathora your goal',
    desc: 'Type your learning goal in plain language — any domain, any level.',
    example: '"I want to learn React from scratch and build real projects in 3 months"',
  },
  {
    number: '02',
    title: 'Personalize your preferences',
    desc: 'Share your experience, available time, learning style, and target date.',
    example: '2 hours/day, weekends, beginner level, prefer hands-on practice',
  },
  {
    number: '03',
    title: 'Get your AI-powered roadmap',
    desc: 'Pathora generates a structured roadmap with real-world resources and a realistic schedule.',
    example: 'Phases → Topics → Resources → Practice Tasks → Schedule',
  },
  {
    number: '04',
    title: 'Learn with your AI mentor',
    desc: 'Follow your daily plan, ask doubts, practice quizzes, and track your progress.',
    example: 'AI teaches, schedules, motivates, and adapts to your pace',
  },
];

const FAQS = [
  {
    q: 'What domains can Pathora generate learning paths for?',
    a: 'Pathora uses AI reasoning to create roadmaps for virtually any learning goal — programming, design, languages, music, competitive exams, finance, creative skills, and more. It is not limited to predefined categories.',
  },
  {
    q: 'Does Pathora use real-world resources or make up links?',
    a: 'When a search integration is configured, Pathora retrieves resources from official docs, recognized course platforms, and authoritative sources. Fabricated links are never presented as real. When live search is unavailable, resources are clearly labeled as AI recommendations pending verification.',
  },
  {
    q: 'How does the AI mentor differ from a general chatbot?',
    a: 'The Pathora AI mentor knows your roadmap, your current topic, your progress, and your level. It teaches step-by-step, adapts explanations, generates practice questions, and provides actionable study guidance — not just generic answers.',
  },
  {
    q: 'What happens if I miss study sessions?',
    a: 'The intelligent scheduler identifies affected topics, checks your available time, and redistributes tasks without overloading you. If the deadline becomes unrealistic, it explains trade-offs and suggests adjustments.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. Pathora uses Supabase with Row Level Security. Your data is only accessible to your account. AI API calls are server-side, and no credentials or user data are exposed to the browser.',
  },
];

// ─── Sample roadmap for demo ───────────────────────────────────
const DEMO_ROADMAP = {
  title: 'Python Programming — Beginner to Job-Ready',
  goal: 'Learn Python and become job-ready in 4 months, 1.5 hours/day',
  phases: [
    {
      title: 'Phase 1: Python Foundations',
      duration: '3 weeks',
      topics: ['Variables & Data Types', 'Control Flow', 'Functions', 'Lists & Dicts'],
      complete: true,
    },
    {
      title: 'Phase 2: Intermediate Python',
      duration: '4 weeks',
      topics: ['OOP', 'File I/O', 'Error Handling', 'Modules & Packages'],
      complete: true,
    },
    {
      title: 'Phase 3: Libraries & Data',
      duration: '5 weeks',
      topics: ['NumPy', 'Pandas', 'Matplotlib', 'APIs & JSON'],
      complete: false,
      current: true,
    },
    {
      title: 'Phase 4: Projects & Portfolio',
      duration: '4 weeks',
      topics: ['Web Scraping', 'Flask App', 'Data Project', 'GitHub Portfolio'],
      complete: false,
    },
  ],
};

// ─── Navbar ────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Explore', href: '#domains' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow glow-brand-sm transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L4 20 12 16 20 20 12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display font-bold gradient-text text-lg">Pathora AI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/app/dashboard" className="btn-primary text-sm px-5 py-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-xs px-3 py-2 border-brand-500/30 text-brand-600 dark:text-brand-400">
                  ✨ Live Demo
                </Link>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/signup" className="btn-primary text-sm px-5 py-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden glass-strong border-t border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2.5 justify-center">Login</Link>
                <Link to="/signup" className="btn-primary text-sm py-2.5 justify-center">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// missing import
function LayoutDashboard({ className }: { className?: string }) {
  return <BarChart3 className={className} />;
}

// ─── Hero Section ──────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [goalInput, setGoalInput] = useState('');

  const exampleGoals = [
    'Learn React from scratch in 3 months',
    'Prepare for GATE 2025 Computer Science',
    'Master UI/UX Design with Figma',
    'Learn Data Analytics and become job-ready',
    'Improve spoken English for interviews',
    'Learn to play acoustic guitar',
  ];

  const [exampleIndex, setExampleIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setExampleIndex((i) => (i + 1) % exampleGoals.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleGenerate = () => {
    if (isAuthenticated) {
      navigate('/app/generate', { state: { goal: goalInput } });
    } else {
      navigate('/signup', { state: { goal: goalInput } });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background gradients */}
      <div className="absolute inset-0 gradient-subtle" />
      <div className="absolute inset-0 opacity-30 dark:opacity-40"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, hsl(258 90% 66% / 0.25), transparent)',
        }}
      />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-electric-500/10 blur-3xl animate-float animation-delay-500" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 badge-brand mb-6 py-1.5 pr-3 pl-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Powered by Google Gemini</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span>Any Goal.</span><br />
              <span>Any Domain.</span><br />
              <span className="gradient-text">One Personal AI</span><br />
              <span className="gradient-text">Learning Path.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Pathora AI turns your learning goal into a structured roadmap, a realistic daily schedule, real-world resources, and an AI mentor that teaches, quizzes, and motivates you every step of the way.
            </motion.p>

            {/* Goal input */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && goalInput && handleGenerate()}
                      placeholder={`e.g., ${exampleGoals[exampleIndex]}`}
                      className="input h-12 text-sm pr-4 shadow-sm transition-all duration-500"
                    />
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="btn-primary h-12 px-6 whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate My Path
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Try: "Learn Python for data science in 6 months" — free to start
                </p>
              </div>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {[
                { icon: CheckCircle, text: 'Any domain, any goal' },
                { icon: Shield, text: 'Your data is private' },
                { icon: Clock, text: 'Ready in seconds' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <item.icon className="w-3.5 h-3.5 text-brand-500" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Hero illustration */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl glow-brand border border-white/10">
              <img
                src="/hero-dashboard.jpg"
                alt="Pathora AI dashboard showing learning roadmap, daily schedule, and AI mentor chat"
                className="w-full object-cover"
                loading="eager"
              />
              {/* Overlay label */}
              <div className="absolute bottom-3 left-3 glass rounded-lg px-3 py-1.5 text-xs font-medium text-foreground border border-white/20">
                ✨ Illustrative demo — your roadmap will be personalized
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              className="absolute -top-4 -right-4 glass rounded-xl px-4 py-2.5 shadow-lg border border-white/20"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-foreground">AI Roadmap Generated</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 glass rounded-xl px-4 py-2.5 shadow-lg border border-white/20"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-brand-500" />
                <span className="text-xs font-semibold text-foreground">AI Mentor Active</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features Section ──────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 badge-brand mb-4 py-1.5 px-3">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">10 Powerful Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Learn Anything</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From roadmap to mastery — Pathora AI provides every tool you need for structured, guided, and motivated learning in any domain.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="card-hover p-5 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-sm transition-transform group-hover:scale-110',
                  feature.color
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-2 text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            How Pathora <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            From goal to personalized learning plan in minutes
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent -translate-x-1/2 z-0" />
              )}

              <div className="card p-6 relative z-10 h-full">
                {/* Step number */}
                <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mb-5 shadow-lg glow-brand-sm">
                  <span className="text-white font-display font-bold text-lg">{step.number}</span>
                </div>

                <h3 className="font-display font-semibold text-base mb-3 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.desc}</p>

                {/* Example */}
                <div className="rounded-lg bg-accent/50 px-3 py-2.5 border border-border/50">
                  <p className="text-xs text-muted-foreground italic">"{step.example}"</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Demo Roadmap ─────────────────────────────────────────────
function DemoRoadmapSection() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(2);

  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 badge-brand mb-4 py-1.5 px-3">
            <Map className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Demo — Illustrative Example</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Sample <span className="gradient-text">Learning Roadmap</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Here's what a generated roadmap looks like. Your actual roadmap is personalized to your goal, level, and schedule.
          </p>
        </motion.div>

        <motion.div
          className="card p-6 lg:p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Roadmap header */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shadow flex-shrink-0">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">{DEMO_ROADMAP.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">"{DEMO_ROADMAP.goal}"</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="badge-brand py-1">Active</span>
                <span className="text-xs text-muted-foreground">4 phases · 16 weeks estimated</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Overall Progress</span>
              <span>50% complete</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-3">
            {DEMO_ROADMAP.phases.map((phase, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-xl border transition-all duration-200 overflow-hidden',
                  phase.current ? 'border-brand-300 dark:border-brand-700 shadow-sm' : 'border-border',
                  phase.complete ? 'opacity-70' : ''
                )}
              >
                <button
                  className="w-full flex items-center gap-4 p-4 text-left"
                  onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold',
                    phase.complete ? 'bg-emerald-500 text-white' :
                    phase.current ? 'gradient-brand text-white shadow glow-brand-sm' :
                    'bg-secondary text-muted-foreground'
                  )}>
                    {phase.complete ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{phase.title}</span>
                      {phase.current && <span className="badge-brand py-0.5 text-[10px]">Current</span>}
                      {phase.complete && <span className="badge-success py-0.5 text-[10px]">Done</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{phase.duration}</span>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', expandedPhase === i && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {expandedPhase === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 flex flex-wrap gap-2">
                        {phase.topics.map((topic) => (
                          <span key={topic} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-accent text-muted-foreground border border-border">
                            <BookOpen className="w-3 h-3" />
                            {topic}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground italic">
            ✨ This is an illustrative example. Your roadmap is generated by AI based on your specific goal and preferences.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Domains Section ──────────────────────────────────────────
function DomainsSection() {
  return (
    <section id="domains" className="py-24 gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Learn <span className="gradient-text">Any Domain</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Pathora's AI engine is not limited to predefined categories. Enter any goal in plain language and it adapts.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {DOMAINS.map((domain, i) => {
            const Icon = domain.icon;
            return (
              <motion.div
                key={domain.label}
                className="card-hover p-5 text-center group cursor-default"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={cn('w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center bg-secondary group-hover:scale-110 transition-transform')}>
                  <Icon className={cn('w-5 h-5', domain.color)} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{domain.label}</h3>
                <p className="text-xs text-muted-foreground">{domain.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-6 py-3 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>…and any other goal you can describe in plain language</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── AI Mentor Demo ──────────────────────────────────────────
function AIMentorSection() {
  const demoMessages = [
    { role: 'user', text: 'I don\'t understand backpropagation. Can you explain it simply?' },
    { role: 'assistant', text: 'Great question! Let\'s break it down step by step.\n\n**Backpropagation** is how a neural network learns from its mistakes. Think of it like this:\n\n1. **Forward pass**: The network makes a prediction\n2. **Calculate error**: We measure how wrong it was\n3. **Backward pass**: We trace *which weights caused the error* — going backwards layer by layer\n4. **Update**: Adjust each weight to reduce the error\n\nThe key math is the **chain rule** from calculus, which lets us calculate how much each weight contributed to the error. Want me to show a concrete numerical example?' },
    { role: 'user', text: 'Yes please! Show me with numbers.' },
    { role: 'assistant', text: 'Perfect! Let\'s use the simplest possible network...' },
  ];

  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 badge-brand mb-4 py-1.5 px-3">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">AI Study Mentor</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              A Teacher That Actually{' '}
              <span className="gradient-text">Understands You</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The Pathora AI mentor knows your roadmap, your current topic, and your level. It teaches step-by-step, adapts explanations, generates practice questions, and provides real study guidance — not just generic answers.
            </p>
            <ul className="space-y-3">
              {[
                'Step-by-step explanations with examples',
                'Adapts to your skill level automatically',
                'Practice questions and quizzes on demand',
                'Responds in English, Tamil, or Hindi',
                'Connects answers to your active roadmap',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="btn-primary mt-8 inline-flex">
              Meet Your AI Mentor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Chat demo */}
          <motion.div
            className="card overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-r from-brand-600/10 to-violet-600/10">
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Pathora AI Mentor</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Active · Machine Learning Roadmap
                </p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground italic">Demo conversation</div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-4 max-h-80 overflow-auto scrollbar-thin">
              {demoMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full gradient-brand flex-shrink-0 flex items-center justify-center mt-1">
                      <Brain className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    'rounded-2xl px-4 py-3 text-sm max-w-xs lg:max-w-sm',
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-secondary text-foreground rounded-tl-sm'
                  )}>
                    {msg.text.split('\n').map((line, j) => (
                      <p key={j} className={cn('leading-relaxed', line.startsWith('**') ? 'font-semibold' : '', j > 0 && 'mt-1')}>
                        {line.replace(/\*\*/g, '')}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <div className="flex gap-3 items-center">
                <div className="w-7 h-7 rounded-full gradient-brand flex-shrink-0 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-2.5">
                <span className="text-sm text-muted-foreground flex-1 italic">Ask a question about your roadmap…</span>
                <button className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Section ─────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 gradient-subtle">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <button
                className="w-full flex items-start gap-4 p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="flex-1 font-medium text-sm leading-relaxed">{faq.q}</span>
                <ChevronDown className={cn('w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform', open === i && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          className="relative rounded-3xl p-12 overflow-hidden gradient-brand shadow-2xl glow-brand"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1' fill='white'/%3E%3C/svg%3E")` }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
              Start Your Learning Journey
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Enter your goal, get your personalized roadmap, and start learning with your AI mentor today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                <Sparkles className="w-5 h-5" />
                Generate My Learning Path — Free
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Sign in to continue
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L4 20 12 16 20 20 12 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-display font-bold gradient-text">Pathora AI</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your Goals. Your Path. Your Progress.<br />
              Powered by Google Gemini.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2">
              {['Features', 'How It Works', 'Pricing', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Learn</h4>
            <ul className="space-y-2">
              {['Documentation', 'Blog', 'Examples', 'Community'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 Pathora AI. Built with Google Gemini. Demonstration content is labeled as such.
          </p>
          <div className="flex items-center gap-4">
            <a href="mailto:hello@pathora.ai" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page Composition ─────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DemoRoadmapSection />
      <DomainsSection />
      <AIMentorSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
