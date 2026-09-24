import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Building2,
  Code2,
  Send,
  CheckCircle,
  HelpCircle,
  Award,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import {
  doc,
  updateDoc,
  increment,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { Question, Answer } from '../types';

interface QuestionDetailModalProps {
  question: Question | null;
  onClose: () => void;
  onQuestionUpdated?: (updated: Question) => void;
  onUpvoteQuestion?: () => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  question,
  onClose,
  onQuestionUpdated,
  onUpvoteQuestion,
}) => {
  const { user, userProfile, signInWithGoogle } = useAuth();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [newAnswerText, setNewAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(question);
  const [hasMarkedAsked, setHasMarkedAsked] = useState(false);

  useEffect(() => {
    setCurrentQuestion(question);
    if (question && user) {
      setHasMarkedAsked(Boolean(question.askedByUserIds?.includes(user.uid)));
    }
    if (question) {
      fetchAnswers(question.id);
    }
  }, [question, user]);

  const handleToggleQuestionUpvote = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    if (onUpvoteQuestion) {
      onUpvoteQuestion();
    }
    if (currentQuestion) {
      const hasUpvoted = Boolean(currentQuestion.upvotedBy?.includes(user.uid));
      const nextUpvotes = Math.max(0, (currentQuestion.upvotes || 0) + (hasUpvoted ? -1 : 1));
      const nextUpvotedBy = hasUpvoted
        ? (currentQuestion.upvotedBy || []).filter((id) => id !== user.uid)
        : [...(currentQuestion.upvotedBy || []), user.uid];
      const updated = {
        ...currentQuestion,
        upvotes: nextUpvotes,
        upvotedBy: nextUpvotedBy,
      };
      setCurrentQuestion(updated);
      if (onQuestionUpdated) {
        onQuestionUpdated(updated);
      }
    }
  };

  const fetchAnswers = async (questionId: string) => {
    setLoadingAnswers(true);
    try {
      const qRef = collection(db, 'answers');
      const qSnap = await getDocs(query(qRef, where('questionId', '==', questionId)));
      const list: Answer[] = [];
      qSnap.forEach((doc) => {
        list.push(doc.data() as Answer);
      });
      // Sort by upvotes descending
      list.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      setAnswers(list);
    } catch (err) {
      console.error('Failed to load answers:', err);
    } finally {
      setLoadingAnswers(false);
    }
  };

  if (!currentQuestion) return null;

  const handleMarkAsked = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    if (hasMarkedAsked) return;

    try {
      const qDocRef = doc(db, 'questions', currentQuestion.id);
      await updateDoc(qDocRef, {
        askedCount: increment(1),
        askedByUserIds: arrayUnion(user.uid),
      });

      const updated = {
        ...currentQuestion,
        askedCount: currentQuestion.askedCount + 1,
        askedByUserIds: [...(currentQuestion.askedByUserIds || []), user.uid],
      };
      setCurrentQuestion(updated);
      setHasMarkedAsked(true);
      if (onQuestionUpdated) onQuestionUpdated(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `questions/${currentQuestion.id}`);
    }
  };

  const handleVote = async (answer: Answer, isUpvote: boolean) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    const hasUpvoted = answer.upvotedBy?.includes(user.uid);
    const hasDownvoted = answer.downvotedBy?.includes(user.uid);

    let newUpvotes = answer.upvotes;
    let newDownvotes = answer.downvotes;
    let newUpvotedBy = [...(answer.upvotedBy || [])];
    let newDownvotedBy = [...(answer.downvotedBy || [])];

    if (isUpvote) {
      if (hasUpvoted) {
        newUpvotes -= 1;
        newUpvotedBy = newUpvotedBy.filter(id => id !== user.uid);
      } else {
        newUpvotes += 1;
        newUpvotedBy.push(user.uid);
        if (hasDownvoted) {
          newDownvotes -= 1;
          newDownvotedBy = newDownvotedBy.filter(id => id !== user.uid);
        }
      }
    } else {
      if (hasDownvoted) {
        newDownvotes -= 1;
        newDownvotedBy = newDownvotedBy.filter(id => id !== user.uid);
      } else {
        newDownvotes += 1;
        newDownvotedBy.push(user.uid);
        if (hasUpvoted) {
          newUpvotes -= 1;
          newUpvotedBy = newUpvotedBy.filter(id => id !== user.uid);
        }
      }
    }

    try {
      const ansDocRef = doc(db, 'answers', answer.id);
      await updateDoc(ansDocRef, {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        upvotedBy: newUpvotedBy,
        downvotedBy: newDownvotedBy,
      });

      setAnswers(prev =>
        prev
          .map(a => (a.id === answer.id ? { ...a, upvotes: newUpvotes, downvotes: newDownvotes, upvotedBy: newUpvotedBy, downvotedBy: newDownvotedBy } : a))
          .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `answers/${answer.id}`);
    }
  };

  const handleAddAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await signInWithGoogle();
      return;
    }
    if (!newAnswerText.trim()) return;

    setSubmittingAnswer(true);
    try {
      const answerId = `ans-${Date.now()}`;
      const newAnswer: Answer = {
        id: answerId,
        questionId: currentQuestion.id,
        userId: user.uid,
        authorName: userProfile?.name || user.displayName || 'Student',
        authorCollege: userProfile?.college || 'University Campus',
        answerText: newAnswerText.trim(),
        upvotes: 1,
        downvotes: 0,
        upvotedBy: [user.uid],
        downvotedBy: [],
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'answers', answerId), newAnswer);
      setAnswers([newAnswer, ...answers]);
      setNewAnswerText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'answers');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-100 text-indigo-700">
                {currentQuestion.type}
              </span>
              {currentQuestion.technology && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-200 text-slate-800">
                  {currentQuestion.technology}
                </span>
              )}
              {currentQuestion.difficulty && (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                  currentQuestion.difficulty === 'Hard'
                    ? 'bg-rose-100 text-rose-700'
                    : currentQuestion.difficulty === 'Easy'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                Asked {currentQuestion.askedCount} time{currentQuestion.askedCount === 1 ? '' : 's'}
              </span>
              {currentQuestion.companiesAsked && currentQuestion.companiesAsked.length > 0 && (
                <>
                  <span>·</span>
                  <span className="text-slate-600">
                    Reported at: {currentQuestion.companiesAsked.join(', ')}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleQuestionUpvote}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                user && currentQuestion.upvotedBy?.includes(user.uid)
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title={user && currentQuestion.upvotedBy?.includes(user.uid) ? 'You upvoted this question' : 'Upvote this question'}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${user && currentQuestion.upvotedBy?.includes(user.uid) ? 'fill-white text-white' : 'text-slate-400'}`} />
              <span>Upvote ({currentQuestion.upvotes || 0})</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          
          {/* Question text box */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug">
              {currentQuestion.questionText}
            </h3>

            {/* Actions: "I was asked this too" + "Upvote Question" */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={handleMarkAsked}
                disabled={hasMarkedAsked}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  hasMarkedAsked
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{hasMarkedAsked ? "You confirmed: I was asked this too" : "I was asked this too"}</span>
              </button>

              <button
                onClick={handleToggleQuestionUpvote}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  user && currentQuestion.upvotedBy?.includes(user.uid)
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${user && currentQuestion.upvotedBy?.includes(user.uid) ? 'fill-white text-white' : 'text-indigo-600'}`} />
                <span>{user && currentQuestion.upvotedBy?.includes(user.uid) ? 'Upvoted' : 'Helpful Question'} ({currentQuestion.upvotes || 0})</span>
              </button>

              <span className="text-xs text-slate-500">
                Helps surface quality questions to students
              </span>
            </div>
          </div>

          {/* Solution or Code if available */}
          {currentQuestion.solution && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" />
                Solution Reference
              </span>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                <code>{currentQuestion.solution}</code>
              </pre>
            </div>
          )}

          {/* Explanation if available */}
          {currentQuestion.explanation && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">Explanation &amp; Logic:</span>
              {currentQuestion.explanation}
            </div>
          )}

          {/* Community Answers Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                Community Solutions &amp; Tips ({answers.length})
              </h4>
              <span className="text-xs text-slate-500">Sorted by Top Answer</span>
            </div>

            {loadingAnswers ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Loading community answers...
              </div>
            ) : answers.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500 text-xs">
                No answers submitted yet. Be the first to share your solution or advice for this question!
              </div>
            ) : (
              <div className="space-y-3">
                {answers.map((ans, idx) => {
                  const isTopAnswer = idx === 0 && ans.upvotes > 1;
                  const hasUpvoted = user && ans.upvotedBy?.includes(user.uid);
                  const hasDownvoted = user && ans.downvotedBy?.includes(user.uid);

                  return (
                    <div
                      key={ans.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isTopAnswer
                          ? 'border-indigo-200 bg-indigo-50/20 shadow-2xs'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {isTopAnswer && (
                        <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[11px] mb-2">
                          <Award className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Top community answer</span>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                        {ans.answerText}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{ans.authorName}</span>
                          {ans.authorCollege && (
                            <span className="text-slate-400 truncate max-w-[140px] sm:max-w-none">
                              · {ans.authorCollege}
                            </span>
                          )}
                        </div>

                        {/* Voting */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(ans, true)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                              hasUpvoted
                                ? 'bg-indigo-100 text-indigo-700 font-bold'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{ans.upvotes}</span>
                          </button>

                          <button
                            onClick={() => handleVote(ans, false)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                              hasDownvoted
                                ? 'bg-rose-100 text-rose-700 font-bold'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Answer Form */}
            <form onSubmit={handleAddAnswer} className="pt-2 space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Share Your Solution or Interview Insight
              </label>
              <textarea
                rows={3}
                required
                placeholder="Write your explanation, code nuance, or what the interviewer specifically looked for in this question..."
                value={newAnswerText}
                onChange={(e) => setNewAnswerText(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAnswer || !newAnswerText.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingAnswer ? 'Posting...' : 'Post Answer'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
