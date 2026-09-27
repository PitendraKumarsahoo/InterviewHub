import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  FileText,
  HelpCircle,
  Edit3,
  Trash2,
  PlusCircle,
  ThumbsUp,
  Bookmark,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  Save,
  X,
  Sparkles,
  TrendingUp,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  increment
} from 'firebase/firestore';
import { InterviewExperience, Question, Company, InterviewType, InterviewResult, DifficultyLevel } from '../types';
import { StatusTag, VisualProgressTracker } from '../components/StatusIndicator';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

interface UserDashboardViewProps {
  companies: Company[];
  allExperiences: InterviewExperience[];
  allQuestions: Question[];
  onSelectExperience: (experience: InterviewExperience) => void;
  onSelectQuestion: (question: Question) => void;
  onOpenSubmit: () => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  companies,
  allExperiences,
  allQuestions,
  onSelectExperience,
  onSelectQuestion,
  onOpenSubmit,
}) => {
  const { user, userProfile, signInWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<'experiences' | 'questions' | 'bookmarks'>('experiences');
  const [userExperiences, setUserExperiences] = useState<InterviewExperience[]>([]);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Experience Modal state
  const [editingExperience, setEditingExperience] = useState<InterviewExperience | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editType, setEditType] = useState<InterviewType>('Campus');
  const [editResult, setEditResult] = useState<InterviewResult>('Selected');
  const [editDifficulty, setEditDifficulty] = useState<DifficultyLevel>('Moderate');
  const [editExperienceText, setEditExperienceText] = useState('');
  const [editAdvice, setEditAdvice] = useState('');
  const [editTechs, setEditTechs] = useState<string[]>([]);
  const [newTechInput, setNewTechInput] = useState('');
  const [savingExp, setSavingExp] = useState(false);

  // Edit Question Modal state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editQuestionType, setEditQuestionType] = useState<Question['type']>('Technical');
  const [editQuestionTech, setEditQuestionTech] = useState('');
  const [editQuestionDiff, setEditQuestionDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [savingQ, setSavingQ] = useState(false);

  // Delete confirmation modals
  const [deletingExpId, setDeletingExpId] = useState<string | null>(null);
  const [deletingQId, setDeletingQId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Filter bookmarked experiences
  const bookmarkedExperiences = allExperiences.filter(
    (exp) =>
      userProfile?.bookmarkedExperienceIds?.includes(exp.id) ||
      exp.bookmarkedBy?.includes(user?.uid || '')
  );

  // Fetch or filter user contributions
  useEffect(() => {
    if (!user) {
      setUserExperiences([]);
      setUserQuestions([]);
      setLoading(false);
      return;
    }

    // Filter directly from live props for instant reactivity
    const exps = allExperiences.filter((e) => e.userId === user.uid);
    const qs = allQuestions.filter(
      (q) => q.userId === user.uid || (q.askedByUserIds && q.askedByUserIds.includes(user.uid))
    );

    setUserExperiences(exps);
    setUserQuestions(qs);
    setLoading(false);
  }, [user, allExperiences, allQuestions]);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Open Edit Experience Modal
  const handleOpenEditExp = (exp: InterviewExperience) => {
    setEditingExperience(exp);
    setEditRole(exp.role);
    setEditType(exp.interviewType);
    setEditResult(exp.result);
    setEditDifficulty(exp.difficulty);
    setEditExperienceText(exp.experienceText);
    setEditAdvice(exp.advice || '');
    setEditTechs(exp.technologies || []);
  };

  // Save Edited Experience
  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperience || !user) return;

    setSavingExp(true);
    try {
      const expRef = doc(db, 'experiences', editingExperience.id);
      const updatedFields = {
        role: editRole.trim(),
        interviewType: editType,
        result: editResult,
        difficulty: editDifficulty,
        experienceText: editExperienceText.trim(),
        advice: editAdvice.trim(),
        technologies: editTechs,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(expRef, updatedFields);
      setUserExperiences((prev) =>
        prev.map((item) =>
          item.id === editingExperience.id ? { ...item, ...updatedFields } : item
        )
      );
      setEditingExperience(null);
      showStatus('Interview experience updated successfully!');
    } catch (err) {
      console.error('Error updating experience:', err);
      showStatus('Failed to update experience. Please try again.', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `experiences/${editingExperience.id}`);
    } finally {
      setSavingExp(false);
    }
  };

  // Delete Experience
  const handleConfirmDeleteExp = async () => {
    if (!deletingExpId || !user) return;

    setActionInProgress(true);
    try {
      const targetExp = userExperiences.find((e) => e.id === deletingExpId);
      await deleteDoc(doc(db, 'experiences', deletingExpId));

      // Decrement company count if company doc exists
      if (targetExp?.companyId) {
        try {
          const compRef = doc(db, 'companies', targetExp.companyId);
          await updateDoc(compRef, {
            experienceCount: increment(-1),
          });
        } catch {
          // Ignore
        }
      }

      setUserExperiences((prev) => prev.filter((e) => e.id !== deletingExpId));
      setDeletingExpId(null);
      showStatus('Interview experience deleted.');
    } catch (err) {
      console.error('Error deleting experience:', err);
      showStatus('Failed to delete experience.', 'error');
      handleFirestoreError(err, OperationType.DELETE, `experiences/${deletingExpId}`);
    } finally {
      setActionInProgress(false);
    }
  };

  // Open Edit Question Modal
  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setEditQuestionText(q.questionText);
    setEditQuestionType(q.type);
    setEditQuestionTech(q.technology || '');
    setEditQuestionDiff(q.difficulty || 'Medium');
  };

  // Save Edited Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !user) return;

    setSavingQ(true);
    try {
      const qRef = doc(db, 'questions', editingQuestion.id);
      const updatedFields = {
        questionText: editQuestionText.trim(),
        normalizedText: editQuestionText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(),
        type: editQuestionType,
        technology: editQuestionTech.trim() || 'General',
        difficulty: editQuestionDiff,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(qRef, updatedFields);
      setUserQuestions((prev) =>
        prev.map((item) =>
          item.id === editingQuestion.id ? { ...item, ...updatedFields } : item
        )
      );
      setEditingQuestion(null);
      showStatus('Question updated successfully!');
    } catch (err) {
      console.error('Error updating question:', err);
      showStatus('Failed to update question.', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `questions/${editingQuestion.id}`);
    } finally {
      setSavingQ(false);
    }
  };

  // Delete Question
  const handleConfirmDeleteQuestion = async () => {
    if (!deletingQId || !user) return;

    setActionInProgress(true);
    try {
      const targetQ = userQuestions.find((q) => q.id === deletingQId);
      await deleteDoc(doc(db, 'questions', deletingQId));

      if (targetQ?.companyId) {
        try {
          const compRef = doc(db, 'companies', targetQ.companyId);
          await updateDoc(compRef, {
            questionCount: increment(-1),
          });
        } catch {
          // Ignore
        }
      }

      setUserQuestions((prev) => prev.filter((q) => q.id !== deletingQId));
      setDeletingQId(null);
      showStatus('Question deleted.');
    } catch (err) {
      console.error('Error deleting question:', err);
      showStatus('Failed to delete question.', 'error');
      handleFirestoreError(err, OperationType.DELETE, `questions/${deletingQId}`);
    } finally {
      setActionInProgress(false);
    }
  };

  // Not signed in state
  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-sm border border-orange-100">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Contributor Dashboard
          </h2>
          <p className="text-base font-medium text-slate-600 leading-relaxed max-w-md mx-auto">
            Sign in with your Google account to track your submitted interview debriefs, manage questions, edit records, and access saved bookmarks.
          </p>
        </div>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2.5 hover:scale-[1.02]"
        >
          <span>Sign In with Google</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Calculate total upvotes received across contributions
  const totalUpvotes =
    userExperiences.reduce((acc, e) => acc + (e.upvotes || 0), 0) +
    userQuestions.reduce((acc, q) => acc + (q.upvotes || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`p-4 sm:p-5 rounded-2xl text-sm sm:text-base font-semibold flex items-center justify-between shadow-md transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Profile Header & Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500/20 shadow-md shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0F172A] to-slate-800 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {user.displayName || 'Campus Contributor'}
                </h1>
                <span className="px-3 py-1 text-xs sm:text-sm font-bold rounded-lg bg-orange-50 text-orange-700 border border-orange-200">
                  Student Contributor
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-600">{user.email}</p>
              {userProfile?.college && (
                <p className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{userProfile.college} {userProfile.branch ? `· ${userProfile.branch}` : ''}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenSubmit}
              className="px-6 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 hover:scale-[1.02]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Share New Experience</span>
            </button>
          </div>
        </div>

        {/* Contribution Metrics Grid: Card-based with subtle shadows */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-6 border-t border-slate-200/80">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50/70 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                Experiences
              </span>
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
              {userExperiences.length}
            </span>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Published debriefs
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50/70 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                Questions
              </span>
              <HelpCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
              {userQuestions.length}
            </span>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Contributed to bank
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50/70 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                Helpful Upvotes
              </span>
              <ThumbsUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
              {totalUpvotes}
            </span>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Peer appreciation
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50/70 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                Saved Debriefs
              </span>
              <Bookmark className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
              {bookmarkedExperiences.length}
            </span>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Bookmarked for revision
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Mobile Friendly Horizontal Scrollable Bar */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('experiences')}
          className={`flex-1 min-w-[150px] min-h-[48px] py-3.5 px-4 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap touch-manipulation ${
            activeTab === 'experiences'
              ? 'bg-white text-[#EA580C] shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>My Experiences ({userExperiences.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex-1 min-w-[150px] min-h-[48px] py-3.5 px-4 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap touch-manipulation ${
            activeTab === 'questions'
              ? 'bg-white text-[#EA580C] shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>My Questions ({userQuestions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 min-w-[150px] min-h-[48px] py-3.5 px-4 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap touch-manipulation ${
            activeTab === 'bookmarks'
              ? 'bg-white text-[#EA580C] shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Bookmark className="w-4 h-4 shrink-0" />
          <span>Saved Debriefs ({bookmarkedExperiences.length})</span>
        </button>
      </div>

      {/* TAB 1: MY EXPERIENCES (Card-based Grid) */}
      {activeTab === 'experiences' && (
        <div className="space-y-6">
          {userExperiences.length === 0 ? (
            <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-2xs">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  No interview experiences shared yet
                </h3>
                <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
                  Sharing your interview rounds and coding problems helps thousands of junior students crack their dream placements.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSubmit}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Share First Experience</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {userExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-6 sm:p-7 bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 shadow-xs hover:shadow-md flex flex-col justify-between space-y-5 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                          {exp.companyName?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl leading-snug">
                            {exp.companyName}
                          </h3>
                          <p className="text-sm font-medium text-slate-600">
                            {exp.role} · {exp.interviewType} ({exp.year || new Date(exp.createdAt).getFullYear()})
                          </p>
                        </div>
                      </div>
                      <StatusTag result={exp.result} size="sm" showDot={true} />
                    </div>

                    <VisualProgressTracker
                      result={exp.result}
                      roundsCount={exp.rounds?.length || 0}
                      rounds={exp.rounds || []}
                      compact={true}
                    />

                    <p className="text-sm sm:text-base font-medium text-slate-700 line-clamp-3 leading-relaxed">
                      {exp.experienceText}
                    </p>

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {exp.technologies.slice(0, 5).map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 text-xs sm:text-sm font-semibold bg-slate-100 text-slate-800 rounded-lg border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile-Friendly Action Bar */}
                  <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => onSelectExperience(exp)}
                      className="min-h-[44px] inline-flex items-center font-bold text-orange-600 hover:text-orange-700 cursor-pointer gap-1.5 self-start sm:self-auto touch-manipulation"
                    >
                      <span>View Full Debrief</span>
                      <span>→</span>
                    </button>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenEditExp(exp)}
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] gap-1.5 px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold cursor-pointer transition-colors touch-manipulation"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingExpId(exp.id)}
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] gap-1.5 px-4 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold cursor-pointer transition-colors border border-rose-200 touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY QUESTIONS (Card-based Grid) */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {userQuestions.length === 0 ? (
            <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-2xs">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  No questions contributed yet
                </h3>
                <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
                  When you submit interview experiences, questions from each round are automatically extracted and indexed into the question bank.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSubmit}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Share Experience</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {userQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-6 bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-xs sm:text-sm font-bold rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                          {q.type}
                        </span>
                        {q.technology && (
                          <span className="px-2.5 py-1 text-xs sm:text-sm font-bold rounded-lg bg-orange-50 text-orange-800 border border-orange-200">
                            {q.technology}
                          </span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-500">
                        {q.companyName} · Asked {q.askedCount || 1}x
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectQuestion(q)}
                      className="text-base sm:text-lg font-bold text-slate-900 hover:text-orange-600 cursor-pointer transition-colors leading-snug"
                    >
                      {q.questionText}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectQuestion(q)}
                      className="min-h-[44px] inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-700 cursor-pointer touch-manipulation"
                    >
                      View Question →
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditQuestion(q)}
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] gap-1.5 px-3.5 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm font-bold cursor-pointer transition-colors touch-manipulation"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingQId(q.id)}
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] gap-1.5 px-3.5 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 text-sm font-bold cursor-pointer transition-colors border border-rose-200 touch-manipulation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SAVED BOOKMARKS (Card-based Grid) */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          {bookmarkedExperiences.length === 0 ? (
            <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-slate-200 space-y-3.5 shadow-sm">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  No saved debriefs
                </h3>
                <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
                  Bookmark interview experiences from the feed to review rounds, questions, and preparation advice prior to campus placement drives.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {bookmarkedExperiences.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => onSelectExperience(exp)}
                  className="p-6 bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 shadow-xs hover:shadow-md cursor-pointer group flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                          {exp.companyName?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-orange-600 transition-colors">
                            {exp.companyName}
                          </h3>
                          <p className="text-sm font-medium text-slate-600">
                            {exp.role} · {exp.interviewType}
                          </p>
                        </div>
                      </div>
                      <StatusTag result={exp.result} size="sm" />
                    </div>

                    <p className="text-sm sm:text-base font-medium text-slate-700 line-clamp-3 leading-relaxed">
                      {exp.experienceText}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-sm font-medium text-slate-600">
                    <span>{exp.rounds?.length || 0} rounds conducted</span>
                    <span className="font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                      View Experience →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT EXPERIENCE MODAL (Mobile Friendly & Accessible) */}
      {editingExperience && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  Edit Interview Experience
                </h3>
                <p className="text-sm font-medium text-slate-600 mt-0.5">
                  {editingExperience.companyName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingExperience(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExp} className="p-6 sm:p-7 overflow-y-auto space-y-5 text-base">
              <div>
                <label className="block font-bold text-slate-900 mb-2">Role / Designation *</label>
                <input
                  type="text"
                  required
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 text-base font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 mb-2">Interview Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as InterviewType)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 text-base font-medium bg-white"
                  >
                    <option value="Campus">Campus</option>
                    <option value="Off-campus">Off-campus</option>
                    <option value="Internship">Internship</option>
                    <option value="PPO">PPO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-2">Result Outcome</label>
                  <select
                    value={editResult}
                    onChange={(e) => setEditResult(e.target.value as InterviewResult)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 text-base font-medium bg-white"
                  >
                    <option value="Selected">Selected</option>
                    <option value="Not Selected">Not Selected</option>
                    <option value="Waitlisted">Waitlisted / Pending</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-2">Difficulty Level</label>
                <div className="flex gap-2.5">
                  {(['Easy', 'Moderate', 'Difficult'] as DifficultyLevel[]).map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setEditDifficulty(d)}
                      className={`flex-1 py-2.5 rounded-xl border font-bold text-sm sm:text-base cursor-pointer transition-colors ${
                        editDifficulty === d
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-2">Experience Description *</label>
                <textarea
                  rows={4}
                  required
                  value={editExperienceText}
                  onChange={(e) => setEditExperienceText(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 text-base font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-2">Advice for Juniors</label>
                <textarea
                  rows={3}
                  value={editAdvice}
                  onChange={(e) => setEditAdvice(e.target.value)}
                  placeholder="Tips on preparation, DSA focus, or interview day mindset..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 text-base font-medium leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingExperience(null)}
                  className="px-5 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold text-base cursor-pointer hover:bg-slate-50 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExp}
                  className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl font-bold text-base cursor-pointer shadow-md disabled:opacity-60 flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingExp ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">Edit Interview Question</h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-5 text-base">
              <div>
                <label className="block font-bold text-slate-900 mb-2">Question Prompt *</label>
                <textarea
                  rows={3}
                  required
                  value={editQuestionText}
                  onChange={(e) => setEditQuestionText(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 text-base font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 mb-2">Round / Type</label>
                  <select
                    value={editQuestionType}
                    onChange={(e) => setEditQuestionType(e.target.value as Question['type'])}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 text-base font-medium bg-white"
                  >
                    <option value="Coding">Coding</option>
                    <option value="Technical">Technical</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="GD">GD</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-2">Difficulty</label>
                  <select
                    value={editQuestionDiff}
                    onChange={(e) => setEditQuestionDiff(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 text-base font-medium bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-2">Primary Technology</label>
                <input
                  type="text"
                  placeholder="e.g. Java / SQL / DSA / React"
                  value={editQuestionTech}
                  onChange={(e) => setEditQuestionTech(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 text-base font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-5 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold text-base cursor-pointer hover:bg-slate-50 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQ}
                  className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl font-bold text-base cursor-pointer shadow-md disabled:opacity-60 flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingQ ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE EXPERIENCE MODAL */}
      {deletingExpId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-xl">Delete Experience?</h3>
              <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
                Are you sure you want to delete this interview debrief? This action is permanent and will remove it from the platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingExpId(null)}
                disabled={actionInProgress}
                className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl text-base font-bold cursor-pointer hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteExp}
                disabled={actionInProgress}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-base font-bold cursor-pointer shadow-md disabled:opacity-60"
              >
                {actionInProgress ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE QUESTION MODAL */}
      {deletingQId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-xl">Delete Question?</h3>
              <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
                Are you sure you want to remove this interview question from your contributions?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQId(null)}
                disabled={actionInProgress}
                className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl text-base font-bold cursor-pointer hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuestion}
                disabled={actionInProgress}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-base font-bold cursor-pointer shadow-md disabled:opacity-60"
              >
                {actionInProgress ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
