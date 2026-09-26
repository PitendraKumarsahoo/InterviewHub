import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Building2,
  Copy,
  Check,
  ThumbsUp,
  Bookmark,
  Download
} from 'lucide-react';
import { InterviewExperience, PreparePlan } from '../types';
import { generatePreparationPlan } from '../lib/gemini';
import { useAuth } from '../context/AuthContext';
import { exportExperiencePDF } from '../lib/pdfExport';

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

  if (!experience) return null;

  const isBookmarked = isExperienceBookmarked(experience.id);
  const hasUpvoted = Boolean(user && experience.upvotedBy?.includes(user.uid));

  const handleGenerateAIPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await generatePreparationPlan(experience);
      setPreparePlan(plan);
    } catch (err) {
      console.error('Failed to generate AI preparation plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleCopyQuestions = () => {
    const allQuestions = experience.rounds
      .map((r) => `[${r.roundName}]\n` + r.questions.map((q) => `• ${q}`).join('\n'))
      .join('\n\n');
    navigator.clipboard.writeText(
      `${experience.companyName} - ${experience.role} (${experience.interviewType})\n\n${allQuestions}\n\nCandidate Advice:\n${experience.advice}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      exportExperiencePDF(experience, preparePlan);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setTimeout(() => setIsExportingPDF(false), 800);
    }
  };

  const yearStr = experience.year || new Date(experience.createdAt).getFullYear();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header: Company, Role, Campus · Year, Result */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSelectCompany && onSelectCompany(experience.companyId)}
                className="font-bold text-slate-900 text-lg hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                {experience.companyName}
              </button>
              <span className="text-slate-400">·</span>
              <span className="text-slate-700 font-semibold text-sm">{experience.role}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
              <span>{experience.interviewType}</span>
              <span>·</span>
              <span>{yearStr}</span>
              {experience.authorCollege && (
                <>
                  <span>·</span>
                  <span>{experience.authorCollege}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded ${
                experience.result === 'Selected'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {experience.result}
            </span>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* Action row (Upvote, Bookmark, Copy) */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <button
                onClick={onUpvote}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium transition-colors ${
                  hasUpvoted
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{experience.upvotes || 0} Upvotes</span>
              </button>

              <button
                onClick={onToggleBookmark}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium transition-colors ${
                  isBookmarked
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyQuestions}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                title="Copy all questions and advice"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy Questions'}</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                title="Download formatted offline PDF document"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isExportingPDF ? 'Generating PDF...' : 'Download as PDF'}</span>
              </button>
            </div>
          </div>

          {/* Interview Overview & Rounds */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-1.5">
              Interview Overview ({experience.rounds.length} Rounds)
            </h3>

            <div className="space-y-3">
              {experience.rounds.map((round, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-2"
                >
                  <h4 className="text-sm font-semibold text-slate-900">
                    Round {idx + 1}: {round.roundName}
                  </h4>

                  {round.questions && round.questions.length > 0 && (
                    <div className="pt-1.5 space-y-1.5">
                      <span className="text-xs font-medium text-slate-700 block">
                        Questions asked:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {round.questions.map((q, qIdx) => (
                          <li key={qIdx} className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Technologies Used */}
          {experience.technologies && experience.technologies.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {experience.technologies.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Student Experience */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Student Experience
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {experience.experienceText}
            </p>
          </section>

          {/* Advice for Juniors */}
          {experience.advice && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Advice for Juniors
              </h3>
              <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-lg text-xs sm:text-sm text-slate-800 leading-relaxed">
                {experience.advice}
              </div>
            </section>
          )}

          {/* AI Preparation option */}
          <section className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Interview Preparation Plan
                </h3>
                <p className="text-xs text-slate-500">
                  Generate a structured study schedule tailored specifically to this company &amp; role.
                </p>
              </div>

              {!preparePlan && (
                <button
                  onClick={handleGenerateAIPlan}
                  disabled={isGeneratingPlan}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingPlan ? 'Generating...' : 'Generate Plan'}</span>
                </button>
              )}
            </div>

            {preparePlan && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-xs sm:text-sm">
                <p className="text-xs text-slate-700 font-medium">
                  {preparePlan.summary}
                </p>

                {preparePlan.recommendedStudyPlan && preparePlan.recommendedStudyPlan.length > 0 && (
                  <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                    <span className="font-semibold text-slate-900 block">Recommended Study Plan:</span>
                    {preparePlan.recommendedStudyPlan.map((stepItem: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold shrink-0">•</span>
                        <span>{stepItem}</span>
                      </div>
                    ))}
                  </div>
                )}

                {preparePlan.proTips && preparePlan.proTips.length > 0 && (
                  <div className="space-y-1 text-xs text-slate-700 pt-1">
                    <span className="font-semibold text-slate-900 block">Candidate Pro-Tips:</span>
                    {preparePlan.proTips.map((tip: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-600">
                        <span className="text-amber-600 font-bold shrink-0">✓</span>
                        <span>{tip}</span>
                      </div>
                    ))}
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
