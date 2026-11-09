import React from 'react';
import { useApp } from '../context/AppContext';
import { ResourceCategory } from '../types';
import { 
  FileText, 
  Award, 
  BookMarked, 
  Glasses, 
  BookOpen, 
  Smile, 
  ChevronRight 
} from 'lucide-react';

export const ResourceCategoryGrid: React.FC = () => {
  const { setSelectedCategory, setActiveView, resources } = useApp();

  const categories: {
    id: ResourceCategory;
    title: string;
    sub: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    iconBg: string;
  }[] = [
    {
      id: 'notes',
      title: 'Notes',
      sub: 'Class & Revision Notes',
      description: 'Topic summaries, teacher handouts, lecture modules & quick study guides.',
      icon: FileText,
      color: 'border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50/50 to-white',
      iconBg: 'bg-blue-600 text-white',
    },
    {
      id: 'exams',
      title: 'Exams',
      sub: 'Past Papers & Marking Schemes',
      description: 'National past papers, mock exams, answer keys & online timed practice.',
      icon: Award,
      color: 'border-amber-200 hover:border-amber-400 bg-gradient-to-br from-amber-50/50 to-white',
      iconBg: 'bg-amber-600 text-white',
    },
    {
      id: 'textbooks',
      title: 'Textbooks',
      sub: 'Core Academic Textbooks',
      description: 'Approved curriculum digital textbooks, reference treatises & subject guides.',
      icon: BookMarked,
      color: 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-br from-emerald-50/50 to-white',
      iconBg: 'bg-emerald-600 text-white',
    },
    {
      id: 'readers',
      title: 'Readers',
      sub: 'Graded Literacy Readers',
      description: 'Phonics blends, comprehension passages, language mastery & level readers.',
      icon: Glasses,
      color: 'border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50/50 to-white',
      iconBg: 'bg-purple-600 text-white',
    },
    {
      id: 'novels',
      title: 'Novels',
      sub: 'African & World Literature',
      description: 'Curriculum set books, historical fiction, contemporary tales & timeless classics.',
      icon: BookOpen,
      color: 'border-rose-200 hover:border-rose-400 bg-gradient-to-br from-rose-50/50 to-white',
      iconBg: 'bg-rose-600 text-white',
    },
    {
      id: 'storybooks',
      title: 'Storybooks',
      sub: 'Illustrated Moral Stories',
      description: 'Vibrant folktales, bedtime fables, character-building adventures for youngsters.',
      icon: Smile,
      color: 'border-indigo-200 hover:border-indigo-400 bg-gradient-to-br from-indigo-50/50 to-white',
      iconBg: 'bg-indigo-600 text-white',
    },
  ];

  const handleCategoryClick = (cat: ResourceCategory) => {
    setSelectedCategory(cat);
    setActiveView('explore');
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Explore by Type</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Six Dedicated Resource Categories
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Whether preparing for an exam or enjoying literature, find precisely what you need
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const count = resources.filter(r => r.category === cat.id).length;
          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`group rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between ${cat.color}`}
            >
              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-xs ${cat.iconBg} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{cat.sub}</p>
                <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-teal-700">
                <span>{count} items</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
