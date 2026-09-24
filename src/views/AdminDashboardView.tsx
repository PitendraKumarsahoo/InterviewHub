import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  FileText,
  Building2,
  HelpCircle,
  Layers,
  Database,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  setDoc
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { InterviewExperience, Company, Question } from '../types';
import { checkAndSeedInitialData } from '../lib/seedData';

interface AdminDashboardViewProps {
  onRefreshData: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onRefreshData }) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'companies' | 'seed'>('pending');
  const [pendingExperiences, setPendingExperiences] = useState<InterviewExperience[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  // New Company form
  const [newCompName, setNewCompName] = useState('');
  const [newCompCategory, setNewCompCategory] = useState('Software Engineering');
  const [newCompType, setNewCompType] = useState('Service');
  const [newCompDesc, setNewCompDesc] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    fetchAdminData();
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch pending experiences
      const expSnap = await getDocs(
        query(collection(db, 'experiences'), where('status', '==', 'pending'))
      );
      const pending: InterviewExperience[] = [];
      expSnap.forEach((d) => pending.push(d.data() as InterviewExperience));
      setPendingExperiences(pending);

      // Fetch companies
      const compSnap = await getDocs(collection(db, 'companies'));
      const comps: Company[] = [];
      compSnap.forEach((d) => comps.push(d.data() as Company));
      setAllCompanies(comps);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Admin Authorization Required</h2>
        <p className="text-xs text-slate-500">
          This moderation dashboard is strictly restricted to verified placement administrators.
        </p>
      </div>
    );
  }

  const handleApprove = async (exp: InterviewExperience) => {
    setProcessingId(exp.id);
    try {
      const expRef = doc(db, 'experiences', exp.id);
      await updateDoc(expRef, { status: 'approved' });

      // Increment company count
      if (exp.companyId) {
        const compRef = doc(db, 'companies', exp.companyId);
        await updateDoc(compRef, { experienceCount: increment(1) });
      }

      // Mark related questions as approved
      const qSnap = await getDocs(
        query(collection(db, 'questions'), where('experienceId', '==', exp.id))
      );
      for (const qDoc of qSnap.docs) {
        await updateDoc(doc(db, 'questions', qDoc.id), { status: 'approved' });
      }

      setPendingExperiences((prev) => prev.filter((e) => e.id !== exp.id));
      onRefreshData();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `experiences/${exp.id}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (exp: InterviewExperience) => {
    setProcessingId(exp.id);
    try {
      const expRef = doc(db, 'experiences', exp.id);
      await updateDoc(expRef, { status: 'rejected' });
      setPendingExperiences((prev) => prev.filter((e) => e.id !== exp.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `experiences/${exp.id}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    try {
      const slug = newCompName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const compRef = doc(db, 'companies', slug);
      const newComp: Company = {
        id: slug,
        name: newCompName.trim(),
        slug,
        category: newCompCategory,
        type: newCompType,
        description: newCompDesc.trim() || `${newCompName} campus hiring and recruitment tracks.`,
        experienceCount: 0,
        questionCount: 0,
        viewCount: 1,
        createdAt: new Date().toISOString(),
      };
      await setDoc(compRef, newComp);
      setAllCompanies([...allCompanies, newComp]);
      setNewCompName('');
      setNewCompDesc('');
      onRefreshData();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'companies');
    }
  };

  const handleTriggerSeed = async () => {
    setSeedStatus('Seeding initial authentic community dataset...');
    const result = await checkAndSeedInitialData();
    if (result) {
      setSeedStatus('Seeded successfully with real placement drives, questions & answers!');
      onRefreshData();
      fetchAdminData();
    } else {
      setSeedStatus('Initial database is already populated.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Placement Moderation Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in as verified administrator: <span className="text-white font-mono">{user?.email}</span>
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'pending'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Pending Submissions ({pendingExperiences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'companies'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Manage Companies ({allCompanies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('seed')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'seed'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Seed Initial Data</span>
        </button>
      </div>

      {/* Tab 1: Pending Submissions */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Student Submissions Awaiting Approval
            </h2>
            <span className="text-xs text-slate-500">
              Only approved experiences appear publicly on company pages
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading pending items...</div>
          ) : pendingExperiences.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-1">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-800">All submissions have been moderated!</p>
              <p className="text-[11px] text-slate-500">No new student experiences in queue.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-6 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {exp.companyName}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {exp.role} ({exp.interviewType})
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                          Pending Moderation
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Submitted by: <strong className="text-slate-700">{exp.authorName}</strong> ({exp.authorCollege || 'Campus'}) · Year {exp.year}
                      </div>
                    </div>

                    {/* Approve / Reject Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        disabled={processingId === exp.id}
                        onClick={() => handleApprove(exp)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        disabled={processingId === exp.id}
                        onClick={() => handleReject(exp)}
                        className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1 border border-rose-200 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    "{exp.experienceText}"
                  </p>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Rounds Reported: </span>
                    {exp.rounds.map(r => `${r.roundName} (${r.questions.length} questions)`).join(' → ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage Companies */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          {/* Add Company Form */}
          <form
            onSubmit={handleCreateCompany}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4"
          >
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add New Company to Catalog
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tech Mahindra / Oracle"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCompCategory}
                  onChange={(e) => setNewCompCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type</label>
                <select
                  value={newCompType}
                  onChange={(e) => setNewCompType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white"
                >
                  <option value="Service">Service</option>
                  <option value="Product">Product</option>
                  <option value="Startup">Startup</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Brief summary of company and recruitment..."
                value={newCompDesc}
                onChange={(e) => setNewCompDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-2xs"
            >
              Add Company
            </button>
          </form>

          {/* List Companies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allCompanies.map((c) => (
              <div key={c.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 text-sm block">{c.name}</span>
                <span className="text-xs text-indigo-600 font-medium block">{c.category} · {c.type}</span>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                  <span>{c.experienceCount} Experiences</span>
                  <span>{c.viewCount} Views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Seed Data */}
      {activeTab === 'seed' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4 max-w-xl">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Seed Initial Placement Drives &amp; Questions
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Populates Firestore with authentic student interview experiences (TCS, Infosys, Amazon, Deloitte, Google), full round breakdowns, real questions with code solutions, and verified community answers.
          </p>

          <button
            onClick={handleTriggerSeed}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            Run Community Seeding
          </button>

          {seedStatus && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 font-medium">
              {seedStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
