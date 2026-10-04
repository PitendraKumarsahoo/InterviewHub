import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  Plus,
  Trash2,
  Send,
  Layers,
  Code2,
  HelpCircle,
  FileCheck2,
  AlertCircle,
  Search,
  Edit3,
  Star,
  Tag,
  Hash
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, updateDoc, increment } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { Company, InterviewType, InterviewResult, DifficultyLevel, RoundDetail } from '../types';
import { StatusTag, parseApplicantStatus } from './StatusIndicator';

interface SubmitExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  initialCompanyId?: string | null;
  onExperienceSubmitted: () => void;
}

const COMMON_TECHNOLOGIES = [
  'Java', 'Python', 'C', 'C++', 'JavaScript', 'TypeScript', 'SQL',
  'React', 'Node.js', 'Spring Boot', 'Django', 'REST API',
  'DSA', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks',
  'Machine Learning', 'Deep Learning', 'Power BI', 'Excel', 'Tableau',
  'Cloud', 'AWS', 'Azure', 'System Design', 'Git', 'Docker'
];

const AVAILABLE_ROUNDS = [
  'Aptitude & Reasoning',
  'Coding Round',
  'Technical Interview 1',
  'Technical Interview 2',
  'Group Discussion (GD)',
  'Managerial Round',
  'HR Round',
];

const DOMAIN_TAGS = [
  'Backend',
  'Frontend',
  'Full Stack',
  'Mobile (Android/iOS)',
  'Cloud & DevOps',
  'AI & Machine Learning',
  'Data Science & Analytics',
  'Cybersecurity',
  'QA & Testing',
  'Systems & Embedded',
  'FinTech',
  'E-Commerce',
  'Enterprise SaaS',
  'Consulting'
];

const SKILL_TAGS = [
  'DSA & Problem Solving',
  'System Design',
  'DBMS & SQL',
  'Object Oriented Programming',
  'Operating Systems',
  'Computer Networks',
  'REST APIs & Microservices',
  'Live Coding / Whiteboard',
  'Behavioral & STAR Method',
  'Aptitude & Puzzles',
  'Concurrency & Threads',
  'Cloud Architecture'
];

