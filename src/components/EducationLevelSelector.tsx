import React from 'react';
import { useApp } from '../context/AppContext';
import { EducationLevel } from '../types';
import { Backpack, Compass, GraduationCap, Building2, ChevronRight } from 'lucide-react';

export const EducationLevelSelector: React.FC = () => {
  const { setSelectedEducationLevel, setActiveView } = useApp();

  const levels: {
    id: EducationLevel;
    title: string;
    grades: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeColor: string;
    highlights: string[];
  }[] = [
    {
      id: 'primary',
      title: 'Primary School',
      grades: 'Grade 1 – 6',
      description: 'CBC learning notes, assessment papers, graded readers, children’s folktales & revision questions.',
      icon: Backpack,
      accentColor: 'from-amber-500/10 to-emerald-500/10 border-emerald-200 hover:border-emerald-400',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      highlights: ['CBC Materials', 'Graded Readers', 'Storybooks']
    },
    {
      id: 'jss',
      title: 'Junior Secondary (JSS)',
      grades: 'Grade 7 – 9',
      description: 'Integrated Science, Pre-Technical studies, Social Studies, KJSEA exam preparation & mock papers.',
      icon: Compass,
      accentColor: 'from-blue-500/10 to-teal-500/10 border-teal-200 hover:border-teal-400',
      badgeColor: 'bg-teal-100 text-teal-800',
      highlights: ['KJSEA Past Papers', 'Subject Notes', 'Mock Exams']
    },
    {
      id: 'senior',
      title: 'Senior School',
      grades: 'Grade 10 – 12',
      description: 'Pathway-specific STEM, Arts & Social sciences notes, KCSE revision masteries & approved novels.',
      icon: GraduationCap,
      accentColor: 'from-purple-500/10 to-indigo-500/10 border-indigo-200 hover:border-indigo-400',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      highlights: ['KCSE Revision', 'STEM Pathways', 'Set Book Novels']
    },
    {
      id: 'college_uni',
      title: 'College & University',
      grades: 'Cert, Diploma, Degree, Masters',
      description: 'Higher education lecture notes, academic research, dissertations, peer-reviewed journals & textbooks.',
      icon: Building2,
      accentColor: 'from-slate-500/10 to-sky-500/10 border-sky-200 hover:border-sky-400',
      badgeColor: 'bg-sky-100 text-sky-800',
      highlights: ['Lecture Modules', 'Research Theses', 'Academic Books']
    }
  ];

  const handleSelect = (level: EducationLevel) => {
    setSelectedEducationLevel(level);
    setActiveView('explore');
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Curricula & Levels</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Choose Your Education Level
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Organized systematically from early foundational learning to postgraduate academia
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {levels.map((lvl) => {
          const Icon = lvl.icon;
          return (
            <div
              key={lvl.id}
              onClick={() => handleSelect(lvl.id)}
              className={`group bg-white rounded-2xl border p-5 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between ${lvl.accentColor}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${lvl.badgeColor}`}>
                    {lvl.grades}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors">
                  {lvl.title}
                </h3>

                <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                  {lvl.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {lvl.highlights.map((h, i) => (
                    <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-600 group-hover:translate-x-1 transition-transform">
                <span>Browse {lvl.title}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
