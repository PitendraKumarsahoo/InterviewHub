import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, HelpCircle, FileText, ChevronRight, Flame } from 'lucide-react';
import { Company, Question, InterviewExperience } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  questions: Question[];
  experiences: InterviewExperience[];
  onSelectCompany: (companyId: string) => void;
  onSelectQuestion: (question: Question) => void;
  onSelectExperience: (experience: InterviewExperience) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  companies,
  questions,
  experiences,
  onSelectCompany,
  onSelectQuestion,
  onSelectExperience,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or shortcut
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchedCompanies = cleanQuery
    ? companies.filter(
        c =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.category.toLowerCase().includes(cleanQuery) ||
          c.type.toLowerCase().includes(cleanQuery)
      )
    : companies.slice(0, 4);

  const matchedQuestions = cleanQuery
    ? questions.filter(
        q =>
          q.questionText.toLowerCase().includes(cleanQuery) ||
          (q.technology && q.technology.toLowerCase().includes(cleanQuery)) ||
          (q.topic && q.topic.toLowerCase().includes(cleanQuery))
      )
    : questions.slice(0, 4);

  const matchedExperiences = cleanQuery
    ? experiences.filter(
        e =>
          e.companyName.toLowerCase().includes(cleanQuery) ||
          e.role.toLowerCase().includes(cleanQuery) ||
          e.technologies.some(t => t.toLowerCase().includes(cleanQuery)) ||
          (e.authorCollege && e.authorCollege.toLowerCase().includes(cleanQuery))
      )
    : experiences.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95">
        
        {/* Search input header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search company, role, technology (e.g. 'TCS Java' or 'SQL Join')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-900 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Companies match */}
          {matchedCompanies.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-2">
                Companies ({matchedCompanies.length})
              </span>
              <div className="space-y-1">
                {matchedCompanies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCompany(c.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block group-hover:text-indigo-600">
                          {c.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {c.category} · {c.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600">
                      <span>{c.experienceCount} exp</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Questions match */}
          {matchedQuestions.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-2">
                Interview Questions ({matchedQuestions.length})
              </span>
              <div className="space-y-1">
                {matchedQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      onSelectQuestion(q);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-900 block truncate group-hover:text-indigo-600">
                          {q.questionText}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {q.type} {q.technology ? `· ${q.technology}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-600 font-semibold shrink-0">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{q.askedCount}x</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Experiences match */}
          {matchedExperiences.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-2">
                Interview Experiences ({matchedExperiences.length})
              </span>
              <div className="space-y-1">
                {matchedExperiences.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      onSelectExperience(e);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 block group-hover:text-indigo-600">
                          {e.companyName} — {e.role}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {e.authorCollege} · {e.interviewType} ({e.result})
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {cleanQuery &&
            matchedCompanies.length === 0 &&
            matchedQuestions.length === 0 &&
            matchedExperiences.length === 0 && (
              <div className="py-10 text-center text-slate-500 text-xs">
                No matching companies, questions, or experiences found for "{query}".
              </div>
            )}
        </div>

      </div>
    </div>
  );
};
