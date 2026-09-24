import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  FileText,
  HelpCircle,
  Code2,
  Flame,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  GraduationCap,
  Sparkles,
  PlusCircle,
  Calendar,
  Layers,
  ThumbsUp,
  Bookmark,
  Tag
} from 'lucide-react';
import { Company, InterviewExperience, Question, InterviewType, InterviewResult } from '../types';
import { useAuth } from '../context/AuthContext';

interface CompanyDetailViewProps {
  company: Company;
  experiences: InterviewExperience[];
  questions: Question[];
  onBack: () => void;
  onSelectExperience: (experience: InterviewExperience) => void;
  onSelectQuestion: (question: Question) => void;
  onOpenSubmit: (companyId?: string) => void;
  onUpvoteExperience?: (experience: InterviewExperience) => void;
  onToggleBookmark?: (experience: InterviewExperience) => void;
  onUpvoteQuestion?: (question: Question) => void;
}

export const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({
  company,
  experiences,
  questions,
  onBack,
  onSelectExperience,
  onSelectQuestion,
  onOpenSubmit,
  onUpvoteExperience,
  onToggleBookmark,
  onUpvoteQuestion,
}) => {
  const { user, isExperienceBookmarked } = useAuth();
  const [roleFilter, setRoleFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [resultFilter, setResultFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [techFilter, setTechFilter] = useState<string>('All');
  const [tagFilter, setTagFilter] = useState<string>('All');

  // Filter approved experiences for this company
  const companyExperiences = experiences.filter(
    (exp) => exp.companyId === company.id || exp.companyName.toLowerCase() === company.name.toLowerCase()
  );

  // Filter questions for this company
  const companyQuestions = questions.filter(
    (q) => q.companyId === company.id || q.companiesAsked?.includes(company.name) || q.companyName === company.name
  );

  // Compute common technologies dynamically from submitted experiences
  const techCounts: { [tech: string]: number } = {};
  companyExperiences.forEach((exp) => {
    exp.technologies?.forEach((t) => {
      techCounts[t] = (techCounts[t] || 0) + 1;
    });
  });
  const commonTechnologies = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tech]) => tech);

  // Tags available in this company's experiences
  const availableTags = Array.from(
    new Set(companyExperiences.flatMap((e) => e.tags || []))
  );

  // Roles available in this company
  const availableRoles = ['All', ...Array.from(new Set(companyExperiences.map((e) => e.role)))];

  // Apply filters
  const filteredExperiences = companyExperiences.filter((exp) => {
    const matchesRole = roleFilter === 'All' || exp.role === roleFilter;
    const matchesType = typeFilter === 'All' || exp.interviewType === typeFilter;
    const matchesResult = resultFilter === 'All' || exp.result === resultFilter;
    const matchesDiff = difficultyFilter === 'All' || exp.difficulty === difficultyFilter;
    const matchesTech = techFilter === 'All' || exp.technologies?.includes(techFilter);
    const matchesTag = tagFilter === 'All' || exp.tags?.includes(tagFilter);
    return matchesRole && matchesType && matchesResult && matchesDiff && matchesTech && matchesTag;
  });

  const codingQuestionsCount = companyQuestions.filter(q => q.type === 'Coding').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Companies</span>
      </button>

      {/* Company Banner & Profile */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
              {company.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {company.name}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {company.category}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                  {company.type}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed pt-1">
                {company.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenSubmit(company.id)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 self-start shrink-0 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Share Experience for {company.name.split(' ')[0]}</span>
          </button>
        </div>

        {/* Real Dynamic Stats for this Company */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Interview Experiences
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {companyExperiences.length}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Reported Questions
            </span>
            <span className="text-xl font-bold text-indigo-600 mt-0.5 block">
              {companyQuestions.length}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Coding Problems
            </span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block">
              {codingQuestionsCount}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Student Views
            </span>
            <span className="text-xl font-bold text-slate-700 mt-0.5 block">
              {company.viewCount}
            </span>
          </div>
        </div>

        {/* Common Technologies for this company */}
        {commonTechnologies.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Common Technologies Asked in {company.name}
            </span>
            <div className="flex flex-wrap gap-2">
              {commonTechnologies.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setTechFilter(techFilter === tech ? 'All' : tech)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    techFilter === tech
                      ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tech} ({techCounts[tech]})
                </button>
              ))}
              {techFilter !== 'All' && (
                <button
                  onClick={() => setTechFilter('All')}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:underline font-semibold"
                >
                  Clear Tech Filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MOST REPEATED QUESTIONS IN THIS COMPANY */}
      {companyQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              Most Repeated Questions at {company.name}
            </h2>
            <span className="text-xs text-slate-500">Based on candidate reports</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyQuestions.slice(0, 4).map((q) => (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-2xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
                      {q.type} {q.technology ? `· ${q.technology}` : ''}
                    </span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      Asked {q.askedCount}x
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {q.questionText}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>{q.difficulty || 'Medium'}</span>
                    {onUpvoteQuestion && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpvoteQuestion(q);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          user && q.upvotedBy?.includes(user.uid)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600'
                        }`}
                        title="Upvote question"
                      >
                        <ThumbsUp className={`w-2.5 h-2.5 ${user && q.upvotedBy?.includes(user.uid) ? 'fill-white text-white' : 'text-slate-400'}`} />
                        <span>{q.upvotes || 0}</span>
                      </button>
                    )}
                  </div>
                  <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                    View Solution →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL INTERVIEW EXPERIENCES */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Candidate Experiences ({companyExperiences.length})
            </h2>
            <p className="text-xs text-slate-500">
              All approved student experiences for {company.name} — both selections and rejections
            </p>
          </div>

          <span className="text-xs font-medium text-slate-500">
            Showing {filteredExperiences.length} of {companyExperiences.length}
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter by:
            </span>

            {/* Role Filter */}
            {availableRoles.length > 2 && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    Role: {r}
                  </option>
                ))}
              </select>
            )}

            {/* Interview Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
            >
              <option value="All">All Types</option>
              <option value="Campus">Campus</option>
              <option value="Off-campus">Off-Campus</option>
              <option value="Internship">Internship</option>
              <option value="PPO">PPO</option>
            </select>

            {/* Result Filter */}
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
            >
              <option value="All">All Results</option>
              <option value="Selected">Selected</option>
              <option value="Not Selected">Not Selected</option>
              <option value="Waitlisted">Waitlisted</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Difficult">Difficult</option>
            </select>

            {/* Domain & Skill Tag Filter */}
            {availableTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-900 font-medium outline-none"
              >
                <option value="All">All Domains &amp; Skills</option>
                {availableTags.map((t) => (
                  <option key={t} value={t}>
                    Tag: #{t}
                  </option>
                ))}
              </select>
            )}

            {(roleFilter !== 'All' || typeFilter !== 'All' || resultFilter !== 'All' || difficultyFilter !== 'All' || techFilter !== 'All' || tagFilter !== 'All') && (
              <button
                onClick={() => {
                  setRoleFilter('All');
                  setTypeFilter('All');
                  setResultFilter('All');
                  setDifficultyFilter('All');
                  setTechFilter('All');
                  setTagFilter('All');
                }}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Experience Cards List */}
        {filteredExperiences.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">
              No experiences match the selected criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Reset your filters or be the first student to share an experience for this role!
            </p>
            <button
              onClick={() => onOpenSubmit(company.id)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              + Share Experience
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExperiences.map((exp, idx) => {
              const isSelected = exp.result === 'Selected';
              const isNotSelected = exp.result === 'Not Selected';

              return (
                <div
                  key={exp.id}
                  onClick={() => onSelectExperience(exp)}
                  className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
                          {exp.role}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                          {exp.interviewType}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-slate-500">Year {exp.year}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">
                          {exp.authorName} ({exp.authorCollege || 'Campus Placement'})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isNotSelected
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {exp.result}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                        exp.difficulty === 'Difficult'
                          ? 'bg-rose-50 text-rose-600'
                          : exp.difficulty === 'Easy'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {exp.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Rounds Flow Preview */}
                  <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap items-center gap-2 text-xs text-slate-700">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Rounds:
                    </span>
                    {exp.rounds.map((r, rIdx) => (
                      <React.Fragment key={rIdx}>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium">
                          {r.roundName}
                        </span>
                        {rIdx < exp.rounds.length - 1 && (
                          <span className="text-slate-400">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Experience text snippet */}
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed italic">
                    "{exp.experienceText}"
                  </p>

                  {/* Domain & Skill Tags */}
                  {exp.tags && exp.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-0.5">
                        <Tag className="w-3 h-3 text-indigo-500" />
                        Tags:
                      </span>
                      {exp.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTagFilter(tagFilter === tag ? 'All' : tag);
                          }}
                          className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                            tagFilter === tag
                              ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                              : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/90'
                          }`}
                          title={`Filter company interviews by #${tag}`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Technologies, Upvote, Bookmark & View Details */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {onUpvoteExperience && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpvoteExperience(exp);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            user && exp.upvotedBy?.includes(user.uid)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700'
                          }`}
                          title="Upvote as helpful"
                        >
                          <ThumbsUp className={`w-3 h-3 ${user && exp.upvotedBy?.includes(user.uid) ? 'fill-white text-white' : 'text-slate-400'}`} />
                          <span>{exp.upvotes || 0}</span>
                        </button>
                      )}

                      {onToggleBookmark && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(exp);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isExperienceBookmarked(exp.id)
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800'
                          }`}
                          title={isExperienceBookmarked(exp.id) ? 'Saved in your bookmarks' : 'Save to bookmarks'}
                        >
                          <Bookmark className={`w-3 h-3 ${isExperienceBookmarked(exp.id) ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
                          <span>{isExperienceBookmarked(exp.id) ? 'Saved' : 'Bookmark'}</span>
                        </button>
                      )}

                      <div className="hidden sm:flex flex-wrap gap-1.5 ml-1">
                        {exp.technologies.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 ml-auto">
                      <span>Read Full Breakdown</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
