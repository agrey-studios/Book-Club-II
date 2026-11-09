import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Bell, 
  User, 
  Sparkles, 
  FileText, 
  GraduationCap, 
  HelpCircle, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  PlusCircle, 
  Menu, 
  X, 
  Bookmark, 
  Award, 
  Users, 
  CreditCard,
  DownloadCloud
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { AuthModal } from './AuthModal';
import { SideMenuDrawer } from './SideMenuDrawer';

export const Navbar: React.FC = () => {
  const { 
    user, 
    logout, 
    currentRole, 
    setCurrentRole, 
    activeView, 
    setActiveView,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    setSelectedEducationLevel,
    unreadNotificationsCount,
    notifications,
    markNotificationAsRead,
    isSideMenuOpen,
    setIsSideMenuOpen
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('explore');
    }
  };

  const isAdminUser = user?.role === 'admin' || currentRole === 'admin';

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'student', label: 'Student / Reader', desc: 'Browse, read & practice' },
    { role: 'teacher', label: 'Teacher / Lecturer', desc: 'Upload notes & exams' },
    { role: 'author', label: 'Author / Creator', desc: 'Publish books & novels' },
    { role: 'institution', label: 'Institution', desc: 'Curricula archives' },
    { role: 'admin', label: 'Administrator', desc: 'Platform moderation' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-14 gap-2">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
            <button 
              onClick={() => setActiveView('home')} 
              className="flex items-center gap-2 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="font-extrabold text-[15px] sm:text-[16px] tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  BOOK <span className="text-teal-600">CLUB</span>
                </span>
                <span className="hidden md:block text-[9px] tracking-widest text-slate-400 uppercase font-medium leading-none">
                  Discover • Read • Learn
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links & Menu Dropdown */}
            <nav className="hidden lg:flex items-center gap-1 text-[13px]">
              <button
                onClick={() => setActiveView('home')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  activeView === 'home' ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveView('explore')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  activeView === 'explore' ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Explore
              </button>
              <button
                onClick={() => { setSelectedCategory('novels'); setActiveView('explore'); }}
                className="px-2.5 py-1.5 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Novels & Literature
              </button>
              <button
                onClick={() => { setSelectedCategory('notes'); setActiveView('explore'); }}
                className="px-2.5 py-1.5 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Notes
              </button>
              <button
                onClick={() => { setSelectedCategory('exams'); setActiveView('explore'); }}
                className="px-2.5 py-1.5 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Exams
              </button>

              {/* Desktop Header Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    showMenuDropdown ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showMenuDropdown && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-[12px]">
                    <button
                      onClick={() => { setActiveView('ai-tools'); setShowMenuDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-amber-950 font-semibold hover:bg-amber-50 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>AI Study Assistant</span>
                    </button>
                    <button
                      onClick={() => { setActiveView('exams'); setShowMenuDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      <span>Online Practice Exams</span>
                    </button>
                    <button
                      onClick={() => { setActiveView('requests'); setShowMenuDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Request a Resource</span>
                    </button>
                    <button
                      onClick={() => { setActiveView('community'); setShowMenuDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Study Groups & Forums</span>
                    </button>
                    <button
                      onClick={() => { setActiveView('pricing'); setShowMenuDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Subscription Pricing</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search notes, exams, novels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white text-slate-800 placeholder-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Prominent Post Button (Upload) */}
            <button
              onClick={() => setActiveView('upload')}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1 transition-colors"
              title="Post or upload educational resource"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>

            {/* Quick Ask AI Tutor pill (Desktop) */}
            <button
              onClick={() => setActiveView('ai-tools')}
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
              title="Ask AI Tutor"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
              <span>Ask AI</span>
            </button>

            {/* Role Switcher Pill - ONLY FOR ADMIN */}
            {isAdminUser && (
              <div className="relative">
                <button
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors"
                  title="Admin Perspective Switcher"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  <span className="capitalize">{currentRole}</span>
                  <ChevronDown className="w-3 h-3 text-teal-600" />
                </button>

                {showRoleSelector && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-[11px]">
                    <div className="px-3 py-1 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Preview (Admin Only)</p>
                    </div>
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          setCurrentRole(r.role);
                          setShowRoleSelector(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 transition-colors flex items-center justify-between ${
                          currentRole === r.role ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{r.label}</span>
                        {currentRole === r.role && <span className="text-[9px] text-teal-600 font-bold">Active</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-[12px]">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900">Notifications</span>
                    <span className="text-[10px] text-teal-600 font-semibold">{unreadNotificationsCount} unread</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 cursor-pointer hover:bg-slate-50 ${!n.read ? 'bg-teal-50/40' : ''}`}
                      >
                        <span className="font-semibold text-slate-900 block text-[12px]">{n.title}</span>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown (Includes Library as requested) */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px] font-bold">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[12px] font-semibold text-slate-800 hidden sm:inline max-w-[80px] truncate">
                    {user.displayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-[12px]">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user.displayName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    {/* Move Library and Downloads to profile menu */}
                    <button
                      onClick={() => { setActiveView('library'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 text-teal-800 hover:bg-teal-50 flex items-center gap-2 font-semibold"
                    >
                      <Bookmark className="w-4 h-4 text-teal-600" />
                      <span>My Saved Library</span>
                    </button>

                    <button
                      onClick={() => { setActiveView('downloads'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 text-teal-800 hover:bg-teal-50 flex items-center gap-2 font-semibold"
                    >
                      <DownloadCloud className="w-4 h-4 text-teal-600" />
                      <span>My Downloads</span>
                    </button>

                    <button
                      onClick={() => { setActiveView('dashboard'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Account & Uploaded Media</span>
                    </button>

                    {isAdminUser && (
                      <button
                        onClick={() => { setActiveView('admin-panel'); setShowProfileMenu(false); }}
                        className="w-full text-left px-3 py-2 text-teal-700 font-bold hover:bg-teal-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => { logout(); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-2.5 py-1.5 rounded-lg text-[12px] font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
              >
                Log In
              </button>
            )}

            {/* Side Menu Button Right of Profile */}
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
              title="Open Book Club Side Menu"
              aria-label="Open Side Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MOBILE: Search Bar Below Header & Ask AI Tutor Quick Action */}
        <div className="md:hidden py-1.5 border-t border-slate-100 flex items-center gap-1.5">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="Search notes, exams, novels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-7 pr-3 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 placeholder-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
          </form>

          {/* Ask AI Tutor Mobile button */}
          <button
            onClick={() => setActiveView('ai-tools')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-950 border border-amber-200 flex items-center gap-1 flex-shrink-0 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-amber-600 fill-amber-400" />
            <span>AI Tutor</span>
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </header>
  );
};
