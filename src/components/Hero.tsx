import React from 'react';
import { Search, Sparkles, BookOpen, GraduationCap, Award, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Hero: React.FC = () => {
  const { searchQuery, setSearchQuery, setActiveView, setSelectedCategory, setSelectedEducationLevel } = useApp();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('explore');
    }
  };

  const quickPills = [
    { label: 'KCSE Revision Notes', action: () => { setSelectedEducationLevel('senior'); setActiveView('explore'); } },
    { label: 'KJSEA Model Papers', action: () => { setSelectedEducationLevel('jss'); setSelectedCategory('exams'); setActiveView('explore'); } },
    { label: 'Grade 4 CBC Science', action: () => { setSelectedEducationLevel('primary'); setSelectedCategory('notes'); setActiveView('explore'); } },
    { label: 'University Computer Science', action: () => { setSelectedEducationLevel('college_uni'); setActiveView('explore'); } },
    { label: 'African Novels', action: () => { setSelectedCategory('novels'); setActiveView('explore'); } },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-950 to-slate-900 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-72 bg-gradient-to-r from-teal-500/20 via-amber-400/10 to-teal-400/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Academic Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-teal-200 mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>CBC, KJSEA, KCSE & University Digital Repository</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Your World of <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-amber-300">Knowledge.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
          Discover thousands of educational resources, textbooks, revision materials and inspiring stories. Everything you need to learn, read and grow in one place.
        </p>

        {/* Prominent Search Bar */}
        <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto relative">
          <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-teal-950/40 p-2 border border-white/20">
            <Search className="w-5 h-5 text-slate-400 ml-3 mr-2" />
            <input
              type="text"
              placeholder="Search notes, exams, textbooks, novels and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none py-1.5"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          </div>
        </form>

        {/* Quick Search Pills */}
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-300">
          <span className="text-slate-400">Popular:</span>
          {quickPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={pill.action}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-teal-200 transition-colors border border-white/10"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Key Statistics */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white">25,000+</div>
            <div className="text-xs text-slate-400 mt-0.5">Study Resources</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-300">4 Levels</div>
            <div className="text-xs text-slate-400 mt-0.5">Primary to University</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-teal-300">100% Verified</div>
            <div className="text-xs text-slate-400 mt-0.5">Curriculum Materials</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white">AI Powered</div>
            <div className="text-xs text-slate-400 mt-0.5">Deep Thinking Tutor</div>
          </div>
        </div>
      </div>
    </section>
  );
};
