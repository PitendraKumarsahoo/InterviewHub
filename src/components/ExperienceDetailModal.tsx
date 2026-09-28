import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Building2,
  Copy,
  Check,
  ThumbsUp,
  Bookmark,
  Download,
  Star,
  Tag,
  UserCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { InterviewExperience, PreparePlan } from '../types';
import { generatePreparationPlan } from '../lib/gemini';
import { useAuth } from '../context/AuthContext';
import { exportExperiencePDF } from '../lib/pdfExport';
import { StatusTag, VisualProgressTracker } from './StatusIndicator';

interface ExperienceDetailModalProps {
  experience: InterviewExperience | null;
  onClose: () => void;
  onSelectCompany?: (companyId: string) => void;
  onUpvote?: () => void;
  onToggleBookmark?: () => void;
}

export const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({
  experience,
  onClose,
  onSelectCompany,
  onUpvote,
  onToggleBookmark,
}) => {
  const { user, isExperienceBookmarked } = useAuth();
  const [preparePlan, setPreparePlan] = useState<PreparePlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);
  const [firestoreExp, setFirestoreExp] = useState<InterviewExperience | null>(null);

  // Sync with Firestore document in real-time when modal opens
  useEffect(() => {
    if (!experience?.id) {
      setFirestoreExp(null);
      return;
    }

    setFirestoreExp(experience);

    // Attach real-time Firestore listener to ensure full and authoritative debrief data
    try {
      const expRef = doc(db, 'experiences', experience.id);
      const unsubscribe = onSnapshot(
        expRef,
        (snap) => {
          if (snap.exists()) {
            setFirestoreExp({ id: snap.id, ...snap.data() } as InterviewExperience);
          }
        },
        (err) => {
          console.warn('Realtime sync warning for experience:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Failed to listen to experience doc:', e);
    }
  }, [experience?.id]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (experience) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [experience, onClose]);

  if (!experience) return null;

  const activeExp = firestoreExp || experience;
  const isBookmarked = isExperienceBookmarked(activeExp.id);
  const hasUpvoted = Boolean(user && activeExp.upvotedBy?.includes(user.uid));

  // Defensive sanitization of rounds, technologies, tags, and date
  const safeRounds = Array.isArray(activeExp.rounds)
    ? activeExp.rounds.map((r: any, idx: number) => ({
        roundName: typeof r === 'string' ? r : (r?.roundName || `Round ${idx + 1}`),
        questions: Array.isArray(r?.questions) ? r.questions.filter((q: any) => typeof q === 'string' && q.trim()) : [],
      }))
    : [];

  const safeTechs = Array.isArray(activeExp.technologies) ? activeExp.technologies.filter(Boolean) : [];
  const safeTags = Array.isArray(activeExp.tags) ? activeExp.tags.filter(Boolean) : [];

  const yearStr = activeExp.year || (() => {
    if (!activeExp.createdAt) return new Date().getFullYear();
    const d = new Date(activeExp.createdAt);
    return isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  })();

  const handleGenerateAIPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await generatePreparationPlan(activeExp);
      setPreparePlan(plan);
    } catch (err) {
      console.error('Failed to generate AI preparation plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleCopyQuestions = () => {
    const allQuestions = safeRounds
      .map((r) => `[${r.roundName}]\n` + (r.questions.length > 0 ? r.questions.map((q: string) => `• ${q}`).join('\n') : '• General discussion'))
      .join('\n\n');
    navigator.clipboard.writeText(
      `${activeExp.companyName || 'Company'} - ${activeExp.role || 'Role'} (${activeExp.interviewType || 'Campus'})\n\n${allQuestions}\n\nCandidate Advice:\n${activeExp.advice || 'N/A'}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    setPdfMessage(null);
    try {
      // Wire directly to the live Firestore-backed activeExp data
      const success = exportExperiencePDF(activeExp, preparePlan);
      if (success) {
        setPdfMessage('PDF debrief downloaded successfully!');
      } else {
        setPdfMessage('Could not generate PDF. Please try again.');
      }
    } catch (err) {
      console.error('Failed to export PDF from Firestore data:', err);
      setPdfMessage('Error generating document.');
    } finally {
      setIsExportingPDF(false);
      setTimeout(() => setPdfMessage(null), 3500);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95"
      >
        {/* Header: Company, Role, Campus · Year, Result */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectCompany && onSelectCompany(activeExp.companyId)}
                className="font-extrabold text-slate-900 text-lg sm:text-xl hover:text-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-5 h-5 text-orange-600" />
                {activeExp.companyName}
              </button>
              <span className="text-slate-300">·</span>
              <span className="text-slate-800 font-bold text-base">{activeExp.role}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-bold">
                {activeExp.interviewType}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Year {yearStr}
              </span>
              {activeExp.difficulty && (
                <>
                  <span>·</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                    activeExp.difficulty === 'Difficult'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : activeExp.difficulty === 'Easy'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}>
                    {activeExp.difficulty}
                  </span>
                </>
              )}
              {activeExp.authorCollege && (
                <>
                  <span>·</span>
                  <span className="text-slate-500 font-normal">{activeExp.authorCollege}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <StatusTag result={activeExp.result} size="md" showDot={true} showPulse={true} />

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* PDF Status Notification Toast */}
          {pdfMessage && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                <span>{pdfMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setPdfMessage(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Visual Progress & Stage Pipeline Indicator */}
          <VisualProgressTracker
            result={activeExp.result}
            rounds={safeRounds}
            compact={false}
          />

          {/* Action row (Upvote, Bookmark, Copy, PDF) */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 border-b border-slate-200 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onUpvote}
                className={`min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation ${
                  hasUpvoted
                    ? 'bg-orange-50 border-orange-500 text-orange-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{activeExp.upvotes || 0} Upvotes</span>
              </button>

              <button
                type="button"
                onClick={onToggleBookmark}
                className={`min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation ${
                  isBookmarked
                    ? 'bg-amber-50 border-amber-500 text-amber-900'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyQuestions}
                className="min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer touch-manipulation shadow-2xs"
                title="Copy all questions and advice"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? 'Copied!' : 'Copy Questions'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="min-h-[38px] flex items-center gap-1.5 px-4 py-1.5 rounded-xl border-2 border-orange-600 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation shadow-xs active:scale-95"
                title="Download formatted offline PDF document"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isExportingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          {/* Student Contributor & Rating Banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                <UserCheck className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Debrief Contributor
                </span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {activeExp.authorName || 'Student Contributor'}
                </span>
                {activeExp.authorCollege && (
                  <span className="text-xs text-slate-600 font-medium block">
                    {activeExp.authorCollege}
                  </span>
                )}
              </div>
            </div>

            {activeExp.overallRating && (
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (activeExp.overallRating || 0)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                  {activeExp.overallRating}/5 Rating
                </span>
              </div>
            )}
          </div>

          {/* Domain & Skill Categorization Tags */}
          {safeTags.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-orange-600" />
                <span>Domain &amp; Skill Tracks</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {safeTags.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 text-xs font-bold bg-orange-50 text-orange-800 rounded-lg border border-orange-200"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Technologies Used */}
          {safeTechs.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">
                Technologies Tested
              </h3>
              <div className="flex flex-wrap gap-2">
                {safeTechs.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-800 rounded-lg border border-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Detailed Student Experience Narrative */}
          <section className="space-y-2.5">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-1.5">
              Full Interview Experience Debrief
            </h3>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap font-normal bg-white p-4 rounded-xl border border-slate-200">
              {activeExp.experienceText}
            </p>
          </section>

          {/* Interview Overview & Structured Rounds Breakdown */}
          <section className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-600" />
              <span>Interview Rounds &amp; Questions Breakdown ({safeRounds.length} Rounds)</span>
            </h3>

            {safeRounds.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No specific rounds recorded for this experience.</p>
            ) : (
              <div className="space-y-3.5">
                {safeRounds.map((round, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center font-black text-xs">
                          {idx + 1}
                        </span>
                        <span>{round.roundName}</span>
                      </h4>
                      <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        {round.questions.length} {round.questions.length === 1 ? 'question' : 'questions'}
                      </span>
                    </div>

                    {round.questions && round.questions.length > 0 ? (
                      <div className="pt-1 space-y-2">
                        <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                          Questions &amp; Discussion Points Reported:
                        </span>
                        <ul className="space-y-2 text-xs sm:text-sm text-slate-800 font-medium">
                          {round.questions.map((q: string, qIdx: number) => (
                            <li key={qIdx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/90">
                              <span className="text-orange-600 font-black shrink-0">•</span>
                              <span className="leading-relaxed">{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Discussion on resume foundations and technical background.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Advice for Juniors */}
          {activeExp.advice && (
            <section className="space-y-2.5">
              <h3 className="text-base font-extrabold text-slate-900">
                Candidate Advice for Juniors &amp; Aspirants
              </h3>
              <div className="p-4 sm:p-5 bg-amber-50/80 border-2 border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-950 font-medium leading-relaxed shadow-2xs">
                {activeExp.advice}
              </div>
            </section>
          )}

          {/* AI Preparation Option */}
          <section className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  AI Interview Preparation Plan
                </h3>
                <p className="text-xs text-slate-600">
                  Generate a structured study roadmap tailored specifically to this company &amp; role.
                </p>
              </div>

              {!preparePlan && (
                <button
                  type="button"
                  onClick={handleGenerateAIPlan}
                  disabled={isGeneratingPlan}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isGeneratingPlan ? 'Generating Roadmap...' : 'Generate AI Plan'}</span>
                </button>
              )}
            </div>

            {preparePlan && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 text-xs sm:text-sm">
                <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                  {preparePlan.summary}
                </p>

                {preparePlan.recommendedStudyPlan && preparePlan.recommendedStudyPlan.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="font-extrabold text-slate-900 block uppercase tracking-wider text-xs">
                      Recommended Study Roadmap:
                    </span>
                    <div className="space-y-1.5">
                      {preparePlan.recommendedStudyPlan.map((stepItem: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-orange-600 font-bold shrink-0">•</span>
                          <span className="text-slate-800 font-medium">{stepItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {preparePlan.proTips && preparePlan.proTips.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="font-extrabold text-slate-900 block uppercase tracking-wider text-xs">
                      Candidate Pro-Tips:
                    </span>
                    <div className="space-y-1.5">
                      {preparePlan.proTips.map((tip: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                          <span className="text-amber-600 font-bold shrink-0">✓</span>
                          <span className="font-medium">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

