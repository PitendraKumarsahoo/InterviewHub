import React from 'react';
import {
  Building2,
  FileText,
  HelpCircle,
  Repeat,
  LayoutDashboard,
  ShieldAlert,
  Heart,
  Sparkles,
  ArrowRight,
  User,
  Compass,
  Code2,
  BookOpen,
  Send,
  MessageSquare,
  Award,
  CheckCircle2
} from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-[#0B1120] border-t border-slate-800 mt-24 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Main 4-Column Grid: Preserves exact DOM selector hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Column 1: Brand & Founder Pitendra (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3.5 text-white font-extrabold text-2xl tracking-tight">
              <div className="w-11 h-11 rounded-2xl bg-[#EA580C] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/25">
                Q
              </div>
              <span className="text-white text-2xl">
                Prep<span className="text-[#EA580C]">Loop</span>
              </span>
            </div>

            <p className="text-base text-slate-300 leading-relaxed max-w-md font-medium">
              The premier open-source placement intelligence platform for university graduates. Real interview questions, round breakdowns, and candidate debriefs straight from live recruitment drives.
            </p>

            {/* Fast Stats Pill */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Peer Verified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-slate-200">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Zero Paywalls</span>
              </span>
            </div>
          </div>

          {/* Column 2: Platform Navigation (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-base font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#EA580C]" />
              <span>Platform</span>
            </h4>
            <ul className="space-y-3 text-base">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('companies')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2.5 group font-medium"
                >
                  <Building2 className="w-4 h-4 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
                  <span>Companies Directory</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('experiences')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2.5 group font-medium"
                >
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
                  <span>Interview Experiences</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('questions')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2.5 group font-medium"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
                  <span>Interview Questions Bank</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('repeated')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2.5 group font-medium"
                >
                  <Repeat className="w-4 h-4 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
                  <span>Top Repeated Questions</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('dashboard')}
                  className="text-orange-400 hover:text-orange-300 transition-colors cursor-pointer flex items-center gap-2.5 group font-bold"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#EA580C]" />
                  <span>My Dashboard (Contributions)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Tracks & Rounds (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-base font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#EA580C]" />
              <span>Tracks</span>
            </h4>
            <ul className="space-y-3 text-base">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('questions', 'Coding')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer block font-medium"
                >
                  Coding &amp; Algorithms
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('questions', 'Technical')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer block font-medium"
                >
                  Core Technical (DSA, OS)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('questions', 'Aptitude')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer block font-medium"
                >
                  Aptitude &amp; Reasoning
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('questions', 'HR')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer block font-medium"
                >
                  HR &amp; Behavioral Rounds
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('community')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer block font-medium"
                >
                  Peer Discussions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Community & Resources (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-base font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#EA580C]" />
              <span>Community</span>
            </h4>
            <ul className="space-y-3 text-base">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('profile')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group font-medium"
                >
                  <User className="w-4 h-4 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
                  <span>Student Profile</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('custom-domain')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer block font-medium"
                >
                  Setup &amp; Domain Guide
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('privacy')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer block font-medium"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('terms')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer block font-medium"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('admin')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Admin Panel</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Child Div 2: Personalized Sign-Off Section Highlighting Developer Pitendra & Bottom Bar */}
        <div className="mt-16 pt-10 border-t border-slate-800 space-y-10">
          
          {/* Personalized Developer Sign-Off Card: Pitendra */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-900/90 border border-slate-700/80 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-orange-500/20">
                  P
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0B1120] flex items-center justify-center" title="Active Developer">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-xl">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <span className="text-xl font-black text-white">Pitendra</span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">
                    Lead Developer &amp; Architect
                  </span>
                </div>
                <p className="text-base text-slate-300 font-medium leading-relaxed">
                  "Hi! I created PrepLoop to end the frustration of entering campus placement season with guesswork. Every debrief you contribute helps junior engineers prepare with confidence."
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-sm font-semibold text-slate-400">
                  <span className="text-orange-400 flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-orange-400 text-orange-400 inline" />
                    <span>Built for all engineering aspirants</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl text-base font-bold shadow-md transition-all cursor-pointer text-center hover:scale-105"
              >
                My Dashboard
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('questions')}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-base font-bold transition-all cursor-pointer text-center hover:scale-105"
              >
                Explore Questions
              </button>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Attribution */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-sm sm:text-base text-slate-400 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 text-center sm:text-left">
              <span>© {new Date().getFullYear()} PrepLoop. All rights reserved.</span>
              <span className="hidden sm:inline text-slate-700">|</span>
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                Designed &amp; Developed with <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" /> by <span className="text-[#EA580C] font-bold">Pitendra</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm sm:text-base font-semibold">
              <button
                type="button"
                onClick={() => onSelectTab('privacy')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <span className="text-slate-700">·</span>
              <button
                type="button"
                onClick={() => onSelectTab('terms')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Terms
              </button>
              <span className="text-slate-700">·</span>
              <button
                type="button"
                onClick={() => onSelectTab('custom-domain')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Domain Docs
              </button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
