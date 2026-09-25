import React, { useState } from 'react';
import {
  Search,
  Building2,
  HelpCircle,
  FileText,
  Flame,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase
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
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Statistics derived dynamically
  const totalCompaniesCount = companies.length;
  const totalExperiencesCount = experiences.length;
  const totalQuestionsCount = questions.length;
  const totalStudentsCount = Math.max(4, totalExperiencesCount * 2 + 3);

  // Top repeated questions for the live hero widget
  const topRepeatedQuestions = [...questions]
    .sort((a, b) => b.askedCount - a.askedCount)
    .slice(0, 3);

  // Fallback items if database questions are minimal
  const heroQuestions = [
    topRepeatedQuestions[0] || {
      id: 'q1',
      companyId: '1',
      questionText: 'Invert a linked list in place',
      type: 'Coding',
      technology: 'Python',
      askedCount: 12,
    },
    topRepeatedQuestions[1] || {
      id: 'q2',
      companyId: '2',
      questionText: "Explain your project's hardest bug",
      type: 'HR',
      technology: 'GD round',
      askedCount: 9,
    },
    topRepeatedQuestions[2] || {
      id: 'q3',
      companyId: '3',
      questionText: 'Design a URL shortener',
      type: 'Technical',
      technology: 'System design',
      askedCount: 7,
    },
  ];

  const filterOptions = [
    'All',
    'Technical',
    'GD Round',
    'HR',
    'Coding',
    'Java',
    'Python',
    'DSA',
    'SQL',
  ];

  // Filtered lists based on activeFilter
  const filteredExperiences = experiences.filter((exp) => {
    if (activeFilter === 'All') return true;
    const matchType = exp.interviewType.toLowerCase().includes(activeFilter.toLowerCase());
    const matchTech = exp.technologies.some((t) => t.toLowerCase() === activeFilter.toLowerCase());
    const matchRole = exp.role.toLowerCase().includes(activeFilter.toLowerCase());
    return matchType || matchTech || matchRole;
  });

  const filteredQuestions = questions.filter((q) => {
    if (activeFilter === 'All') return true;
    const matchType = q.type.toLowerCase().includes(activeFilter.toLowerCase());
    const matchTech = q.technology?.toLowerCase() === activeFilter.toLowerCase();
    const matchText = q.questionText.toLowerCase().includes(activeFilter.toLowerCase());
    return matchType || matchTech || matchText;
  });

  const popularCompanies = [...companies].sort((a, b) => b.viewCount - a.viewCount).slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectTab('questions', searchInput.trim());
    }
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* 1. HERO SECTION (MATCHING SCREENSHOT LAYOUT & COLOR DESIGN) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2 pb-6">
        {/* Left Column: Heading, Subtitle, Dual CTAs & Stats */}
        <div className="lg:col-span-7 space-y-6">
          {/* Eyebrow Badge (Lavender / Indigo Pill) */}
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#EDE9FE] text-[#4F46E5] text-xs font-semibold tracking-wide">
            <span>For non-placed & junior students</span>
          </div>

          {/* Display Headline: "straight from the room." in vibrant orange */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#0F172A] tracking-tight leading-[1.08]">
            Real interview questions,{' '}
            <span className="text-[#EA580C] block sm:inline">straight from the room.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
            Students share the exact coding, GD and HR questions they faced. Browse by company, round,
            or language — then learn from answers that helped someone move forward.
          </p>

          {/* Action Buttons: Indigo Primary Pill + Warm Subtle Secondary Pill */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onSelectTab('companies')}
              className="px-6 py-2.5 rounded-full bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Explore companies</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSubmit}
              className="px-6 py-2.5 rounded-full bg-[#F3EFE9] hover:bg-white text-[#0F172A] font-semibold text-sm border border-[#EAE4DC] shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
            >
              Submit your experience
            </button>
          </div>

          {/* Inline Stats Counter */}
          <div className="flex items-center gap-6 sm:gap-8 pt-3 border-t border-[#EAE4DC] max-w-lg">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {totalQuestionsCount}
              </span>
              <span className="text-slate-500 text-xs sm:text-sm font-medium">questions</span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {totalCompaniesCount}
              </span>
              <span className="text-slate-500 text-xs sm:text-sm font-medium">companies</span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {totalStudentsCount}+
              </span>
              <span className="text-slate-500 text-xs sm:text-sm font-medium">students</span>
            </div>
          </div>
        </div>

        {/* Right Column: "This week's most asked" Live Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-[#EAE4DC] shadow-xs space-y-4">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-bold text-[#0F172A] text-base sm:text-lg">
                This week's most asked
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#EA580C]">
                Live
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-2.5">
              {heroQuestions.map((q, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;

                return (
                  <div
                    key={q.id || idx}
                    onClick={() => {
                      const match = questions.find((item) => item.id === q.id);
                      if (match) {
                        onSelectQuestion(match);
                      } else {
                        onSelectTab('questions', q.questionText);
                      }
                    }}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#F3EFE9] hover:border-[#EAE4DC] transition-colors cursor-pointer flex items-start gap-3 group"
                  >
                    {/* Index Badge */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isFirst
                          ? 'bg-[#EDE9FE] text-[#4F46E5]'
                          : isSecond
                          ? 'bg-[#FFEDD5] text-[#EA580C]'
                          : 'bg-[#F1F5F9] text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0F172A] text-sm group-hover:text-[#EA580C] transition-colors line-clamp-1">
                        {q.questionText}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {q.technology || q.type} · {q.askedCount} asks
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILTER ROW & SEARCH BAR */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Pill Filters (Matching Screenshot) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-sm font-semibold text-slate-500 mr-1.5">Filter:</span>
            {filterOptions.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'bg-white hover:bg-[#F3EFE9] text-slate-700 border border-[#EAE4DC] shadow-2xs'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Search Input Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full md:w-80 flex items-center bg-white p-1 pl-3.5 rounded-full border border-[#EAE4DC] shadow-2xs focus-within:ring-2 focus-within:ring-[#EA580C]/20 focus-within:border-[#EA580C] transition-all shrink-0"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search topics, questions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-slate-400 text-slate-900 pr-2"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-semibold text-xs rounded-full transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 3. POPULAR COMPANIES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Popular Companies
            </h2>
            <p className="text-xs text-slate-500">
              Most actively reviewed placement drives and campus interviews
            </p>
          </div>
          <button
            onClick={() => onSelectTab('companies')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View all companies</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularCompanies.map((company) => (
            <div
              key={company.id}
              onClick={() => onSelectCompany(company.id)}
              className="p-5 bg-white rounded-2xl border border-[#EAE4DC] hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm group-hover:bg-orange-600 transition-colors shadow-2xs">
                    {company.name.charAt(0)}
                  </div>
                  <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#FAF8F5] text-slate-600 border border-[#EAE4DC]">
                    {company.type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition-colors line-clamp-1">
                  {company.name}
                </h3>
                <span className="text-xs text-slate-500 block mb-2 font-medium">
                  {company.category}
                </span>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {company.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE4DC]/60 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>{company.experienceCount} Experiences</span>
                <span>{company.questionCount} Questions</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. RECENT INTERVIEW EXPERIENCES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Recent Interview Experiences
            </h2>
            <p className="text-xs text-slate-500">
              Verified campus and off-campus debriefs with round breakdowns and questions
            </p>
          </div>
          <button
            onClick={() => onSelectTab('experiences')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View all debriefs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredExperiences.slice(0, 3).map((exp) => (
            <div
              key={exp.id}
              onClick={() => onSelectExperience(exp)}
              className="p-5 bg-white rounded-2xl border border-[#EAE4DC] hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                      {exp.companyName}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {exp.role} · {exp.interviewType}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full shrink-0 ${
                      exp.result === 'Selected'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                        : exp.result === 'Not Selected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                        : 'bg-orange-50 text-orange-700 border border-orange-200/80'
                    }`}
                  >
                    {exp.result}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {exp.experienceText}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.technologies.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 text-[11px] font-medium bg-[#FAF8F5] text-slate-700 rounded-full border border-[#EAE4DC]"
                    >
                      {t}
                    </span>
                  ))}
                  {exp.technologies.length > 3 && (
                    <span className="px-2 py-0.5 text-[11px] text-slate-400 font-medium">
                      +{exp.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE4DC]/60 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">{exp.rounds.length} Interview Rounds</span>
                <span className="text-orange-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  View Experience →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TOP REPEATED QUESTIONS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Repeated Interview Questions
            </h2>
            <p className="text-xs text-slate-500">
              Frequently asked in technical and coding rounds across different firms
            </p>
          </div>
          <button
            onClick={() => onSelectTab('repeated')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View all repeats</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredQuestions.slice(0, 4).map((q, idx) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="p-4 bg-white rounded-2xl border border-[#EAE4DC] hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      0{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#FAF8F5] text-slate-700 border border-[#EAE4DC]">
                      {q.type} {q.technology ? `· ${q.technology}` : ''}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200/70 rounded-full">
                    Asked {q.askedCount} times
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {q.questionText}
                </h3>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#EAE4DC]/60 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[70%] font-medium">
                  {q.companiesAsked && q.companiesAsked.length > 0
                    ? `Companies: ${q.companiesAsked.slice(0, 3).join(' · ')}`
                    : 'Reported in multiple interview rounds'}
                </span>
                <span className="text-orange-600 font-semibold group-hover:translate-x-0.5 transition-transform shrink-0">
                  View →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="p-6 sm:p-8 bg-[#0F172A] rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm border border-[#1E293B]">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Community Driven</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            Share your interview experience
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Help fellow students crack their dream job by contributing questions, rounds, and advice from your recent campus interview.
          </p>
        </div>
        <button
          onClick={onOpenSubmit}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold text-sm rounded-full transition-all shrink-0 shadow-md cursor-pointer flex items-center gap-2"
        >
          <span>Share experience</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
