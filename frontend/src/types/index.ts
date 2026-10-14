// ============================================================
// Core Domain Types for Pathora AI
// ============================================================

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
export type LearningMethod = 'reading' | 'videos' | 'hands-on' | 'mixed';
export type Language = 'en' | 'ta' | 'hi';
export type ResourceType = 'documentation' | 'course' | 'video' | 'book' | 'article' | 'tool' | 'practice' | 'other';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'missed';
export type RoadmapStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

// ============================================================
// User & Auth
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LearningPreferences {
  id: string;
  user_id: string;
  current_level: LearningLevel;
  preferred_language: Language;
  preferred_methods: LearningMethod[];
  daily_hours: number;
  preferred_days: string[];
  session_length_minutes: number;
  known_weak_areas?: string[];
  constraints?: string;
  updated_at: string;
}

// ============================================================
// Roadmap
// ============================================================

export interface LearningResource {
  id?: string;
  title: string;
  url: string;
  publisher?: string;
  resource_type: ResourceType;
  description?: string;
  relevance?: string;
  is_verified?: boolean;
  topic_id?: string;
}

export interface RoadmapTopic {
  id: string;
  phase_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_hours: number;
  objectives: string[];
  concepts: string[];
  prerequisites: string[];
  subtopics?: string[];
  subtopic_progress?: boolean[];
  practice_activities: string[];
  resources: LearningResource[];
  assessment_questions?: string[];
  is_completed: boolean;
  completion_percentage: number;
}

export interface RoadmapPhase {
  id: string;
  roadmap_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_weeks: number;
  why_this_phase: string;
  milestone: string;
  topics: RoadmapTopic[];
  is_completed: boolean;
}

export interface Roadmap {
  id: string;
  user_id: string;
  title: string;
  description: string;
  goal: string;
  target_outcome: string;
  domain: string;
  current_level: LearningLevel;
  target_date?: string;
  preferred_days?: string[];
  daily_hours: number;
  total_estimated_hours: number;
  total_estimated_weeks: number;
  status: RoadmapStatus;
  completion_percentage: number;
  prerequisites_assumed: string[];
  starting_point: string;
  completion_criteria: string[];
  phases: RoadmapPhase[];
  is_research_backed: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoadmapGenerationInput {
  goal: string;
  current_level?: LearningLevel;
  prior_experience?: string;
  target_outcome?: string;
  target_date?: string;
  daily_hours?: number;
  preferred_days?: string[];
  preferred_language?: Language;
  preferred_methods?: LearningMethod[];
  constraints?: string;
  weak_areas?: string[];
}

// ============================================================
// Scheduler & Tasks
// ============================================================

export interface StudyTask {
  id: string;
  roadmap_id: string;
  topic_id: string;
  unit_key?: string;
  subtopic?: string | null;
  user_id: string;
  title: string;
  description?: string;
  task_type: 'study' | 'practice' | 'revision' | 'assessment' | 'project';
  scheduled_date: string;
  start_time?: string;
  duration_minutes: number;
  status: TaskStatus;
  phase_title?: string;
  topic_title?: string;
  resources?: LearningResource[];
  skip_reason?: string;
  completed_at?: string;
  created_at: string;
}

// ============================================================
// Chat / AI Mentor
// ============================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  roadmap_id?: string;
  topic_id?: string;
  language: Language;
  message_count: number;
  last_message_at?: string;
  created_at: string;
}

// ============================================================
// Notes & Quizzes
// ============================================================

export interface Note {
  id: string;
  user_id: string;
  topic_id?: string;
  roadmap_id?: string;
  title: string;
  content: string;
  is_ai_generated: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_type: 'mcq' | 'short_answer' | 'true_false';
}

export interface Quiz {
  id: string;
  user_id: string;
  topic_id?: string;
  roadmap_id?: string;
  title: string;
  questions: QuizQuestion[];
  is_ai_generated: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  answers: Record<string, string>;
  completed_at: string;
}

// ============================================================
// Progress & Analytics
// ============================================================

export interface TopicProgress {
  topic_id: string;
  topic_title: string;
  phase_title: string;
  completion_percentage: number;
  study_hours_completed: number;
  quiz_accuracy?: number;
  last_studied_at?: string;
}

export interface ProgressSummary {
  roadmap_id: string;
  overall_percentage: number;
  topics_completed: number;
  topics_total: number;
  study_hours_planned: number;
  study_hours_actual: number;
  quiz_accuracy_avg: number;
  milestones_reached: number;
  milestones_total: number;
  streak_days: number;
  week_activity: { date: string; hours: number }[];
  strong_topics: string[];
  weak_topics: string[];
  next_recommendations: string[];
}

// ============================================================
// API Response
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================
// UI State
// ============================================================

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}
