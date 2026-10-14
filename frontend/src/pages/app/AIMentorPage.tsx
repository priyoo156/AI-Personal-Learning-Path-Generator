import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Plus, MessageCircle, Trash2, Pencil, Copy, RefreshCw,
  Brain, ArrowLeft, Globe, ChevronDown, Loader2, Check
} from 'lucide-react';
import { chatApi, extractErrorMessage } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { cn, copyToClipboard, formatRelativeDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { ChatSession, ChatMessage } from '@/types';

const SUGGESTED_PROMPTS = [
  'Explain the concept I just learned in simple terms',
  'Give me 5 practice questions on this topic',
  'What should I study next?',
  'I\'m stuck on this topic — help me understand',
  'Create a quick quiz for revision',
  'Summarize the key points I need to remember',
];

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-8 h-8 rounded-full gradient-brand flex-shrink-0 flex items-center justify-center">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  key?: string;
  msg: ChatMessage;
  onCopy: () => void;
}

function MessageBubble({ msg, onCopy }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = async () => {
    await copyToClipboard(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy();
  };

  return (
    <motion.div
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full gradient-brand flex-shrink-0 flex items-center justify-center mt-1">
          <Brain className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={cn('group max-w-[80%] lg:max-w-[70%]')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-secondary text-foreground rounded-tl-sm'
        )}>
          {msg.content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
              {line || <br />}
            </p>
          ))}
        </div>

        {/* Actions */}
        <div className={cn('flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isUser ? 'justify-end' : 'justify-start')}>
          <button
            onClick={handleCopy}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Copy"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
          <span className="text-xs text-muted-foreground px-1">
            {formatRelativeDate(msg.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIMentorPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(sessionId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch all sessions
  const { data: sessionsData } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => chatApi.getSessions(),
  });
  const sessions: ChatSession[] = (sessionsData?.data?.data as ChatSession[]) || [];

  // Fetch messages for active session
  const { data: msgsData, isLoading: loadingMsgs } = useQuery({
    queryKey: ['chat-messages', activeSession],
    queryFn: () => chatApi.getMessages(activeSession!),
    enabled: !!activeSession,
  });
  const messages: ChatMessage[] = (msgsData?.data?.data as ChatMessage[]) || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Create new session
  const createSession = useMutation({
    mutationFn: () => chatApi.createSession({ language }),
    onSuccess: (res) => {
      const session = res.data?.data as ChatSession;
      if (session?.id) {
        setActiveSession(session.id);
        qc.invalidateQueries({ queryKey: ['chat-sessions'] });
        navigate(`/app/mentor/${session.id}`, { replace: true });
      }
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  // Send message
  const sendMessage = async () => {
    const content = message.trim();
    if (!content) return;

    // Create session if none
    let sid = activeSession;
    if (!sid) {
      const res = await chatApi.createSession({ language });
      sid = (res.data?.data as any)?.id;
      if (sid) {
        setActiveSession(sid);
        qc.invalidateQueries({ queryKey: ['chat-sessions'] });
      }
    }
    if (!sid) return;

    setMessage('');
    setIsTyping(true);

    // Optimistic user message
    const tempId = 'temp-' + Date.now();
    const userMsg: ChatMessage = {
      id: tempId,
      session_id: sid,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    qc.setQueryData(['chat-messages', sid], (old: { data?: { data?: ChatMessage[] } } | undefined) => ({
      ...old,
      data: { data: [...(old?.data?.data || []), userMsg] },
    }));

    try {
      const res = await chatApi.sendMessage(sid, content, language);
      setIsTyping(false);
      qc.invalidateQueries({ queryKey: ['chat-messages', sid] });
      qc.invalidateQueries({ queryKey: ['chat-sessions'] });
    } catch (err) {
      setIsTyping(false);
      toast.error(extractErrorMessage(err));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteSession = useMutation({
    mutationFn: (id: string) => chatApi.deleteSession(id),
    onSuccess: () => {
      setActiveSession(null);
      qc.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });

  return (
    <div className="flex h-full">
      {/* Session sidebar */}
      <div className="hidden lg:flex w-64 flex-col border-r border-border bg-card/50 flex-shrink-0">
        <div className="p-4 border-b border-border">
          <button
            onClick={() => createSession.mutate()}
            disabled={createSession.isPending}
            className="btn-primary w-full text-sm h-9"
          >
            <Plus className="w-4 h-4" />New Chat
          </button>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin p-2 space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => { setActiveSession(session.id); navigate(`/app/mentor/${session.id}`); }}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left group transition-colors',
                activeSession === session.id ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-accent'
              )}
            >
              <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{session.title}</p>
                <p className="text-xs text-muted-foreground">
                  {session.message_count} msgs · {session.last_message_at ? formatRelativeDate(session.last_message_at) : ''}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession.mutate(session.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-destructive transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </button>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No chats yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">Pathora AI Mentor</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Always online · Powered by Gemini
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="ta">🇮🇳 TA</option>
              <option value="hi">🇮🇳 HI</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto scrollbar-thin px-4 lg:px-8 py-6 space-y-5">
          {!activeSession && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mb-6 shadow-xl glow-brand">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Your AI Study Mentor</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-8">
                Ask any question about your roadmap, get step-by-step explanations, practice questions, and personalized study guidance.
              </p>
              <div className="grid sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setMessage(prompt); inputRef.current?.focus(); }}
                    className="text-left p-3 rounded-xl border border-border hover:border-brand-200 hover:bg-accent/50 transition-all text-sm text-muted-foreground hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loadingMsgs && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} onCopy={() => { toast.success('Copied!'); }} />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card/80 backdrop-blur-sm px-4 lg:px-8 py-4 flex-shrink-0">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything — a doubt, a concept, a practice question…"
                className="textarea min-h-[52px] max-h-48 pr-4 resize-none text-sm leading-relaxed"
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 192) + 'px';
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isTyping}
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                message.trim() && !isTyping
                  ? 'gradient-brand shadow glow-brand-sm hover:scale-105'
                  : 'bg-secondary cursor-not-allowed'
              )}
            >
              {isTyping
                ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                : <Send className="w-4 h-4 text-white" />
              }
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send · Shift+Enter for new line · AI can make mistakes — verify important facts
          </p>
        </div>
      </div>
    </div>
  );
}
