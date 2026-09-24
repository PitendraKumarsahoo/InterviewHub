import React, { useState } from 'react';
import {
  Flame,
  Search,
  Building2,
  ChevronRight,
  TrendingUp,
  Award,
  HelpCircle,
  Code2,
  Filter,
  ThumbsUp
} from 'lucide-react';
import { Question } from '../types';
import { useAuth } from '../context/AuthContext';

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
  onUpvoteQuestion,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState('All');

  // Filter questions that have been asked more than once or sort all by askedCount descending
  const sortedQuestions = [...questions].sort((a, b) => b.askedCount - a.askedCount);

  const technologies = [
    'All',
    'Java',
    'Python',
    'SQL',
    'DSA',
    'OOP',
    'DBMS',
    'Operating Systems',
    'Computer Networks',
  ];

  const filtered = sortedQuestions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      (q.technology && q.technology.toLowerCase().includes(search.toLowerCase())) ||
      (q.companiesAsked && q.companiesAsked.some(c => c.toLowerCase().includes(search.toLowerCase())));

    const matchesTech =
      selectedTech === 'All' ||
      (q.technology && q.technology.toLowerCase() === selectedTech.toLowerCase());

    return matchesSearch && matchesTech;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
            <Flame className="w-4 h-4 fill-white" />
            <span>High-Yield Interview Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Most Repeated Interview Questions
          </h1>

          <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
            These questions have appeared repeatedly across multiple university campus drives and off-campus evaluation rounds. If you only have a few days to prepare, prioritize these core topics first.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search repeated questions by keyword, technology, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs sm:text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Technology:
          </span>
          {technologies.map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedTech === tech
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Repeated Questions Ranked List */}
      <div className="space-y-4">
        {filtered.map((q, idx) => {
          const isTopTier = idx < 3;

          return (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isTopTier
                  ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300 hover:shadow-md'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Rank number badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                    idx === 0
                      ? 'bg-amber-500 text-white shadow-xs'
                      : idx === 1
                      ? 'bg-slate-700 text-white'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  #{idx + 1}
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {q.type}
                    </span>
                    {q.technology && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700">
                        {q.technology}
                      </span>
                    )}
                    {q.difficulty && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-600">
                        {q.difficulty}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                    {q.questionText}
                  </h3>

                  {q.companiesAsked && q.companiesAsked.length > 0 && (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Reported across: <strong className="text-slate-700">{q.companiesAsked.join(' · ')}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Repetition frequency, Upvote & Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center gap-2">
                  {onUpvoteQuestion && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpvoteQuestion(q);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                        user && q.upvotedBy?.includes(user.uid)
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700'
                      }`}
                      title="Upvote question"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${user && q.upvotedBy?.includes(user.uid) ? 'fill-white text-white' : 'text-slate-500'}`} />
                      <span>{q.upvotes || 0}</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/90 text-amber-900 rounded-xl font-bold text-xs sm:text-sm">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
                    <span>Asked {q.askedCount}x</span>
                  </div>
                </div>

                <span className="text-indigo-600 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Solutions &amp; Tips</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
