import React, { useState } from 'react';
import {
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
    { id: 'home', label: 'Home' },
    { id: 'companies', label: 'Companies' },
    { id: 'questions', label: 'Categories' },
    { id: 'experiences', label: 'Top answers' },
    { id: 'repeated', label: 'Repeats' },
    { id: 'community', label: 'Community' },
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
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:scale-105 transition-transform shrink-0">
                Q
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold tracking-tight text-slate-900">
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
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-white hover:bg-[#F3EFE9] rounded-full border border-[#EAE4DC] shadow-2xs transition-colors"
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
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-full"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Sign in / Sign out text link */}
            {user ? (
              <button
                onClick={logout}
                className="hidden sm:inline-block text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-1 py-1"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="hidden sm:inline-block text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-1 py-1"
              >
                Sign in
              </button>
            )}

            {/* Orange Pill CTA: Share experience (Matching Screenshot) */}
            <button
              onClick={onOpenSubmit}
              className="flex items-center gap-1.5 px-5 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-full shadow-xs transition-all cursor-pointer"
            >
              <span>Share experience</span>
            </button>

            {/* Admin (where appropriate) */}
            {isAdmin && (
              <button
                onClick={() => onSelectTab('admin')}
                className={`hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
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
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-slate-300 transition-all"
                  title={user.displayName || 'Profile'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-medium text-slate-700 max-w-[80px] truncate">
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
                    <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg shadow-md border border-slate-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">
                          {user.displayName || 'Student'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSelectTab('profile');
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        My Profile &amp; Bookmarks
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        Edit College Info
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSelectTab('admin');
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-rose-700 font-medium"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          Admin Panel
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-0.5" />

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-400" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#EAE4DC] bg-[#FAF8F5] py-2 px-1 space-y-1">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectTab(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-md flex items-center justify-between ${
                    isActive
                      ? 'text-orange-700 bg-orange-50 font-semibold'
                      : 'text-slate-700 hover:bg-[#F3EFE9]'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-[#EAE4DC]">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSubmit();
                }}
                className="w-full px-3 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-full flex items-center justify-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Share Experience</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
