import React from 'react';
import { GraduationCap, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>Interview<span className="text-indigo-400">Hub</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Student interview intelligence community. Real interview experiences, coding problems, technical rounds, GD topics, and repeated questions shared by university graduates.
            </p>
            <div className="text-[11px] text-slate-500">
              Built for campus &amp; off-campus placement preparation.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-300 tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('companies')}
                  className="hover:text-white transition-colors text-left"
                >
                  Top Hiring Companies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('questions')}
                  className="hover:text-white transition-colors text-left"
                >
                  Technical &amp; Coding Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('repeated')}
                  className="hover:text-white transition-colors text-left"
                >
                  Most Repeated Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('experiences')}
                  className="hover:text-white transition-colors text-left"
                >
                  Selected &amp; Rejection Experiences
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-300 tracking-wider mb-3">
              Roles &amp; Tech
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('questions', 'Coding')}
                  className="hover:text-white transition-colors text-left"
                >
                  DSA &amp; Coding Rounds
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('questions', 'Technical')}
                  className="hover:text-white transition-colors text-left"
                >
                  Java, Python &amp; SQL Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('questions', 'Aptitude')}
                  className="hover:text-white transition-colors text-left"
                >
                  Quantitative Aptitude &amp; Verbal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('questions', 'HR')}
                  className="hover:text-white transition-colors text-left"
                >
                  HR &amp; Managerial Behaviorals
                </button>
              </li>
            </ul>
          </div>

          {/* Community Ethics */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-300 tracking-wider mb-3">
              Community
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All interview insights are moderated for authenticity and academic honesty. Submissions reflect real university campus placement drives.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for graduating students</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} InterviewHub. Real student placement knowledge.
          </div>
          <div className="mt-2 sm:mt-0 flex gap-4">
            <span className="text-slate-400">Zero fake statistics · 100% peer-contributed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
