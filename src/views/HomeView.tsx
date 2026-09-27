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
  Briefcase,
  Repeat,
  Layers,
  Award,
  Zap,
  Check,
  Users
} from 'lucide-react';
import { Company, InterviewExperience, Question } from '../types';
import { StatusTag, VisualProgressTracker } from '../components/StatusIndicator';

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

  // Statistics derived dynamically from live collections
  const totalCompaniesCount = companies.length;
  const totalExperiencesCount = experiences.length;
  const totalQuestionsCount = questions.length;

  // Top repeated questions for the live hero widget
  const heroQuestions = [...questions]
    .sort((a, b) => (b.askedCount || 0) - (a.askedCount || 0))
    .slice(0, 3);
  const topRepeatedQuestions = heroQuestions;

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
          {/* Eyebrow Label (Clean typography, no lavender pill) */}
          <div className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Campus Placement Interview Archives
          </div>

          {/* Display Headline: "straight from the room." in vibrant orange */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#0F172A] tracking-tight leading-[1.08]">
            Real interview questions,{' '}
            <span className="text-[#EA580C] block sm:inline">straight from the room.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
            Students share the exact coding, GD and HR questions they faced. Browse by company, round,
            or language: then learn from answers that helped someone move forward.
          </p>

          {/* Action Buttons: Clean Rectangular SaaS Buttons (min 44px touch targets) */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onSelectTab('companies')}
              className="min-h-[44px] px-6 py-3 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] active:bg-[#312E81] text-white font-semibold text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] touch-manipulation"
            >
              <span>Explore companies</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSubmit}
              className="min-h-[44px] px-6 py-3 rounded-xl bg-[#F3EFE9] hover:bg-white text-[#0F172A] font-semibold text-sm border border-[#EAE4DC] shadow-2xs transition-all flex items-center justify-center cursor-pointer active:scale-[0.98] touch-manipulation"
            >
              Submit your experience
            </button>
          </div>

          {/* Inline Stats Counter: Real metrics only */}
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
                {totalExperiencesCount}
              </span>
              <span className="text-slate-500 text-xs sm:text-sm font-medium">experiences</span>
            </div>
          </div>
        </div>

        {/* Right Column: "This week's most asked" Live Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl p-6 border border-[#EAE4DC] shadow-xs space-y-4">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-bold text-[#0F172A] text-base sm:text-lg">
                Frequently Asked Coding &amp; HR
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FFF7ED] text-[#EA580C]">
                Verified
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-2.5">
              {heroQuestions.length > 0 ? (
                heroQuestions.map((q, idx) => {
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
                })
              ) : (
                <div className="py-8 px-4 rounded-xl bg-[#FAF8F5] border border-[#F3EFE9] text-center space-y-3">
                  <HelpCircle className="w-8 h-8 text-orange-500 mx-auto" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">No questions added yet</p>
                    <p className="text-xs text-slate-500">Be the first to share an experience and add interview questions.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenSubmit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Share Experience</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILTER ROW & SEARCH BAR */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-sm font-semibold text-slate-500 mr-1 hidden sm:inline">Filter:</span>
            {filterOptions.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
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
            className="w-full md:w-80 min-h-[48px] flex items-center bg-white p-1 pl-4 rounded-xl border border-[#EAE4DC] shadow-2xs focus-within:ring-2 focus-within:ring-[#EA580C]/20 focus-within:border-[#EA580C] transition-all shrink-0"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search topics, questions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-900 pr-2"
            />
            <button
              type="submit"
              className="min-h-[40px] px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer shrink-0 touch-manipulation flex items-center justify-center"
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

        {popularCompanies.length > 0 ? (
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
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-[#FAF8F5] text-slate-600 border border-[#EAE4DC]">
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
        ) : (
          <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#EAE4DC] space-y-3.5 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">No companies added yet — be the first to share an experience</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Real student interview debriefs and placement company tracks will populate dynamically as experiences are submitted.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>Share Experience</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
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

        {filteredExperiences.length > 0 ? (
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
                    <StatusTag result={exp.result} size="sm" showDot={true} showPulse={true} />
                  </div>

                  {/* Visual Progress Indicator */}
                  <VisualProgressTracker
                    result={exp.result}
                    roundsCount={exp.rounds.length}
                    rounds={exp.rounds}
                    compact={true}
                  />

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {exp.experienceText}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {exp.technologies.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-[11px] font-medium bg-[#FAF8F5] text-slate-700 rounded-md border border-[#EAE4DC]"
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
        ) : (
          <div className="p-10 sm:p-14 text-center bg-white rounded-2xl border border-[#EAE4DC] space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-2xs">
              <FileText className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                {activeFilter === 'All'
                  ? 'No interview experiences added yet — be the first to share an experience'
                  : `No experiences found for "${activeFilter}"`}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {activeFilter === 'All'
                  ? 'Share rounds, question details, and placement prep advice from your recent recruitment drives.'
                  : `Try switching to "All" or submit the first experience for ${activeFilter}.`}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white rounded-xl text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
            >
              <span>Share Experience</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* 5. TOP REPEATED QUESTIONS */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Repeated Interview Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5">
              Frequently asked in technical and coding rounds across different firms
            </p>
          </div>
          <button
            onClick={() => onSelectTab('repeated')}
            className="text-sm sm:text-base font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>View all repeated questions</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {filteredQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestions.slice(0, 4).map((q, idx) => (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-5 bg-white rounded-2xl border border-[#EAE4DC] hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-400">
                        0{idx + 1}
                      </span>
                      <span className="px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-lg bg-[#FAF8F5] text-slate-700 border border-[#EAE4DC]">
                        {q.type} {q.technology ? `· ${q.technology}` : ''}
                      </span>
                    </div>
                    <span className="px-3 py-1 text-xs sm:text-sm font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg">
                      Asked {q.askedCount} times
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                    {q.questionText}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EAE4DC]/80 flex items-center justify-between text-xs sm:text-sm text-slate-600">
                  <span className="truncate max-w-[70%] font-medium">
                    {q.companiesAsked && q.companiesAsked.length > 0
                      ? `Companies: ${q.companiesAsked.slice(0, 3).join(' · ')}`
                      : 'Reported in multiple interview rounds'}
                  </span>
                  <span className="text-orange-600 font-bold group-hover:translate-x-1 transition-transform shrink-0 flex items-center gap-1">
                    <span>View</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 sm:p-14 text-center bg-white rounded-2xl border border-[#EAE4DC] space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-2xs">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                {activeFilter === 'All'
                  ? 'No interview questions added yet — be the first to share an experience'
                  : `No questions found for "${activeFilter}"`}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Real interview questions will be collected from student submissions and ranked by repetition frequency.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white rounded-xl text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
            >
              <span>Share Experience</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* 6. SIGNATURE BRAND IDENTITY & PLACEMENT ECOSYSTEM (Architected by Pitendra) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-white border border-slate-700/80 shadow-2xl p-6 sm:p-10 lg:p-14 space-y-12">
        {/* Subtle geometric atmospheric glowing backdrops */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-12">
          {/* Top Brand Identity Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 text-sm sm:text-base font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>The PrepLoop Continuous Placement Cycle · Engineered by Pitendra</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Turning Campus Interview Rooms into Open Knowledge Loops
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
                PrepLoop eliminates recruitment guesswork. Every interview round, live coding challenge, and technical question you document feeds a continuous cycle of placement intelligence for the entire university student community.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
              <button
                type="button"
                onClick={onOpenSubmit}
                className="px-7 py-4 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2.5 hover:scale-[1.02]"
              >
                <span>Share Interview Debrief</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className="px-6 py-4 bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-600 font-bold text-base sm:text-lg rounded-xl transition-colors cursor-pointer text-center"
              >
                My Dashboard
              </button>
            </div>
          </div>

          {/* UNIQUE BRAND DESIGN ELEMENT: The 4-Stage Continuous Placement Loop */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Repeat className="w-4 h-4 animate-spin-slow" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  How The PrepLoop Cycle Works
                </h3>
              </div>
              <span className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-slate-400">
                Self-Sustaining Campus Knowledge
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Loop Node 1 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md flex flex-col justify-between space-y-4 hover:border-orange-500/50 transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      STEP 01
                    </span>
                    <Building2 className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-orange-300 transition-colors">
                    Campus Interview Drive
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    Students face actual on-campus and off-campus recruitment rounds across top tech and service companies.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>Real interview rooms</span>
                </div>
              </div>

              {/* Loop Node 2 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      STEP 02
                    </span>
                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Instant Round Debrief
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    Candidates upload rounds, exact problem statements, tech stack asked, and interview difficulty ratings.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Transparent debrief</span>
                </div>
              </div>

              {/* Loop Node 3 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      STEP 03
                    </span>
                    <Repeat className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    Frequency Matrix
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    PrepLoop clusters repeating questions, surfacing high-yield questions asked across multiple companies.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Smart repeat ranking</span>
                </div>
              </div>

              {/* Loop Node 4 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      STEP 04
                    </span>
                    <Award className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Confident Offer Letters
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    Junior batches prepare targeted interview roadmaps, clear rounds with confidence, and loop back to mentor others.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Offer conversion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Three Feature Pillars with High Contrast & Medium Typography */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 border-t border-slate-700/80">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/70 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-lg border border-orange-500/30">
                01
              </div>
              <h3 className="font-bold text-white text-lg sm:text-xl">100% Real Submissions</h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                Zero mock records or synthetic placeholders. Every post reflects genuine questions and actual company interview rounds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/70 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-lg border border-indigo-500/30">
                02
              </div>
              <h3 className="font-bold text-white text-lg sm:text-xl">Multi-Round Clarity</h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                Comprehensive breakdowns from initial aptitude tests and core technical interviews to managerial and HR conversations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/70 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/30">
                03
              </div>
              <h3 className="font-bold text-white text-lg sm:text-xl">Architected by Pitendra</h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                Conceived and engineered by Pitendra to democratize recruitment preparation for engineering and university graduates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
