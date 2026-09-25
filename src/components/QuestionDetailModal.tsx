import React, { useState, useEffect } from 'react';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Building2,
  Send,
  CheckCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import {
  doc,
  updateDoc,
  increment,
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

  useEffect(() => {
    setCurrentQuestion(question);
    if (question) {
      fetchAnswers(question.id);
    }
  }, [question]);

  const fetchAnswers = async (questionId: string) => {
    setLoadingAnswers(true);
    try {
      const qRef = collection(db, 'answers');
      const qSnap = await getDocs(query(qRef, where('questionId', '==', questionId)));
      const list: Answer[] = [];
      qSnap.forEach((doc) => {
        list.push(doc.data() as Answer);
      });
      list.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      setAnswers(list);
    } catch (err) {
      console.error('Error fetching answers:', err);
    } finally {
      setLoadingAnswers(false);
    }
  };

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

  const handleVoteAnswer = async (answerId: string, direction: 'up' | 'down') => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setAnswers((prev) =>
      prev.map((a) => {
        if (a.id === answerId) {
          return {
            ...a,
            upvotes: direction === 'up' ? a.upvotes + 1 : a.upvotes,
            downvotes: direction === 'down' ? a.downvotes + 1 : a.downvotes,
          };
        }
        return a;
      })
    );

    try {
      const ansRef = doc(db, 'answers', answerId);
      await updateDoc(ansRef, {
        [direction === 'up' ? 'upvotes' : 'downvotes']: increment(1),
      });
    } catch (err) {
      console.warn('Answer vote sync notice:', err);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerText.trim() || !currentQuestion) return;
    if (!user) {
      await signInWithGoogle();
      return;
    }

    setSubmittingAnswer(true);
    const newAnswerId = `ans_${Date.now()}`;
    const newAns: Answer = {
      id: newAnswerId,
      questionId: currentQuestion.id,
      userId: user.uid,
      authorName: userProfile?.name || user.displayName || 'Student Contributor',
      authorCollege: userProfile?.college || 'University Graduate',
      answerText: newAnswerText.trim(),
      upvotes: 1,
      downvotes: 0,
      upvotedBy: [user.uid],
      downvotedBy: [],
      createdAt: new Date().toISOString(),
    };

    try {
      const ansRef = doc(db, 'answers', newAnswerId);
      await setDoc(ansRef, newAns);
      setAnswers((prev) => [newAns, ...prev]);
      setNewAnswerText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `answers/${newAnswerId}`);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (!question || !currentQuestion) return null;

  const companiesList = currentQuestion.companiesAsked && currentQuestion.companiesAsked.length > 0
    ? currentQuestion.companiesAsked
    : currentQuestion.companyName ? [currentQuestion.companyName] : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/60">
          <div className="space-y-1 pr-4">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{currentQuestion.type}</span>
              {currentQuestion.technology && (
                <>
                  <span>·</span>
                  <span className="font-medium text-slate-700">{currentQuestion.technology}</span>
                </>
              )}
              {currentQuestion.difficulty && (
                <>
                  <span>·</span>
                  <span className="font-medium text-slate-600">{currentQuestion.difficulty}</span>
                </>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQuestion.questionText}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Question Details Block */}
          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-3">
            {(currentQuestion.explanation || currentQuestion.solution) && (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.explanation || currentQuestion.solution}
              </p>
            )}

            {/* Companies where reported & Asked times */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Companies reported:</span>
                <span className="font-medium text-slate-900">
                  {companiesList.length > 0 ? companiesList.join(' · ') : 'Campus placement drives'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-medium bg-white rounded border border-slate-200 text-slate-700">
                  Asked {currentQuestion.askedCount} times
                </span>

                <button
                  onClick={handleToggleQuestionUpvote}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{currentQuestion.upvotes || 0}</span>
                </button>
              </div>
            </div>

            {/* Related topics */}
            {currentQuestion.topic && (
              <div className="text-xs text-slate-500 pt-1">
                <span>Related topic: </span>
                <span className="font-medium text-slate-700">{currentQuestion.topic}</span>
              </div>
            )}
          </div>

          {/* Community Answers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Community Answers ({answers.length})
              </h3>
              <span className="text-xs text-slate-500">Peer verified solutions</span>
            </div>

            {loadingAnswers ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading answers...</div>
            ) : answers.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
                No answers posted yet. Be the first to share an answer or explanation!
              </div>
            ) : (
              <div className="space-y-3">
                {answers.map((ans, idx) => {
                  const isTopAnswer = idx === 0 && ans.upvotes > 0;
                  return (
                    <div
                      key={ans.id}
                      className={`p-3.5 rounded-lg border transition-all space-y-2 ${
                        isTopAnswer
                          ? 'bg-indigo-50/30 border-indigo-200/80 shadow-2xs'
                          : 'bg-white border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{ans.authorName}</span>
                          {ans.authorCollege && (
                            <>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500">{ans.authorCollege}</span>
                            </>
                          )}
                          {isTopAnswer && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-800 rounded">
                              Top answer
                            </span>
                          )}
                        </div>

                        <span className="text-slate-400 text-[11px]">
                          {new Date(ans.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {ans.answerText}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleVoteAnswer(ans.id, 'up')}
                          className="flex items-center gap-1 px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3 text-slate-500" />
                          <span>{ans.upvotes}</span>
                        </button>

                        <button
                          onClick={() => handleVoteAnswer(ans.id, 'down')}
                          className="flex items-center gap-1 px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                        >
                          <ThumbsDown className="w-3 h-3 text-slate-500" />
                          <span>{ans.downvotes || 0}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Answer Form */}
          <form onSubmit={handlePostAnswer} className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-700">
              Contribute your solution or tips
            </label>
            <textarea
              rows={3}
              value={newAnswerText}
              onChange={(e) => setNewAnswerText(e.target.value)}
              placeholder="Write your explanation, code snippet, or interview experience with this question..."
              className="w-full p-2.5 text-xs sm:text-sm bg-white rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingAnswer || !newAnswerText.trim()}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingAnswer ? 'Posting...' : 'Post Answer'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
