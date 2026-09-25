import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  Award,
  LogOut,
  Edit3,
  Bookmark,
  ThumbsUp,
  ChevronRight
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
}) => {
  const { user, userProfile, logout, setIsProfileModalOpen, signInWithGoogle } = useAuth();
  const [myExperiences, setMyExperiences] = useState<InterviewExperience[]>([]);
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

        // Fetch answers
        const ansSnap = await getDocs(
          query(collection(db, 'answers'), where('authorId', '==', user.uid))
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
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Your Profile</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Sign in with Google to view your contributions, submission statuses, earned badges, and university attribution.
        </p>
        <button
          onClick={signInWithGoogle}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-2xs transition-colors"
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Student Profile Header Card */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Student'}
              className="w-12 h-12 rounded-xl border border-slate-200 object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0">
              {user.displayName?.charAt(0) || 'S'}
            </div>
          )}

          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-slate-900">
              {userProfile?.name || user.displayName}
            </h1>
            <p className="text-xs text-slate-500">{user.email}</p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                <Building className="w-3 h-3" />
                {userProfile?.college || 'College not set'}
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

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Contributor Badges */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-indigo-600" />
          Placement Contribution Badges
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((b, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                b.unlocked
                  ? 'bg-white border-slate-200/90 text-slate-900 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/60 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 block truncate">{b.title}</span>
                {b.unlocked && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Tabs (Bookmarks, My Experiences, My Answers) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Bookmarks ({bookmarkedExperiences.length})
          </button>
          <button
            onClick={() => setActiveTab('experiences')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'experiences'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Submissions ({myExperiences.length})
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'answers'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Community Answers ({myAnswers.length})
          </button>
        </div>

        {/* Tab 1: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            {bookmarkedExperiences.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
                You haven't bookmarked any interview experiences yet. Browse experiences and click Bookmark to save them for revision!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {bookmarkedExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => onSelectExperience(exp)}
                    className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {exp.companyName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                            exp.result === 'Selected'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {exp.result}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{exp.role} · {exp.interviewType}</p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {exp.experienceText}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{exp.rounds.length} rounds</span>
                      <span className="text-indigo-600 font-medium">View details →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Experiences */}
        {activeTab === 'experiences' && (
          <div className="space-y-3">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading your experiences...</div>
            ) : myExperiences.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs sm:text-sm space-y-3">
                <p>You haven't submitted any interview experiences yet.</p>
                <button
                  onClick={onOpenSubmit}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium"
                >
                  Share Your First Experience
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => onSelectExperience(exp)}
                    className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {exp.companyName}
                        </h3>
                        <span className="text-xs text-slate-500">· {exp.role}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                            exp.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {exp.status === 'approved' ? 'Live & Published' : 'In Moderation'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                        {exp.experienceText}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-indigo-600 shrink-0">
                      View →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Answers */}
        {activeTab === 'answers' && (
          <div className="space-y-3">
            {myAnswers.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
                No answers posted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {myAnswers.map((ans) => (
                  <div
                    key={ans.id}
                    className="p-4 bg-white rounded-xl border border-slate-200/90 space-y-2"
                  >
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {ans.answerText}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>{new Date(ans.createdAt).toLocaleDateString()}</span>
                      <span className="font-medium text-indigo-600">{ans.upvotes} Upvotes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
