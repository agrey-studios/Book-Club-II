import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceCard } from './ResourceCard';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  FileText, 
  Award, 
  HelpCircle,
  ChevronDown,
  Layers,
  Library
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { resources, setActiveView, setSelectedCategory, setSelectedEducationLevel } = useApp();

  // Detect desktop (>= 1024px) for 6 columns x 2 rows (12 items) vs mobile (2 columns x 2 rows = 4 items)
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initialBatch = isDesktop ? 12 : 4;
  const stepBatch = isDesktop ? 12 : 4;

  // 1. Novels & Literature (Merged: novels, readers, storybooks)
  const novelsAndLiterature = useMemo(() => {
    return resources.filter(
      r => r.category === 'novels' || r.category === 'readers' || r.category === 'storybooks'
    );
  }, [resources]);

  // 2. Notes
  const notesResources = useMemo(() => {
    return resources.filter(r => r.category === 'notes');
  }, [resources]);

  // 3. Exams
  const examResources = useMemo(() => {
    return resources.filter(r => r.category === 'exams');
  }, [resources]);

  // Display limits with "Load More" button per section
  const [novelsLimit, setNovelsLimit] = useState(initialBatch);
  const [notesLimit, setNotesLimit] = useState(initialBatch);
  const [examsLimit, setExamsLimit] = useState(initialBatch);

  // Sync limits when responsive view transitions
  useEffect(() => {
    setNovelsLimit(initialBatch);
    setNotesLimit(initialBatch);
    setExamsLimit(initialBatch);
  }, [initialBatch]);

  // 4. "After last section on homepage, show all remaining resources (Title: Resources), auto load more on scroll."
  const remainingResources = useMemo(() => {
    // Collect IDs shown in the initial view of top sections
    const topIds = new Set([
      ...novelsAndLiterature.slice(0, novelsLimit).map(r => r.id),
      ...notesResources.slice(0, notesLimit).map(r => r.id),
      ...examResources.slice(0, examsLimit).map(r => r.id)
    ]);
    const remaining = resources.filter(r => !topIds.has(r.id));
    return remaining.length > 0 ? remaining : resources;
  }, [resources, novelsAndLiterature, novelsLimit, notesResources, notesLimit, examResources, examsLimit]);

  const [resourceLoadLimit, setResourceLoadLimit] = useState(initialBatch);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const observerSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setResourceLoadLimit(initialBatch);
  }, [initialBatch]);

  // IntersectionObserver for auto load more on scroll
  useEffect(() => {
    const sentinel = observerSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && resourceLoadLimit < remainingResources.length && !isAutoLoading) {
          setIsAutoLoading(true);
          // Auto load next batch smoothly on scroll
          setTimeout(() => {
            setResourceLoadLimit(prev => Math.min(prev + stepBatch, remainingResources.length));
            setIsAutoLoading(false);
          }, 350);
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [resourceLoadLimit, remainingResources.length, isAutoLoading, stepBatch]);

  return (
    <div className="w-[99%] md:w-[95%] mx-auto px-0.5 sm:px-2 py-2 space-y-3">
      {/* Quick Level Filter Pills + Ask AI Tutor Quick Launcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
        {/* Education Level Selector Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] sm:text-[12px]">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider pl-1 pr-0.5">
            Level:
          </span>
          {[
            { id: 'primary', label: 'Primary (G1-6)' },
            { id: 'jss', label: 'JSS (G7-9)' },
            { id: 'senior', label: 'Senior (G10-12)' },
            { id: 'college_uni', label: 'University' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => {
                setSelectedEducationLevel(lvl.id as any);
                setActiveView('explore');
              }}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold whitespace-nowrap transition-colors"
            >
              {lvl.label}
            </button>
          ))}
        </div>

        {/* Ask AI Tutor Action */}
        <button
          onClick={() => setActiveView('ai-tools')}
          className="flex items-center justify-between sm:justify-start gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-bold text-[11px] sm:text-[12px] shadow-2xs transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
            <span>Ask AI Tutor</span>
          </div>
          <span className="text-[10px] text-amber-800 font-normal">Deep Thinking Mode &rarr;</span>
        </button>
      </div>

      {/* 1. SECTION: NOVELS & LITERATURE (2 cols mobile, 5 cols desktop) */}
      <section className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-2 sm:p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-rose-600" />
            <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
              Novels, Readers & Literature
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('novels');
              setActiveView('explore');
            }}
            className="text-[11px] sm:text-[12px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-0.5"
          >
            <span>See All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 2 columns on mobile (2 rows = 4 items), 5 columns on desktop (2 rows = 10 items) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[5px]">
          {novelsAndLiterature.slice(0, novelsLimit).map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>

        {/* Load More Button for Section */}
        {novelsAndLiterature.length > novelsLimit && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setNovelsLimit(prev => prev + stepBatch)}
              className="px-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] sm:text-[12px] inline-flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Load More ({novelsAndLiterature.length - novelsLimit} remaining)</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 2. SECTION: REVISION & SUBJECT NOTES (2 cols mobile, 5 cols desktop) */}
      <section className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-2 sm:p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
              Curriculum Revision Notes
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('notes');
              setActiveView('explore');
            }}
            className="text-[11px] sm:text-[12px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-0.5"
          >
            <span>See All Notes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 2 columns on mobile, 5 columns on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[5px]">
          {notesResources.slice(0, notesLimit).map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>

        {/* Load More Button for Section */}
        {notesResources.length > notesLimit && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setNotesLimit(prev => prev + stepBatch)}
              className="px-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] sm:text-[12px] inline-flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Load More ({notesResources.length - notesLimit} remaining)</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 3. SECTION: PAST PAPERS & EXAMINATIONS (2 cols mobile, 5 cols desktop) */}
      <section className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-2 sm:p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
              Past Examination Papers & Marking Schemes
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('exams');
              setActiveView('explore');
            }}
            className="text-[11px] sm:text-[12px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-0.5"
          >
            <span>See All Exams</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 2 columns on mobile, 5 columns on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[5px]">
          {examResources.slice(0, examsLimit).map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>

        {/* Load More Button for Section */}
        {examResources.length > examsLimit && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setExamsLimit(prev => prev + stepBatch)}
              className="px-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] sm:text-[12px] inline-flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Load More ({examResources.length - examsLimit} remaining)</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 4. SECTION: RESOURCES (After last section on homepage, show all remaining resources, auto load more on scroll) */}
      <section className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-2 sm:p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Library className="w-4 h-4 text-teal-600" />
            <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
              Resources
            </h2>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
            Showing {Math.min(resourceLoadLimit, remainingResources.length)} of {remainingResources.length} items
          </span>
        </div>

        {/* 2 columns on mobile, 5 columns on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[5px]">
          {remainingResources.slice(0, resourceLoadLimit).map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>

        {/* Auto Load More on Scroll Sentinel */}
        {resourceLoadLimit < remainingResources.length ? (
          <div ref={observerSentinelRef} className="py-3 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200 shadow-2xs">
              <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <span>Auto loading more resources on scroll...</span>
            </div>
          </div>
        ) : (
          <div className="py-2.5 text-center text-[10px] sm:text-[11px] text-slate-400">
            <span>All resources loaded ({remainingResources.length} items)</span>
          </div>
        )}
      </section>

      {/* Compact Request Banner */}
      <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-teal-700 flex-shrink-0" />
          <span className="text-slate-700 leading-tight">
            Can't find a set book or past paper? <strong>Request it directly</strong>.
          </span>
        </div>
        <button
          onClick={() => setActiveView('requests')}
          className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-bold text-[11px] whitespace-nowrap shadow-xs"
        >
          Request
        </button>
      </div>
    </div>
  );
};
