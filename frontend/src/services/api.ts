import axios, { AxiosError, AxiosResponse } from 'axios';
import { supabase } from '@/lib/supabase';
import type { ApiResponse } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s for AI requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach Supabase auth token safely ──────
apiClient.interceptors.request.use(async (config) => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        config.headers['Authorization'] = `Bearer ${data.session.access_token}`;
      }
    }
  } catch (err) {
    // Ignore in local demo/offline mode
  }
  return config;
});

// ── Response interceptor: normalize error format ─────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      // Session expired — sign out
      supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Helper to extract error message
// ============================================================
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error
      || error.response?.data?.message
      || error.message
      || 'An unexpected error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

// ============================================================
// Roadmap API
// ============================================================
export const roadmapApi = {
  generate: (input: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/roadmaps/generate', input),

  list: () =>
    apiClient.get<ApiResponse>('/roadmaps'),

  get: (id: string) =>
    apiClient.get<ApiResponse>(`/roadmaps/${id}`),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse>(`/roadmaps/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/roadmaps/${id}`),

  regeneratePhase: (roadmapId: string, phaseId: string) =>
    apiClient.post<ApiResponse>(`/roadmaps/${roadmapId}/phases/${phaseId}/regenerate`),

  markTopicComplete: (roadmapId: string, topicId: string, completed: boolean) =>
    apiClient.patch<ApiResponse>(`/roadmaps/${roadmapId}/topics/${topicId}`, { is_completed: completed }),

  markSubtopicComplete: (roadmapId: string, topicId: string, subtopicIndex: number, completed: boolean) =>
    apiClient.patch<ApiResponse>(
      `/roadmaps/${roadmapId}/topics/${topicId}/subtopics/${subtopicIndex}`,
      { is_completed: completed }
    ),
};

// ============================================================
// Schedule API
// ============================================================
export const scheduleApi = {
  generate: (roadmapId: string, options?: Record<string, unknown>) =>
    apiClient.post<ApiResponse>(`/schedule/generate`, { roadmap_id: roadmapId, ...options }),

  getTasks: (roadmapId: string, startDate?: string, endDate?: string) =>
    apiClient.get<ApiResponse>(`/schedule/${roadmapId}/tasks`, { params: { start_date: startDate, end_date: endDate } }),

  updateTask: (taskId: string, data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse>(`/tasks/${taskId}`, data),

  reschedule: (roadmapId: string) =>
    apiClient.post<ApiResponse>(`/schedule/${roadmapId}/reschedule`),
};

// ============================================================
// Chat API
// ============================================================
export const chatApi = {
  createSession: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/chat/sessions', data),

  getSessions: () =>
    apiClient.get<ApiResponse>('/chat/sessions'),

  getMessages: (sessionId: string) =>
    apiClient.get<ApiResponse>(`/chat/${sessionId}/messages`),

  sendMessage: (sessionId: string, content: string, language = 'en') =>
    apiClient.post<ApiResponse>(`/chat/${sessionId}/message`, { content, language }),

  deleteSession: (sessionId: string) =>
    apiClient.delete<ApiResponse>(`/chat/sessions/${sessionId}`),

  renameSession: (sessionId: string, title: string) =>
    apiClient.patch<ApiResponse>(`/chat/sessions/${sessionId}`, { title }),
};

// ============================================================
// Notes API
// ============================================================
export const notesApi = {
  list: (roadmapId?: string) =>
    apiClient.get<ApiResponse>('/notes', { params: { roadmap_id: roadmapId } }),

  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/notes', data),

  generateForTopic: (topic: string, type: 'summary' | 'detailed' | 'flashcards') =>
    apiClient.post<ApiResponse>('/notes/generate', { topic, type }),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse>(`/notes/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/notes/${id}`),
};

// ============================================================
// Resource API
// ============================================================
export const resourceApi = {
  list: () => apiClient.get<ApiResponse>('/resources'),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/resources', data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/resources/${id}`),
};

// ============================================================
// Quiz API
// ============================================================
export const quizApi = {
  generate: (topic: string, options: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/quizzes/generate', { topic, ...options }),

  list: (roadmapId?: string) =>
    apiClient.get<ApiResponse>('/quizzes', { params: { roadmap_id: roadmapId } }),

  submitAttempt: (quizId: string, answers: Record<string, string>) =>
    apiClient.post<ApiResponse>(`/quizzes/${quizId}/attempt`, { answers }),

  getAttempts: (quizId: string) =>
    apiClient.get<ApiResponse>(`/quizzes/${quizId}/attempts`),
};

// ============================================================
// Progress API
// ============================================================
export const progressApi = {
  getSummary: (roadmapId: string) =>
    apiClient.get<ApiResponse>(`/progress/${roadmapId}`),

  logSession: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/progress/sessions', data),
};

// ============================================================
// Profile API
// ============================================================
export const profileApi = {
  get: () => apiClient.get<ApiResponse>('/profile'),
  update: (data: Record<string, unknown>) => apiClient.put<ApiResponse>('/profile', data),
  updatePreferences: (data: Record<string, unknown>) => apiClient.put<ApiResponse>('/profile/preferences', data),
};

export default apiClient;
