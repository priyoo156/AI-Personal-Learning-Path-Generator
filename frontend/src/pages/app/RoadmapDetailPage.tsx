import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Calendar, MessageCircle, BookOpen, CheckCircle, Circle,
  ChevronDown, ChevronRight, Clock, Award, ExternalLink, Sparkles,
  Share2, Download, ArrowLeft, RefreshCw, CheckCircle2,
  FileText, HelpCircle, Layers, Target, BookMarked
} from 'lucide-react';
import { roadmapApi } from '@/services/api';
import { cn, formatHours } from '@/lib/utils';
import type { Roadmap, RoadmapPhase, RoadmapTopic, LearningResource } from '@/types';
import toast from 'react-hot-toast';

// Fallback roadmap for demonstration or offline development
const MOCK_ROADMAP: Roadmap = {
  id: 'demo-fullstack-ai',
  user_id: 'user-demo',
  title: 'Full-Stack GenAI & LLM Application Engineer',
  description: 'Master modern full-stack engineering integrated with Large Language Models, LangChain, vector databases, and agentic workflows.',
  goal: 'Build and deploy enterprise-grade AI products',
  target_outcome: 'Production Full-Stack AI Engineer',
  domain: 'Artificial Intelligence & Web Dev',
  current_level: 'intermediate',
  daily_hours: 2,
  total_estimated_hours: 84,
  total_estimated_weeks: 6,
  status: 'active',
  completion_percentage: 35,
  is_research_backed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  prerequisites_assumed: ['JavaScript / TypeScript fundamentals', 'Basic Python & Git familiarity', 'HTTP & REST APIs'],
  starting_point: 'Intermediate JavaScript/Python developer seeking AI specialization',
  completion_criteria: [
    'Deploy a complete RAG-powered application to cloud infrastructure',
    'Build an autonomous agent with multi-tool calling and memory persistence',
    'Pass end-to-end evaluation with automated unit & hallucination testing'
  ],
  phases: [
    {
      id: 'p1',
      roadmap_id: 'demo-fullstack-ai',
      title: 'Phase 1: Foundation of LLMs & API Integration',
      description: 'Understanding tokenization, prompt engineering patterns, structured output parsing, and direct LLM API access.',
      order_index: 0,
      estimated_weeks: 1.5,
      why_this_phase: 'Solidifies understanding of LLM parameters, temperature, context windows, and streaming responses.',
      milestone: 'Interactive playground app using streaming Gemini & OpenAI completions',
      is_completed: true,
      topics: [
        {
          id: 't1',
          phase_id: 'p1',
          title: 'Prompt Engineering & System Instructions',
          description: 'Few-shot prompting, chain-of-thought, role definitions, and delimiters for reliable responses.',
          order_index: 0,
          estimated_hours: 6,
          objectives: ['Master zero-shot and few-shot prompting techniques', 'Implement markdown structured extraction', 'Prevent prompt injection vulnerabilities'],
          concepts: ['Context window limits', 'Temperature and Top-P sampling', 'System vs User vs Assistant personas'],
          prerequisites: ['Basic REST API experience'],
          practice_activities: ['Build a prompt evaluation test suite comparing 5 different framing styles on customer support queries'],
          resources: [
            { title: 'Google DeepMind Prompt Engineering Guide', url: 'https://ai.google.dev/gemini-api/docs/prompting-strategies', resource_type: 'documentation', is_verified: true, publisher: 'Google AI' },
            { title: 'OpenAI Cookbook: Techniques to Improve Reliability', url: 'https://cookbook.openai.com', resource_type: 'article', is_verified: true, publisher: 'OpenAI' }
          ],
          is_completed: true,
          completion_percentage: 100
        },
        {
          id: 't2',
          phase_id: 'p1',
          title: 'Structured Output & Function Calling / Tool Calling',
          description: 'Enforcing JSON schemas and schema validation via Pydantic and Zod.',
          order_index: 1,
          estimated_hours: 8,
          objectives: ['Define JSON schemas for tool declarations', 'Handle parallel and nested function calls', 'Parse typed outputs with error correction'],
          concepts: ['Tool definitions', 'Constrained decoding', 'Self-healing schemas'],
          prerequisites: ['TypeScript interfaces or Python dataclasses'],
          practice_activities: ['Implement a multi-tool weather & currency converter assistant that returns strict JSON models'],
          resources: [
            { title: 'Gemini Function Calling Tutorial', url: 'https://ai.google.dev/gemini-api/docs/function-calling', resource_type: 'documentation', is_verified: true, publisher: 'Google' }
          ],
          is_completed: true,
          completion_percentage: 100
        }
      ]
    },
    {
      id: 'p2',
      roadmap_id: 'demo-fullstack-ai',
      title: 'Phase 2: Embeddings & Retrieval-Augmented Generation (RAG)',
      description: 'Vector databases, document chunking algorithms, hybrid search, and semantic re-ranking.',
      order_index: 1,
      estimated_weeks: 2,
      why_this_phase: 'RAG is the primary architecture powering knowledge retrieval in enterprise AI today.',
      milestone: 'A full-stack PDF / Docs Q&A search system with hybrid vector + keyword retrieval',
      is_completed: false,
      topics: [
        {
          id: 't3',
          phase_id: 'p2',
          title: 'Document Processing & Smart Chunking Strategies',
          description: 'Recursive character splitting, semantic chunking, metadata attachment, and token-aware batching.',
          order_index: 0,
          estimated_hours: 8,
          objectives: ['Compare fixed vs recursive vs semantic chunking strategies', 'Preserve document hierarchy and headings in chunks', 'Extract and index metadata tags'],
          concepts: ['Chunk overlap', 'Boundary detection', 'Lost-in-the-middle problem'],
          prerequisites: ['Phase 1 completions'],
          practice_activities: ['Create a Python script that benchmarks 3 chunking strategies over technical whitepapers'],
          resources: [
            { title: 'Pinecone Learning Center: Chunking Strategies for LLMs', url: 'https://www.pinecone.io/learn/chunking-strategies/', resource_type: 'article', is_verified: true, publisher: 'Pinecone' }
          ],
          is_completed: false,
          completion_percentage: 40
        },
        {
          id: 't4',
          phase_id: 'p2',
          title: 'Vector Databases & Similarity Search (Pgvector & Chroma)',
          description: 'Deploying pgvector in PostgreSQL and ChromaDB for embedding storage and HNSW indexing.',
          order_index: 1,
          estimated_hours: 10,
          objectives: ['Deploy pgvector extension in PostgreSQL', 'Configure cosine similarity and inner product distance metrics', 'Implement HNSW and IVFFlat index tuning'],
          concepts: ['Vector embeddings', 'Cosine distance vs Euclidean distance', 'Approximate nearest neighbors (ANN)'],
          prerequisites: ['SQL knowledge'],
          practice_activities: ['Spin up PostgreSQL with pgvector and run query latency benchmarks for 100,000 vectors'],
          resources: [
            { title: 'pgvector Official Documentation', url: 'https://github.com/pgvector/pgvector', resource_type: 'documentation', is_verified: true, publisher: 'pgvector' }
          ],
          is_completed: false,
          completion_percentage: 0
        }
      ]
    },
    {
      id: 'p3',
      roadmap_id: 'demo-fullstack-ai',
      title: 'Phase 3: Autonomous AI Agents & Production Deployment',
      description: 'ReAct pattern, plan-and-solve agents, state machines, human-in-the-loop validation, and latency optimization.',
      order_index: 2,
      estimated_weeks: 2.5,
      why_this_phase: 'Prepares you for the cutting edge of AI engineering: autonomous multi-step reasoning agents.',
      milestone: 'Production-ready AI researcher agent with persistent memory and evaluation metrics',
      is_completed: false,
      topics: [
        {
          id: 't5',
          phase_id: 'p3',
          title: 'Agentic Architectures: ReAct & Plan-and-Execute',
          description: 'Designing agents that reason before acting, inspect observation results, and iteratively loop to solve complex multi-step problems.',
          order_index: 0,
          estimated_hours: 12,
          objectives: ['Implement ReAct (Reasoning + Acting) loop from scratch', 'Add maximum recursion limits and timeout safeguards', 'Integrate memory buffering'],
          concepts: ['Stateful agents', 'Loop termination logic', 'Reflection & self-correction'],
          prerequisites: ['Phase 2 completion'],
          practice_activities: ['Build an autonomous code reviewer agent that clones a Git repo, runs linters, and suggests PR diffs'],
          resources: [
            { title: 'ReAct: Synergizing Reasoning and Acting in Language Models', url: 'https://arxiv.org/abs/2210.03629', resource_type: 'article', is_verified: true, publisher: 'Princeton / Google' }
          ],
          is_completed: false,
          completion_percentage: 0
        }
      ]
    }
  ]
};

