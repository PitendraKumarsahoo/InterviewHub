import React from 'react';

interface FooterProps {
  onSelectTab: (tab: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-[#FAF8F5] border-t border-[#EAE4DC] mt-16 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                Q
              </div>
              <span>Prep<span className="text-orange-600">Loop</span></span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real interview questions, straight from the room. Students share the exact coding, GD and HR questions they faced.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('companies')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Companies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('questions')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Interview Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('repeated')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Repeated Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('experiences')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Interview Experiences
                </button>
              </li>
            </ul>
          </div>

          {/* Core Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('questions', 'Coding')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Coding &amp; Algorithms
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('questions', 'Technical')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Core Technical
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('questions', 'Aptitude')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Aptitude &amp; Verbal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('questions', 'HR')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  HR &amp; Behavioral
                </button>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Community
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('community')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Peer Solutions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('profile')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Student Profile &amp; Bookmarks
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#EAE4DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PrepLoop. Real student placement intelligence.</p>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => onSelectTab('privacy')}
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => onSelectTab('terms')}
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => onSelectTab('custom-domain')}
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              Custom Domain
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
