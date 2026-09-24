import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  GraduationCap,
  Award,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Code2,
  ListOrdered,
  HelpCircle,
  Copy,
  Check,
  ThumbsUp,
  Bookmark
} from 'lucide-react';
import { InterviewExperience, PreparePlan } from '../types';
import { generatePreparationPlan } from '../lib/gemini';
import { useAuth } from '../context/AuthContext';

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
      .map(r => `[${r.roundName}]\n` + r.questions.map(q => `• ${q}`).join('\n'))
      .join('\n\n');
    navigator.clipboard.writeText(
      `${experience.companyName} - ${experience.role} (${experience.interviewType})\n\n${allQuestions}\n\nCandidate Advice:\n${experience.advice}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSelected = experience.result === 'Selected';
  const isRejected = experience.result === 'Not Selected';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSelectCompany && onSelectCompany(experience.companyId)}
                className="font-bold text-slate-900 text-lg hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <Building2 className="w-5 h-5 text-indigo-600" />
                {experience.companyName}
              </button>
              <span className="text-slate-400">·</span>
              <span className="text-slate-700 font-semibold text-sm">{experience.role}</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 text-slate-700">
                {experience.interviewType}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                {experience.authorCollege || 'Campus Drive'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Drive Year: {experience.year}
              </span>
              <span>·</span>
              <span className="text-slate-600 font-medium">By {experience.authorName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Bookmark button */}
            <button
              onClick={onToggleBookmark}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title={isBookmarked ? 'Saved in your profile bookmarks' : 'Bookmark this interview breakdown'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            {/* Upvote button */}
            <button
              onClick={onUpvote}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                hasUpvoted
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title={hasUpvoted ? 'You upvoted this experience as helpful' : 'Upvote this interview experience'}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-white text-white' : 'text-slate-400'}`} />
              <span>Helpful ({experience.upvotes || 0})</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          
          {/* Key Badges Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Final Result
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {isSelected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-700 text-xs">Selected</span>
                  </>
                ) : isRejected ? (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-rose-700 text-xs">Not Selected</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-amber-700 text-xs">{experience.result}</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Difficulty
              </span>
              <span className={`inline-block mt-1 font-bold text-xs ${
                experience.difficulty === 'Difficult'
                  ? 'text-rose-600'
                  : experience.difficulty === 'Easy'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}>
                {experience.difficulty}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Rounds
              </span>
              <span className="mt-1 font-bold text-slate-800 text-xs block">
                {experience.rounds.length} Interview Rounds
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Community Upvotes
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-indigo-600 font-bold text-xs">
                <ThumbsUp className="w-3.5 h-3.5 fill-indigo-600" />
                <span>{experience.upvotes || 0} helpful votes</span>
              </div>
            </div>
          </div>

          {/* Technologies Tested */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Technologies &amp; Topics Tested
            </span>
            <div className="flex flex-wrap gap-1.5">
              {experience.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Experience Text */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Candidate Overview &amp; Process Experience
            </span>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200 whitespace-pre-line">
              {experience.experienceText}
            </p>
          </div>

          {/* Round-by-Round Breakdown with Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Rounds &amp; Questions Asked
              </span>
              <button
                onClick={handleCopyQuestions}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy All Questions'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {experience.rounds.map((round, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/70 px-4 py-2.5 font-semibold text-slate-800 text-xs flex items-center justify-between">
                    <span>Round {idx + 1}: {round.roundName}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {round.questions.length} question{round.questions.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="p-4 bg-white divide-y divide-slate-100">
                    {round.questions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No specific questions listed.</p>
                    ) : (
                      round.questions.map((q, qIdx) => (
                        <div key={qIdx} className="py-2 first:pt-0 last:pb-0 flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                          <span className="text-indigo-600 font-mono font-bold text-xs shrink-0 mt-0.5">
                            Q{qIdx + 1}.
                          </span>
                          <span className="leading-relaxed">{q}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice for Juniors */}
          {experience.advice && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Advice for Juniors &amp; Placement Aspirants
              </div>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed italic">
                "{experience.advice}"
              </p>
            </div>
          )}

          {/* AI Feature: "Prepare Me From This Experience" */}
          <div className="border border-indigo-200 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    Prepare Me From This Experience
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                      AI Powered
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Gemini analyzes this company drive to construct your target study syllabus
                  </p>
                </div>
              </div>

              {!preparePlan && (
                <button
                  onClick={handleGenerateAIPlan}
                  disabled={isGeneratingPlan}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingPlan ? 'Synthesizing...' : 'Generate Prep Plan'}</span>
                </button>
              )}
            </div>

            {isGeneratingPlan && (
              <div className="p-6 text-center space-y-2">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-indigo-700 font-medium">
                  Analyzing interview questions, technologies, and rounds...
                </p>
              </div>
            )}

            {preparePlan && (
              <div className="space-y-4 pt-2 border-t border-indigo-100 animate-in fade-in">
                {/* Summary */}
                <div className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs leading-relaxed">
                  <span className="font-bold text-indigo-900 block mb-1">Company Evaluation Focus:</span>
                  {preparePlan.summary}
                </div>

                {/* Key Topics & Coding Focus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs space-y-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      Key Core CS Topics to Master
                    </span>
                    <ul className="space-y-1 text-slate-600">
                      {preparePlan.keyTopics?.map((topic, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs space-y-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      Target Coding &amp; Problem Types
                    </span>
                    <ul className="space-y-1 text-slate-600">
                      {preparePlan.codingFocus?.map((codeTopic, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{codeTopic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Likely Questions */}
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs space-y-2 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    Likely Practice Questions
                  </span>
                  <ul className="space-y-1.5 text-slate-700">
                    {preparePlan.likelyQuestions?.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                        <span className="text-indigo-600 font-bold font-mono">0{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Study Plan */}
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs space-y-2 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                    Suggested 5-Day Revision Strategy
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {preparePlan.recommendedStudyPlan?.map((planItem, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-bold text-indigo-900 block text-[11px] mb-0.5">
                          Stage {i + 1}
                        </span>
                        <span className="text-slate-600 text-[11px] leading-relaxed">
                          {planItem}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 italic text-right">
                  AI-synthesized preparation guide based on submitted candidate experience data.
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleBookmark}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
              <span>{isBookmarked ? 'Bookmarked' : 'Save to Bookmarks'}</span>
            </button>

            <button
              onClick={onUpvote}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasUpvoted
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-white text-white' : 'text-slate-400'}`} />
              <span>{hasUpvoted ? 'Upvoted' : 'Upvote Experience'} ({experience.upvotes || 0})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Reported in {experience.year} · Verified
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
