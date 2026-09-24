import React, { useState } from 'react';
import {
  Compass,
  Building2,
  HelpCircle,
  FileText,
  Flame,
  Users,
  Search,
  PlusCircle,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string, param?: string) => void;
  onOpenSearch: () => void;
  onOpenSubmit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenSubmit,
}) => {
  const { user, userProfile, isAdmin, signInWithGoogle, logout, setIsProfileModalOpen } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'experiences', label: 'Experiences', icon: FileText },
    { id: 'repeated', label: 'Repeated', icon: Flame, badge: 'Hot' },
    { id: 'community', label: 'Community', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Interview<span className="text-indigo-600">Hub</span>
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                  Student Intelligence
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onSelectTab(link.id)}
                    className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {link.label}
                    {link.badge && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* Global Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors"
              title="Search companies, roles, technologies..."
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
              <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white rounded border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={onOpenSearch}
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Submit Experience Button */}
            <button
              onClick={onOpenSubmit}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Experience</span>
            </button>

            {/* Admin Badge/Link */}
            {isAdmin && (
              <button
                onClick={() => onSelectTab('admin')}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  currentTab === 'admin'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Admin</span>
              </button>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden xl:inline text-xs font-medium text-slate-700 max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">
                          {user.displayName || 'Student'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        {userProfile?.college && (
                          <p className="text-[11px] text-indigo-600 truncate mt-0.5">
                            {userProfile.college}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSelectTab('profile');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile &amp; Contributions
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        Edit College Info
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSelectTab('admin');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 font-medium"
                        >
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          Admin Moderation
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onSelectTab(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  {link.label}
                </span>
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenSubmit();
              }}
              className="w-full py-2.5 px-3 text-center text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm"
            >
              + Submit Experience
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onSelectTab('admin');
                }}
                className="w-full py-2 px-3 text-center text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
              >
                Admin Moderation
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