export const SubmitExperienceModal: React.FC<SubmitExperienceModalProps> = ({
  isOpen,
  onClose,
  companies,
  initialCompanyId,
  onExperienceSubmitted,
}) => {
  const { user, userProfile, isAdmin, signInWithGoogle } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Step 1: Company & Role
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  const [isCustomCompany, setIsCustomCompany] = useState(false);
  const [isCompanySelectorOpen, setIsCompanySelectorOpen] = useState(false);

  const [customCompanyName, setCustomCompanyName] = useState('');
  const [customCategory, setCustomCategory] = useState('Software Engineering');
  const [customType, setCustomType] = useState('Service');

  const [role, setRole] = useState('Software Engineer');
  const [interviewType, setInterviewType] = useState<InterviewType>('Campus');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Step 2: Rounds selection
  const [selectedRounds, setSelectedRounds] = useState<string[]>([
    'Aptitude & Reasoning',
    'Technical Interview 1',
    'HR Round',
  ]);

  // Step 3: Round questions
  const [roundsData, setRoundsData] = useState<{ [round: string]: string[] }>({
    'Aptitude & Reasoning': [''],
    'Technical Interview 1': [''],
    'HR Round': [''],
  });

  // Step 4: Technologies & Domain / Skill Tags
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['Java', 'SQL', 'OOP', 'DSA']);
  const [customTechInput, setCustomTechInput] = useState('');

  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Backend',
    'DSA & Problem Solving',
    'DBMS & SQL'
  ]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [tagCategoryFilter, setTagCategoryFilter] = useState<'all' | 'domains' | 'skills'>('all');

  // Step 5: Overall experience & advice
  const [experienceText, setExperienceText] = useState('');
  const [advice, setAdvice] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Moderate');
  const [overallRating, setOverallRating] = useState<number>(4);

  // Step 6: Final selection result
  const [result, setResult] = useState<InterviewResult>('Selected');

  // Sync / Initialize company whenever modal opens or initialCompanyId changes
  useEffect(() => {
    if (isOpen) {
      if (initialCompanyId) {
        const found = companies.find(c => c.id === initialCompanyId);
        if (found) {
          setSelectedCompanyId(found.id);
          setSelectedCompanyName(found.name);
          setIsCustomCompany(false);
          setIsCompanySelectorOpen(false);
        } else {
          setSelectedCompanyId('custom');
          setSelectedCompanyName(initialCompanyId);
          setCustomCompanyName(initialCompanyId);
          setIsCustomCompany(true);
          setIsCompanySelectorOpen(false);
        }
      } else if (!selectedCompanyId && companies.length > 0) {
        const first = companies[0];
        setSelectedCompanyId(first.id);
        setSelectedCompanyName(first.name);
        setIsCustomCompany(false);
        setIsCompanySelectorOpen(false);
      }
    }
  }, [isOpen, initialCompanyId, companies]);

  if (!isOpen) return null;

  // Filtered company suggestions when typing
  const cleanQuery = companySearchQuery.trim().toLowerCase();
  const matchedCompanies = cleanQuery
    ? companies.filter(
        c =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.slug.toLowerCase().includes(cleanQuery)
      )
    : companies;

  const handleSelectExistingCompany = (c: Company) => {
    setSelectedCompanyId(c.id);
    setSelectedCompanyName(c.name);
    setIsCustomCompany(false);
    setIsCompanySelectorOpen(false);
    setCompanySearchQuery('');
  };

  const handleSelectCustomCompany = (typedName: string) => {
    const trimmed = typedName.trim();
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-');
    setSelectedCompanyId('custom');
    setSelectedCompanyName(trimmed);
    setCustomCompanyName(trimmed);
    setIsCustomCompany(true);
    setIsCompanySelectorOpen(false);
    setCompanySearchQuery('');
  };

  const handleToggleRound = (round: string) => {
    if (selectedRounds.includes(round)) {
      setSelectedRounds(selectedRounds.filter(r => r !== round));
      const newMap = { ...roundsData };
      delete newMap[round];
      setRoundsData(newMap);
    } else {
      setSelectedRounds([...selectedRounds, round]);
      setRoundsData({ ...roundsData, [round]: [''] });
    }
  };

  const handleAddQuestionToRound = (round: string) => {
    const currentQuestions = roundsData[round] || [];
    setRoundsData({
      ...roundsData,
      [round]: [...currentQuestions, ''],
    });
  };

  const handleUpdateQuestion = (round: string, index: number, value: string) => {
    const list = [...(roundsData[round] || [])];
    list[index] = value;
    setRoundsData({
      ...roundsData,
      [round]: list,
    });
  };

  const handleRemoveQuestion = (round: string, index: number) => {
    const list = [...(roundsData[round] || [])];
    list.splice(index, 1);
    setRoundsData({
      ...roundsData,
      [round]: list,
    });
  };

  const handleToggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter(t => t !== tech));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
  };

  const handleAddCustomTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTechInput.trim() && !selectedTechs.includes(customTechInput.trim())) {
      setSelectedTechs([...selectedTechs, customTechInput.trim()]);
      setCustomTechInput('');
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const resetForm = () => {
    setStep(1);
    if (companies.length > 0) {
      setSelectedCompanyId(companies[0].id);
      setSelectedCompanyName(companies[0].name);
      setIsCustomCompany(false);
    }
    setIsCompanySelectorOpen(false);
    setCompanySearchQuery('');
    setRole('Software Engineer');
    setInterviewType('Campus');
    setSelectedRounds(['Aptitude & Reasoning', 'Technical Interview 1', 'HR Round']);
    setRoundsData({
      'Aptitude & Reasoning': [''],
      'Technical Interview 1': [''],
      'HR Round': [''],
    });
    setSelectedTechs(['Java', 'SQL', 'OOP', 'DSA']);
    setSelectedTags(['Backend', 'DSA & Problem Solving', 'DBMS & SQL']);
    setCustomTagInput('');
    setExperienceText('');
    setAdvice('');
    setDifficulty('Moderate');
    setOverallRating(4);
    setResult('Selected');
  };

  const handleSubmit = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    setSubmitting(true);
    try {
      let compId = selectedCompanyId;
      let compName = selectedCompanyName || customCompanyName;

      const slug = compName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (!compId || compId === 'custom' || isCustomCompany) {
        compId = slug;
      }

      const structuredRounds: RoundDetail[] = selectedRounds.map(r => ({
        roundName: r,
        questions: (roundsData[r] || []).filter(q => q.trim().length > 0),
      }));

      const totalQuestionsCount = structuredRounds.reduce(
        (acc, r) => acc + r.questions.length,
        0
      );

      // Ensure company doc exists or update counts
      const compRef = doc(db, 'companies', compId);
      const companyAlreadyExists = companies.some(c => c.id === compId);

      if (!companyAlreadyExists) {
        await setDoc(compRef, {
          id: compId,
          name: compName,
          slug: compId,
          category: customCategory || 'Software Engineering',
          type: customType || 'Product',
          description: `${compName} placement drive experiences and interview questions.`,
          experienceCount: 1,
          questionCount: totalQuestionsCount,
          viewCount: 1,
          createdAt: new Date().toISOString(),
        });
      } else {
        await updateDoc(compRef, {
          experienceCount: increment(1),
          questionCount: increment(totalQuestionsCount),
        });
      }

      const experienceId = `exp-${Date.now()}`;
      const expDocRef = doc(db, 'experiences', experienceId);

      // Submissions are live and approved immediately so all people can see them
      const status = 'approved';

      const experiencePayload = {
        id: experienceId,
        userId: user.uid,
        authorName: userProfile?.name || user.displayName || 'Student Contributor',
        authorCollege: userProfile?.college || 'Engineering Campus',
        companyId: compId,
        companyName: compName,
        role,
        interviewType,
        year: Number(year),
        result,
        difficulty,
        rounds: structuredRounds,
        technologies: selectedTechs,
        tags: selectedTags,
        experienceText: experienceText || 'Detailed interview experience.',
        advice: advice || 'Focus on core subjects and problem solving.',
        overallRating,
        upvotes: 0,
        upvotedBy: [],
        bookmarkedBy: [],
        status,
        createdAt: new Date().toISOString(),
      };

      await setDoc(expDocRef, experiencePayload);

      // Add individual questions to the questions bank with author userId
      for (const round of structuredRounds) {
        for (const qText of round.questions) {
          if (qText.trim()) {
            const qId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const roundLower = round.roundName.toLowerCase();
            const isCoding = roundLower.includes('coding') || roundLower.includes('online assessment') || roundLower.includes('oa');
            const isGD = roundLower.includes('gd') || roundLower.includes('group discussion');
            const isHR = roundLower.includes('hr') || roundLower.includes('human resource') || roundLower.includes('behavioral');
            const isAptitude = roundLower.includes('aptitude');
            const qPayload = {
              id: qId,
              userId: user.uid,
              authorName: userProfile?.name || user.displayName || 'Student Contributor',
              companyId: compId,
              companyName: compName,
              experienceId,
              type: isCoding ? 'Coding' : isGD ? 'GD' : isHR ? 'HR' : isAptitude ? 'Aptitude' : 'Technical',
              questionText: qText.trim(),
              normalizedText: qText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(),
              technology: selectedTechs[0] || 'General',
              difficulty: difficulty === 'Difficult' ? 'Hard' : (difficulty === 'Easy' ? 'Easy' : 'Medium'),
              askedCount: 1,
              askedByUserIds: [user.uid],
              status: 'approved',
              companiesAsked: [compName],
              upvotes: 0,
              upvotedBy: [],
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'questions', qId), qPayload);
          }
        }
      }

      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onExperienceSubmitted();
        resetForm();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Submission error:', err);
      handleFirestoreError(err, OperationType.CREATE, 'experiences');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Top Modal Header */}
        <div className="bg-slate-50 px-6 py-4.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black text-base shadow-xs">
              {step}/6
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                {step === 1 && 'Step 1: Company & Placement Track'}
                {step === 2 && 'Step 2: Interview Rounds'}
                {step === 3 && 'Step 3: Questions per Round'}
                {step === 4 && 'Step 4: Tech Stack, Domain & Skill Tags'}
                {step === 5 && 'Step 5: Overall Experience & Advice'}
                {step === 6 && 'Step 6: Final Result & Review'}
              </h3>
              <p className="text-sm sm:text-base text-slate-600">
                Click any step tab below to jump directly and edit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clickable Step Navigation Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-100/90 border-b border-slate-200 overflow-x-auto flex items-center gap-2">
          {[
            { num: 1, label: '1. Company' },
            { num: 2, label: '2. Rounds' },
            { num: 3, label: '3. Questions' },
            { num: 4, label: '4. Tech & Tags' },
            { num: 5, label: '5. Advice' },
            { num: 6, label: '6. Review' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-sm sm:text-base ${
                step === s.num
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6 text-base">
          {!user && (
            <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3.5 text-sm sm:text-base text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Sign in required to publish: </span>
                You can draft your experience now. When you click Submit, you will be prompted to sign in with Google.
              </div>
            </div>
          )}

          {/* STEP 1: Company & Role */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-base font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>Company Name *</span>
                  {selectedCompanyName && !isCompanySelectorOpen && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompanySelectorOpen(true);
                        setCompanySearchQuery('');
                      }}
                      className="text-sm sm:text-base text-orange-600 hover:text-orange-700 font-bold normal-case flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      Change Company
                    </button>
                  )}
                </label>

                {/* Selected Company Card (when selected and not in search mode) */}
                {selectedCompanyName && !isCompanySelectorOpen ? (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                        {selectedCompanyName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-lg block">
                          {selectedCompanyName}
                        </span>
                        <span className="text-sm text-slate-600">
                          {isCustomCompany
                            ? `${customCategory} · ${customType} (New Company Track)`
                            : `${companies.find(c => c.id === selectedCompanyId)?.category || 'Software Engineering'} · ${companies.find(c => c.id === selectedCompanyId)?.type || 'Service'}`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompanySelectorOpen(true);
                        setCompanySearchQuery('');
                      }}
                      className="px-4 py-2 text-sm sm:text-base font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors cursor-pointer border border-orange-200"
                    >
                      Change Company
                    </button>
                  </div>
                ) : (
                  /* Search / Type Company Name Input */
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in">
                    <div className="relative">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Type company name (e.g. TCS, Infosys, Amazon, Google, Wipro, Accenture)..."
                        value={companySearchQuery}
                        onChange={(e) => setCompanySearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && companySearchQuery.trim()) {
                            e.preventDefault();
                            if (matchedCompanies.length > 0 && matchedCompanies[0].name.toLowerCase() === cleanQuery) {
                              handleSelectExistingCompany(matchedCompanies[0]);
                            } else {
                              handleSelectCustomCompany(companySearchQuery);
                            }
                          }
                        }}
                        className="w-full px-4 py-3.5 pl-11 pr-10 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white font-medium"
                      />
                      <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
                      {companySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCompanySearchQuery('')}
                          className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Add as new custom company prompt if typed */}
                    {companySearchQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => handleSelectCustomCompany(companySearchQuery)}
                        className="w-full text-left p-3.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-base font-bold text-orange-950 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Plus className="w-5 h-5 text-orange-600" />
                          <span>Use "<strong className="text-orange-700">{companySearchQuery.trim()}</strong>" as company</span>
                        </span>
                        <span className="text-sm bg-white px-3 py-1.5 rounded-lg text-orange-700 border border-orange-200 font-bold shadow-2xs">
                          Select
                        </span>
                      </button>
                    )}

                    {/* Matched Companies List */}
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pt-1">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-500 block px-1">
                        {companySearchQuery ? `Matching Companies (${matchedCompanies.length})` : 'Popular Companies'}
                      </span>
                      {matchedCompanies.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectExistingCompany(c)}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-white flex items-center justify-between text-base transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 group-hover:text-orange-600">
                              {c.name}
                            </span>
                            <span className="text-sm text-slate-500">
                              · {c.category} ({c.type})
                            </span>
                          </div>
                          <span className="text-sm text-orange-600 opacity-0 group-hover:opacity-100 font-bold transition-opacity">
                            Choose →
                          </span>
                        </button>
                      ))}
                    </div>

                    {selectedCompanyName && (
                      <div className="pt-3 border-t border-slate-200 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsCompanySelectorOpen(false)}
                          className="text-sm sm:text-base text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
                        >
                          Keep "{selectedCompanyName}"
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Custom Company Details (if custom company selected) */}
              {isCustomCompany && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-base font-bold text-slate-900 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wipro / Accenture / Microsoft"
                      value={customCompanyName}
                      onChange={(e) => {
                        setCustomCompanyName(e.target.value);
                        setSelectedCompanyName(e.target.value);
                      }}
                      className="w-full px-4 py-3.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-bold text-slate-900 mb-2">
                        Category
                      </label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                      >
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Data Analytics">Data Analytics</option>
                        <option value="AI/ML">AI / ML</option>
                        <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-base font-bold text-slate-900 mb-2">
                        Type
                      </label>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                      >
                        <option value="Service">Service</option>
                        <option value="Product">Product</option>
                        <option value="Startup">Startup</option>
                        <option value="Consulting">Consulting</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Role & Drive Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-bold text-slate-900 mb-2">
                    Job Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer / SDE-1 / Data Analyst"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-base font-medium"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-slate-900 mb-2">
                    Interview Type *
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-base font-medium"
                  >
                    <option value="Campus">On-Campus Placement</option>
                    <option value="Off-campus">Off-Campus Drive</option>
                    <option value="Internship">Internship / PPO</option>
                    <option value="PPO">PPO Conversion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-slate-900 mb-2">
                  Placement Drive Year
                </label>
                <input
                  type="number"
                  min={2020}
                  max={2030}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-base font-medium"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Rounds Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg sm:text-xl">Select Interview Rounds</h4>
                  <p className="text-slate-600 text-sm sm:text-base mt-1">
                    Which rounds were conducted during your campus or off-campus evaluation?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {AVAILABLE_ROUNDS.map((round) => {
                  const isChecked = selectedRounds.includes(round);
                  return (
                    <button
                      type="button"
                      key={round}
                      onClick={() => handleToggleRound(round)}
                      className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer touch-manipulation ${
                        isChecked
                          ? 'border-orange-600 bg-orange-50 text-slate-950 font-black shadow-xs ring-2 ring-orange-500/20'
                          : 'border-slate-300 hover:border-slate-500 text-slate-800 bg-white hover:bg-slate-50 font-bold shadow-2xs'
                      }`}
                    >
                      <span className="text-base sm:text-lg font-bold">{round}</span>
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-colors ${
                          isChecked
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Questions per round */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg sm:text-xl">Questions Asked in Each Round</h4>
                  <p className="text-slate-600 text-sm sm:text-base mt-1">
                    Enter the questions and problems you faced during each round:
                  </p>
                </div>
              </div>

              {selectedRounds.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-base font-bold text-slate-800">No rounds selected.</p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-base text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    ← Click here to select rounds in Step 2
                  </button>
                </div>
              ) : (
                selectedRounds.map((round) => (
                  <div key={round} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-lg flex items-center gap-2.5">
                        <Layers className="w-5 h-5 text-orange-600" />
                        {round}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddQuestionToRound(round)}
                        className="text-sm sm:text-base text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Add Question
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(roundsData[round] || []).map((q, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder={`e.g. Question #${idx + 1} asked in ${round}...`}
                            value={q}
                            onChange={(e) => handleUpdateQuestion(round, idx, e.target.value)}
                            className="flex-1 px-4 py-3 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white font-medium"
                          />
                          {(roundsData[round]?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(round, idx)}
                              className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* STEP 4: Tech Stack, Domain & Skill Tags */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Categorization & Tagging System */}
              <div className="p-5 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-orange-600" />
                      <span>Domain &amp; Skill Categorization Tags *</span>
                    </label>
                    <p className="text-slate-600 text-sm sm:text-base mt-1">
                      Categorize your experience by engineering domain or specific skills tested to help candidates find relevant interview tracks.
                    </p>
                  </div>

                  {/* Filter pill switcher */}
                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto text-sm">
                    <button
                      type="button"
                      onClick={() => setTagCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        tagCategoryFilter === 'all'
                          ? 'bg-[#EA580C] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setTagCategoryFilter('domains')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        tagCategoryFilter === 'domains'
                          ? 'bg-[#EA580C] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Domains
                    </button>
                    <button
                      type="button"
                      onClick={() => setTagCategoryFilter('skills')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        tagCategoryFilter === 'skills'
                          ? 'bg-[#EA580C] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Skills
                    </button>
                  </div>
                </div>

                {/* Domain Tags section */}
                {(tagCategoryFilter === 'all' || tagCategoryFilter === 'domains') && (
                  <div className="space-y-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-600 block">
                      Engineering Domains &amp; Tracks:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {DOMAIN_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => handleToggleTag(tag)}
                            className={`px-3.5 py-2 rounded-xl text-sm sm:text-base transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'bg-orange-600 text-white shadow-xs font-black border-2 border-orange-600 ring-2 ring-orange-500/20'
                                : 'bg-white text-slate-800 border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-50 font-bold shadow-2xs'
                            }`}
                          >
                            <span>#{tag}</span>
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Skill Tags section */}
                {(tagCategoryFilter === 'all' || tagCategoryFilter === 'skills') && (
                  <div className="space-y-2 pt-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-600 block">
                      Core Interview Skills &amp; Focus Areas:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {SKILL_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => handleToggleTag(tag)}
                            className={`px-3.5 py-2 rounded-xl text-sm sm:text-base transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'bg-orange-600 text-white shadow-xs font-black border-2 border-orange-600 ring-2 ring-orange-500/20'
                                : 'bg-white text-slate-800 border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-50 font-bold shadow-2xs'
                            }`}
                          >
                            <span>#{tag}</span>
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add Custom Domain or Skill Tag */}
                <div className="pt-3 border-t border-orange-100">
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Add custom skill or domain tag:
                  </label>
                  <div className="flex gap-2.5">
                    <div className="relative flex-1">
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. Distributed Systems, Kubernetes, Kafka, Next.js, Product Management..."
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTag();
                          }
                        }}
                        className="w-full pl-9 pr-3.5 py-2.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddCustomTag()}
                      className="px-4 py-2.5 text-sm sm:text-base font-bold bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>

                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                  <div className="p-4 bg-white rounded-xl border border-orange-200 space-y-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-orange-900 block">
                      Currently Attached Tags ({selectedTags.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-50 text-orange-800 rounded-lg border border-orange-200 font-bold"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="p-1 hover:bg-orange-200/60 rounded-md transition-colors text-orange-700 cursor-pointer"
                            title="Remove tag"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Technologies Tested section */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-base font-bold text-slate-900 mb-1">
                    Technologies Asked During Interview *
                  </label>
                  <p className="text-slate-600 text-sm sm:text-base mb-3">
                    Click chips to select languages, libraries, and frameworks asked during the rounds.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {COMMON_TECHNOLOGIES.map((tech) => {
                      const isSelected = selectedTechs.includes(tech);
                      return (
                        <button
                          type="button"
                          key={tech}
                          onClick={() => handleToggleTech(tech)}
                          className={`px-3.5 py-2 rounded-xl text-sm sm:text-base transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-950 border-2 border-slate-950 text-white shadow-xs font-black'
                              : 'bg-white border-2 border-slate-300 text-slate-900 hover:border-slate-500 hover:bg-slate-50 font-bold shadow-2xs'
                          }`}
                        >
                          {isSelected ? `✓ ${tech}` : `+ ${tech}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add custom technology */}
                <div className="pt-2">
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Add another technology not listed above
                  </label>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      placeholder="e.g. Flutter / Rust / GraphQL / Kafka"
                      value={customTechInput}
                      onChange={(e) => setCustomTechInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTech}
                      className="px-4 py-2.5 text-sm sm:text-base font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                    >
                      Add Chip
                    </button>
                  </div>
                </div>

                {selectedTechs.length > 0 && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-700 block mb-2">
                      Currently Selected Technologies ({selectedTechs.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTechs.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 text-sm bg-white text-slate-800 rounded-lg border border-slate-200 font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Overall experience & advice */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <label className="block text-base font-bold text-slate-900 mb-2">
                  Detailed Experience Description *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe how the interview progressed, atmosphere, interviewer demeanor, coding style expected, and any critical moments..."
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                  className="w-full px-4 py-3.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-slate-900 mb-2">
                  Advice for Juniors &amp; Future Aspirants
                </label>
                <textarea
                  rows={4}
                  placeholder="What should juniors specifically prepare? What mistakes should they avoid? (e.g. Practice talking while coding, revise resume projects thoroughly)"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="w-full px-4 py-3.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-bold text-slate-900 mb-2">
                    Interview Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white font-medium"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Difficult">Difficult</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-bold text-slate-900 mb-2">
                    Overall Experience Rating (1-5)
                  </label>
                  <div className="flex items-center gap-2 pt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setOverallRating(star)}
                        className={`p-1 transition-transform cursor-pointer ${
                          star <= overallRating ? 'text-amber-500 scale-110' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                    <span className="text-base font-bold text-slate-800 ml-2.5">
                      {overallRating}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Final result & preview with DIRECT EDIT LINKS */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <label className="block text-base font-bold text-slate-900 mb-3">
                  What was your final result? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(['Selected', 'Not Selected', 'Still Waiting', 'Waitlisted', 'Prefer not to say'] as InterviewResult[]).map((res) => {
                    const isSelected = result === res;

                    // High contrast colors and indicators for each choice
                    let activeStyles = '';
                    let radioIcon = null;
                    let pillBadge = null;

                    if (res === 'Selected') {
                      activeStyles = 'bg-emerald-50 border-2 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/30 shadow-sm';
                      radioIcon = (
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-700 bg-emerald-700 flex items-center justify-center text-white shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      );
                      pillBadge = <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-700 text-white">Offer Received</span>;
                    } else if (res === 'Not Selected') {
                      activeStyles = 'bg-rose-50 border-2 border-rose-600 text-rose-950 ring-2 ring-rose-500/30 shadow-sm';
                      radioIcon = (
                        <div className="w-5 h-5 rounded-full border-2 border-rose-700 bg-rose-700 flex items-center justify-center text-white shrink-0">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      );
                      pillBadge = <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-700 text-white">Concluded</span>;
                    } else if (res === 'Still Waiting') {
                      activeStyles = 'bg-amber-50 border-2 border-amber-600 text-amber-950 ring-2 ring-amber-500/30 shadow-sm';
                      radioIcon = (
                        <div className="w-5 h-5 rounded-full border-2 border-amber-600 bg-amber-600 flex items-center justify-center text-white shrink-0">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      );
                      pillBadge = <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-700 text-white">In Progress</span>;
                    } else if (res === 'Waitlisted') {
                      activeStyles = 'bg-indigo-50 border-2 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/30 shadow-sm';
                      radioIcon = (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-600 bg-indigo-600 flex items-center justify-center text-white shrink-0">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      );
                      pillBadge = <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-700 text-white">Waitlist</span>;
                    } else {
                      // Prefer not to say
                      activeStyles = 'bg-slate-100 border-2 border-slate-700 text-slate-950 ring-2 ring-slate-400/30 shadow-sm';
                      radioIcon = (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-800 bg-slate-800 flex items-center justify-center text-white shrink-0">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      );
                      pillBadge = <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-white">Confidential</span>;
                    }

                    return (
                      <button
                        type="button"
                        key={res}
                        onClick={() => setResult(res)}
                        className={`min-h-[56px] p-4 rounded-2xl text-left flex items-center justify-between gap-3 transition-all cursor-pointer touch-manipulation group ${
                          isSelected
                            ? `${activeStyles} font-black scale-[1.01]`
                            : 'bg-white border-2 border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-500 font-bold shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            radioIcon
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-400 bg-white group-hover:border-slate-600 shrink-0" />
                          )}
                          <span className="text-sm sm:text-base font-extrabold text-slate-900">{res}</span>
                        </div>
                        {isSelected && pillBadge}
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-slate-600 mt-2.5">
                  Tip: Rejection and in-progress experiences are just as valuable! Sharing where you encountered bottlenecks helps fellow students prepare better.
                </p>
              </div>

              {/* Clean Preview Card with direct 1-click edit links */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                      Submission Summary
                    </span>
                    <StatusTag result={result} size="sm" showDot={true} showPulse={true} />
                  </div>
                  <span className="text-sm text-orange-600 font-bold">
                    Click [Edit] to modify any section
                  </span>
                </div>

                {/* Company & Role row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-slate-900 text-lg sm:text-xl block">
                      {selectedCompanyName || 'No company selected'}
                    </span>
                    <span className="text-sm sm:text-base text-slate-600 mt-0.5 block">
                      {role} · {interviewType} · Year {year}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-bold text-orange-700 hover:text-orange-900 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-orange-100 transition-colors cursor-pointer"
                  >
                    Edit Company &amp; Role
                  </button>
                </div>

                {/* Rounds row */}
                <div className="pt-3 border-t border-slate-200 flex items-start justify-between gap-3">
                  <div className="text-sm sm:text-base text-slate-700 flex-1">
                    <span className="font-bold text-slate-900 block mb-1.5">Rounds &amp; Questions:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedRounds.map((r, i) => (
                        <span key={i} className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-slate-800 text-sm font-semibold">
                          {r} ({(roundsData[r] || []).filter(q => q.trim()).length} Qs)
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-sm font-bold text-orange-700 hover:text-orange-900 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-orange-100 transition-colors shrink-0 cursor-pointer"
                  >
                    Edit Questions
                  </button>
                </div>

                {/* Domain & Skill Tags row */}
                <div className="pt-3 border-t border-slate-200 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block text-sm sm:text-base mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-orange-600" />
                      Domain &amp; Skill Tags:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTags.length > 0 ? (
                        selectedTags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 text-sm bg-orange-50 border border-orange-200 rounded-lg text-orange-800 font-bold">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400 italic">No tags selected</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-sm font-bold text-orange-700 hover:text-orange-900 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-orange-100 transition-colors shrink-0 cursor-pointer"
                  >
                    Edit Tags
                  </button>
                </div>

                {/* Tech row */}
                <div className="pt-3 border-t border-slate-200 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block text-sm sm:text-base mb-1.5">Technologies Tested:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTechs.map(t => (
                        <span key={t} className="px-2.5 py-1 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-sm font-bold text-orange-700 hover:text-orange-900 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-orange-100 transition-colors shrink-0 cursor-pointer"
                  >
                    Edit Tech
                  </button>
                </div>

                {/* Description & Advice */}
                <div className="pt-3 border-t border-slate-200 flex items-start justify-between gap-3">
                  <div className="flex-1 text-sm sm:text-base text-slate-700">
                    <span className="font-bold text-slate-900 block mb-1">Experience &amp; Advice:</span>
                    <p className="line-clamp-2 italic text-slate-600 leading-relaxed">
                      "{experienceText || 'No detailed walkthrough provided'}"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="text-sm font-bold text-orange-700 hover:text-orange-900 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-orange-100 transition-colors shrink-0 cursor-pointer"
                  >
                    Edit Advice
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600 font-medium">
                  <span>Candidate Result: <strong className="text-slate-900 font-bold">{result}</strong></span>
                  <span className="font-bold text-emerald-600">Status: Verified Submission</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 sm:px-7 py-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 text-sm sm:text-base font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-3 text-sm sm:text-base font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-7 py-3.5 text-base font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] rounded-xl shadow-lg flex items-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02]"
            >
              {submitting ? (
                <span>Submitting Experience...</span>
              ) : submittedSuccess ? (
                <>
                  <Check className="w-5 h-5 text-emerald-300" />
                  <span>Submitted Successfully!</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Experience</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
