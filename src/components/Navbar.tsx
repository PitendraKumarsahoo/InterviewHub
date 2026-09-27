import React, { useState, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  GraduationCap,
  Bookmark
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
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'companies', label: 'Companies' },
    { id: 'questions', label: 'Categories' },
    { id: 'experiences', label: 'Top answers' },
    { id: 'repeated', label: 'Repeats' },
    { id: 'community', label: 'Community' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE4DC]/80 transition-all">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Brand Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EA580C] flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform shrink-0">
                Q
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Prep<span className="text-orange-600">Loop</span>
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onSelectTab(link.id)}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-orange-600 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-white hover:bg-[#F3EFE9] rounded-lg border border-[#EAE4DC] shadow-2xs transition-colors"
              title="Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
              <kbd className="ml-1 px-1.5 py-0.2 text-[9px] font-mono text-slate-400 bg-[#F3EFE9] rounded border border-[#EAE4DC]">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={onOpenSearch}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-colors cursor-pointer touch-manipulation"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Sign in / Sign out text link */}
            {user ? (
              <button
                onClick={logout}
                className="hidden sm:inline-flex items-center min-h-[44px] px-2 py-1 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="hidden sm:inline-flex items-center min-h-[44px] px-2 py-1 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Sign in
              </button>
            )}

            {/* Orange CTA: Share experience */}
            <button
              onClick={onOpenSubmit}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 touch-manipulation"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Share <span className="hidden sm:inline">experience</span></span>
            </button>

            {/* Admin (where appropriate) */}
            {isAdmin && (
              <button
                onClick={() => onSelectTab('admin')}
                className={`hidden md:flex items-center min-h-[44px] gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  currentTab === 'admin'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-white text-slate-600 border-[#EAE4DC] hover:bg-[#F3EFE9]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Admin</span>
              </button>
            )}

            {/* User Profile avatar */}
            {user && (
              <div className="relative shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 p-1 rounded-full border border-slate-200 bg-white hover:ring-2 hover:ring-orange-500/30 transition-all cursor-pointer shrink-0 shadow-2xs touch-manipulation"
                  title={user.displayName || 'Profile'}
                  aria-label="User profile menu"
                >
                  {user.photoURL && !imageError ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover block shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#EA580C] to-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden xl:inline text-xs sm:text-sm font-semibold text-slate-700 max-w-[80px] truncate pr-1">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu (Accessible and responsive on mobile) */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 text-sm animate-in fade-in zoom-in-95">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-bold text-slate-900 text-sm truncate">
                          {user.displayName || 'Campus Contributor'}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSelectTab('dashboard');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-900 font-semibold cursor-pointer transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-orange-600" />
                        <span>My Dashboard (Contributions)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSelectTab('profile');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Saved Bookmarks</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer transition-colors"
                      >
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span>Edit College Info</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSelectTab('admin');
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-rose-700 font-semibold cursor-pointer transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>Admin Panel</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 font-medium cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer touch-manipulation"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#EAE4DC] bg-white py-3 px-3 space-y-2 shadow-xl animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectTab(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[48px] text-left px-4 py-3 text-base font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer touch-manipulation ${
                    isActive
                      ? 'text-orange-700 bg-orange-50 font-extrabold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />}
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSubmit();
                }}
                className="w-full min-h-[48px] py-3.5 px-4 text-base font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer touch-manipulation"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Share Experience</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
