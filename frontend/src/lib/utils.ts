import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';

// ============================================================
// Class name utility (shadcn/ui pattern)
// ============================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// Date utilities
// ============================================================
export function formatDate(date: string | Date, fmt = 'MMM dd, yyyy') {
  return format(new Date(date), fmt);
}

export function formatRelativeDate(date: string | Date) {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

// ============================================================
// String utilities
// ============================================================
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '…';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ============================================================
// Number utilities
// ============================================================
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// ============================================================
// Color utilities
// ============================================================
export function getLevelColor(level: string): string {
  switch (level) {
    case 'beginner': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
    case 'intermediate': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
    case 'advanced': return 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20';
    default: return 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-900/20';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
    case 'in_progress': return 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-900/20';
    case 'pending': return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20';
    case 'skipped': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
    case 'missed': return 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20';
    case 'paused': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
    default: return 'text-slate-600 bg-slate-50';
  }
}

// ============================================================
// Phase color by index
// ============================================================
export const PHASE_COLORS = [
  { bg: 'bg-brand-500', text: 'text-brand-500', ring: 'ring-brand-500/30', light: 'bg-brand-50 dark:bg-brand-900/20' },
  { bg: 'bg-violet-500', text: 'text-violet-500', ring: 'ring-violet-500/30', light: 'bg-violet-50 dark:bg-violet-900/20' },
  { bg: 'bg-electric-500', text: 'text-electric-500', ring: 'ring-electric-500/30', light: 'bg-electric-50 dark:bg-electric-900/20' },
  { bg: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-500/30', light: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500/30', light: 'bg-amber-50 dark:bg-amber-900/20' },
  { bg: 'bg-rose-500', text: 'text-rose-500', ring: 'ring-rose-500/30', light: 'bg-rose-50 dark:bg-rose-900/20' },
];

// ============================================================
// Validation helpers
// ============================================================
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// Local storage with error handling
// ============================================================
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};

// ============================================================
// Copy to clipboard
// ============================================================
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// Generate unique ID (client side)
// ============================================================
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ============================================================
// Domain detection helper
// ============================================================
export function detectDomainCategory(goal: string): string {
  const lower = goal.toLowerCase();
  if (/python|javascript|typescript|react|node|programming|code|developer|software/.test(lower)) return 'Programming';
  if (/ai|machine learning|deep learning|nlp|generative|llm/.test(lower)) return 'Artificial Intelligence';
  if (/design|figma|ui|ux|graphic|illustration/.test(lower)) return 'Design';
  if (/data|analytics|sql|excel|tableau|power bi/.test(lower)) return 'Data & Analytics';
  if (/english|language|communication|speaking|writing/.test(lower)) return 'Language Learning';
  if (/gate|upsc|jee|neet|competitive|exam/.test(lower)) return 'Exam Preparation';
  if (/finance|investment|stock|accounting|economics/.test(lower)) return 'Finance & Business';
  if (/music|guitar|piano|singing|instrument/.test(lower)) return 'Music & Arts';
  if (/marketing|seo|social media|digital marketing/.test(lower)) return 'Digital Marketing';
  if (/math|calculus|algebra|statistics|physics/.test(lower)) return 'Mathematics & Science';
  return 'Custom Domain';
}
