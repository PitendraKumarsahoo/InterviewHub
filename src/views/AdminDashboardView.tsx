import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  FileText,
  Building2,
  Database,
  RefreshCw
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
import { InterviewExperience, Company } from '../types';
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
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Admin Authorization Required</h2>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px] uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Placement Moderation Dashboard</span>
          </div>
          <h1 className="text-xl font-bold">Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in as administrator: <span className="text-slate-200 font-mono">{user?.email}</span>
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'pending'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Pending Submissions ({pendingExperiences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'companies'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Manage Companies ({allCompanies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('seed')}
          className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'seed'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50'
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
            <h2 className="text-sm font-semibold text-slate-900">
              Student Submissions Awaiting Approval
            </h2>
            <span className="text-xs text-slate-500">
              Approved experiences appear publicly
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading pending items...</div>
          ) : pendingExperiences.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              No pending student submissions waiting for approval.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 bg-white rounded-xl border border-slate-200/90 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {exp.companyName} · {exp.role}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {exp.authorCollege || 'Campus drive'} · {exp.interviewType} · {exp.result}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(exp)}
                        disabled={processingId === exp.id}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleReject(exp)}
                        disabled={processingId === exp.id}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{exp.experienceText}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage Companies */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 p-5 bg-white rounded-xl border border-slate-200/90 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Add New Company</h3>
            <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oracle, Cisco, Adobe"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={newCompCategory}
                  onChange={(e) => setNewCompCategory(e.target.value)}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={newCompType}
                  onChange={(e) => setNewCompType(e.target.value)}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none"
                >
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                  <option value="Startup">Startup</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Government/PSU">Government/PSU</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCompDesc}
                  onChange={(e) => setNewCompDesc(e.target.value)}
                  placeholder="Brief description of campus roles..."
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded transition-colors"
              >
                Add Company
              </button>
            </form>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Existing Companies ({allCompanies.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allCompanies.map((c) => (
                <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-200/90 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{c.name}</span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 rounded text-slate-600">
                      {c.type}
                    </span>
                  </div>
                  <p className="text-slate-500 line-clamp-1">{c.description}</p>
                  <p className="text-[11px] text-slate-400 pt-1">
                    {c.experienceCount} exp · {c.questionCount} questions
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Seed Initial Data */}
      {activeTab === 'seed' && (
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 max-w-xl space-y-3 text-xs">
          <h3 className="font-semibold text-slate-900 text-sm">Database Seeder</h3>
          <p className="text-slate-600 leading-relaxed">
            Ensure initial placement datasets (TCS, Infosys, Deloitte, Amazon, Google, Accenture) and repeated questions are present in your Firestore collection.
          </p>
          <button
            onClick={handleTriggerSeed}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
          >
            Run Initial Data Seeder
          </button>
          {seedStatus && (
            <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-indigo-700 font-medium">
              {seedStatus}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
