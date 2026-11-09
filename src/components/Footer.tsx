import React from 'react';
import { BookOpen, ShieldCheck, Heart, Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedEducationLevel, setSelectedCategory } = useApp();

  return (
    <footer className="hidden md:block bg-slate-900 text-slate-300 pt-10 pb-10 border-t border-slate-800 text-[12px]">
      <div className="w-[99%] md:w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-sm">
                <BookOpen className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                BOOK <span className="text-teal-400">CLUB</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-light">
              Discover thousands of educational resources, textbooks, revision materials and inspiring stories. An all-in-one mobile-first academic platform connecting learners, educators, authors and academic institutions.
            </p>
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Discover. Read. Learn.</span>
            </div>
          </div>

          {/* Col 2: Education Levels */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Education Levels</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button 
                  onClick={() => { setSelectedEducationLevel('primary'); setActiveView('explore'); }}
                  className="hover:text-teal-300 transition-colors"
                >
                  Primary School (Grade 1–6)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedEducationLevel('jss'); setActiveView('explore'); }}
                  className="hover:text-teal-300 transition-colors"
                >
                  Junior Secondary (KJSEA)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedEducationLevel('senior'); setActiveView('explore'); }}
                  className="hover:text-teal-300 transition-colors"
                >
                  Senior School (KCSE)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedEducationLevel('college_uni'); setActiveView('explore'); }}
                  className="hover:text-teal-300 transition-colors"
                >
                  College & University
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resource Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => { setSelectedCategory('notes'); setActiveView('explore'); }} className="hover:text-teal-300 transition-colors">
                  Subject & Revision Notes
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('exams'); setActiveView('explore'); }} className="hover:text-teal-300 transition-colors">
                  Past Papers & Marking Schemes
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('textbooks'); setActiveView('explore'); }} className="hover:text-teal-300 transition-colors">
                  Digital Core Textbooks
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('readers'); setActiveView('explore'); }} className="hover:text-teal-300 transition-colors">
                  Graded Literacy Readers
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('novels'); setActiveView('explore'); }} className="hover:text-teal-300 transition-colors">
                  African & World Literature
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('storybooks'); setActiveView('explore'); }} className="hover:text-teal-300 transition-colors">
                  Illustrated Children Stories
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Features */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Platform & AI</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => setActiveView('ai-tools')} className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gemini AI Study Tutor</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('exams')} className="hover:text-teal-300 transition-colors">
                  Online Timed Examination System
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('requests')} className="hover:text-teal-300 transition-colors">
                  Request a Resource
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('community')} className="hover:text-teal-300 transition-colors">
                  Study Groups & Discussions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('pricing')} className="hover:text-teal-300 transition-colors">
                  Subscription Plans & M-Pesa
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('upload')} className="hover:text-teal-300 transition-colors">
                  Contributor Publishing Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 Book Club. All rights reserved. Built for mobile-first academic empowerment.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Strict Copyright Protection & Fair Use Policy</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
