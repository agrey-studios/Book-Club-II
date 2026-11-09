import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, User, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { loginWithGoogle, loginAsDemoUser, authError, setAuthError } = useApp();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleClick = async () => {
    setLoadingGoogle(true);
    await loginWithGoogle();
    setLoadingGoogle(false);
  };

  const handleDemoLogin = async (email: string, name: string, role: any) => {
    await loginAsDemoUser(email, name, role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold mb-2">
            <ShieldCheck className="w-3 h-3" />
            <span>Secure Firebase Authentication</span>
          </div>
          <h2 className="text-xl font-bold">Welcome to Book Club</h2>
          <p className="text-xs text-slate-300 mt-0.5">Discover. Read. Learn.</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Real Google Sign-in */}
          <div>
            <button
              onClick={handleGoogleClick}
              disabled={loadingGoogle}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loadingGoogle ? 'Connecting to Google...' : 'Continue with Google Account'}</span>
            </button>
          </div>

          {/* Popup Blocker Notice if triggered */}
          {authError && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Popup Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                {authError}
              </p>
              <p className="text-[10px] text-amber-700 italic">
                Tip: You can allow popups in your browser or select an instant role below.
              </p>
            </div>
          )}

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider absolute">
              Or Instant Role Sign-in
            </span>
          </div>

          {/* Quick Instant Profiles */}
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('oumameshack@yahoo.com', 'Meshack Ouma', 'admin')}
              className="w-full p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/60 text-left flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-teal-950">oumameshack@yahoo.com</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-teal-600 text-white">
                    Administrator
                  </span>
                </div>
                <p className="text-[11px] text-teal-800 mt-0.5">Primary configured platform admin account</p>
              </div>
              <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleDemoLogin('david.kiprono@bookclub.org', 'Mr. David Kiprono', 'teacher')}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">Mr. David Kiprono</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800">
                    Teacher / Educator
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Upload notes, mock exams, and manage wallet</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleDemoLogin('mercy.chebet@student.ac.ke', 'Mercy Chebet', 'student')}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">Mercy Chebet</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 text-slate-700">
                    Student / Reader
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Read books, attempt quizzes, and use AI study tools</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
