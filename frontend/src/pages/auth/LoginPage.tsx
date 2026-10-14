import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/app/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      // Graceful local mode when Supabase API keys are not added yet
      useAuthStore.getState().setUser({
        id: 'local-user',
        email: email,
        full_name: email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      toast.success('Signed in successfully! 🚀');
      navigate(from, { replace: true });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error(msg.includes('Invalid') ? 'Incorrect email or password' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm mt-1">Sign in to continue your learning journey</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="login-email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn('input pl-10', errors.email && 'border-destructive focus-visible:ring-destructive')}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium" htmlFor="login-password">Password</label>
            <Link to="/forgot-password" className="text-xs text-brand-500 hover:text-brand-600 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn('input pl-10 pr-10', errors.password && 'border-destructive focus-visible:ring-destructive')}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full h-11"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
          ) : (
            <>Sign In<ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or Preview Instantly</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            useAuthStore.getState().setUser({
              id: 'demo-user',
              email: 'learner@pathora.ai',
              full_name: 'Alex Chen',
              avatar_url: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            toast.success('Welcome to Pathora AI Demo Mode! 🚀');
            navigate('/app/dashboard');
          }}
          className="btn-secondary w-full h-11 text-xs font-semibold flex items-center justify-center gap-2 border-brand-500/40 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10"
        >
          ⚡ Explore Demo Mode (Instant Access)
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-medium transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
