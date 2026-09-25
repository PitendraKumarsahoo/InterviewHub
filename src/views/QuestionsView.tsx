import React, { useState } from 'react';
import { Search, ChevronRight, Filter } from 'lucide-react';
import { Question } from '../types';
import { useAuth } from '../context/AuthContext';

interface QuestionsViewProps {
  questions: Question[];
  initialFilter?: string;
  onSelectQuestion: (question: Question) => void;
  onOpenSubmit: () => void;
  onUpvoteQuestion?: (question: Question) => void;
}

export const QuestionsView: React.FC<QuestionsViewProps> = ({
  questions,
  initialFilter,
  onSelectQuestion,
  onOpenSubmit,
}) => {
  const [search, setSearch] = useState(initialFilter || '');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [techFilter, setTechFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const questionTypes = ['All', 'Coding', 'Technical', 'Aptitude', 'GD', 'HR'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const allCompanies = [
    'All',
    ...Array.from(
      new Set(
        questions.flatMap((q) => [
          q.companyName,
          ...(q.companiesAsked || [])
        ]).filter(Boolean) as string[]
      )
    )
  ];

  const allTechs = [
    'All',
    ...Array.from(
      new Set(questions.map((q) => q.technology).filter(Boolean) as string[])
    )
  ];

  const filtered = questions.filter((q) => {
    const query = search.toLowerCase();
    const matchesSearch =
      q.questionText.toLowerCase().includes(query) ||
      (q.technology && q.technology.toLowerCase().includes(query)) ||
      (q.companyName && q.companyName.toLowerCase().includes(query)) ||
      (q.companiesAsked && q.companiesAsked.some((c) => c.toLowerCase().includes(query)));

    const matchesCompany =
      companyFilter === 'All' ||
      q.companyName === companyFilter ||
      (q.companiesAsked && q.companiesAsked.includes(companyFilter));

    const matchesType = typeFilter === 'All' || q.type === typeFilter;
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const matchesTech = techFilter === 'All' || q.technology === techFilter;

    return matchesSearch && matchesCompany && matchesType && matchesDiff && matchesTech;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Questions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Explore verified coding challenges, technical questions, and HR rounds straight from the room.
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-full shadow-xs transition-all self-start sm:self-auto shrink-0 cursor-pointer"
        >
          Submit Question
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search questions by keyword, topic, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs transition-all"
        />
      </div>

      {/* Filters: Company, Technology, Type, Difficulty */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          {questionTypes.map((t) => (
            <option key={t} value={t}>
              {t === 'All' ? 'All Types' : t}
            </option>
          ))}
        </select>

        <select
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          {allTechs.map((tech) => (
            <option key={tech} value={tech}>
              {tech === 'All' ? 'All Technologies' : tech}
            </option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-700 outline-none hover:border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d === 'All' ? 'All Difficulties' : d}
            </option>
          ))}
        </select>

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

        {(typeFilter !== 'All' || techFilter !== 'All' || difficultyFilter !== 'All' || companyFilter !== 'All' || search) && (
          <button
            onClick={() => {
              setTypeFilter('All');
              setTechFilter('All');
              setDifficultyFilter('All');
              setCompanyFilter('All');
              setSearch('');
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold ml-1 cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Question List (Compact rows) */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
            No questions found matching your filter criteria.
          </div>
        ) : (
          filtered.map((q) => {
            const companiesList = q.companiesAsked && q.companiesAsked.length > 0
              ? q.companiesAsked
              : q.companyName ? [q.companyName] : [];

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                {/* Left side: title + tags */}
                <div className="space-y-1.5 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors leading-snug">
                    {q.questionText}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{q.type}</span>
                    {q.technology && (
                      <>
                        <span>·</span>
                        <span>{q.technology}</span>
                      </>
                    )}
                    {q.difficulty && (
                      <>
                        <span>·</span>
                        <span
                          className={`font-semibold ${
                            q.difficulty === 'Easy'
                              ? 'text-emerald-600'
                              : q.difficulty === 'Medium'
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </>
                    )}
                    {companiesList.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-slate-500">
                          {companiesList.slice(0, 3).join(' · ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side: Asked count + View button */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200/70">
                    Asked {q.askedCount}x
                  </span>

                  <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-0.5">
                    View
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
