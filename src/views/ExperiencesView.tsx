import React, { useState } from 'react';
import { Search, ChevronRight, Download } from 'lucide-react';
import { InterviewExperience, Company } from '../types';
import { exportExperiencePDF } from '../lib/pdfExport';

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

  const filtered = experiences.filter((exp) => {
    const query = search.toLowerCase();
    const expYear = exp.year ? exp.year.toString() : new Date(exp.createdAt).getFullYear().toString();
    const matchesSearch =
      exp.companyName.toLowerCase().includes(query) ||
      exp.role.toLowerCase().includes(query) ||
      exp.experienceText.toLowerCase().includes(query);

    const matchesCompany = companyFilter === 'All' || exp.companyName === companyFilter;
    const matchesRole = roleFilter === 'All' || exp.role === roleFilter;
    const matchesYear = yearFilter === 'All' || expYear === yearFilter;
    const matchesResult = resultFilter === 'All' || exp.result === resultFilter;
    const matchesType = typeFilter === 'All' || exp.interviewType === typeFilter;
    const matchesDiff = diffFilter === 'All' || exp.difficulty === diffFilter;
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
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-full shadow-xs transition-all self-start sm:self-auto shrink-0 cursor-pointer"
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
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs transition-all"
        />
      </div>

      {/* Filters: Company, Role, Year, Result, Interview Type, Difficulty, Technology */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
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
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
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
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
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
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          <option value="All">All Results</option>
          <option value="Selected">Selected</option>
          <option value="Not Selected">Not Selected</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          <option value="All">All Types</option>
          <option value="Campus">Campus</option>
          <option value="Off-Campus">Off-Campus</option>
          <option value="Referral">Referral</option>
        </select>

        <select
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
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
          techFilter !== 'All' ||
          search) && (
          <button
            onClick={() => {
              setCompanyFilter('All');
              setRoleFilter('All');
              setYearFilter('All');
              setResultFilter('All');
              setTypeFilter('All');
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
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
            No interview experiences found matching your criteria.
          </div>
        ) : (
          filtered.map((exp) => {
            const roundsFlow = exp.rounds.map((r) => r.roundName).join(' → ');
            const yearStr = exp.year || new Date(exp.createdAt).getFullYear();

            return (
              <div
                key={exp.id}
                onClick={() => onSelectExperience(exp)}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                        {exp.companyName}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        {exp.role}
                      </p>
                    </div>

                    {/* Result badge */}
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full shrink-0 ${
                        exp.result === 'Selected'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                      }`}
                    >
                      {exp.result}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span>{exp.interviewType}</span>
                    <span>·</span>
                    <span>{yearStr}</span>
                  </div>

                  {/* Rounds Flow */}
                  <div className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60 line-clamp-1 font-medium">
                    {roundsFlow || 'Interview Process'}
                  </div>

                  {/* Technologies */}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="text-xs text-slate-500 truncate">
                      {exp.technologies.slice(0, 4).join(' · ')}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {exp.rounds.length} {exp.rounds.length === 1 ? 'round' : 'rounds'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportExperiencePDF(exp);
                      }}
                      title="Download structured PDF brief for offline prep"
                      className="px-2 py-1 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1 text-[11px] font-medium border border-slate-200"
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
