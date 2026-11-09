import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Bookmark, 
  Sparkles, 
  BookOpen, 
  Compass, 
  Award, 
  HelpCircle, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  LogOut, 
  User, 
  FileText, 
  ExternalLink,
  ChevronRight,
  PlusCircle,
  GraduationCap,
  DownloadCloud
} from 'lucide-react';

interface SideMenuDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenAuth?: () => void;
}

export const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({ 
  isOpen: propIsOpen, 
  onClose: propOnClose, 
  onOpenAuth 
}) => {
  const { 
    user, 
    logout, 
    currentRole, 
    activeView, 
    setActiveView, 
    setSelectedEducationLevel, 
    setSelectedCategory,
    library,
    downloads,
    isSideMenuOpen,
    setIsSideMenuOpen
  } = useApp();

  const [activeInfoTopic, setActiveInfoTopic] = useState<'copyright' | 'dmca' | 'fairuse' | 'support' | null>(null);

  const isOpen = propIsOpen !== undefined ? propIsOpen : isSideMenuOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    setIsSideMenuOpen(false);
  };

  if (!isOpen) return null;

  const navigateTo = (view: string, action?: () => void) => {
    if (action) action();
    setActiveView(view);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={handleClose} 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col border-l border-slate-200 text-[13px]">
          {/* Header */}
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white text-xs">
                BC
              </div>
              <div>
                <h3 className="font-bold text-[14px] leading-tight text-white">Book Club Menu</h3>
                <span className="text-[10px] text-teal-300">Discover • Read • Learn</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* User Profile / Auth Block */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              {user ? (
                <div>
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate text-[13px]">{user.displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold capitalize">
                      {user.role} • {user.subscriptionTier.toUpperCase()}
                    </span>
                    <button
                      onClick={() => navigateTo('pricing')}
                      className="text-teal-700 font-bold hover:underline"
                    >
                      Manage Plan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-slate-600 mb-2 text-[12px]">Sign in to access your library, offline downloads and AI tutor.</p>
                  <button
                    onClick={() => { handleClose(); onOpenAuth?.(); }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[12px] shadow-xs"
                  >
                    Log In / Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions (Library, Downloads & AI Tutor) */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => navigateTo('library')}
                className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl border border-teal-200 text-left flex flex-col justify-between transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <Bookmark className="w-3.5 h-3.5 text-teal-700" />
                  <span className="text-[9px] font-bold px-1 py-0.2 bg-teal-200/60 rounded">
                    {library.length}
                  </span>
                </div>
                <span className="font-bold text-[11px] truncate">Library</span>
                <span className="text-[9px] text-teal-700">Saved</span>
              </button>

              <button
                onClick={() => navigateTo('downloads')}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl border border-blue-200 text-left flex flex-col justify-between transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <DownloadCloud className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-[9px] font-bold px-1 py-0.2 bg-blue-200/60 rounded">
                    {downloads.length}
                  </span>
                </div>
                <span className="font-bold text-[11px] truncate">Downloads</span>
                <span className="text-[9px] text-blue-700">Offline</span>
              </button>

              <button
                onClick={() => navigateTo('ai-tools')}
                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-xl border border-amber-200 text-left flex flex-col justify-between transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                  <span className="text-[9px] font-bold px-1 py-0.2 bg-amber-200/60 rounded">
                    AI
                  </span>
                </div>
                <span className="font-bold text-[11px] truncate">AI Tutor</span>
                <span className="text-[9px] text-amber-800">Study</span>
              </button>
            </div>

            {/* Navigation Sections */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Explore Categories
              </span>
              <button
                onClick={() => navigateTo('explore', () => setSelectedCategory('novels'))}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-rose-600" />
                  <span>Novels, Readers & Storybooks</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigateTo('explore', () => setSelectedCategory('notes'))}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Subject & Revision Notes</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigateTo('explore', () => setSelectedCategory('exams'))}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Past Papers & Mock Exams</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigateTo('explore', () => setSelectedCategory('textbooks'))}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Core Academic Textbooks</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Education Levels */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Education Levels
              </span>
              <button
                onClick={() => navigateTo('explore', () => setSelectedEducationLevel('primary'))}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span>Primary School (Grade 1–6)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigateTo('explore', () => setSelectedEducationLevel('jss'))}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span>Junior Secondary (KJSEA Grade 7–9)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigateTo('explore', () => setSelectedEducationLevel('senior'))}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span>Senior School (KCSE Grade 10–12)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigateTo('explore', () => setSelectedEducationLevel('college_uni'))}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span>College & University Programmes</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Learning Modules */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Interactive Modules
              </span>
              <button
                onClick={() => navigateTo('exams')}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>Timed Online Examinations</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigateTo('requests')}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  <span>Request a Resource</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigateTo('community')}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Study Circles & Discussions</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigateTo('pricing')}
                className="w-full p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  <span>Subscription Plans & M-Pesa</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Admin / Contributor Controls */}
            {(user?.role === 'admin' || currentRole === 'admin') && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 px-1">
                  Management
                </span>
                <button
                  onClick={() => navigateTo('admin-panel')}
                  className="w-full p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>Administrator Console</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Footer Items & Legal Links in Side Menu (Required for mobile) */}
            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                About & Legal Info
              </span>
              <p className="px-1 text-slate-600 leading-relaxed text-[11px]">
                Book Club is an academic digital library platform aligning with Kenyan CBC, KJSEA, KCSE, and University curricula.
              </p>
              {/* Policy modal inside drawer instead of window.alert */}
              <div className="grid grid-cols-2 gap-1.5 px-1 pt-1 text-[11px]">
                <button 
                  onClick={() => setActiveInfoTopic(activeInfoTopic === 'copyright' ? null : 'copyright')} 
                  className="text-left hover:text-teal-700 font-medium"
                >
                  Copyright Policy
                </button>
                <button 
                  onClick={() => setActiveInfoTopic(activeInfoTopic === 'dmca' ? null : 'dmca')} 
                  className="text-left hover:text-teal-700 font-medium"
                >
                  DMCA Takedown
                </button>
                <button 
                  onClick={() => setActiveInfoTopic(activeInfoTopic === 'fairuse' ? null : 'fairuse')} 
                  className="text-left hover:text-teal-700 font-medium"
                >
                  Fair Use Terms
                </button>
                <button 
                  onClick={() => setActiveInfoTopic(activeInfoTopic === 'support' ? null : 'support')} 
                  className="text-left hover:text-teal-700 font-medium"
                >
                  Help & Support
                </button>
              </div>

              {activeInfoTopic && (
                <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 mt-2 text-[11px] text-slate-700 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>
                      {activeInfoTopic === 'copyright' && 'Copyright Policy'}
                      {activeInfoTopic === 'dmca' && 'DMCA Takedown'}
                      {activeInfoTopic === 'fairuse' && 'Fair Use Terms'}
                      {activeInfoTopic === 'support' && 'Help & Support'}
                    </span>
                    <button onClick={() => setActiveInfoTopic(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="leading-snug">
                    {activeInfoTopic === 'copyright' && 'All educational resources are distributed under author/publisher agreements, Creative Commons licenses, or open-access educational fair use.'}
                    {activeInfoTopic === 'dmca' && 'For DMCA copyright claims, email legal@bookclub.education with document specifics for prompt removal within 24 hours.'}
                    {activeInfoTopic === 'fairuse' && 'Revision notes and past papers are made available exclusively for non-commercial individual student revision and classroom instruction.'}
                    {activeInfoTopic === 'support' && 'Need help? Contact support@bookclub.education or join our official community forum for swift assistance.'}
                  </p>
                </div>
              )}
              <p className="px-1 pt-1 text-[10px] text-slate-400">
                © 2026 Book Club. Discover • Read • Learn.
              </p>
            </div>
          </div>

          {/* Footer Action */}
          {user && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => { logout(); handleClose(); }}
                className="w-full py-2 bg-white hover:bg-red-50 text-red-600 rounded-lg border border-red-200 font-semibold text-[12px] flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
