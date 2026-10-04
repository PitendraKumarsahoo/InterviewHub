import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Download, Filter, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { InterviewExperience, Company } from '../types';
import { exportExperiencePDF } from '../lib/pdfExport';
import { StatusTag, VisualProgressTracker, parseApplicantStatus } from '../components/StatusIndicator';

interface ExperiencesViewProps {
  experiences: InterviewExperience[];
  companies: Company[];
  onSelectExperience: (experience: InterviewExperience) => void;
  onSelectCompany: (companyId: string) => void;
  onOpenSubmit: () => void;
  onUpvoteExperience?: (experience: InterviewExperience) => void;
  onToggleBookmark?: (experience: InterviewExperience) => void;
}

export const ExperiencesView: React.FC<ExperiencesViewProps> = ({
  experiences,
  companies,
  onSelectExperience,
  onOpenSubmit,
}) => {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [resultFilter, setResultFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [techFilter, setTechFilter] = useState('All');

  const allCompanies = ['All', ...Array.from(new Set(experiences.map((e) => e.companyName)))];
  const allRoles = ['All', ...Array.from(new Set(experiences.map((e) => e.role)))];
  const allYears = [
    'All',
    ...Array.from(
      new Set(
        experiences.map((e) => (e.year ? e.year.toString() : new Date(e.createdAt).getFullYear().toString()))
      )
    ),
  ];
  const allTechs = [
    'All',
    ...Array.from(new Set(experiences.flatMap((e) => e.technologies || []))),
  ];

  const statusCounts = useMemo(() => {
    let selected = 0;
    let waiting = 0;
    let rejected = 0;
    experiences.forEach((e) => {
      const cfg = parseApplicantStatus(e.result);
      if (cfg.type === 'selected') selected++;
      else if (cfg.type === 'waiting') waiting++;
      else if (cfg.type === 'rejected') rejected++;
    });
    return {
      all: experiences.length,
      selected,
      waiting,
      rejected,
    };
  }, [experiences]);

  const filtered = experiences.filter((exp) => {
    const query = search.toLowerCase();
    const expYear = exp.year ? exp.year.toString() : new Date(exp.createdAt).getFullYear().toString();
    const matchesSearch =
      exp.companyName.toLowerCase().includes(query) ||
      exp.role.toLowerCase().includes(query) ||
      exp.experienceText.toLowerCase().includes(query);

    const statusCfg = parseApplicantStatus(exp.result);
    const matchesCompany = companyFilter === 'All' || exp.companyName === companyFilter;
    const matchesRole = roleFilter === 'All' || exp.role === roleFilter;
    const matchesYear = yearFilter === 'All' || expYear === yearFilter;
    const matchesResult =
      resultFilter === 'All' ||
      (resultFilter === 'Selected' && statusCfg.type === 'selected') ||
      (resultFilter === 'Not Selected' && statusCfg.type === 'rejected') ||
      (resultFilter === 'Waiting' && statusCfg.type === 'waiting') ||
      exp.result === resultFilter;
    const matchesType = typeFilter === 'All' || exp.interviewType === typeFilter;
    const expDiffStr = (exp.difficulty as string || '').toLowerCase();
    const matchesDiff =
      diffFilter === 'All' ||
      (diffFilter === 'Hard' && (expDiffStr === 'hard' || expDiffStr === 'difficult')) ||
      (diffFilter === 'Moderate' && (expDiffStr === 'moderate' || expDiffStr === 'medium')) ||
      (diffFilter === 'Easy' && expDiffStr === 'easy') ||
      expDiffStr === diffFilter.toLowerCase();
    const matchesTech = techFilter === 'All' || exp.technologies?.includes(techFilter);

    return (
      matchesSearch &&
      matchesCompany &&
      matchesRole &&
      matchesYear &&
      matchesResult &&
      matchesType &&
      matchesDiff &&
      matchesTech
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Experiences
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real debriefs, rounds, questions and tips from students who faced the placement drive.
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all self-start sm:self-auto shrink-0 cursor-pointer"
        >
          Share Experience
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search experiences by company, role, or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs transition-all"
        />
      </div>

      {/* Status Filter Tabs (Color-Coded for Instant Readability) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Filter by Status:
        </span>

        <button
          onClick={() => setResultFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            resultFilter === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>All Statuses</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            resultFilter === 'All' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {statusCounts.all}
          </span>
        </button>

        <button
          onClick={() => setResultFilter(resultFilter === 'Selected' ? 'All' : 'Selected')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            resultFilter === 'Selected'
              ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 hover:bg-emerald-100/70'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${resultFilter === 'Selected' ? 'text-white' : 'text-emerald-600'}`} />
          <span>Selected</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            resultFilter === 'Selected' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {statusCounts.selected}
          </span>
        </button>

        <button
          onClick={() => setResultFilter(resultFilter === 'Waiting' ? 'All' : 'Waiting')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            resultFilter === 'Waiting'
              ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-500/20'
              : 'bg-amber-50 text-amber-900 border border-amber-200/90 hover:bg-amber-100/70'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${resultFilter === 'Waiting' ? 'text-white' : 'text-amber-600'}`} />
          <span>Still Waiting</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            resultFilter === 'Waiting' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-900'
          }`}>
            {statusCounts.waiting}
          </span>
        </button>

        <button
          onClick={() => setResultFilter(resultFilter === 'Not Selected' ? 'All' : 'Not Selected')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            resultFilter === 'Not Selected'
              ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/20'
              : 'bg-rose-50 text-rose-800 border border-rose-200/90 hover:bg-rose-100/70'
          }`}
        >
          <XCircle className={`w-3.5 h-3.5 ${resultFilter === 'Not Selected' ? 'text-white' : 'text-rose-600'}`} />
          <span>Not Selected / Rejected</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            resultFilter === 'Not Selected' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
          }`}>
            {statusCounts.rejected}
          </span>
        </button>
      </div>

      {/* Dropdown Filters: Company, Role, Year, Result, Interview Type, Difficulty, Technology */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          {allCompanies.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Companies' : c}
            </option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          {allRoles.map((r) => (
            <option key={r} value={r}>
              {r === 'All' ? 'All Roles' : r}
            </option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          {allYears.map((y) => (
            <option key={y} value={y}>
              {y === 'All' ? 'All Years' : y}
            </option>
          ))}
        </select>

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          <option value="All">All Results</option>
          <option value="Selected">Selected</option>
          <option value="Waiting">Still Waiting / In Progress</option>
          <option value="Not Selected">Not Selected / Rejected</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          <option value="All">All Types</option>
          <option value="Campus">Campus</option>
          <option value="Off-Campus">Off-Campus</option>
          <option value="Referral">Referral</option>
        </select>

        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          aria-label="Filter experiences by difficulty"
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Moderate">Moderate</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          {allTechs.map((t) => (
            <option key={t} value={t}>
              {t === 'All' ? 'All Technologies' : t}
            </option>
          ))}
        </select>

        {(companyFilter !== 'All' ||
          roleFilter !== 'All' ||
          yearFilter !== 'All' ||
          resultFilter !== 'All' ||
          typeFilter !== 'All' ||
          diffFilter !== 'All' ||
          techFilter !== 'All' ||
          search) && (
          <button
            onClick={() => {
              setCompanyFilter('All');
              setRoleFilter('All');
              setYearFilter('All');
              setResultFilter('All');
              setTypeFilter('All');
              setDiffFilter('All');
              setTechFilter('All');
              setSearch('');
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold ml-1 cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Experience Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-10 sm:p-14 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-base">
              {experiences.length === 0 ? 'No interview experiences added yet — be the first to share an experience' : 'No interview experiences found matching your filters'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {experiences.length === 0
                ? 'Be the first to share round breakdowns, coding challenges, and advice from your placement drives.'
                : 'Try adjusting your search criteria or resetting filters.'}
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenSubmit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Share Experience
              </button>
            </div>
          </div>
        ) : (
          filtered.map((exp) => {
            const safeRoundsList = Array.isArray(exp.rounds) ? exp.rounds : [];
            const roundsFlow = safeRoundsList.map((r: any) => typeof r === 'string' ? r : (r?.roundName || 'Round')).join(' → ');
            const yearStr = exp.year || (() => {
              if (!exp.createdAt) return new Date().getFullYear();
              const d = new Date(exp.createdAt);
              return isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
            })();

            return (
              <div
                key={exp.id}
                onClick={() => onSelectExperience(exp)}
                className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-3.5">
                  {/* Card Header with Company & Role and Color-Coded Status Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors truncate">
                        {exp.companyName}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                        {exp.role}
                      </p>
                    </div>

                    {/* Color-Coded Status Tag */}
                    <StatusTag result={exp.result} size="sm" showDot={true} showPulse={true} />
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">{exp.interviewType}</span>
                    <span>·</span>
                    <span>{yearStr}</span>
                    {exp.difficulty && (
                      <>
                        <span>·</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          exp.difficulty.toLowerCase() === 'easy'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : exp.difficulty.toLowerCase() === 'moderate' || exp.difficulty.toLowerCase() === 'medium'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {exp.difficulty === 'Difficult' ? 'Hard' : exp.difficulty}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Visual Progress Indicator */}
                  <VisualProgressTracker
                    result={exp.result}
                    roundsCount={safeRoundsList.length}
                    rounds={safeRoundsList}
                    compact={true}
                  />

                  {/* Rounds Flow */}
                  <div className="text-xs text-slate-700 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200/60 line-clamp-1 font-medium">
                    {roundsFlow || 'Interview Process'}
                  </div>

                  {/* Technologies */}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exp.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {exp.technologies.length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium">
                          +{exp.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {safeRoundsList.length} {safeRoundsList.length === 1 ? 'round' : 'rounds'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportExperiencePDF(exp);
                      }}
                      title="Download structured PDF brief for offline prep"
                      className="px-2 py-1 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1 text-[11px] font-medium border border-slate-200 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>PDF</span>
                    </button>
                    <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      View Experience →
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
