import React, { useState } from 'react';
import {
  ArrowLeft,
  PlusCircle,
  HelpCircle,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';
import { Company, InterviewExperience, Question } from '../types';
import { exportExperiencePDF } from '../lib/pdfExport';

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
}) => {
  const [roleFilter, setRoleFilter] = useState('All');
  const [resultFilter, setResultFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'experiences' | 'questions'>('experiences');

  // Filter approved experiences for this company
  const companyExperiences = experiences.filter(
    (exp) => exp.companyId === company.id || exp.companyName.toLowerCase() === company.name.toLowerCase()
  );

  // Filter questions for this company
  const companyQuestions = questions.filter(
    (q) =>
      q.companyId === company.id ||
      q.companiesAsked?.some((c) => c.toLowerCase() === company.name.toLowerCase()) ||
      q.companyName?.toLowerCase() === company.name.toLowerCase()
  );

  // Dynamic common technologies
  const techCounts: { [tech: string]: number } = {};
  companyExperiences.forEach((exp) => {
    exp.technologies?.forEach((t) => {
      techCounts[t] = (techCounts[t] || 0) + 1;
    });
  });
  const commonTechnologies = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tech]) => tech);

  // Most repeated questions for this company (or sorted by askedCount)
  const topCompanyQuestions = [...companyQuestions]
    .sort((a, b) => b.askedCount - a.askedCount)
    .slice(0, 5);

  const availableRoles = ['All', ...Array.from(new Set(companyExperiences.map((e) => e.role)))];

  const filteredExperiences = companyExperiences.filter((exp) => {
    const matchesRole = roleFilter === 'All' || exp.role === roleFilter;
    const matchesResult = resultFilter === 'All' || exp.result === resultFilter;
    const matchesType = typeFilter === 'All' || exp.interviewType === typeFilter;
    return matchesRole && matchesResult && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Companies</span>
      </button>

      {/* Top Company Header */}
      <div className="p-6 sm:p-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xl shadow-2xs shrink-0">
              {company.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {company.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {company.type} · {company.category}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                <span className="font-bold text-slate-900">{companyExperiences.length} Experiences</span>
                <span>·</span>
                <span className="font-bold text-slate-900">{companyQuestions.length} Questions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              onClick={() => {
                const qEl = document.getElementById('company-questions-section');
                if (qEl) qEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-full border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
            >
              View Questions
            </button>
            <button
              onClick={() => onOpenSubmit(company.id)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share Experience</span>
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium block">Experiences</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">{companyExperiences.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium block">Reported Questions</span>
            <span className="text-lg font-bold text-indigo-600 mt-0.5 block">{companyQuestions.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium block">Coding Rounds</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">
              {companyQuestions.filter((q) => q.type === 'Coding').length}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium block">Campus Views</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">{company.viewCount}</span>
          </div>
        </div>

        {/* Common Technologies */}
        {commonTechnologies.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-semibold text-slate-500 block">
              Common Technologies:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {commonTechnologies.slice(0, 8).map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-50 text-slate-700 border border-slate-200/60"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Most Repeated Questions (Compact list rows instead of oversized cards) */}
      <div id="company-questions-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            Most Repeated Questions in {company.name}
          </h2>
          <span className="text-xs text-slate-500">{topCompanyQuestions.length} questions</span>
        </div>

        {topCompanyQuestions.length === 0 ? (
          <div className="p-4 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No repeated questions reported for this company yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 divide-y divide-slate-100">
            {topCompanyQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {q.questionText}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{q.type}</span>
                    {q.technology && (
                      <>
                        <span>·</span>
                        <span>{q.technology}</span>
                      </>
                    )}
                    {q.companiesAsked && q.companiesAsked.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-slate-500">
                          {q.companiesAsked.slice(0, 3).join(' · ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <span className="px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 rounded">
                    Asked {q.askedCount} times
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interview Experiences Section */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            Interview Experiences ({filteredExperiences.length})
          </h2>

          {/* Quick Filter controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 outline-none"
            >
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r === 'All' ? 'All Roles' : r}
                </option>
              ))}
            </select>

            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 outline-none"
            >
              <option value="All">All Results</option>
              <option value="Selected">Selected</option>
              <option value="Not Selected">Not Selected</option>
            </select>
          </div>
        </div>

        {/* Clean cards / list rows for experiences */}
        {filteredExperiences.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No interview experiences found for this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExperiences.map((exp) => (
              <div
                key={exp.id}
                onClick={() => onSelectExperience(exp)}
                className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {exp.role}
                    </h3>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{exp.interviewType}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs text-slate-500">
                      {exp.year || new Date(exp.createdAt).getFullYear()}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[11px] font-medium rounded self-start sm:self-auto ${
                      exp.result === 'Selected'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {exp.result}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {exp.experienceText}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-slate-700">{exp.rounds.length} Rounds</span>
                    {exp.technologies && exp.technologies.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{exp.technologies.join(' · ')}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportExperiencePDF(exp);
                      }}
                      title="Download PDF brief"
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-600" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      View breakdown →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
