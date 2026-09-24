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
  Sparkles,
  Tag,
  Hash
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, updateDoc, increment } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { Company, InterviewType, InterviewResult, DifficultyLevel, RoundDetail } from '../types';

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
      let compName = selectedCompanyName;

      // Check if new/custom company
      if (selectedCompanyId === 'custom' || isCustomCompany) {
        compId = customCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        compName = customCompanyName;
        const newCompRef = doc(db, 'companies', compId);
        await setDoc(newCompRef, {
          id: compId,
          name: compName,
          slug: compId,
          category: customCategory,
          type: customType,
          description: `${compName} interview experiences and placement tracks.`,
          experienceCount: isAdmin ? 1 : 0,
          questionCount: 0,
          viewCount: 1,
          createdAt: new Date().toISOString(),
        });
      }

      const experienceId = `exp-${Date.now()}`;
      const expDocRef = doc(db, 'experiences', experienceId);

      const structuredRounds: RoundDetail[] = selectedRounds.map(r => ({
        roundName: r,
        questions: (roundsData[r] || []).filter(q => q.trim().length > 0),
      }));

      // If submitted by admin -> auto-approved, else 'pending' moderation
      const status = isAdmin ? 'approved' : 'pending';

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
        status,
        createdAt: new Date().toISOString(),
      };

      await setDoc(expDocRef, experiencePayload);

      // If approved or admin, increment company experienceCount
      if (status === 'approved' && !isCustomCompany) {
        const compRef = doc(db, 'companies', compId);
        await updateDoc(compRef, {
          experienceCount: increment(1),
        });
      }

      // Add individual questions to the questions bank
      for (const round of structuredRounds) {
        for (const qText of round.questions) {
          if (qText.trim()) {
            const qId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const isCoding = round.roundName.toLowerCase().includes('coding');
            const qPayload = {
              id: qId,
              companyId: compId,
              companyName: compName,
              experienceId,
              type: isCoding ? 'Coding' : (round.roundName.toLowerCase().includes('hr') ? 'HR' : 'Technical'),
              questionText: qText.trim(),
              normalizedText: qText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(),
              technology: selectedTechs[0] || 'General',
              difficulty: difficulty === 'Difficult' ? 'Hard' : (difficulty === 'Easy' ? 'Easy' : 'Medium'),
              askedCount: 1,
              askedByUserIds: [user.uid],
              status,
              companiesAsked: [compName],
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
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {step}/6
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {step === 1 && 'Step 1: Company & Placement Track'}
                {step === 2 && 'Step 2: Interview Rounds'}
                {step === 3 && 'Step 3: Questions per Round'}
                {step === 4 && 'Step 4: Tech Stack, Domain & Skill Tags'}
                {step === 5 && 'Step 5: Overall Experience & Advice'}
                {step === 6 && 'Step 6: Final Result & Review'}
              </h3>
              <p className="text-xs text-slate-500">
                Click any step tab below to jump directly and edit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clickable Step Navigation Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-100/80 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 text-xs">
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
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                step === s.num
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          {!user && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Sign in required to publish: </span>
                You can draft your experience now. When you click Submit, you will be prompted to sign in with Google.
              </div>
            </div>
          )}

          {/* STEP 1: Company & Role */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Company *</span>
                  {selectedCompanyName && !isCompanySelectorOpen && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompanySelectorOpen(true);
                        setCompanySearchQuery('');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold normal-case flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Change Company
                    </button>
                  )}
                </label>

                {/* Selected Company Card (when selected and not in search mode) */}
                {selectedCompanyName && !isCompanySelectorOpen ? (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                        {selectedCompanyName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {selectedCompanyName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isCustomCompany
                            ? `${customCategory} · ${customType} (Custom / New)`
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
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      Change Company
                    </button>
                  </div>
                ) : (
                  /* Search / Type Company Name Input */
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
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
                        className="w-full px-3.5 py-2.5 pl-9 pr-8 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      {companySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCompanySearchQuery('')}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Add as new custom company prompt if typed */}
                    {companySearchQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => handleSelectCustomCompany(companySearchQuery)}
                        className="w-full text-left p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-900 flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-indigo-600" />
                          Use "<strong className="text-indigo-700">{companySearchQuery.trim()}</strong>" as company
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded text-indigo-600 border border-indigo-200">
                          Select
                        </span>
                      </button>
                    )}

                    {/* Matched Companies List */}
                    <div className="max-h-48 overflow-y-auto space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                        {companySearchQuery ? `Matching Companies (${matchedCompanies.length})` : 'Popular Companies'}
                      </span>
                      {matchedCompanies.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectExistingCompany(c)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-white flex items-center justify-between text-xs transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 group-hover:text-indigo-600">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              · {c.category} ({c.type})
                            </span>
                          </div>
                          <span className="text-[11px] text-indigo-600 opacity-0 group-hover:opacity-100 font-semibold transition-opacity">
                            Choose →
                          </span>
                        </button>
                      ))}
                    </div>

                    {selectedCompanyName && (
                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsCompanySelectorOpen(false)}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium"
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
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
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
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
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
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Type
                      </label>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Job Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer / SDE-1 / Data Analyst"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Interview Type *
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-xs sm:text-sm"
                  >
                    <option value="Campus">On-Campus Placement</option>
                    <option value="Off-campus">Off-Campus Drive</option>
                    <option value="Internship">Internship / PPO</option>
                    <option value="PPO">PPO Conversion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Placement Drive Year
                </label>
                <input
                  type="number"
                  min={2020}
                  max={2030}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Rounds Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Select Interview Rounds</h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Which rounds took place during the interview evaluation?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {AVAILABLE_ROUNDS.map((round) => {
                  const isChecked = selectedRounds.includes(round);
                  return (
                    <button
                      type="button"
                      key={round}
                      onClick={() => handleToggleRound(round)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{round}</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
                  <h4 className="font-bold text-slate-900 text-sm">Questions Asked in Each Round</h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Enter the questions you were asked by the interviewers or online test:
                  </p>
                </div>
              </div>

              {selectedRounds.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl space-y-2">
                  <p>No rounds selected.</p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    ← Click here to select rounds in Step 2
                  </button>
                </div>
              ) : (
                selectedRounds.map((round) => (
                  <div key={round} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        {round}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddQuestionToRound(round)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Question
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(roundsData[round] || []).map((q, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`e.g. Question #${idx + 1} asked in ${round}`}
                            value={q}
                            onChange={(e) => handleUpdateQuestion(round, idx, e.target.value)}
                            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                          />
                          {(roundsData[round]?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(round, idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
              <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      Domain &amp; Skill Categorization Tags *
                    </label>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Categorize your experience by engineering domain or specific skills tested to help candidates find relevant interview tracks.
                    </p>
                  </div>

                  {/* Filter pill switcher */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
                    <button
                      type="button"
                      onClick={() => setTagCategoryFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        tagCategoryFilter === 'all'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setTagCategoryFilter('domains')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        tagCategoryFilter === 'domains'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Domains
                    </button>
                    <button
                      type="button"
                      onClick={() => setTagCategoryFilter('skills')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        tagCategoryFilter === 'skills'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Skills
                    </button>
                  </div>
                </div>

                {/* Domain Tags section */}
                {(tagCategoryFilter === 'all' || tagCategoryFilter === 'domains') && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Engineering Domains &amp; Tracks:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {DOMAIN_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => handleToggleTag(tag)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                            }`}
                          >
                            <span>#{tag}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Skill Tags section */}
                {(tagCategoryFilter === 'all' || tagCategoryFilter === 'skills') && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Core Interview Skills &amp; Focus Areas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => handleToggleTag(tag)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                            }`}
                          >
                            <span>#{tag}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add Custom Domain or Skill Tag */}
                <div className="pt-2 border-t border-indigo-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Add custom skill or domain tag:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
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
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddCustomTag()}
                      className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>

                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                  <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 block">
                      Currently Attached Tags ({selectedTags.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 font-semibold"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="p-0.5 hover:bg-indigo-200/60 rounded-full transition-colors text-indigo-600"
                            title="Remove tag"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Technologies Tested section */}
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Technologies Asked During Interview *
                  </label>
                  <p className="text-slate-500 text-xs mb-3">
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
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? `✓ ${tech}` : `+ ${tech}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add custom technology */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Add another technology not listed above
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Flutter / Rust / GraphQL / Kafka"
                      value={customTechInput}
                      onChange={(e) => setCustomTechInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTech}
                      className="px-3 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 cursor-pointer"
                    >
                      Add Chip
                    </button>
                  </div>
                </div>

                {selectedTechs.length > 0 && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Currently Selected Technologies ({selectedTechs.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTechs.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs bg-white text-slate-700 rounded-md border border-slate-200 font-medium"
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
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Experience Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe how the interview progressed, atmosphere, interviewer demeanor, coding style expected, and any critical moments..."
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Advice for Juniors &amp; Future Aspirants
                </label>
                <textarea
                  rows={3}
                  placeholder="What should juniors specifically prepare? What mistakes should they avoid? (e.g. Practice talking while coding, revise resume projects thoroughly)"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Interview Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Difficult">Difficult</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Overall Experience Rating (1-5)
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setOverallRating(star)}
                        className={`text-lg transition-transform ${
                          star <= overallRating ? 'text-amber-400 scale-110' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-slate-600 ml-2">
                      {overallRating}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Final result & preview with DIRECT EDIT LINKS */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  What was your final result? *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['Selected', 'Not Selected', 'Waitlisted', 'Prefer not to say'] as InterviewResult[]).map((res) => {
                    const isSelected = result === res;
                    return (
                      <button
                        type="button"
                        key={res}
                        onClick={() => setResult(res)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? res === 'Selected'
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold'
                              : res === 'Not Selected'
                              ? 'bg-rose-50 border-rose-600 text-rose-900 font-semibold'
                              : 'bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{res}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Tip: Rejection experiences are just as valuable! Sharing where you encountered bottlenecks helps fellow students know what to improve.
                </p>
              </div>

              {/* Clean Preview Card with direct 1-click edit links */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Submission Summary
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    Click [Edit] on any section to change it directly
                  </span>
                </div>

                {/* Company & Role row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-base block">
                      {selectedCompanyName || 'No company selected'}
                    </span>
                    <span className="text-xs text-slate-600">
                      {role} · {interviewType} · Year {year}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors"
                  >
                    Edit Company &amp; Role
                  </button>
                </div>

                {/* Rounds row */}
                <div className="pt-2 border-t border-slate-200 flex items-start justify-between gap-2">
                  <div className="text-xs text-slate-600 flex-1">
                    <span className="font-semibold text-slate-800 block mb-1">Rounds &amp; Questions:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {selectedRounds.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-700 text-[11px]">
                          {r} ({(roundsData[r] || []).filter(q => q.trim()).length} Qs)
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors shrink-0"
                  >
                    Edit Questions
                  </button>
                </div>

                {/* Domain & Skill Tags row */}
                <div className="pt-2 border-t border-slate-200 flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800 block text-xs mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-indigo-600" />
                      Domain &amp; Skill Tags:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.length > 0 ? (
                        selectedTags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-[11px] bg-indigo-50 border border-indigo-200 rounded text-indigo-700 font-medium">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No tags selected</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors shrink-0"
                  >
                    Edit Tags
                  </button>
                </div>

                {/* Tech row */}
                <div className="pt-2 border-t border-slate-200 flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800 block text-xs mb-1">Technologies Tested:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedTechs.map(t => (
                        <span key={t} className="px-2 py-0.5 text-[11px] bg-white border border-slate-200 rounded text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors shrink-0"
                  >
                    Edit Tech
                  </button>
                </div>

                {/* Description & Advice */}
                <div className="pt-2 border-t border-slate-200 flex items-start justify-between gap-2">
                  <div className="flex-1 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-0.5">Experience &amp; Advice:</span>
                    <p className="line-clamp-2 italic">
                      "{experienceText || 'No detailed walkthrough provided'}"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors shrink-0"
                  >
                    Edit Advice
                  </button>
                </div>

                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Candidate Result: <strong className="text-slate-800">{result}</strong></span>
                  <span className="font-semibold text-indigo-600">Review Status: Moderated</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : submittedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Submitted for Review!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
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
