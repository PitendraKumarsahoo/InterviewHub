import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  ThumbsUp,
  GraduationCap
} from 'lucide-react';
import { Answer, Question, InterviewExperience } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

interface CommunityViewProps {
  questions: Question[];
  experiences?: InterviewExperience[];
  onSelectQuestion: (question: Question) => void;
  onSelectExperience?: (experience: InterviewExperience) => void;
  onOpenSubmit: () => void;
  onUpvoteExperience?: (experience: InterviewExperience) => void;
  onToggleBookmark?: (experience: InterviewExperience) => void;
  onUpvoteQuestion?: (question: Question) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  questions,
  onSelectQuestion,
  onOpenSubmit,
}) => {
  const [recentAnswers, setRecentAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAnswers = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'answers'), limit(10)));
        const list: Answer[] = [];
        snap.forEach((doc) => {
          list.push(doc.data() as Answer);
        });
        list.sort((a, b) => b.upvotes - a.upvotes);
        setRecentAnswers(list);
      } catch (err) {
        console.error('Error fetching answers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentAnswers();
  }, []);

  const topContributors = [
    { name: 'Aarav Sharma', college: 'GIET University', points: 142, badges: 'Top Scholar' },
    { name: 'Sneha Kulkarni', college: 'COEP Pune', points: 98, badges: 'SQL Contributor' },
    { name: 'Vikram Sengupta', college: 'IIT Bhubaneswar', points: 87, badges: 'Algorithms' },
    { name: 'Ananya Mishra', college: 'KIIT University', points: 65, badges: 'Campus Star' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            Student Community &amp; Knowledge
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Peer-reviewed interview solutions, technical insights, and university contributors.
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs rounded-lg shadow-2xs transition-colors self-start sm:self-auto shrink-0"
        >
          Share Knowledge
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Community Answers & Solutions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Highest Rated Solutions &amp; Tips
            </h2>
            <span className="text-xs text-slate-500">Upvoted by students</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading community solutions...
            </div>
          ) : recentAnswers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
              No answers posted yet. Click on any question in the Question Bank to post the first answer!
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnswers.map((ans) => {
                const relatedQ = questions.find((q) => q.id === ans.questionId);

                return (
                  <div
                    key={ans.id}
                    className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all space-y-3"
                  >
                    {relatedQ && (
                      <div
                        onClick={() => onSelectQuestion(relatedQ)}
                        className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200/80 cursor-pointer transition-colors"
                      >
                        <div className="text-[10px] uppercase font-semibold text-indigo-600 tracking-wider mb-0.5">
                          Question Reference
                        </div>
                        <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {relatedQ.questionText}
                        </span>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      "{ans.answerText}"
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">{ans.authorName}</span>
                        {ans.authorCollege && <span>· {ans.authorCollege}</span>}
                      </div>

                      <div className="flex items-center gap-1.5 text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{ans.upvotes} helpful upvotes</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Top Contributors & Guidelines */}
        <div className="space-y-4">
          {/* Top Contributors Card */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/90 space-y-3">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Top Student Contributors
            </h3>

            <div className="space-y-2.5 divide-y divide-slate-100">
              {topContributors.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs pt-2 first:pt-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
                      #{i + 1}
                    </div>
                    <div>
                      <span className="font-medium text-slate-800 block">{c.name}</span>
                      <span className="text-[11px] text-slate-400">{c.college}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 font-medium text-slate-600 rounded text-[11px]">
                    {c.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Code of Ethics */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
              Academic Integrity &amp; Sharing
            </h4>
            <p>
              InterviewHub is an open student placement preparation community. Experiences reflect public placement patterns, algorithmic topics, and interview problem-solving approaches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
