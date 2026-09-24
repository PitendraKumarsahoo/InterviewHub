import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Building, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileModal: React.FC = () => {
  const { userProfile, isProfileModalOpen, setIsProfileModalOpen, updateUserProfile } = useAuth();
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science');
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear());
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setCollege(userProfile.college || '');
      setDegree(userProfile.degree || 'B.Tech');
      setBranch(userProfile.branch || 'Computer Science');
      setGraduationYear(userProfile.graduationYear || new Date().getFullYear());
    }
  }, [userProfile]);

  if (!isProfileModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        name,
        college,
        degree,
        branch,
        graduationYear: Number(graduationYear),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsProfileModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Student Academic Profile</h3>
              <p className="text-xs text-slate-500">Helps juniors know which college drive you attended</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. Pitendra Kumar Sahoo"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              College / University *
            </label>
            <input
              type="text"
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. GIET University, Gunupur / NIT Rourkela"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Degree
              </label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="MCA">MCA</option>
                <option value="M.Tech">M.Tech</option>
                <option value="BCA">BCA</option>
                <option value="B.Sc">B.Sc Computer Science</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Graduation Year
              </label>
              <input
                type="number"
                min={2020}
                max={2030}
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Branch / Specialization
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. Computer Science and Engineering"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>Profile Updated!</span>
                </>
              ) : (
                <span>{saving ? 'Saving...' : 'Save Academic Profile'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
