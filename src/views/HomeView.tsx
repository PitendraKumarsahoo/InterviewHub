import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Building2,
  HelpCircle,
  FileText,
  Flame,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Award,
  ArrowRight,
  GraduationCap,
  Tag
} from 'lucide-react';
import { Company, InterviewExperience, Question } from '../types';

interface HomeViewProps {
  companies: Company[];
  experiences: InterviewExperience[];
  questions: Question[];
  onSelectTab: (tab: string, param?: string) => void;
  onSelectCompany: (companyId: string) => void;
  onSelectExperience: (experience: InterviewExperience) => void;
  onSelectQuestion: (question: Question) => void;
  onOpenSubmit: () => void;
  onUpvoteExperience?: (experience: InterviewExperience) => void;
  onToggleBookmark?: (experience: InterviewExperience) => void;
  onUpvoteQuestion?: (question: Question) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  companies,
  experiences,
  questions,
  onSelectTab,
  onSelectCompany,
  onSelectExperience,
  onSelectQuestion,
  onOpenSubmit,
  onUpvoteExperience,
  onToggleBookmark,
  onUpvoteQuestion,
}) => {
  const [searchInput, setSearchInput] = useState('');

  // Real statistics derived from live Firestore collections
  const totalCompaniesCount = companies.length;
  const totalExperiencesCount = experiences.length;
  const totalQuestionsCount = questions.length;
  const totalCodingCount = questions.filter(q => q.type === 'Coding').length;

  // Filtered/Ranked Companies
  const popularCompanies = [...companies].sort((a, b) => b.viewCount - a.viewCount).slice(0, 4);
  const mostExperiencedCompanies = [...companies].sort((a, b) => b.experienceCount - a.experienceCount).slice(0, 4);

  // Top repeated questions
  const topRepeatedQuestions = [...questions].sort((a, b) => b.askedCount - a.askedCount).slice(0, 4);

  // Recent approved experiences
  const recentExperiences = [...experiences].slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectTab('questions', searchInput.trim());
    }
  };

  const topTechnologies = [
    'Java', 'Python', 'SQL', 'DSA', 'OOP', 'DBMS',
    'React', 'Spring Boot', 'Computer Networks', 'Operating Systems', 'Power BI'
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-6">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Campus &amp; Off-Campus Placement Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Know the Interview <br className="hidden sm:inline" />
            <span className="text-indigo-600">Before You Face It.</span>
          </h1>

          <p className="mt-4 text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Real interview experiences, coding questions, technical rounds, GD topics and HR questions shared by university students across India.
          </p>

          {/* Large Global Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex items-center bg-white p-2 rounded-2xl shadow-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 transition-all"
          >
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search company, role, technology or question (e.g. 'TCS Java' or 'SQL Join')..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 text-sm sm:text-base bg-transparent outline-none placeholder:text-slate-400 text-slate-900 px-1"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick Categories Chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium mr-1">Quick Browse:</span>
            <button
              onClick={() => onSelectTab('companies')}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
            >
              Companies
            </button>
            <button
              onClick={() => onSelectTab('questions', 'Coding')}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
            >
              Coding
            </button>
            <button
              onClick={() => onSelectTab('questions', 'Technical')}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
            >
              Technical
            </button>
            <button
              onClick={() => onSelectTab('questions', 'GD')}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
            >
              GD Topics
            </button>
            <button
              onClick={() => onSelectTab('questions', 'HR')}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
            >
              HR Questions
            </button>
            <button
              onClick={() => onSelectTab('repeated')}
              className="px-3 py-1 bg-amber-50 hover:bg-amber-100/80 text-amber-800 rounded-lg border border-amber-200 font-semibold transition-colors flex items-center gap-1"
            >
              <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
              Repeated Questions
            </button>
          </div>
        </div>
      </section>

      {/* REAL DATA STATISTICS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="p-4 text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalCompaniesCount}+
            </span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Hiring Companies
            </span>
            <span className="text-[11px] text-slate-400">Campus &amp; off-campus drives</span>
          </div>

          <div className="p-4 text-center sm:text-left border-l-0 sm:border-l border-slate-200">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
              {totalExperiencesCount}+
            </span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Interview Experiences
            </span>
            <span className="text-[11px] text-slate-400">Selected &amp; rejection insights</span>
          </div>

          <div className="p-4 text-center sm:text-left border-t sm:border-t-0 sm:border-l border-slate-200">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalQuestionsCount}+
            </span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Real Questions Asked
            </span>
            <span className="text-[11px] text-slate-400">Technical, GD, Aptitude &amp; HR</span>
          </div>

          <div className="p-4 text-center sm:text-left border-t sm:border-t-0 sm:border-l border-slate-200">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {totalCodingCount}+
            </span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Live Coding Problems
            </span>
            <span className="text-[11px] text-slate-400">With student community solutions</span>
          </div>
        </div>
      </section>

      {/* POPULAR COMPANIES & MOST EXPERIENCED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Popular Placement Drives
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Ranked dynamically from actual views, student activity, and submissions
            </p>
          </div>
          <button
            onClick={() => onSelectTab('companies')}
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Companies</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularCompanies.map((company) => (
            <div
              key={company.id}
              onClick={() => onSelectCompany(company.id)}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 transition-colors">
                    {company.name.charAt(0)}
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                    {company.type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {company.name}
                </h3>
                <span className="text-xs text-slate-500 block mb-2">
                  {company.category}
                </span>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {company.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  {company.experienceCount} Experiences
                </span>
                <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Explore →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MOST REPEATED QUESTIONS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>Frequently Repeated in Interviews</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Most Repeated Interview Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Identified from multi-student submissions across TCS, Infosys, Deloitte, Amazon, and more
              </p>
            </div>

            <button
              onClick={() => onSelectTab('repeated')}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all self-start sm:self-auto shrink-0 shadow-sm"
            >
              View All Repeated Questions
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topRepeatedQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                      {q.type} {q.technology ? `· ${q.technology}` : ''}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      Asked {q.askedCount} times
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {q.questionText}
                  </h3>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                  <span>Reported at: {q.companiesAsked?.slice(0, 3).join(', ')}</span>
                  <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    View Solutions →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT EXPERIENCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Recent Student Submissions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Real interview breakdowns with rounds, questions, and advice
            </p>
          </div>
          <button
            onClick={() => onSelectTab('experiences')}
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Experiences</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recentExperiences.map((exp) => (
            <div
              key={exp.id}
              onClick={() => onSelectExperience(exp)}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                      {exp.companyName}
                    </h3>
                    <span className="text-xs text-slate-600 font-medium">
                      {exp.role} · {exp.interviewType}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                    exp.result === 'Selected'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : exp.result === 'Not Selected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    {exp.result}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exp.authorCollege || 'Campus Drive'}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed italic">
                  "{exp.experienceText}"
                </p>

                {/* Domain & Skill Tags */}
                {exp.tags && exp.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {exp.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100"
                      >
                        #{tag}
                      </span>
                    ))}
                    {exp.tags.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium">
                        +{exp.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-1 pt-0.5">
                  {exp.technologies.slice(0, 3).map((t) => (
                    <span key={t} className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded">
                      {t}
                    </span>
                  ))}
                  {exp.technologies.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                      +{exp.technologies.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{exp.rounds.length} Interview Rounds</span>
                <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  Read Breakdown →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR TECHNOLOGIES SELECTION CHIPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Explore Interviews By Technology
          </span>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {topTechnologies.map((tech) => (
              <button
                key={tech}
                onClick={() => onSelectTab('questions', tech)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 shadow-2xs transition-all cursor-pointer"
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION: SHARE EXPERIENCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Recently Attended a Campus or Off-Campus Interview?
            </h3>
            <p className="text-sm text-indigo-200 max-w-xl leading-relaxed">
              Share the questions you were asked, the rounds you faced, and your advice for juniors. Both selected and rejection experiences provide immense value!
            </p>
          </div>
          <button
            onClick={onOpenSubmit}
            className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 shrink-0"
          >
            + Submit Your Experience
          </button>
        </div>
      </section>
    </div>
  );
};
