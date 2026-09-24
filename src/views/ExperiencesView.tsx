import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  Building2,
  GraduationCap,
  Layers,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ThumbsUp,
  Bookmark,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { InterviewExperience, Company } from '../types';
import { useAuth } from '../context/AuthContext';

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
  onSelectCompany,
  onOpenSubmit,
  onUpvoteExperience,
  onToggleBookmark,
}) => {
  const { user, isExperienceBookmarked } = useAuth();
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [resultFilter, setResultFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [techFilter, setTechFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'upvotes' | 'newest' | 'rating'>('upvotes');

  const allTechs = Array.from(
    new Set(experiences.flatMap((e) => e.technologies || []))
  );

  const allTags = Array.from(
    new Set(experiences.flatMap((e) => e.tags || []))
  );

  const filtered = experiences.filter((exp) => {
    const matchesSearch =
      exp.companyName.toLowerCase().includes(search.toLowerCase()) ||
      exp.role.toLowerCase().includes(search.toLowerCase()) ||
      exp.experienceText.toLowerCase().includes(search.toLowerCase()) ||
      (exp.authorCollege && exp.authorCollege.toLowerCase().includes(search.toLowerCase())) ||
      (exp.tags && exp.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));

    const matchesCompany = companyFilter === 'All' || exp.companyId === companyFilter;
    const matchesType = typeFilter === 'All' || exp.interviewType === typeFilter;
    const matchesResult = resultFilter === 'All' || exp.result === resultFilter;
    const matchesDifficulty = difficultyFilter === 'All' || exp.difficulty === difficultyFilter;
    const matchesTech = techFilter === 'All' || exp.technologies?.includes(techFilter);
    const matchesTag = tagFilter === 'All' || exp.tags?.includes(tagFilter);

    return matchesSearch && matchesCompany && matchesType && matchesResult && matchesDifficulty && matchesTech && matchesTag;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return (b.upvotes || 0) - (a.upvotes || 0);
    }
    if (sortBy === 'rating') {
      return (b.overallRating || 0) - (a.overallRating || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Experiences
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real interview round breakdowns, questions, and preparation advice from university candidates
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto shrink-0"
        >
          + Submit Experience
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, role, college, or question details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs sm:text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>

          {/* Company filter */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
          >
            <option value="All">All Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Interview Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
          >
            <option value="All">All Types</option>
            <option value="Campus">On-Campus</option>
            <option value="Off-campus">Off-Campus</option>
            <option value="Internship">Internship</option>
            <option value="PPO">PPO</option>
          </select>

          {/* Result Filter */}
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
          >
            <option value="All">All Results</option>
            <option value="Selected">Selected</option>
            <option value="Not Selected">Not Selected</option>
            <option value="Waitlisted">Waitlisted</option>
          </select>

          {/* Difficulty */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Difficult">Difficult</option>
          </select>

          {/* Tech Filter */}
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
          >
            <option value="All">All Tech Stack</option>
            {allTechs.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Domain & Skill Tag Filter */}
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-900 font-medium outline-none"
          >
            <option value="All">All Domains &amp; Skills</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                Tag: #{t}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold outline-none"
            >
              <option value="upvotes">Most Helpful (Upvoted)</option>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>

          {(companyFilter !== 'All' || typeFilter !== 'All' || resultFilter !== 'All' || difficultyFilter !== 'All' || techFilter !== 'All' || tagFilter !== 'All') && (
            <button
              onClick={() => {
                setCompanyFilter('All');
                setTypeFilter('All');
                setResultFilter('All');
                setDifficultyFilter('All');
                setTechFilter('All');
                setTagFilter('All');
              }}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Experiences */}
      {sorted.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No experiences match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or reset the filters to see more candidate breakdowns.
          </p>
          <button
            onClick={onOpenSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            + Submit Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((exp) => {
            const isSelected = exp.result === 'Selected';
            const isNotSelected = exp.result === 'Not Selected';
            const isBookmarked = isExperienceBookmarked(exp.id);
            const hasUpvoted = Boolean(user && exp.upvotedBy?.includes(user.uid));

            return (
              <div
                key={exp.id}
                onClick={() => onSelectExperience(exp)}
                className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
                        {exp.companyName}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-slate-700 text-sm">
                        {exp.role}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                        {exp.interviewType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {exp.authorName} ({exp.authorCollege || 'Campus Drive'})
                      </span>
                      <span>·</span>
                      <span>Drive Year: {exp.year}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isNotSelected
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {exp.result}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                      exp.difficulty === 'Difficult'
                        ? 'bg-rose-50 text-rose-600'
                        : exp.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {exp.difficulty}
                    </span>
                  </div>
                </div>

                {/* Rounds summary */}
                <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap items-center gap-2 text-xs text-slate-700">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Process Flow:
                  </span>
                  {exp.rounds.map((r, rIdx) => (
                    <React.Fragment key={rIdx}>
                      <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium">
                        {r.roundName}
                      </span>
                      {rIdx < exp.rounds.length - 1 && (
                        <span className="text-slate-400">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Candidate notes */}
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed italic">
                  "{exp.experienceText}"
                </p>

                {/* Domain & Skill Tags */}
                {exp.tags && exp.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-0.5">
                      <Tag className="w-3 h-3 text-indigo-500" />
                      Tags:
                    </span>
                    {exp.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTagFilter(tagFilter === tag ? 'All' : tag);
                        }}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                          tagFilter === tag
                            ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                            : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/90'
                        }`}
                        title={`Click to filter by #${tag}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer tags and Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Upvote button */}
                    {onUpvoteExperience && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpvoteExperience(exp);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          hasUpvoted
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700'
                        }`}
                        title="Helpful interview experience upvote"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-white text-white' : 'text-slate-500'}`} />
                        <span>{hasUpvoted ? 'Helpful' : 'Helpful'} ({exp.upvotes || 0})</span>
                      </button>
                    )}

                    {/* Bookmark button */}
                    {onToggleBookmark && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(exp);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800'
                        }`}
                        title={isBookmarked ? 'Saved in your profile bookmarks' : 'Save to profile bookmarks'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
                        <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                      </button>
                    )}

                    <div className="hidden sm:flex flex-wrap gap-1.5 ml-2">
                      {exp.technologies.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 ml-auto">
                    <span>View Breakdown &amp; Questions</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
