import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Building,
  Calendar,
  Award,
  FileText,
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Edit3,
  PlusCircle,
  Bookmark,
  ThumbsUp,
  Layers,
  ChevronRight,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { InterviewExperience, Question, Answer } from '../types';

interface ProfileViewProps {
  allExperiences?: InterviewExperience[];
  onSelectExperience: (experience: InterviewExperience) => void;
  onSelectQuestion: (question: Question) => void;
  onOpenSubmit: () => void;
  onUpvoteExperience?: (experience: InterviewExperience) => void;
  onToggleBookmark?: (experience: InterviewExperience) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  allExperiences = [],
  onSelectExperience,
  onSelectQuestion,
  onOpenSubmit,
  onUpvoteExperience,
  onToggleBookmark,
}) => {
  const { user, userProfile, logout, setIsProfileModalOpen, signInWithGoogle, toggleBookmarkExperience } = useAuth();
  const [myExperiences, setMyExperiences] = useState<InterviewExperience[]>([]);
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [myAnswers, setMyAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'experiences' | 'answers'>('bookmarks');

  // Filter bookmarked experiences
  const bookmarkedExperiences = allExperiences.filter((exp) => {
    return (
      userProfile?.bookmarkedExperienceIds?.includes(exp.id) ||
      exp.bookmarkedBy?.includes(user?.uid || '')
    );
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMyData = async () => {
      setLoading(true);
      try {
        // Fetch experiences
        const expSnap = await getDocs(
          query(collection(db, 'experiences'), where('userId', '==', user.uid))
        );
        const expList: InterviewExperience[] = [];
        expSnap.forEach((doc) => expList.push(doc.data() as InterviewExperience));
        setMyExperiences(expList);

        // Fetch questions
        const qSnap = await getDocs(
          query(collection(db, 'questions'), where('experienceId', '!=', ''))
        );
        // Alternatively filter client side
        const qList: Question[] = [];
        qSnap.forEach((doc) => {
          const d = doc.data() as Question;
          if (d.askedByUserIds?.includes(user.uid)) {
            qList.push(d);
          }
        });
        setMyQuestions(qList);

        // Fetch answers
        const ansSnap = await getDocs(
          query(collection(db, 'answers'), where('userId', '==', user.uid))
        );
        const ansList: Answer[] = [];
        ansSnap.forEach((doc) => ansList.push(doc.data() as Answer));
        setMyAnswers(ansList);
      } catch (err) {
        console.error('Error fetching student contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Your Profile</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Sign in with Google to view your contributions, submission statuses, earned badges, and university attribution.
        </p>
        <button
          onClick={signInWithGoogle}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  // Calculate Badges
  const hasFirstContrib = myExperiences.length > 0 || myAnswers.length > 0;
  const hasInterviewContrib = myExperiences.length >= 1;
  const hasTenContrib = myExperiences.length >= 10;
  const hasHelpfulAnswer = myAnswers.some((a) => a.upvotes >= 5);

  const badges = [
    { title: 'First Contribution', desc: 'Contributed your first experience or answer', unlocked: hasFirstContrib },
    { title: 'Interview Contributor', desc: 'Shared complete interview round details', unlocked: hasInterviewContrib },
    { title: 'Helpful Contributor', desc: 'Received 5+ community upvotes on answers', unlocked: hasHelpfulAnswer },
    { title: '10 Experiences', desc: 'Contributed 10+ campus/off-campus breakdowns', unlocked: hasTenContrib },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Profile Header Card */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Student'}
              className="w-16 h-16 rounded-2xl border border-slate-200 object-cover shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
              {user.displayName?.charAt(0) || 'S'}
            </div>
          )}

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900">
              {userProfile?.name || user.displayName}
            </h1>
            <p className="text-xs text-slate-500">{user.email}</p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                <Building className="w-3.5 h-3.5" />
                {userProfile?.college || 'College not set yet'}
              </span>
              {userProfile?.branch && (
                <span>· {userProfile.branch} ({userProfile.degree})</span>
              )}
              {userProfile?.graduationYear && (
                <span>· Class of {userProfile.graduationYear}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={logout}
            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Contributor Badges */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Earned Contributor Badges
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((b, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border transition-all ${
                b.unlocked
                  ? 'bg-indigo-50/50 border-indigo-200 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Award className={`w-5 h-5 ${b.unlocked ? 'text-indigo-600' : 'text-slate-400'}`} />
                {b.unlocked && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Unlocked
                  </span>
                )}
              </div>
              <h4 className="font-bold text-xs">{b.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contributions & Bookmarks Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'bookmarks'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${activeTab === 'bookmarks' ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
              <span>Saved Bookmarks ({bookmarkedExperiences.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('experiences')}
              className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'experiences'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Submissions ({myExperiences.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('answers')}
              className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'answers'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>My Answers ({myAnswers.length})</span>
            </button>
          </div>

          <button
            onClick={onOpenSubmit}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Submit Experience</span>
          </button>
        </div>

        {/* Content of selected tab */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading student records...</div>
        ) : activeTab === 'bookmarks' ? (
          bookmarkedExperiences.length === 0 ? (
            <div className="p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
              <Bookmark className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Bookmarked Experiences Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Save your favorite or most relevant interview experiences when browsing companies so you can review their rounds and coding questions right before your interview drives.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkedExperiences.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => onSelectExperience(exp)}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                        {exp.companyName}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        — {exp.role} ({exp.interviewType})
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700">
                        {exp.year}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      "{exp.experienceText}"
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {exp.technologies?.slice(0, 4).map((tech) => (
                        <span key={tech} className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded">
                          {tech}
                        </span>
                      ))}
                      <span className="text-[11px] text-slate-400">
                        {exp.rounds.length} rounds
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {onUpvoteExperience && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpvoteExperience(exp);
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 border transition-colors ${
                          user && exp.upvotedBy?.includes(user.uid)
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                        title="Upvote as helpful"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${user && exp.upvotedBy?.includes(user.uid) ? 'fill-indigo-600 text-indigo-600' : 'text-slate-400'}`} />
                        <span>{exp.upvotes || 0}</span>
                      </button>
                    )}

                    {onToggleBookmark && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(exp);
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Remove from saved bookmarks"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                        <span>Saved</span>
                      </button>
                    )}

                    <span className="text-indigo-600 text-xs font-semibold flex items-center gap-0.5">
                      Review <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'experiences' ? (
          myExperiences.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">You haven't submitted any interview experiences yet.</p>
              <p className="text-[11px] text-slate-500">Share your latest campus drive to help juniors prepare.</p>
              <button
                onClick={onOpenSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold mt-2"
              >
                + Submit Experience
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myExperiences.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => onSelectExperience(exp)}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {exp.companyName}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        — {exp.role} ({exp.interviewType})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 italic">
                      "{exp.experienceText}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      exp.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : exp.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {exp.status === 'approved' && '🟢 Live (Approved)'}
                      {exp.status === 'pending' && '🟡 In Review (Pending)'}
                      {exp.status === 'rejected' && '🔴 Rejected'}
                    </span>

                    <span className="text-indigo-600 text-xs font-semibold">View →</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          myAnswers.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">You haven't posted any answers yet.</p>
              <p className="text-[11px] text-slate-500">Go to the Question Bank to answer and earn upvotes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myAnswers.map((ans) => (
                <div key={ans.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    "{ans.answerText}"
                  </p>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>Upvotes: {ans.upvotes}</span>
                    <span>Posted on {new Date(ans.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
