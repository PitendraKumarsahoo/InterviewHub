import React, { useState } from 'react';
import { Search, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Question } from '../types';

interface RepeatedQuestionsViewProps {
  questions: Question[];
  onSelectQuestion: (question: Question) => void;
  onOpenSubmit: () => void;
  onUpvoteQuestion?: (question: Question) => void;
}

export const RepeatedQuestionsView: React.FC<RepeatedQuestionsViewProps> = ({
  questions,
  onSelectQuestion,
  onOpenSubmit,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState('All');

  // Filter questions that have been asked more than once or sort all by askedCount descending
  const sortedQuestions = [...questions].sort((a, b) => b.askedCount - a.askedCount);

  const filters = [
    { label: 'All', value: 'All' },
    { label: 'Java', value: 'Java' },
    { label: 'Python', value: 'Python' },
    { label: 'SQL', value: 'SQL' },
    { label: 'DSA', value: 'DSA' },
    { label: 'OOP', value: 'OOP' },
    { label: 'DBMS', value: 'DBMS' },
    { label: 'OS', value: 'Operating Systems' },
    { label: 'CN', value: 'Computer Networks' },
  ];

  const filtered = sortedQuestions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      (q.technology && q.technology.toLowerCase().includes(search.toLowerCase())) ||
      (q.companiesAsked && q.companiesAsked.some((c) => c.toLowerCase().includes(search.toLowerCase())));

    const matchesTech =
      selectedTech === 'All' ||
      (q.technology &&
        (q.technology.toLowerCase() === selectedTech.toLowerCase() ||
          (selectedTech === 'Operating Systems' && q.technology.toLowerCase().includes('os')) ||
          (selectedTech === 'Computer Networks' && q.technology.toLowerCase().includes('network'))));

    return matchesSearch && matchesTech;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Repeated Questions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Frequently asked questions reported across multiple student interview debriefs.
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all self-start sm:self-auto shrink-0 cursor-pointer"
        >
          Submit Question
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search repeated questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-xs font-semibold text-slate-500 mr-1">Topic:</span>
        {filters.map((f) => (
          <button
            key={f.label}
            onClick={() => setSelectedTech(f.value)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              selectedTech === f.value
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Clean Ranked List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
            No repeated questions found matching your criteria.
          </div>
        ) : (
          filtered.map((q, index) => {
            const rankStr = String(index + 1).padStart(2, '0');
            return (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
              >
                {/* Left side: subtle rank + question info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className="text-sm font-bold text-slate-400 pt-0.5 shrink-0">
                    {rankStr}
                  </span>

                  <div className="space-y-1.5 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors leading-snug">
                      {q.questionText}
                    </h3>

                    {/* Metadata & Tag chips */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {q.type}
                      </span>
                      {q.technology && (
                        <>
                          <span>·</span>
                          <span>{q.technology}</span>
                        </>
                      )}
                      {q.difficulty && (
                        <>
                          <span>·</span>
                          <span className="font-semibold">{q.difficulty}</span>
                        </>
                      )}
                      {q.companiesAsked && q.companiesAsked.length > 0 && (
                        <>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline text-slate-500 font-medium">
                            Reported across: {q.companiesAsked.join(' · ')}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Mobile only reported across */}
                    {q.companiesAsked && q.companiesAsked.length > 0 && (
                      <p className="sm:hidden text-xs text-slate-500">
                        Reported across: {q.companiesAsked.join(' · ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: asked badge + View question button */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="px-2.5 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-md border border-indigo-200/70">
                    Asked {q.askedCount} times
                  </span>

                  <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-0.5">
                    View question
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
