import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Edit3, FileText, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { notesApi } from '@/services/api';
import { cn, formatDate } from '@/lib/utils';
import type { Note } from '@/types';

type NotePayload = Pick<Note, 'title' | 'content' | 'tags' | 'is_ai_generated'>;

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('Study');
  const [aiTopic, setAiTopic] = useState(searchParams.get('topic') || '');
  const [noteType, setNoteType] = useState<'summary' | 'detailed' | 'flashcards'>('summary');

  const notesQuery = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await notesApi.list();
      return (response.data.data as Note[] | undefined) || [];
    },
  });
  const notes = notesQuery.data || [];
  const allTags = useMemo(() => Array.from(new Set(notes.flatMap((note) => note.tags || []))), [notes]);
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query);
    return matchesQuery && (selectedTag === 'all' || note.tags?.includes(selectedTag));
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: NotePayload) => {
      const response = editingNote
        ? await notesApi.update(editingNote.id, payload)
        : await notesApi.create(payload);
      return response.data.data as Note;
    },
    onSuccess: (savedNote) => {
      queryClient.setQueryData<Note[]>(['notes'], (current) => {
        const list = current || [];
        return editingNote
          ? list.map((note) => note.id === savedNote.id ? savedNote : note)
          : [savedNote, ...list];
      });
      closeEditor();
      toast.success(editingNote ? 'Note updated.' : 'Note saved.');
    },
    onError: () => toast.error('Could not save the note. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Note[]>(['notes'], (current) => (current || []).filter((note) => note.id !== id));
      if (selectedNote?.id === id) setSelectedNote(null);
      toast.success('Note deleted.');
    },
    onError: () => toast.error('Could not delete the note. Please try again.'),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await notesApi.generateForTopic(aiTopic.trim(), noteType);
      return response.data.data as Note;
    },
    onSuccess: (note) => {
      queryClient.setQueryData<Note[]>(['notes'], (current) => [note, ...(current || [])]);
      setSelectedNote(note);
      toast.success('Your AI note is ready and saved.');
    },
    onError: () => toast.error('Could not generate the note. Check that the backend and AI are available.'),
  });

  function closeEditor() {
    setIsEditorOpen(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
    setTags('Study');
  }

  function openNewNote() {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setTags('Study');
    setIsEditorOpen(true);
  }

  function openEditNote(note: Note) {
    setSelectedNote(null);
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags?.join(', ') || 'Study');
    setIsEditorOpen(true);
  }

  function saveNote() {
    if (!title.trim() || !content.trim()) {
      toast.error('Add a title and some note content first.');
      return;
    }
    saveMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      is_ai_generated: editingNote?.is_ai_generated || false,
    });
  }

  function exportNote(note: Note) {
    const file = new Blob([note.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-display font-bold">Study Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create your own notes or ask AI to make a simple study guide.</p>
        </div>
        <button type="button" onClick={openNewNote} className="btn-secondary text-sm">
          <Plus className="h-4 w-4" /> Write a Note
        </button>
      </div>

      <section className="card space-y-4 p-4 sm:p-5" aria-labelledby="generate-note-heading">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-brand-500/15 p-2 text-brand-500"><Sparkles className="h-5 w-5" /></div>
          <div>
            <h2 id="generate-note-heading" className="font-semibold">Make a note with AI</h2>
            <p className="text-sm text-muted-foreground">Enter a topic, choose a format, and save the result to your notes.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
          <input
            className="input"
            value={aiTopic}
            onChange={(event) => setAiTopic(event.target.value)}
            placeholder="Example: Python loops or cell biology"
            aria-label="Topic for AI note"
            maxLength={300}
          />
          <select className="input" value={noteType} onChange={(event) => setNoteType(event.target.value as typeof noteType)} aria-label="AI note format">
            <option value="summary">Quick summary</option>
            <option value="detailed">Detailed study note</option>
            <option value="flashcards">Flashcards</option>
          </select>
          <button
            type="button"
            onClick={() => generateMutation.mutate()}
            disabled={!aiTopic.trim() || generateMutation.isPending}
            className="btn-primary"
          >
            <Sparkles className={cn('h-4 w-4', generateMutation.isPending && 'animate-spin')} />
            {generateMutation.isPending ? 'Making note…' : 'Generate & Save'}
          </button>
        </div>
      </section>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="input pl-9"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search your notes"
            aria-label="Search notes"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', ...allTags].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs transition-colors',
                selectedTag === tag
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-border text-muted-foreground hover:bg-accent'
              )}
            >
              {tag === 'all' ? `All (${notes.length})` : `#${tag}`}
            </button>
          ))}
        </div>
      </div>

      {notesQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : notesQuery.isError ? (
        <div className="card p-8 text-center text-sm text-destructive">Notes could not be loaded. Please check the backend and try again.</div>
      ) : filteredNotes.length === 0 ? (
        <div className="card p-10 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <h2 className="font-semibold">{notes.length ? 'No notes match your search' : 'Your notes will appear here'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {notes.length ? 'Try a different search or tag.' : 'Make an AI note above or write your first note.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => (
            <article key={note.id} className="card flex min-w-0 flex-col p-4 sm:p-5">
              <button type="button" onClick={() => setSelectedNote(note)} className="min-w-0 text-left">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium text-brand-500">
                    {note.is_ai_generated ? 'AI note' : 'My note'}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(note.updated_at || note.created_at)}</span>
                </div>
                <h2 className="line-clamp-2 font-semibold">{note.title}</h2>
                <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-sm text-muted-foreground">{note.content}</p>
              </button>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex flex-wrap gap-1">
                  {note.tags?.slice(0, 3).map((tag) => <span key={tag} className="rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground">#{tag}</span>)}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => openEditNote(note)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label={`Edit ${note.title}`} title="Edit note">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => exportNote(note)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label={`Download ${note.title}`} title="Download Markdown">
                    <Download className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => {
                    if (window.confirm(`Delete "${note.title}"?`)) deleteMutation.mutate(note.id);
                  }} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${note.title}`} title="Delete note">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="note-reader-title">
          <div className="card max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-brand-500">{selectedNote.is_ai_generated ? 'AI study note' : 'Personal note'}</p>
                <h2 id="note-reader-title" className="mt-1 text-xl font-semibold">{selectedNote.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedNote(null)} className="btn-secondary px-3 py-2">Close</button>
            </div>
            <p className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-7">{selectedNote.content}</p>
            <div className="flex flex-wrap gap-2">
              {selectedNote.tags?.map((tag) => <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">#{tag}</span>)}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => exportNote(selectedNote)} className="btn-secondary"><Download className="h-4 w-4" /> Download</button>
              <button type="button" onClick={() => openEditNote(selectedNote)} className="btn-secondary"><Edit3 className="h-4 w-4" /> Edit</button>
              <button type="button" onClick={() => {
                if (window.confirm(`Delete "${selectedNote.title}"?`)) deleteMutation.mutate(selectedNote.id);
              }} className="btn-secondary text-destructive"><Trash2 className="h-4 w-4" /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="note-editor-title">
          <div className="card w-full max-w-xl space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 id="note-editor-title" className="text-lg font-semibold">{editingNote ? 'Edit Note' : 'Write a Note'}</h2>
              <button type="button" onClick={closeEditor} className="btn-ghost px-2">Close</button>
            </div>
            <label className="block text-sm font-medium">
              Title
              <input className="input mt-1.5" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} />
            </label>
            <label className="block text-sm font-medium">
              Tags <span className="font-normal text-muted-foreground">(separate with commas)</span>
              <input className="input mt-1.5" value={tags} onChange={(event) => setTags(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Note
              <textarea className="textarea mt-1.5 min-h-48" value={content} onChange={(event) => setContent(event.target.value)} />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeEditor} className="btn-secondary">Cancel</button>
              <button type="button" onClick={saveNote} disabled={saveMutation.isPending} className="btn-primary">
                {saveMutation.isPending ? 'Saving…' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
