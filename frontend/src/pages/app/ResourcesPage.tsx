import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, Search, ExternalLink, Filter, Plus, CheckCircle2,
  BookOpen, Video, FileText, Code2, Bookmark, Star, Globe, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { resourceApi, roadmapApi, extractErrorMessage } from '@/services/api';
import type { LearningResource, ResourceType } from '@/types';
import toast from 'react-hot-toast';

const RESOURCE_TYPES: { id: ResourceType | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Resources', icon: Library },
  { id: 'documentation', label: 'Documentation', icon: FileText },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'course', label: 'Courses', icon: BookOpen },
  { id: 'article', label: 'Articles & Guides', icon: FileText },
  { id: 'tool', label: 'Tools & Libraries', icon: Code2 },
  { id: 'book', label: 'Research Papers', icon: BookOpen },
];

type ResourceCard = LearningResource & {
  id: string;
  tags?: string[];
  roadmap_title?: string;
  is_saved_resource: boolean;
};

export default function ResourcesPage() {
  const queryClient = useQueryClient();
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

  const savedResourcesQuery = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const response = await resourceApi.list();
      return (response.data.data as ResourceCard[] | undefined) || [];
    },
  });
  const roadmapsQuery = useQuery({
    queryKey: ['roadmaps'],
    queryFn: () => roadmapApi.list(),
  });
  const savedResources = savedResourcesQuery.data || [];
  const roadmaps = (roadmapsQuery.data?.data?.data as import('@/types').Roadmap[] | undefined) || [];
  const roadmapResources = roadmaps.flatMap((roadmap) =>
    (roadmap.phases || []).flatMap((phase) =>
      (phase.topics || []).flatMap((topic) =>
        (topic.resources || []).map((resource, index) => ({
          ...resource,
          id: resource.id || `${roadmap.id}-${topic.id}-${index}`,
          tags: [topic.title],
          roadmap_title: roadmap.title,
          is_saved_resource: false,
        }))
      )
    )
  );
  const resources: ResourceCard[] = [
    ...savedResources.map((resource) => ({ ...resource, is_saved_resource: true })),
    ...roadmapResources,
  ];

  const addResourceMutation = useMutation({
    mutationFn: async () => {
      const response = await resourceApi.create({
        title: newTitle.trim(),
        url: newUrl.trim(),
        publisher: newPublisher.trim(),
        resource_type: newType,
        description: newDesc.trim(),
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setIsAdding(false);
      setNewTitle('');
      setNewUrl('');
      setNewPublisher('');
      setNewDesc('');
      toast.success('Resource saved.');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: string) => resourceApi.delete(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource deleted.');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const toggleBookmark = (url: string) => {
    setBookmarkedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
    toast.success('Bookmarks updated');
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    addResourceMutation.mutate();
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
          <h1 className="text-2xl font-display font-bold text-foreground">Learning Resources</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resources from your roadmaps plus links you choose to save.
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
        {(savedResourcesQuery.isLoading || roadmapsQuery.isLoading) && (
          <div className="card p-8 text-center text-sm text-muted-foreground">Loading your resources…</div>
        )}
        {(savedResourcesQuery.isError || roadmapsQuery.isError) && (
          <div role="alert" className="card p-8 text-sm text-destructive">Could not load resources. Refresh and try again.</div>
        )}
        {!savedResourcesQuery.isLoading && !roadmapsQuery.isLoading && !savedResourcesQuery.isError && !roadmapsQuery.isError && filteredResources.length === 0 && (
          <div className="card col-span-full p-8 text-center">
            <Library className="mx-auto h-9 w-9 text-muted-foreground" />
            <p className="mt-3 font-medium">No resources match this search.</p>
            <p className="mt-1 text-sm text-muted-foreground">Generate a roadmap with resources or save a link you want to study.</p>
          </div>
        )}
        {filteredResources.map((res, idx) => {
          const isSaved = bookmarkedUrls.includes(res.url);

          return (
            <motion.div
              key={res.id}
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
                    {res.roadmap_title && (
                      <span className="text-[11px] text-muted-foreground">From {res.roadmap_title}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
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
                    {res.is_saved_resource && (
                      <button
                        type="button"
                        onClick={() => deleteResourceMutation.mutate(res.id)}
                        disabled={deleteResourceMutation.isPending}
                        className="p-1 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${res.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
                  <button type="submit" className="btn-primary text-xs" disabled={addResourceMutation.isPending}>
                    {addResourceMutation.isPending ? 'Saving…' : 'Save Resource'}
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
