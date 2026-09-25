import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProfileModal } from './components/ProfileModal';
import { SubmitExperienceModal } from './components/SubmitExperienceModal';
import { ExperienceDetailModal } from './components/ExperienceDetailModal';
import { QuestionDetailModal } from './components/QuestionDetailModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { HomeView } from './views/HomeView';
import { CompaniesView } from './views/CompaniesView';
import { CompanyDetailView } from './views/CompanyDetailView';
import { QuestionsView } from './views/QuestionsView';
import { ExperiencesView } from './views/ExperiencesView';
import { RepeatedQuestionsView } from './views/RepeatedQuestionsView';
import { CommunityView } from './views/CommunityView';
import { ProfileView } from './views/ProfileView';
import { AdminDashboardView } from './views/AdminDashboardView';

import { Company, InterviewExperience, Question } from './types';
import { db } from './lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreErrors';
import {
  checkAndSeedInitialData,
  INITIAL_COMPANIES,
  INITIAL_EXPERIENCES,
  INITIAL_QUESTIONS
} from './lib/seedData';

function MainApp() {
  const { user, isAdmin, signInWithGoogle, toggleBookmarkExperience } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<InterviewExperience | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitModalInitialCompanyId, setSubmitModalInitialCompanyId] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [questionsFilterParam, setQuestionsFilterParam] = useState<string | undefined>(undefined);

  // Firestore collections with initial baseline data
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [experiences, setExperiences] = useState<InterviewExperience[]>(INITIAL_EXPERIENCES);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Seed check: ONLY run when verified admin is signed in
  useEffect(() => {
    if (isAdmin) {
      checkAndSeedInitialData().catch((e) => {
        console.warn('Admin seed attempt:', e);
      });
    }
  }, [isAdmin]);

  // Listen to companies
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'companies'),
      (snapshot) => {
        if (!snapshot.empty) {
          const comps: Company[] = [];
          snapshot.forEach((doc) => comps.push(doc.data() as Company));
          setCompanies(comps);
        }
        setLoadingInitial(false);
      },
      (error) => {
        console.warn('Companies snapshot notice:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen to approved experiences
  useEffect(() => {
    const q = query(collection(db, 'experiences'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const exps: InterviewExperience[] = [];
          snapshot.forEach((doc) => exps.push(doc.data() as InterviewExperience));
          // Sort newest first
          exps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setExperiences(exps);
        }
      },
      (error) => {
        console.warn('Experiences snapshot notice:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen to approved questions
  useEffect(() => {
    const q = query(collection(db, 'questions'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const qs: Question[] = [];
          snapshot.forEach((doc) => qs.push(doc.data() as Question));
          // Sort highest asked first
          qs.sort((a, b) => b.askedCount - a.askedCount);
          setQuestions(qs);
        }
      },
      (error) => {
        console.warn('Questions snapshot notice:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSelectTab = (tab: string, param?: string) => {
    if (tab === 'questions' && param) {
      setQuestionsFilterParam(param);
    } else {
      setQuestionsFilterParam(undefined);
    }
    if (tab !== 'company-detail') {
      setSelectedCompanyId(null);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setCurrentTab('company-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubmit = (companyId?: string) => {
    setSubmitModalInitialCompanyId(companyId || null);
    setIsSubmitModalOpen(true);
  };

  const handleUpvoteExperience = async (experience: InterviewExperience) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    const hasUpvoted = Boolean(experience.upvotedBy?.includes(user.uid));
    const newUpvotes = Math.max(0, (experience.upvotes || 0) + (hasUpvoted ? -1 : 1));
    const newUpvotedBy = hasUpvoted
      ? (experience.upvotedBy || []).filter((id) => id !== user.uid)
      : [...(experience.upvotedBy || []), user.uid];

    const updatedExperience = {
      ...experience,
      upvotes: newUpvotes,
      upvotedBy: newUpvotedBy,
    };

    setExperiences((prev) =>
      prev.map((e) => (e.id === experience.id ? updatedExperience : e))
    );
    if (selectedExperience && selectedExperience.id === experience.id) {
      setSelectedExperience(updatedExperience);
    }

    try {
      const expDocRef = doc(db, 'experiences', experience.id);
      await updateDoc(expDocRef, {
        upvotes: increment(hasUpvoted ? -1 : 1),
        upvotedBy: hasUpvoted ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (err) {
      setExperiences((prev) =>
        prev.map((e) => (e.id === experience.id ? experience : e))
      );
      if (selectedExperience && selectedExperience.id === experience.id) {
        setSelectedExperience(experience);
      }
      handleFirestoreError(err, OperationType.UPDATE, `experiences/${experience.id}`);
    }
  };

  const handleUpvoteQuestion = async (question: Question) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    const hasUpvoted = Boolean(question.upvotedBy?.includes(user.uid));
    const newUpvotes = Math.max(0, (question.upvotes || 0) + (hasUpvoted ? -1 : 1));
    const newUpvotedBy = hasUpvoted
      ? (question.upvotedBy || []).filter((id) => id !== user.uid)
      : [...(question.upvotedBy || []), user.uid];

    const updatedQuestion = {
      ...question,
      upvotes: newUpvotes,
      upvotedBy: newUpvotedBy,
    };

    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? updatedQuestion : q))
    );
    if (selectedQuestion && selectedQuestion.id === question.id) {
      setSelectedQuestion(updatedQuestion);
    }

    try {
      const qDocRef = doc(db, 'questions', question.id);
      await updateDoc(qDocRef, {
        upvotes: increment(hasUpvoted ? -1 : 1),
        upvotedBy: hasUpvoted ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (err) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? question : q))
      );
      if (selectedQuestion && selectedQuestion.id === question.id) {
        setSelectedQuestion(question);
      }
      handleFirestoreError(err, OperationType.UPDATE, `questions/${question.id}`);
    }
  };

  const handleToggleBookmark = async (experience: InterviewExperience) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    const isNowBookmarked = await toggleBookmarkExperience(experience.id);
    const newBookmarkedBy = isNowBookmarked
      ? [...(experience.bookmarkedBy || []).filter((id) => id !== user.uid), user.uid]
      : (experience.bookmarkedBy || []).filter((id) => id !== user.uid);

    const updatedExp = {
      ...experience,
      bookmarkedBy: newBookmarkedBy,
    };

    setExperiences((prev) =>
      prev.map((e) => (e.id === experience.id ? updatedExp : e))
    );
    if (selectedExperience && selectedExperience.id === experience.id) {
      setSelectedExperience(updatedExp);
    }
  };

  const currentCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-900 selection:bg-orange-100 selection:text-orange-900 font-sans">
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenSubmit={() => handleOpenSubmit()}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            companies={companies}
            experiences={experiences}
            questions={questions}
            onSelectTab={handleSelectTab}
            onSelectCompany={handleSelectCompany}
            onSelectExperience={setSelectedExperience}
            onSelectQuestion={setSelectedQuestion}
            onOpenSubmit={() => handleOpenSubmit()}
            onUpvoteExperience={handleUpvoteExperience}
            onToggleBookmark={handleToggleBookmark}
            onUpvoteQuestion={handleUpvoteQuestion}
          />
        )}

        {currentTab === 'companies' && (
          <CompaniesView
            companies={companies}
            onSelectCompany={handleSelectCompany}
            onOpenSubmit={() => handleOpenSubmit()}
          />
        )}

        {currentTab === 'company-detail' && currentCompany && (
          <CompanyDetailView
            company={currentCompany}
            experiences={experiences}
            questions={questions}
            onBack={() => setCurrentTab('companies')}
            onSelectExperience={setSelectedExperience}
            onSelectQuestion={setSelectedQuestion}
            onOpenSubmit={handleOpenSubmit}
            onUpvoteExperience={handleUpvoteExperience}
            onToggleBookmark={handleToggleBookmark}
            onUpvoteQuestion={handleUpvoteQuestion}
          />
        )}

        {currentTab === 'questions' && (
          <QuestionsView
            questions={questions}
            initialFilter={questionsFilterParam}
            onSelectQuestion={setSelectedQuestion}
            onOpenSubmit={() => handleOpenSubmit()}
            onUpvoteQuestion={handleUpvoteQuestion}
          />
        )}

        {currentTab === 'experiences' && (
          <ExperiencesView
            experiences={experiences}
            companies={companies}
            onSelectExperience={setSelectedExperience}
            onSelectCompany={handleSelectCompany}
            onOpenSubmit={() => handleOpenSubmit()}
            onUpvoteExperience={handleUpvoteExperience}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentTab === 'repeated' && (
          <RepeatedQuestionsView
            questions={questions}
            onSelectQuestion={setSelectedQuestion}
            onOpenSubmit={() => handleOpenSubmit()}
            onUpvoteQuestion={handleUpvoteQuestion}
          />
        )}

        {currentTab === 'community' && (
          <CommunityView
            questions={questions}
            experiences={experiences}
            onSelectQuestion={setSelectedQuestion}
            onSelectExperience={setSelectedExperience}
            onOpenSubmit={() => handleOpenSubmit()}
            onUpvoteExperience={handleUpvoteExperience}
            onToggleBookmark={handleToggleBookmark}
            onUpvoteQuestion={handleUpvoteQuestion}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            allExperiences={experiences}
            onSelectExperience={setSelectedExperience}
            onSelectQuestion={setSelectedQuestion}
            onOpenSubmit={() => handleOpenSubmit()}
            onUpvoteExperience={handleUpvoteExperience}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardView
            onRefreshData={() => {
              // snapshot will refresh automatically
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onSelectTab={handleSelectTab} />

      {/* Profile Setup / Edit Modal */}
      <ProfileModal />

      {/* Multi-Step Submit Experience Modal */}
      <SubmitExperienceModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setSubmitModalInitialCompanyId(null);
        }}
        companies={companies}
        initialCompanyId={submitModalInitialCompanyId}
        onExperienceSubmitted={() => {
          // Handled
        }}
      />

      {/* Experience Details & AI Prep Modal */}
      <ExperienceDetailModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
        onSelectCompany={handleSelectCompany}
        onUpvote={() => selectedExperience && handleUpvoteExperience(selectedExperience)}
        onToggleBookmark={() => selectedExperience && handleToggleBookmark(selectedExperience)}
      />

      {/* Question Details & Community Answers Modal */}
      <QuestionDetailModal
        question={selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        onQuestionUpdated={(updated) => {
          setSelectedQuestion(updated);
        }}
        onUpvoteQuestion={() => selectedQuestion && handleUpvoteQuestion(selectedQuestion)}
      />

      {/* Global Search Modal (⌘K) */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        companies={companies}
        questions={questions}
        experiences={experiences}
        onSelectCompany={handleSelectCompany}
        onSelectQuestion={setSelectedQuestion}
        onSelectExperience={setSelectedExperience}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
