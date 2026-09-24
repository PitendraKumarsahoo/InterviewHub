import React, { useState } from 'react';
import {
  Search,
  Filter,
  Flame,
  HelpCircle,
  Code2,
  ThumbsUp,
  MessageSquare,
  Building2,
  ChevronRight,
  BookOpen,
  ArrowUpDown
} from 'lucide-react';
import { Question } from '../types';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

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
  onUpvoteQuestion,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [search, setSearch] = useState(initialFilter || '');
  const [typeFilter, setTypeFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [techFilter, setTechFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'upvotes' | 'asked' | 'newest'>('upvotes');

  const questionTypes = ['All', 'Coding', 'Technical', 'Aptitude', 'GD', 'HR'];

  const allTechs = Array.from(
    new Set(questions.map((q) => q.technology).filter(Boolean))
  ) as string[];

  const handleQuickAskIncrement = async (e: React.MouseEvent, q: Question) => {
    e.stopPropagation();
    if (!user) {
      await signInWithGoogle();
      return;
    }
    if (q.askedByUserIds?.includes(user.uid)) return;

    try {
      const qRef = doc(db, 'questions', q.id);
      await updateDoc(qRef, {
        askedCount: increment(1),
        askedByUserIds: arrayUnion(user.uid),
      });
      q.askedCount += 1;
      q.askedByUserIds = [...(q.askedByUserIds || []), user.uid];
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `questions/${q.id}`);
    }
  };

  const filtered = questions.filter((q) => {
    const query = search.toLowerCase();
    const matchesSearch =
      q.questionText.toLowerCase().includes(query) ||
      (q.technology && q.technology.toLowerCase().includes(query)) ||
      (q.companyName && q.companyName.toLowerCase().includes(query)) ||
      (q.companiesAsked && q.companiesAsked.some(c => c.toLowerCase().includes(query)));

    const matchesType = typeFilter === 'All' || q.type === typeFilter;
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const matchesTech = techFilter === 'All' || q.technology === techFilter;

    return matchesSearch && matchesType && matchesDiff && matchesTech;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return (b.upvotes || 0) - (a.upvotes || 0);
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.askedCount - a.askedCount;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Question Bank &amp; Solutions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real interview questions from campus evaluations with community answers and asked frequencies
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto shrink-0"
        >
          + Submit Interview Question
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions by keyword, topic, technology (e.g. 'ArrayList', 'Reverse', 'JOIN')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs sm:text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Question Type Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">Type:</span>
            {questionTypes.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Difficulty & Tech */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {allTechs.length > 0 && (
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
              >
                <option value="All">All Tech Stacks</option>
                {allTechs.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-slate-400 font-semibold text-xs flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold outline-none"
              >
                <option value="upvotes">Most Upvoted</option>
                <option value="asked">Most Asked (Frequency)</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {(typeFilter !== 'All' || difficultyFilter !== 'All' || techFilter !== 'All' || search) && (
              <button
                onClick={() => {
                  setTypeFilter('All');
                  setDifficultyFilter('All');
                  setTechFilter('All');
                  setSearch('');
                }}
                className="text-rose-600 hover:underline font-semibold ml-1 text-xs"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Questions List */}
      {sorted.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No questions match your query</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for broader keywords or submit a new question from your placement drive.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sorted.map((q) => {
            const hasUserAsked = user && q.askedByUserIds?.includes(user.uid);
            const hasUpvoted = Boolean(user && q.upvotedBy?.includes(user.uid));

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
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
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                        q.difficulty === 'Hard'
                          ? 'bg-rose-50 text-rose-700'
                          : q.difficulty === 'Easy'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {q.questionText}
                  </h3>

                  {q.companiesAsked && q.companiesAsked.length > 0 && (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Reported at: {q.companiesAsked.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Action / Upvote / "I was asked this too" */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Upvote button */}
                  {onUpvoteQuestion && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpvoteQuestion(q);
                      }}
                      title="Upvote question as helpful"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        hasUpvoted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-white text-white' : 'text-slate-500'}`} />
                      <span>{q.upvotes || 0}</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => handleQuickAskIncrement(e, q)}
                    title="Click if you were also asked this question in an interview!"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      hasUserAsked
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Asked {q.askedCount}x</span>
                  </button>

                  <button className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-colors flex items-center gap-1">
                    <span>Answers</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