export default function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({ p1: true, p2: true, p3: true });
  const [selectedTopic, setSelectedTopic] = useState<RoadmapTopic | null>(null);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'overview' | 'resources'>('curriculum');

  // Query roadmap
  const { data: roadmapRes, isLoading, isError } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: async () => {
      if (!id) throw new Error('A roadmap ID is required.');
      const res = await roadmapApi.get(id);
      return res.data;
    },
  });

  const roadmap = roadmapRes?.data as Roadmap | undefined;

  // Toggle topic completion mutation
  const toggleTopicMutation = useMutation({
    mutationFn: async ({ topicId, completed }: { topicId: string; completed: boolean }) => {
      if (roadmap?.id) {
        await roadmapApi.markTopicComplete(roadmap.id, topicId, completed);
      }
    },
    onMutate: async ({ topicId, completed }) => {
      // Optimistic update
      queryClient.setQueryData(['roadmap', id], (old: { data: Roadmap } | undefined) => {
        if (!old?.data) return old;
        const updatedPhases = old.data.phases.map((phase) => ({
          ...phase,
          topics: phase.topics.map((top) =>
            top.id === topicId ? { ...top, is_completed: completed, completion_percentage: completed ? 100 : 0 } : top
          ),
        }));

        const totalTopics = updatedPhases.flatMap((p) => p.topics).length;
        const completedTopics = updatedPhases.flatMap((p) => p.topics).filter((t) => t.is_completed).length;
        const pct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        return {
          ...old,
          data: {
            ...old.data,
            phases: updatedPhases,
            completion_percentage: pct,
          },
        };
      });
      toast.success(completed ? 'Topic marked as finished! 🚀' : 'Topic marked as pending');
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', id] });
      toast.error('Failed to update progress on server');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduler-tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });

  const toggleSubtopicMutation = useMutation({
    mutationFn: async ({
      topicId,
      subtopicIndex,
      completed,
    }: {
      topicId: string;
      subtopicIndex: number;
      completed: boolean;
    }) => {
      if (!roadmap?.id) throw new Error('Roadmap is unavailable.');
      const response = await roadmapApi.markSubtopicComplete(roadmap.id, topicId, subtopicIndex, completed);
      return response.data.data as RoadmapTopic;
    },
    onSuccess: (updatedTopic) => {
      queryClient.setQueryData(['roadmap', id], (old: { data: Roadmap } | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            completion_percentage: Math.round(
              old.data.phases.flatMap((phase) => phase.topics)
                .reduce((sum, topic) => sum + (topic.id === updatedTopic.id
                  ? updatedTopic.completion_percentage
                  : topic.completion_percentage), 0) /
              old.data.phases.flatMap((phase) => phase.topics).length
            ),
            phases: old.data.phases.map((phase) => ({
              ...phase,
              topics: phase.topics.map((topic) => topic.id === updatedTopic.id ? updatedTopic : topic),
            })),
          },
        };
      });
      setSelectedTopic(updatedTopic);
      queryClient.invalidateQueries({ queryKey: ['scheduler-tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
    onError: () => toast.error('Could not update this subtopic. Please try again.'),
  });

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const handleExportMarkdown = () => {
    let md = `# ${roadmap.title}\n\n`;
    md += `**Goal:** ${roadmap.goal}\n`;
    md += `**Estimated Total Hours:** ${roadmap.total_estimated_hours}h | **Duration:** ${roadmap.total_estimated_weeks} weeks\n`;
    md += `**Target Outcome:** ${roadmap.target_outcome}\n\n`;
    md += `## Prerequisites\n${roadmap.prerequisites_assumed?.map((p) => `- ${p}`).join('\n')}\n\n`;
    md += `## Curriculum\n`;

    roadmap.phases?.forEach((phase, pIdx) => {
      md += `\n### Phase ${pIdx + 1}: ${phase.title}\n`;
      md += `*${phase.description}*\n`;
      md += `**Milestone:** ${phase.milestone}\n\n`;
      phase.topics?.forEach((top, tIdx) => {
        md += `#### ${pIdx + 1}.${tIdx + 1} ${top.title} (${top.estimated_hours}h) [${top.is_completed ? 'x' : ' '}]\n`;
        md += `${top.description}\n`;
        if (top.objectives?.length) {
          md += `Objectives:\n${top.objectives.map((o) => `  - ${o}`).join('\n')}\n`;
        }
        if (top.subtopics?.length) {
          md += `Subtopics:\n${top.subtopics.map((subtopic) => `  - ${subtopic}`).join('\n')}\n`;
        }
        if (top.resources?.length) {
          md += `Resources:\n${top.resources.map((r) => `  - [${r.title}](${r.url}) (${r.resource_type})`).join('\n')}\n`;
        }
      });
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${roadmap.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-roadmap.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Roadmap exported as Markdown!');
  };

  const totalTopics = roadmap?.phases?.reduce((acc, p) => acc + p.topics.length, 0) || 0;
  const completedTopicsCount = roadmap?.phases?.reduce(
    (acc, p) => acc + p.topics.filter((t) => t.is_completed).length,
    0
  ) || 0;

  const allResources: LearningResource[] = roadmap?.phases?.flatMap((p) => p.topics.flatMap((t) => t.resources || [])) || [];

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading your roadmap…</div>;
  }
  if (isError || !roadmap) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-xl font-semibold">Roadmap unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">This roadmap could not be loaded. It may have been deleted or the API is unavailable.</p>
        <button type="button" className="btn-secondary mt-4" onClick={() => navigate('/app/roadmaps')}>Back to roadmaps</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top back & actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/app/roadmaps"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Roadmaps
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMarkdown}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Download roadmap as markdown"
          >
            <Download className="w-3.5 h-3.5" /> Export Markdown
          </button>
          <Link
            to={`/app/scheduler/${roadmap.id}`}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-brand-500" /> Plan Timetable
          </Link>
          <Link
            to={`/app/mentor?roadmapId=${roadmap.id}`}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask AI Mentor
          </Link>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="card p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-card via-card to-brand-950/10 border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              {roadmap.domain || 'Learning Path'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
              {roadmap.current_level} Level
            </span>
            {roadmap.is_research_backed && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> AI Curated & Verified
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {roadmap.daily_hours} hrs/day commitment
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            {roadmap.title}
          </h1>

          <p className="text-sm lg:text-base text-muted-foreground max-w-3xl leading-relaxed">
            {roadmap.description}
          </p>

          {/* Progress summary bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
              <span>Overall Roadmap Completion</span>
              <span className="font-semibold text-foreground">
                {completedTopicsCount} of {totalTopics} topics finished ({roadmap.completion_percentage}%)
              </span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5">
              <motion.div
                className="h-full rounded-full gradient-brand shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${roadmap.completion_percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Metrics ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Est. Total Time</p>
              <p className="text-lg font-bold font-display text-foreground">{formatHours(roadmap.total_estimated_hours)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estimated Duration</p>
              <p className="text-lg font-bold font-display text-foreground">{roadmap.total_estimated_weeks} Weeks</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Phases</p>
              <p className="text-lg font-bold font-display text-foreground">{roadmap.phases?.length || 0} Phases</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Curated Resources</p>
              <p className="text-lg font-bold font-display text-foreground">{allResources.length} Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'curriculum'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Layers className="w-4 h-4" /> Curriculum & Topics
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'overview'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Target className="w-4 h-4" /> Goals & Outcomes
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'resources'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <BookMarked className="w-4 h-4" /> Verified Resources ({allResources.length})
        </button>
      </div>

      {/* Tab: Curriculum & Topics */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {roadmap.phases?.map((phase, pIndex) => {
            const isExpanded = expandedPhases[phase.id] ?? true;
            const phaseCompletedCount = phase.topics.filter((t) => t.is_completed).length;
            const phasePct = phase.topics.length > 0 ? Math.round((phaseCompletedCount / phase.topics.length) * 100) : 0;

            return (
              <div
                key={phase.id}
                className="card overflow-hidden border border-border shadow-sm transition-all"
              >
                {/* Phase Accordion Header */}
                <div
                  onClick={() => togglePhase(phase.id)}
                  className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-accent/40 select-none bg-card"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors',
                      phasePct === 100
                        ? 'bg-emerald-500 text-white'
                        : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    )}>
                      {phasePct === 100 ? <CheckCircle className="w-4 h-4" /> : `P${pIndex + 1}`}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-display font-semibold text-foreground">
                          {phase.title}
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {phase.estimated_weeks} weeks
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-xl mt-0.5">
                        {phase.milestone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-semibold text-foreground">{phasePct}% complete</p>
                      <p className="text-[11px] text-muted-foreground">{phaseCompletedCount}/{phase.topics.length} topics</p>
                    </div>

                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Phase Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border bg-card/50"
                    >
                      {/* Phase context explanation */}
                      <div className="p-4 bg-muted/20 border-b border-border/50 flex items-start gap-3 text-xs text-muted-foreground">
                        <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-foreground">Why this phase matters: </span>
                          {phase.why_this_phase || phase.description}
                        </div>
                      </div>

                      {/* Topic items */}
                      <div className="divide-y divide-border">
                        {phase.topics.map((topic, tIndex) => (
                          <div
                            key={topic.id}
                            className={cn(
                              'p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group',
                              topic.is_completed ? 'bg-muted/10' : 'hover:bg-accent/30'
                            )}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTopicMutation.mutate({
                                    topicId: topic.id,
                                    completed: !topic.is_completed,
                                  });
                                }}
                                className="mt-0.5 text-muted-foreground hover:text-brand-500 transition-colors flex-shrink-0"
                                title={topic.is_completed ? 'Mark as incomplete' : 'Mark as completed'}
                              >
                                {topic.is_completed ? (
                                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground/60 hover:text-brand-500" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-mono text-muted-foreground">
                                    {pIndex + 1}.{tIndex + 1}
                                  </span>
                                  <h3
                                    onClick={() => setSelectedTopic(topic)}
                                    className={cn(
                                      'text-sm font-semibold cursor-pointer hover:text-brand-500 transition-colors',
                                      topic.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                                    )}
                                  >
                                    {topic.title}
                                  </h3>
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {topic.estimated_hours}h
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                  {topic.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:ml-auto flex-shrink-0">
                              <button
                                onClick={() => setSelectedTopic(topic)}
                                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                              >
                                View Topic Details
                              </button>
                              <Link
                                to={`/app/mentor?roadmapId=${roadmap.id}&topicId=${topic.id}&prompt=${encodeURIComponent(`Explain the core concepts of "${topic.title}" in detail with real-world examples.`)}`}
                                className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-brand-500 transition-colors"
                                title="Ask AI Mentor about this topic"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/app/quizzes?topicId=${topic.id}&title=${encodeURIComponent(topic.title)}`}
                                className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-brand-500 transition-colors"
                                title="Take Quiz for this topic"
                              >
                                <BookOpen className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Overview & Outcomes */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-display font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-500" /> Target Outcome & Goal
            </h2>
            <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 text-sm">
              <p className="font-medium text-foreground">{roadmap.target_outcome}</p>
              <p className="text-xs text-muted-foreground mt-1">{roadmap.goal}</p>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
              Prerequisites Assumed
            </h3>
            <ul className="space-y-2">
              {roadmap.prerequisites_assumed?.map((pre, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                  <span>{pre}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-base font-display font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completion Criteria
            </h2>
            <p className="text-xs text-muted-foreground">
              You will be considered job-ready in this domain upon meeting the following project and test milestones:
            </p>
            <ul className="space-y-2.5">
              {roadmap.completion_criteria?.map((crit, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{crit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Resources */}
      {activeTab === 'resources' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-brand-500" /> All Curated Learning Resources
            </h2>
            <span className="text-xs text-muted-foreground">{allResources.length} items found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {allResources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      {res.resource_type}
                    </span>
                    {res.publisher && (
                      <span className="text-xs text-muted-foreground">{res.publisher}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors mt-1.5 truncate">
                    {res.title}
                  </h3>
                  {res.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {res.description}
                    </p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors flex-shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Topic Detail Modal / Slide-over Drawer */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin p-6 space-y-6 shadow-2xl border-border bg-card"
            >
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      {selectedTopic.estimated_hours} Hours Required
                    </span>
                    {selectedTopic.is_completed && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600">
                        Completed
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-display font-bold text-foreground mt-1">
                    {selectedTopic.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Topic Description
                </h3>
                <p className="text-sm text-foreground leading-relaxed">{selectedTopic.description}</p>
              </div>

              {/* Objectives */}
              {selectedTopic.objectives?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Key Learning Objectives
                  </h3>
                  <ul className="space-y-1.5">
                    {selectedTopic.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Core Concepts */}
              {selectedTopic.concepts?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Essential Concepts Covered
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTopic.concepts.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-muted text-xs text-foreground font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTopic.subtopics?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Syllabus & Subtopics
                  </h3>
                  <ol className="space-y-2">
                    {selectedTopic.subtopics.map((subtopic, index) => {
                      const completed = selectedTopic.subtopic_progress?.[index] || false;
                      return (
                      <li key={`${index}-${subtopic}`} className="flex items-start gap-2 text-sm text-foreground">
                        <button
                          type="button"
                          disabled={toggleSubtopicMutation.isPending}
                          aria-label={`${completed ? 'Mark incomplete' : 'Mark complete'}: ${subtopic}`}
                          onClick={() => toggleSubtopicMutation.mutate({
                            topicId: selectedTopic.id,
                            subtopicIndex: index,
                            completed: !completed,
                          })}
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-[11px] font-semibold text-brand-500"
                        >
                          {completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                        </button>
                        <span className={completed ? 'text-muted-foreground line-through' : ''}>{subtopic}</span>
                      </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* Practice projects */}
              {selectedTopic.practice_activities?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Hands-on Practice & Exercises
                  </h3>
                  <div className="space-y-2">
                    {selectedTopic.practice_activities.map((act, i) => (
                      <div key={i} className="p-3 rounded-lg bg-brand-500/5 border border-brand-500/20 text-xs text-foreground flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {selectedTopic.resources?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Recommended Study Resources
                  </h3>
                  <div className="space-y-2">
                    {selectedTopic.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-lg border border-border flex items-center justify-between gap-3 text-xs hover:bg-accent/40 transition-colors group"
                      >
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-brand-500 transition-colors">
                            {res.title}
                          </p>
                          <span className="text-[11px] text-muted-foreground uppercase">{res.resource_type} • {res.publisher || 'Web'}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal footer action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    toggleTopicMutation.mutate({
                      topicId: selectedTopic.id,
                      completed: !selectedTopic.is_completed,
                    });
                    setSelectedTopic({ ...selectedTopic, is_completed: !selectedTopic.is_completed });
                  }}
                  className={cn(
                    'btn-secondary text-xs',
                    selectedTopic.is_completed ? 'text-destructive' : 'text-emerald-600'
                  )}
                >
                  {selectedTopic.is_completed ? 'Mark as Incomplete' : '✓ Mark Finished'}
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/app/notes?topic=${encodeURIComponent(selectedTopic.title)}`}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Make Study Note
                  </Link>
                  <Link
                    to={`/app/mentor?roadmapId=${roadmap.id}&topicId=${selectedTopic.id}&prompt=${encodeURIComponent(`Explain ${selectedTopic.title} step-by-step.`)}`}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Tutor Me with AI
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
