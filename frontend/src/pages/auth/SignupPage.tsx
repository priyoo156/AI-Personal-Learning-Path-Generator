import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      useAuthStore.getState().setUser({
        id: 'local-user',
        email: email,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      toast.success('Account created! Welcome to Pathora AI! 🎉');
      navigate('/app/dashboard');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/app/dashboard`,
        },
      });
      if (error) throw error;
      toast.success('Account created! Check your email to verify.');
      navigate('/onboarding');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      toast.error(msg.includes('already registered') ? 'Email already in use. Try logging in.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const ps = passwordStrength();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm mt-1">Start your personalized AI learning journey</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full name */}
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="signup-name">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={cn('input pl-10', errors.fullName && 'border-destructive')}
              placeholder="Your full name"
              autoComplete="name"
            />
          </div>
          {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="signup-email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn('input pl-10', errors.email && 'border-destructive')}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="signup-password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="signup-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn('input pl-10 pr-10', errors.password && 'border-destructive')}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= ps ? strengthColors[ps] : 'bg-secondary')} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength: <span className={cn('font-medium', ps >= 3 ? 'text-emerald-500' : ps >= 2 ? 'text-amber-500' : 'text-red-500')}>{strengthLabels[ps]}</span>
              </p>
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
        </div>

        {/* Terms */}
        <p className="text-xs text-muted-foreground">
          By creating an account you agree to our{' '}
          <a href="#" className="text-brand-500 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-brand-500 hover:underline">Privacy Policy</a>.
        </p>

        <button type="submit" disabled={loading} className="btn-primary w-full h-11">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</>
            : <><CheckCircle className="w-4 h-4" />Create My Account<ArrowRight className="w-4 h-4" /></>
          }
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
