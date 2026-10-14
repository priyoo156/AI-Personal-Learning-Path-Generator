import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, Search, ExternalLink, Filter, Plus, CheckCircle2,
  BookOpen, Video, FileText, Code2, Bookmark, Star, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningResource, ResourceType } from '@/types';
import toast from 'react-hot-toast';

const INITIAL_RESOURCES: (LearningResource & { tags?: string[] })[] = [
  {
    title: 'Google DeepMind: Gemini API Prompt Engineering Guide',
    url: 'https://ai.google.dev/gemini-api/docs/prompting-strategies',
    publisher: 'Google AI',
    resource_type: 'documentation',
    description: 'Comprehensive guide to multi-turn prompting, structured JSON schema generation, and zero-shot reasoning.',
    is_verified: true,
    tags: ['AI', 'Prompting', 'Gemini'],
  },
  {
    title: 'Andrej Karpathy: Neural Networks: Zero to Hero',
    url: 'https://karpathy.ai/zero-to-hero.html',
    publisher: 'Andrej Karpathy',
    resource_type: 'video',
    description: 'World-class YouTube course building micrograd, backpropagation, and GPT transformers from pure Python scratch.',
    is_verified: true,
    tags: ['Deep Learning', 'PyTorch', 'Transformers'],
  },
  {
    title: 'Pinecone: Master RAG & Chunking Strategies',
    url: 'https://www.pinecone.io/learn/chunking-strategies/',
    publisher: 'Pinecone Learning',
    resource_type: 'article',
    description: 'Detailed benchmarks on fixed-size vs recursive character splitting vs semantic chunking strategies for vector search.',
    is_verified: true,
    tags: ['RAG', 'Embeddings', 'Vectors'],
  },
  {
    title: 'DeepLearning.AI: Building Systems with the ChatGPT API',
    url: 'https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/',
    publisher: 'DeepLearning.AI',
    resource_type: 'course',
    description: 'Taught by Andrew Ng & Isa Fulford. Covers multi-step workflows, moderation, and chained system evaluations.',
    is_verified: true,
    tags: ['GenAI', 'System Design'],
  },
  {
    title: 'pgvector: Open-Source Vector Similarity Search for PostgreSQL',
    url: 'https://github.com/pgvector/pgvector',
    publisher: 'GitHub / Andrew Kane',
    resource_type: 'tool',
    description: 'Official extension documentation for storing and querying high-dimensional vectors with HNSW indexes in standard SQL.',
    is_verified: true,
    tags: ['SQL', 'PostgreSQL', 'Vectors'],
  },
  {
    title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
    url: 'https://arxiv.org/abs/2210.03629',
    publisher: 'Princeton University & Google Research',
    resource_type: 'book',
    description: 'The foundational academic paper introducing the ReAct pattern for autonomous tool-augmented AI agents.',
    is_verified: true,
    tags: ['Agents', 'Research Paper'],
  },
  {
    title: 'MDN Web Docs: JavaScript Modern Async & Promises',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous',
    publisher: 'Mozilla MDN',
    resource_type: 'documentation',
    description: 'The definitive web guide to event loops, async/await concurrency, and fetch streaming responses.',
    is_verified: true,
    tags: ['JavaScript', 'Web Dev'],
  },
  {
    title: 'FastAPI High Performance Web Framework',
    url: 'https://fastapi.tiangolo.com/',
    publisher: 'FastAPI',
    resource_type: 'documentation',
    description: 'Modern, fast (high-performance) Python web framework with automatic OpenAPI docs and Pydantic validation.',
    is_verified: true,
    tags: ['Python', 'Backend', 'API'],
  },
];

const RESOURCE_TYPES: { id: ResourceType | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Resources', icon: Library },
  { id: 'documentation', label: 'Documentation', icon: FileText },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'course', label: 'Courses', icon: BookOpen },
  { id: 'article', label: 'Articles & Guides', icon: FileText },
  { id: 'tool', label: 'Tools & Libraries', icon: Code2 },
  { id: 'book', label: 'Research Papers', icon: BookOpen },
];

export default function ResourcesPage() {
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedUrls, setBookmarkedUrls] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // New resource modal state
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPublisher, setNewPublisher] = useState('');
  const [newType, setNewType] = useState<ResourceType>('documentation');
  const [newDesc, setNewDesc] = useState('');

  const toggleBookmark = (url: string) => {
    setBookmarkedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
    toast.success('Bookmarks updated');
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) {
      toast.error('Title and URL are required');
      return;
    }
    const newRes: LearningResource & { tags?: string[] } = {
      title: newTitle,
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      publisher: newPublisher || 'Curated',
      resource_type: newType,
      description: newDesc,
      is_verified: true,
      tags: ['Custom'],
    };
    setResources((prev) => [newRes, ...prev]);
    setIsAdding(false);
    setNewTitle('');
    setNewUrl('');
    setNewPublisher('');
    setNewDesc('');
    toast.success('Resource added to your hub!');
  };

  const filteredResources = resources.filter((res) => {
    const matchesType = selectedType === 'all' || res.resource_type === selectedType;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.publisher?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Curated Resource Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hand-picked, verified learning materials, official documentation, courses, and research papers.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Add Resource
        </button>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources by title, publisher, or concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-2 text-xs w-full"
          />
        </div>

        {/* Type pills */}
        <div className="flex flex-wrap gap-2">
          {RESOURCE_TYPES.map((t) => {
            const Icon = t.icon;
            const active = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors',
                  active
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'border-border text-muted-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res, idx) => {
          const isSaved = bookmarkedUrls.includes(res.url);

          return (
            <motion.div
              key={idx}
              layout
              className="card p-5 border border-border hover:border-brand-500/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      {res.resource_type}
                    </span>
                    {res.is_verified && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleBookmark(res.url)}
                    className={cn(
                      'p-1 rounded-md transition-colors',
                      isSaved ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'
                    )}
                    title={isSaved ? 'Remove bookmark' : 'Bookmark resource'}
                  >
                    <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
                  </button>
                </div>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block group-hover:text-brand-500 transition-colors"
                >
                  <h3 className="text-base font-display font-bold text-foreground group-hover:text-brand-500 line-clamp-2">
                    {res.title}
                  </h3>
                </a>

                {res.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 truncate max-w-[60%]">
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  {res.publisher || 'Web Resource'}
                </span>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                >
                  Visit Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Custom Resource Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-lg p-6 space-y-4 border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-display font-bold text-foreground">Add Learning Resource</h3>
                <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>

              <form onSubmit={handleAddResource} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Resource Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stanford CS229: Machine Learning Course"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="input-field text-xs w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/course"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="input-field text-xs w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Publisher / Author</label>
                    <input
                      type="text"
                      placeholder="e.g. Stanford / YouTube"
                      value={newPublisher}
                      onChange={(e) => setNewPublisher(e.target.value)}
                      className="input-field text-xs w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Resource Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as ResourceType)}
                      className="input-field text-xs w-full"
                    >
                      <option value="documentation">Documentation</option>
                      <option value="video">Video</option>
                      <option value="course">Course</option>
                      <option value="article">Article</option>
                      <option value="tool">Tool</option>
                      <option value="book">Paper / Book</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly explain what this resource covers..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="input-field text-xs w-full resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs">
                    Save Resource
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
