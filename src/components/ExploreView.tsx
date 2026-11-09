import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceCategory, EducationLevel, ResourceItem } from '../types';
import { ResourceCard } from './ResourceCard';
import { 
  Search, 
  ArrowUpDown, 
  X, 
  BookOpen,
  Sparkles
} from 'lucide-react';

export const ExploreView: React.FC = () => {
  const { 
    resources, 
    searchQuery, 
    setSearchQuery, 
    selectedEducationLevel, 
    setSelectedEducationLevel, 
    selectedCategory, 
    setSelectedCategory 
  } = useApp();

  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'epub'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'downloads' | 'rating' | 'price_asc'>('relevance');

  // Filtered and sorted resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Search matching across title, subject, topic, author, fullDescription, curriculum
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          res.title.toLowerCase().includes(q) ||
          res.subject.toLowerCase().includes(q) ||
          (res.topic && res.topic.toLowerCase().includes(q)) ||
          res.authorName.toLowerCase().includes(q) ||
          res.shortDescription.toLowerCase().includes(q) ||
          res.curriculum.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Education Level
      if (selectedEducationLevel !== 'all' && res.educationLevel !== selectedEducationLevel) {
        return false;
      }

      // Category (Novels, readers and storybooks merged)
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'novels' || selectedCategory === 'readers' || selectedCategory === 'storybooks') {
          if (res.category !== 'novels' && res.category !== 'readers' && res.category !== 'storybooks') {
            return false;
          }
        } else if (res.category !== selectedCategory) {
          return false;
        }
      }

      // Free / Paid
      if (priceFilter === 'free' && !res.isFree) return false;
      if (priceFilter === 'paid' && res.isFree) return false;

      // Format
      if (formatFilter !== 'all' && res.fileFormat !== formatFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'downloads') {
        return b.downloadsCount - a.downloadsCount;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'price_asc') {
        return a.priceKsh - b.priceKsh;
      }
      return 0; // relevance
    });
  }, [resources, searchQuery, selectedEducationLevel, selectedCategory, priceFilter, formatFilter, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedEducationLevel('all');
    setSelectedCategory('all');
    setPriceFilter('all');
    setFormatFilter('all');
    setSortBy('relevance');
  };

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedEducationLevel !== 'all' || 
    selectedCategory !== 'all' || 
    priceFilter !== 'all' || 
    formatFilter !== 'all';

  return (
    <div className="w-[99%] md:w-[95%] mx-auto px-1 sm:px-2 py-2 sm:py-3 space-y-2.5">
      {/* Top Filter & Search Controls */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-2.5 sm:p-4 shadow-2xs space-y-2">
        {/* Search input & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title, subject, curriculum, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-[12px] sm:text-[13px] focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white text-slate-800"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] sm:text-[12px] text-slate-700">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="downloads">Most Downloaded</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Recently Uploaded</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Education Level Quick Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] sm:text-[12px]">
          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider whitespace-nowrap pl-0.5">
            Level:
          </span>
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'primary', label: 'Primary (G1-6)' },
            { id: 'jss', label: 'Junior Sec (G7-9)' },
            { id: 'senior', label: 'Senior (G10-12)' },
            { id: 'college_uni', label: 'College / University' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedEducationLevel(lvl.id as any)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors font-medium ${
                selectedEducationLevel === lvl.id
                  ? 'bg-teal-700 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        {/* Category Quick Chips - Merged Readers, Novels & Storybooks */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] sm:text-[12px]">
          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider whitespace-nowrap pl-0.5">
            Category:
          </span>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'novels', label: 'Novels & Stories' },
            { id: 'notes', label: 'Revision Notes' },
            { id: 'exams', label: 'Past Exams' },
            { id: 'textbooks', label: 'Textbooks' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors font-medium ${
                selectedCategory === cat.id || 
                (cat.id === 'novels' && (selectedCategory === 'readers' || selectedCategory === 'storybooks'))
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Pricing Chips */}
          <div className="ml-auto flex items-center gap-1 pl-2 border-l border-slate-200">
            <button
              onClick={() => setPriceFilter(p => p === 'free' ? 'all' : 'free')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                priceFilter === 'free' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setPriceFilter(p => p === 'paid' ? 'all' : 'paid')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                priceFilter === 'paid' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Premium
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900">
            {selectedEducationLevel !== 'all' ? selectedEducationLevel.toUpperCase().replace('_', ' ') : 'Academic Resources'}
            {selectedCategory !== 'all' && ` • ${selectedCategory.toUpperCase()}`}
          </h2>
          <p className="text-[11px] sm:text-[12px] text-slate-500">
            {filteredResources.length} resources found
          </p>
        </div>
      </div>

      {/* Grid of Results: 2 columns on mobile, 6 columns on desktop, 5px gap */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[5px]">
          {filteredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto my-6 space-y-2 text-[12px]">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-[14px] font-bold text-slate-800">No resources found</h3>
          <p className="text-slate-500 text-[12px] leading-relaxed">
            Try adjusting your search terms or clearing level and category filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-[12px] font-bold shadow-xs"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
