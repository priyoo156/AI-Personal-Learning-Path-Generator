import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand relative overflow-hidden flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40V0h1v40zM40 40V0h1v40z' fill='white' opacity='.5'/%3E%3Cpath d='M40 0H0v1h40zM40 40H0v1h40z' fill='white' opacity='.5'/%3E%3C/svg%3E")`
          }}
        />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L4 20 12 16 20 20 12 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-display font-bold text-white">Pathora AI</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-display font-bold text-white leading-tight mb-4">
              Your Goals.<br />
              Your Path.<br />
              Your Progress.
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
              Pathora AI turns any learning goal into a personalized roadmap, realistic schedule, and guided AI mentoring experience.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div
            className="mt-10 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {[
              { icon: '🎯', text: 'Personalized learning paths for any domain' },
              { icon: '🤖', text: 'AI mentor that teaches and answers doubts' },
              { icon: '📅', text: 'Smart daily and weekly study schedules' },
              { icon: '📈', text: 'Progress tracking and analytics' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/85 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-white/50 text-xs">
          Pathora AI — Powered by Google Gemini
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L4 20 12 16 20 20 12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display font-bold gradient-text">Pathora AI</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
