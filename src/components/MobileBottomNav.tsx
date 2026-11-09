import React from 'react';
import { Home, Compass, Plus, Sparkles, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {/* 1. Home */}
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center justify-center py-0.5 px-2 transition-all ${
            activeView === 'home' ? 'text-teal-700 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className={`w-4 h-4 ${activeView === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
        </button>

        {/* 2. Explore */}
        <button
          onClick={() => setActiveView('explore')}
          className={`flex flex-col items-center justify-center py-0.5 px-2 transition-all ${
            activeView === 'explore' ? 'text-teal-700 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Compass className={`w-4 h-4 ${activeView === 'explore' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Explore</span>
        </button>

        {/* 3. Center Create / Post Button */}
        <button
          onClick={() => setActiveView('upload')}
          className="flex flex-col items-center justify-center -mt-2 p-1 focus:outline-none group"
          aria-label="Upload resource"
        >
          <div className="w-9 h-9 rounded-full bg-teal-600 group-hover:bg-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-600/30 transition-transform active:scale-95">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          <span className="text-[9px] font-bold text-teal-700 mt-0.5">Post</span>
        </button>

        {/* 4. AI Tutor (Replaced downloads on bottom menu) */}
        <button
          onClick={() => setActiveView('ai-tools')}
          className={`flex flex-col items-center justify-center py-0.5 px-2 transition-all ${
            activeView === 'ai-tools' ? 'text-amber-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeView === 'ai-tools' ? 'stroke-[2.5] text-amber-500 fill-amber-400' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">AI Tutor</span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center py-0.5 px-2 transition-all ${
            activeView === 'dashboard' ? 'text-teal-700 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className={`w-4 h-4 ${activeView === 'dashboard' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};
