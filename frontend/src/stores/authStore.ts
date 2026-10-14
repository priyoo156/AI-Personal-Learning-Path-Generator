import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  session: unknown;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
  // Actions
  setUser: (user: UserProfile | null, isDemo?: boolean) => void;
  setSession: (session: unknown) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      isDemo: false,

      setUser: (user, isDemo = false) =>
        set({ user, isAuthenticated: !!user, isDemo, isLoading: false }),

      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      updateProfile: async (data: Partial<UserProfile>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore offline errors
        }
        set({ user: null, session: null, isAuthenticated: false, isDemo: false, isLoading: false });
      },

      initialize: async () => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

        // If user is already authenticated in demo mode or persisted, don't wipe them out
        if (get().isDemo && get().user) {
          set({ isAuthenticated: true, isLoading: false });
          return;
        }

        if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
          set({ isLoading: false });
          return;
        }

        try {
          const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 1000)
          );
          const { data } = await Promise.race([
            supabase.auth.getSession(),
            timeoutPromise,
          ]);

          if (data?.session?.user) {
            set({
              session: data.session,
              user: {
                id: data.session.user.id,
                email: data.session.user.email ?? '',
                full_name: data.session.user.user_metadata?.full_name,
                avatar_url: data.session.user.user_metadata?.avatar_url,
                created_at: data.session.user.created_at,
                updated_at: data.session.user.updated_at ?? data.session.user.created_at,
              },
              isAuthenticated: true,
              isDemo: false,
            });
          }
        } catch (err) {
          console.warn('[Auth] Supabase init check skipped:', err);
        } finally {
          set({ isLoading: false });
        }

        try {
          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event: unknown, session: any) => {
            if (session?.user) {
              set({
                session,
                user: {
                  id: session.user.id,
                  email: session.user.email ?? '',
                  full_name: session.user.user_metadata?.full_name,
                  avatar_url: session.user.user_metadata?.avatar_url,
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at ?? session.user.created_at,
                },
                isAuthenticated: true,
                isDemo: false,
                isLoading: false,
              });
            } else if (!get().isDemo) {
              // Only reset if NOT in Demo Mode
              set({ user: null, session: null, isAuthenticated: false, isLoading: false });
            }
          });
        } catch {
          // Ignore offline listener errors
        }
      },
    }),
    {
      name: 'pathora-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isDemo: state.isDemo,
      }),
    }
  )
);
