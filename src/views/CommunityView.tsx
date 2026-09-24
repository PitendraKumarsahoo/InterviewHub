import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  GraduationCap,
  HelpCircle,
  ChevronRight
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
  experiences = [],
  onSelectQuestion,
  onSelectExperience,
  onOpenSubmit,
  onUpvoteExperience,
  onToggleBookmark,
  onUpvoteQuestion,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Community &amp; Knowledge
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Peer-reviewed interview solutions, deep technical insights, and university contributors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top Community Answers & Solutions */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Highest Rated Solutions &amp; Tips
            </h2>
            <span className="text-xs text-slate-500">Upvoted by students</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading community solutions...
            </div>
          ) : recentAnswers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No answers posted yet. Click on any question in the Question Bank to post the first answer!
            </div>
          ) : (
            <div className="space-y-4">
              {recentAnswers.map((ans) => {
                const relatedQ = questions.find((q) => q.id === ans.questionId);

                return (
                  <div
                    key={ans.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    {relatedQ && (
                      <div
                        onClick={() => onSelectQuestion(relatedQ)}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 cursor-pointer transition-colors"
                      >
                        <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider mb-0.5">
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
                        <span className="font-semibold text-slate-800">{ans.authorName}</span>
                        {ans.authorCollege && <span>· {ans.authorCollege}</span>}
                      </div>

                      <div className="flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{ans.upvotes} helpful upvotes</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Community Guidelines & Top Contributors */}
        <div className="space-y-6">
          {/* Top Contributors Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Top University Contributors
            </h3>

            <div className="space-y-3">
              {topContributors.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">{c.name}</span>
                      <span className="text-[11px] text-slate-500">{c.college}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 font-semibold text-slate-700 rounded text-[11px]">
                    {c.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Code of Ethics */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Academic Integrity &amp; Sharing
            </h4>
            <p>
              InterviewHub is an open student-to-student placement preparation community. Experiences reflect public placement drive patterns, algorithmic topics, and interview problem-solving approaches.
            </p>
            <p>
              Please avoid sharing proprietary company trade secrets or ongoing confidential coding test questions before the evaluation window closes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
