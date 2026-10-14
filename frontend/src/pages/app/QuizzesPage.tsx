import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Award, HelpCircle, ChevronRight, Check, AlertTriangle, MessageCircle
} from 'lucide-react';
import { extractErrorMessage, quizApi, roadmapApi } from '@/services/api';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion } from '@/types';
import toast from 'react-hot-toast';

export default function QuizzesPage() {
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('title') || 'Generative AI & LLM Engineering';

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generator form
  const [customTopic, setCustomTopic] = useState(topicParam);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [questionCount, setQuestionCount] = useState(5);

  const { data: roadmapsResponse } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: () => roadmapApi.list(),
  });
  const curriculumTopics = Array.from(new Set(
    ((roadmapsResponse?.data?.data as import('@/types').Roadmap[] | undefined) || [])
      .flatMap((roadmap) => roadmap.phases || [])
      .flatMap((phase) => phase.topics || [])
      .map((topic) => topic.title)
  ));

  const currentQuestion: QuizQuestion | undefined = activeQuiz?.questions[currentQuestionIdx];

  const handleSelectAnswer = (ans: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: ans,
    }));
  };

  const handleNext = () => {
    if (!activeQuiz) return;
    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx((idx) => idx + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((idx) => idx - 1);
    }
  };

  const calculateScore = () => {
    if (!activeQuiz) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    activeQuiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    return {
      correct,
      total: activeQuiz.questions.length,
      percentage: Math.round((correct / activeQuiz.questions.length) * 100),
    };
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < activeQuiz.questions.length) {
      if (!confirm(`You have answered ${answeredCount} of ${activeQuiz.questions.length} questions. Submit anyway?`)) {
        return;
      }
    }
    setIsSubmitted(true);
    toast.success('Quiz submitted! Review your score and explanations below.');
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIdx(0);
  };

  const handleGenerateNewQuiz = async () => {
    setIsGenerating(true);
    try {
      const response = await quizApi.generate(customTopic.trim(), {
        level,
        question_count: questionCount,
      });
      const newGeneratedQuiz = response.data.data as Quiz;
      if (!newGeneratedQuiz?.questions?.length) throw new Error('The AI returned an empty quiz.');
      setActiveQuiz(newGeneratedQuiz);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setCurrentQuestionIdx(0);
      toast.success('New AI quiz generated!');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const score = activeQuiz ? calculateScore() : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">AI Knowledge Quiz & Assessments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Test your comprehension, identify weak areas, and reinforce learning with AI-generated questions.
          </p>
        </div>

        <button
          onClick={handleRetake}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Quiz
        </button>
      </div>

      {/* Generator Drawer */}
      <div className="card p-5 border-border bg-card/60 space-y-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Build a Quiz
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value=""
            onChange={(event) => event.target.value && setCustomTopic(event.target.value)}
            className="input w-full text-sm"
            aria-label="Choose a topic from your roadmaps"
          >
            <option value="">Choose a roadmap topic</option>
            {curriculumTopics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
          </select>
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Or type your own topic"
            className="input w-full text-sm"
            maxLength={300}
          />
          <select value={level} onChange={(event) => setLevel(event.target.value as typeof level)} className="input w-full text-sm" aria-label="Quiz level">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <label className="flex items-center gap-3 rounded-xl border border-border px-3">
            <span className="shrink-0 text-sm text-muted-foreground">Questions</span>
            <input
              type="number"
              min={3}
              max={20}
              value={questionCount}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              className="w-full bg-transparent py-2 text-sm outline-none"
              aria-label="Number of questions"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Choose a topic, learning level, and 3–20 questions. Questions are generated for this quiz.</p>
        <button
          onClick={handleGenerateNewQuiz}
          disabled={isGenerating || !customTopic.trim() || questionCount < 3 || questionCount > 20}
          className="btn-primary text-sm"
        >
          <Sparkles className={cn('h-4 w-4', isGenerating && 'animate-spin')} />
          {isGenerating ? 'Creating your quiz…' : 'Generate Quiz'}
        </button>
      </div>

      {/* Main Quiz Area */}
      {activeQuiz && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Box */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6 border-border space-y-6">
            {/* Question progress header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                  {currentQuestion.difficulty}
                </span>
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                {Object.keys(selectedAnswers).length}/{activeQuiz.questions.length} answered
              </div>
            </div>

            {/* Question text */}
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-foreground leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {currentQuestion.options?.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === option;
                const isCorrect = option === currentQuestion.correct_answer;
                const showFeedback = isSubmitted;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={isSubmitted}
                    className={cn(
                      'w-full p-4 rounded-xl text-left border text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3',
                      !showFeedback && isSelected
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                        : !showFeedback
                        ? 'border-border hover:bg-accent/40 text-foreground'
                        : isCorrect
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : isSelected
                        ? 'border-destructive bg-destructive/10 text-destructive font-semibold'
                        : 'border-border opacity-50 text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg border border-current flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {showFeedback && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Explanation Box (After submission) */}
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs"
              >
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <HelpCircle className="w-4 h-4 text-brand-500" />
                  <span>AI Explanation:</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{currentQuestion.explanation}</p>
                <Link
                  to={`/app/mentor?prompt=${encodeURIComponent(`Explain this quiz question and why "${currentQuestion.correct_answer}" is correct: "${currentQuestion.question}"`)}`}
                  className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline pt-1 font-medium"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Ask AI Mentor to explain further
                </Link>
              </motion.div>
            )}

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIdx === 0}
                className="btn-secondary text-xs disabled:opacity-30"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                  <button onClick={handleNext} className="btn-secondary text-xs flex items-center gap-1">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : !isSubmitted ? (
                  <button onClick={handleSubmitQuiz} className="btn-primary text-xs flex items-center gap-1">
                    Submit Quiz <Check className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={handleRetake} className="btn-secondary text-xs flex items-center gap-1">
                    Retake <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Score card & Question List Drawer */}
        <div className="space-y-4">
          {/* Score Summary Card */}
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-6 text-center border-border gradient-card space-y-3"
            >
              <Award className="w-10 h-10 text-brand-500 mx-auto" />
              <h3 className="text-lg font-display font-bold text-foreground">Assessment Complete</h3>
              <div className="text-4xl font-display font-extrabold gradient-text">
                {score.percentage}%
              </div>
              <p className="text-xs text-muted-foreground">
                You got {score.correct} out of {score.total} questions correct.
              </p>
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                {score.percentage >= 80
                  ? 'Outstanding! You have mastered this concept! 🌟'
                  : score.percentage >= 60
                  ? 'Solid foundation. Review the missed questions above.'
                  : 'Needs revision. Review this topic in your roadmap.'}
              </p>
            </motion.div>
          )}

          {/* Question Navigator Grid */}
          <div className="card p-5 border-border space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Question Navigator
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {activeQuiz.questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIdx;
                const isAnswered = !!selectedAnswers[q.id];
                const isCorrect = selectedAnswers[q.id] === q.correct_answer;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={cn(
                      'h-10 rounded-xl text-xs font-bold border transition-all flex items-center justify-center',
                      isCurrent ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-background' : '',
                      isSubmitted
                        ? isCorrect
                          ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500'
                          : 'bg-destructive/20 text-destructive border-destructive'
                        : isAnswered
                        ? 'bg-brand-500/10 text-brand-600 border-brand-500'
                        : 'border-border text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}
      {!activeQuiz && (
        <div className="card p-8 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 font-display text-lg font-semibold">Your quiz will appear here</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose a roadmap topic or enter your own, set the level and question count, then generate a quiz.</p>
        </div>
      )}
    </div>
  );
}
