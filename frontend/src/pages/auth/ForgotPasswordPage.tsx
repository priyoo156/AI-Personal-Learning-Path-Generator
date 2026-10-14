import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Check your email</h2>
        <p className="text-muted-foreground text-sm mb-8">
          We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the link to reset your password.
        </p>
        <Link to="/login" className="btn-primary justify-center w-full">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" />Back to login
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold">Reset your password</h1>
        <p className="text-muted-foreground text-sm mt-1">Enter your email and we'll send you a reset link</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="reset-email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input pl-10" placeholder="you@example.com" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full h-11">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : <>Send Reset Link<ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </div>
  );
}
