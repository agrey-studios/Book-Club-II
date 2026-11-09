import React, { useState, useEffect, useRef } from 'react';
import { ResourceItem } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Bookmark, 
  Check, 
  Search, 
  Sparkles, 
  Type, 
  Sun, 
  Moon, 
  Coffee, 
  List, 
  Download,
  Send,
  BookOpen,
  FileText,
  Volume2,
  VolumeX,
  Printer,
  RotateCw,
  Columns,
  Square,
  Layers
} from 'lucide-react';

interface DigitalReaderProps {
  resource: ResourceItem;
  onClose: () => void;
}

export const DigitalReader: React.FC<DigitalReaderProps> = ({ resource, onClose }) => {
  const { 
    addBookmark, 
    removeBookmark,
    isPageBookmarked,
    bookmarks, 
    readingProgress, 
    readerInitialPage,
    updateReadingProgress, 
    recordDownload 
  } = useApp();

  const totalPages = Math.max(resource.samplePages?.length || 0, resource.pagesCount || 12);
  const initialPage = (readerInitialPage && readerInitialPage >= 1 && readerInitialPage <= totalPages) 
    ? readerInitialPage 
    : (readingProgress[resource.id]?.currentPage || 1);

  // View Mode: 'book' (2-page book experience) vs 'pdf' (PDF document view)
  const [viewMode, setViewMode] = useState<'book' | 'pdf'>('book');

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [fontSize, setFontSize] = useState<number>(15);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkTargetPage, setBookmarkTargetPage] = useState<number>(currentPage);
  const [bookmarkNoteInput, setBookmarkNoteInput] = useState('');
  const [searchInDoc, setSearchInDoc] = useState('');
  const [bookmarkSaved, setBookmarkSaved] = useState(false);

  // Jump to readerInitialPage if changed externally
  useEffect(() => {
    if (readerInitialPage && readerInitialPage >= 1 && readerInitialPage <= totalPages) {
      setCurrentPage(readerInitialPage);
    }
  }, [readerInitialPage, totalPages]);

  // Audio Text-to-Speech
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // AI Document Assistant drawer state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: `Hello! I am your AI Study Tutor. Ask me any question about "${resource.title}", whether you want difficult concepts explained simply, chapter summaries, or past exam revision questions.`
    }
  ]);

  // Sync reading progress
  useEffect(() => {
    updateReadingProgress(resource.id, currentPage, totalPages);
  }, [currentPage]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text to speech narration handler
  const handleToggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const pageText = getPageData(currentPage).content;
      const cleanText = `${getPageData(currentPage).title}. ${pageText}`;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleNextPage = () => {
    if (viewMode === 'book') {
      setCurrentPage(p => Math.min(totalPages, p + 2));
    } else {
      if (currentPage < totalPages) setCurrentPage(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (viewMode === 'book') {
      setCurrentPage(p => Math.max(1, p - 2));
    } else {
      if (currentPage > 1) setCurrentPage(p => p - 1);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullScreen(false);
    }
  };

  const isCurrentBookmarked = isPageBookmarked(resource.id, currentPage);
  const docBookmarks = bookmarks.filter(b => b.resourceId === resource.id);

  const handleOpenBookmarkModal = (targetPage: number) => {
    setBookmarkTargetPage(targetPage);
    const existing = bookmarks.find(b => b.resourceId === resource.id && b.pageNumber === targetPage);
    setBookmarkNoteInput(existing?.note || '');
    setShowBookmarkModal(true);
  };

  const handleSaveBookmarkWithNote = () => {
    const pageTitle = getPageData(bookmarkTargetPage).title;
    addBookmark(
      resource.id, 
      bookmarkTargetPage, 
      bookmarkNoteInput.trim() || `Bookmark on page ${bookmarkTargetPage}`, 
      pageTitle
    );
    setShowBookmarkModal(false);
    setBookmarkSaved(true);
    setTimeout(() => setBookmarkSaved(false), 2000);
  };

  const handleRemoveCurrentBookmark = (targetPage: number) => {
    const existing = bookmarks.find(b => b.resourceId === resource.id && b.pageNumber === targetPage);
    if (existing) {
      removeBookmark(existing.id);
    }
    setShowBookmarkModal(false);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  const handleDownloadFile = () => {
    recordDownload(resource);
    const element = document.createElement("a");
    const file = new Blob([
      `BOOK CLUB DIGITAL ARCHIVE\n============================\nTitle: ${resource.title}\nSubject: ${resource.subject}\nLevel: ${resource.educationLevel}\nGrade: ${resource.gradeLevel}\nAuthor: ${resource.authorName}\n\n${getPageData(currentPage).title}\n\n${getPageData(currentPage).content}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = resource.fileName || `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;

    const userQ = aiQuestion.trim();
    setAiMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setAiQuestion('');
    setAiLoading(true);

    try {
      const activeContent = getPageData(currentPage).content;
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          educationLevel: resource.educationLevel,
          subject: resource.subject,
          contextText: `Book Title: ${resource.title}\nPage ${currentPage} content:\n${activeContent}`,
          complexReasoning: true
        })
      });
      const data = await res.json();
      setAiMessages(prev => [...prev, { sender: 'ai', text: data.text || 'Unable to analyze text.' }]);
    } catch (err: any) {
      setAiMessages(prev => [...prev, { sender: 'ai', text: 'Error contacting AI study assistant. Please check your network connection.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper to generate dynamic, authentic page content across all pages
  const getPageData = (pageNum: number) => {
    const existing = resource.samplePages?.[pageNum - 1];
    if (existing) {
      return {
        title: existing.title || `Chapter ${Math.ceil(pageNum / 2)}: Section ${pageNum}`,
        content: existing.content
      };
    }

    // Dynamic educational academic content
    const chapterNum = Math.ceil(pageNum / 2);
    const sectionNum = (pageNum % 2 === 0 ? 2 : 1);

    const title = `${resource.subject} • Chapter ${chapterNum}.${sectionNum}: Core Concepts & Principles`;
    const content = `1.0 PEDAGOGICAL OBJECTIVE\nBy the end of this study module in ${resource.subject} (${resource.gradeLevel}), learners should be able to:\n• Accurately formulate the governing principles and definitions for this topic.\n• Apply scientific/literary reasoning to solve structured curriculum questions.\n• Interpret schematic charts, data tables, and empirical benchmarks.\n\n2.0 DETAILED THEORETICAL BREAKDOWN\nThe fundamental relationship in this domain requires understanding both qualitative definitions and quantitative frameworks. When evaluating national examination standards, clarity in working steps and proper units is vital.\n\n3.0 WORKED EXAMPLE & ASSESSMENT DRILL\nQuestion: Analyze the primary factors influencing the target outcome, and calculate the expected value under standard test conditions.\n\nStep 1: State the governing curriculum formula or analytical framework.\nStep 2: Substitute the known assessment parameters carefully.\nStep 3: State the final deduced conclusion with appropriate academic precision.\n\n4.0 REVISION & EXAM TIP\nPast national assessment moderators frequently award method marks for clear schematic diagrams, labeled axes, and explicit citations of relevant rules and principles. Ensure all terms are clearly defined.`;

    return { title, content };
  };

  // Highlight search text inside content
  const renderHighlightedContent = (text: string) => {
    if (!searchInDoc.trim()) return text;
    const parts = text.split(new RegExp(`(${searchInDoc})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchInDoc.toLowerCase() ? (
        <mark key={i} className="bg-amber-300 text-slate-950 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Theme styling helpers
  const getThemeClass = () => {
    switch (theme) {
      case 'dark': return 'bg-slate-950 text-slate-100';
      case 'sepia': return 'bg-[#FAF4E8] text-[#3D3325]';
      case 'light':
      default: return 'bg-slate-100 text-slate-900';
    }
  };

  const getToolbarBg = () => {
    switch (theme) {
      case 'dark': return 'bg-slate-900 border-slate-800 text-slate-200';
      case 'sepia': return 'bg-[#F2E8D5] border-[#E2D4BE] text-[#3D3325]';
      case 'light':
      default: return 'bg-white border-slate-200 text-slate-800';
    }
  };

  // Book Spread Pages: Left (even or page 1) and Right (odd or next)
  const leftPageNum = currentPage % 2 === 0 ? currentPage : Math.max(1, currentPage - 1);
  const rightPageNum = leftPageNum + 1 <= totalPages ? leftPageNum + 1 : null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${getThemeClass()} select-text overflow-hidden`}>
      {/* TOP READER TOOLBAR */}
      <header className={`h-13 px-2 sm:px-4 flex items-center justify-between border-b ${getToolbarBg()} z-30 shadow-2xs`}>
        {/* Left: Exit & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            title="Exit Reader"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[12px] sm:text-[14px] font-bold truncate max-w-[130px] sm:max-w-xs md:max-w-md">
                {resource.title}
              </h2>
              <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/10">
                {resource.fileFormat}
              </span>
            </div>
            <div className="text-[10px] opacity-70 flex items-center gap-1.5 leading-none">
              <span>{resource.subject}</span>
              <span>•</span>
              <span>{resource.gradeLevel}</span>
              <span>•</span>
              <span>{Math.round((currentPage / totalPages) * 100)}% read</span>
            </div>
          </div>
        </div>

        {/* Center: Experience Mode Switcher (Book Mode vs PDF View) */}
        <div className="flex items-center bg-black/5 p-0.5 rounded-xl border border-black/10 text-[11px] font-bold">
          <button
            onClick={() => setViewMode('book')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'book'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Book Spread Experience (2-page layout)"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Book View</span>
          </button>
          <button
            onClick={() => setViewMode('pdf')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'pdf'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="PDF Document Viewer (A4 sheet & thumbnails)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF Document</span>
          </button>
        </div>

        {/* Right: Actions, AI Tutor, Audio & Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Audio Narration TTS */}
          <button
            onClick={handleToggleAudio}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              isPlayingAudio ? 'bg-amber-500 text-slate-950 animate-pulse' : 'hover:bg-black/10 text-slate-700'
            }`}
            title={isPlayingAudio ? "Stop Audio Reader" : "Listen to Document (Text to Speech)"}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden xl:inline">{isPlayingAudio ? 'Listening...' : 'Listen'}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => handleOpenBookmarkModal(currentPage)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              isCurrentBookmarked 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs' 
                : bookmarkSaved 
                  ? 'bg-teal-600 text-white' 
                  : 'hover:bg-black/10 text-slate-700'
            }`}
            title={isCurrentBookmarked ? `Page ${currentPage} is bookmarked. Click to edit or remove.` : `Bookmark Page ${currentPage}`}
          >
            <Bookmark className={`w-4 h-4 ${isCurrentBookmarked ? 'fill-slate-950 text-slate-950' : ''}`} />
            <span className="hidden lg:inline text-[11px]">
              {isCurrentBookmarked ? `Page ${currentPage} Bookmarked` : 'Bookmark'}
            </span>
          </button>

          {/* Document Bookmarks Quick Drawer Toggle */}
          {docBookmarks.length > 0 && (
            <button
              onClick={() => setShowBookmarksDrawer(!showBookmarksDrawer)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 shadow-2xs ${
                showBookmarksDrawer 
                  ? 'bg-amber-500 text-slate-950 border-amber-600' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
              }`}
              title="View all saved bookmarks in this document"
            >
              <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{docBookmarks.length}</span>
              <span className="hidden sm:inline">Saved</span>
            </button>
          )}

          {/* Theme selector */}
          <div className="hidden sm:flex items-center bg-black/5 rounded-lg p-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`p-1 rounded ${theme === 'light' ? 'bg-white shadow-2xs text-slate-900' : 'opacity-60'}`}
              title="Light theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1 rounded ${theme === 'sepia' ? 'bg-[#FAF4E8] shadow-2xs text-[#3D3325]' : 'opacity-60'}`}
              title="Sepia parchment"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1 rounded ${theme === 'dark' ? 'bg-slate-800 shadow-2xs text-white' : 'opacity-60'}`}
              title="Dark theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Study Companion Toggle */}
          <button
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all ${
              showAiAssistant ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ask AI Tutor</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-black/10"
            title="Toggle Fullscreen"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* SECONDARY TOOLBAR FOR PDF MODE */}
      {viewMode === 'pdf' && (
        <div className={`h-10 px-3 flex items-center justify-between border-b ${getToolbarBg()} text-[11px] font-medium z-20`}>
          {/* Thumbnails toggle & Page Jumper */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`p-1 rounded hover:bg-black/10 flex items-center gap-1 ${showThumbnails ? 'bg-black/10 font-bold' : ''}`}
              title="Toggle Thumbnails Sidebar"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thumbnails</span>
            </button>

            <span className="opacity-40">|</span>

            {/* Page Jump */}
            <div className="flex items-center gap-1">
              <span>Page</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= totalPages) setCurrentPage(val);
                }}
                className="w-12 text-center bg-black/5 border border-black/15 rounded py-0.5 text-xs font-bold"
              />
              <span>of {totalPages}</span>
            </div>
          </div>

          {/* Zoom & Rotation Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center bg-black/5 rounded px-1.5 py-0.5 gap-1">
              <button
                onClick={() => setZoomLevel(z => Math.max(50, z - 15))}
                className="hover:text-teal-600 font-bold px-1"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-[10px]">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(z => Math.min(200, z + 15))}
                className="hover:text-teal-600 font-bold px-1"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="text-[9px] font-bold px-1 bg-black/10 rounded ml-1"
                title="Reset Zoom to 100%"
              >
                Fit
              </button>
            </div>

            <button
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="p-1 rounded hover:bg-black/10"
              title="Rotate Document Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handlePrintDocument}
              className="p-1 rounded hover:bg-black/10 hidden sm:flex"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDownloadFile}
              className="p-1 rounded hover:bg-black/10"
              title="Download Document"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN READER WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PDF Thumbnails Sidebar (in PDF mode) */}
        {viewMode === 'pdf' && showThumbnails && (
          <aside className={`w-36 sm:w-44 border-r ${getToolbarBg()} p-2 overflow-y-auto z-10 flex-shrink-0 text-[11px]`}>
            <div className="font-bold text-[10px] uppercase text-slate-400 mb-2 pl-1">Pages</div>
            <div className="space-y-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNo = idx + 1;
                const isCurrent = currentPage === pageNo;
                return (
                  <button
                    key={pageNo}
                    onClick={() => setCurrentPage(pageNo)}
                    className={`w-full p-1.5 rounded-lg border text-left transition-all ${
                      isCurrent 
                        ? 'border-teal-500 bg-teal-50 shadow-2xs ring-1 ring-teal-500' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="aspect-[3/4] bg-slate-50 border border-slate-100 rounded p-1 flex flex-col justify-between mb-1 overflow-hidden pointer-events-none">
                      <div className="text-[7px] text-slate-400 leading-tight line-clamp-3">
                        {getPageData(pageNo).title}
                      </div>
                      <div className="w-full bg-slate-200 h-0.5 rounded" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 block text-center">
                      Page {pageNo}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* READING STAGE */}
        <main className={`flex-1 overflow-auto flex justify-center p-2 sm:p-6 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-200/60'}`}>
          {/* 1. BOOK SPREAD MODE (2-PAGE REALISTIC BOOK SPREAD) */}
          {viewMode === 'book' ? (
            <div className="w-full max-w-5xl my-auto flex flex-col items-center justify-center">
              {/* Dual-Page Open Book Container */}
              <div 
                className="w-full relative rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col md:flex-row transition-transform"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: fontFamily === 'serif' ? 'Georgia, Cambria, serif' : 'Inter, sans-serif',
                  minHeight: '75vh'
                }}
              >
                {/* Left Page Interactive Bookmark Ribbon */}
                <button
                  type="button"
                  onClick={() => handleOpenBookmarkModal(leftPageNum)}
                  className={`absolute top-0 right-16 w-6 h-12 shadow-md rounded-b z-20 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isPageBookmarked(resource.id, leftPageNum)
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-black/20 hover:bg-red-500 text-white/80 hover:text-white'
                  }`}
                  title={isPageBookmarked(resource.id, leftPageNum) ? `Page ${leftPageNum} is bookmarked (Click to edit note)` : `Bookmark Page ${leftPageNum}`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isPageBookmarked(resource.id, leftPageNum) ? 'fill-white' : ''}`} />
                </button>

                {/* Left Page (Even) */}
                <div 
                  className={`flex-1 p-5 sm:p-10 flex flex-col justify-between relative ${
                    theme === 'dark' 
                      ? 'bg-slate-900 text-slate-100' 
                      : theme === 'sepia' 
                        ? 'bg-[#FAF4E8] text-[#3D3325]' 
                        : 'bg-white text-slate-900'
                  }`}
                >
                  {/* Running Header */}
                  <div className="border-b border-black/10 pb-2 mb-4 flex items-center justify-between text-[10px] opacity-60">
                    <span className="truncate">{resource.title}</span>
                    <span>{resource.subject}</span>
                  </div>

                  {/* Left Page Body Content */}
                  <div className="flex-1 space-y-3">
                    <h3 className="font-bold text-[14px] sm:text-[16px] leading-tight">
                      {getPageData(leftPageNum).title}
                    </h3>
                    <div className="whitespace-pre-line leading-relaxed text-[12px] sm:text-[13px]">
                      {renderHighlightedContent(getPageData(leftPageNum).content)}
                    </div>
                  </div>

                  {/* Left Footer with Page Number on outer edge */}
                  <div className="border-t border-black/10 pt-3 mt-6 flex items-center justify-between text-[10px] opacity-60">
                    <span className="font-bold">Page {leftPageNum}</span>
                    <span>Book Club Digital Library</span>
                  </div>
                </div>

                {/* Center Book Crease / Spine Shadow */}
                <div className="hidden md:block w-6 bg-gradient-to-r from-black/20 via-black/5 to-black/20 z-10 shadow-inner flex-shrink-0" />

                {/* Right Page (Odd) - Only shown on tablets/desktop */}
                <div 
                  className={`hidden md:flex flex-1 p-5 sm:p-10 flex-col justify-between relative ${
                    theme === 'dark' 
                      ? 'bg-slate-900 text-slate-100' 
                      : theme === 'sepia' 
                        ? 'bg-[#FAF4E8] text-[#3D3325]' 
                        : 'bg-white text-slate-900'
                  }`}
                >
                  {rightPageNum ? (
                    <>
                      {/* Running Header */}
                      <div className="border-b border-black/10 pb-2 mb-4 flex items-center justify-between text-[10px] opacity-60">
                        <span>{resource.gradeLevel}</span>
                        <span className="truncate">{getPageData(rightPageNum).title}</span>
                      </div>

                      {/* Right Page Body Content */}
                      <div className="flex-1 space-y-3">
                        <h3 className="font-bold text-[14px] sm:text-[16px] leading-tight">
                          {getPageData(rightPageNum).title}
                        </h3>
                        <div className="whitespace-pre-line leading-relaxed text-[12px] sm:text-[13px]">
                          {renderHighlightedContent(getPageData(rightPageNum).content)}
                        </div>
                      </div>

                      {/* Right Footer with Page Number on outer edge */}
                      <div className="border-t border-black/10 pt-3 mt-6 flex items-center justify-between text-[10px] opacity-60">
                        <span>Verified Curriculum</span>
                        <span className="font-bold">Page {rightPageNum}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 text-xs">
                      <BookOpen className="w-10 h-10 mb-2" />
                      <p>End of Document</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* 2. PDF DOCUMENT SHEET VIEW (A4 Academic Sheet with Zoom & Rotation) */
            <div 
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out'
              }}
              className="w-full max-w-3xl my-4"
            >
              <div className="bg-white rounded-xl shadow-2xl border border-slate-300 p-8 sm:p-14 text-slate-900 relative min-h-[90vh] flex flex-col justify-between">
                {/* Official Academic Header Banner */}
                <div>
                  <div className="border-b-2 border-slate-900 pb-3 mb-6 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700">
                        REPUBLIC OF KENYA • NATIONAL CURRICULUM ARCHIVE
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5 tracking-tight">
                        {resource.title}
                      </h1>
                      <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2">
                        <span><strong>Level:</strong> {resource.educationLevel.toUpperCase()}</span>
                        <span>•</span>
                        <span><strong>Grade:</strong> {resource.gradeLevel}</span>
                        <span>•</span>
                        <span><strong>Subject:</strong> {resource.subject}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="px-2 py-0.5 bg-slate-900 text-white rounded font-mono font-bold text-[10px]">
                        CAT: {resource.category.toUpperCase()}
                      </span>
                      <div className="text-[9px] text-slate-400 mt-1">Ref: BKC-{resource.id.slice(0, 6)}</div>
                    </div>
                  </div>

                  {/* Watermark in background */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-[-30deg]">
                    <div className="text-6xl font-black uppercase text-slate-950 tracking-widest text-center">
                      BOOK CLUB ACADEMIC<br />VERIFIED REPOSITORY
                    </div>
                  </div>

                  {/* Page Title & Subject Content */}
                  <div className="space-y-4">
                    <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg">
                      <span className="text-[10px] font-bold uppercase text-teal-800">Topic Section</span>
                      <h2 className="text-base font-bold text-slate-900">{getPageData(currentPage).title}</h2>
                    </div>

                    <div className="text-[13px] leading-relaxed whitespace-pre-line text-slate-800">
                      {renderHighlightedContent(getPageData(currentPage).content)}
                    </div>

                    {/* Pedagogical Tip Box */}
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-xs">
                      <strong>Exam Master Tip:</strong> Always show formulas, complete working steps, and SI units when submitting calculations for national examination moderation.
                    </div>
                  </div>
                </div>

                {/* PDF Page Footer */}
                <div className="border-t border-slate-200 pt-4 mt-8 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Author: {resource.authorName} • Book Club Platform</span>
                  <span className="font-bold text-slate-900">Page {currentPage} of {totalPages}</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* AI STUDY ASSISTANT DRAWER */}
        {showAiAssistant && (
          <aside className={`w-80 sm:w-96 border-l ${getToolbarBg()} flex flex-col z-30 shadow-2xl`}>
            {/* AI Header */}
            <div className="p-3 border-b border-black/10 flex items-center justify-between bg-teal-50/50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-none">AI Study Tutor</span>
                  <span className="text-[9px] text-teal-700">Deep Reasoning Mode</span>
                </div>
              </div>
              <button onClick={() => setShowAiAssistant(false)} className="p-1 hover:bg-black/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white ml-6 rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 mr-6 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              ))}
              {aiLoading && (
                <div className="p-3 bg-white border border-slate-200 rounded-xl mr-6 text-slate-600 text-xs flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing curriculum concepts with Gemini...</span>
                </div>
              )}
            </div>

            {/* Ask AI Input */}
            <form onSubmit={handleAiAsk} className="p-2.5 border-t border-black/10 bg-white">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Ask a question about this page..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>

      {/* BOTTOM PAGINATION BAR */}
      <footer className={`h-12 px-3 sm:px-6 flex items-center justify-between border-t ${getToolbarBg()} z-30`}>
        {/* Previous Button */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/5 hover:bg-black/10 disabled:opacity-40 transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Center Page Slider / Indicator */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-24 sm:w-44 accent-teal-600 h-1.5 bg-black/10 rounded cursor-pointer"
          />
          <span className="text-xs font-bold">
            {viewMode === 'book' ? (
              rightPageNum ? `${leftPageNum}-${rightPageNum} / ${totalPages}` : `${leftPageNum} / ${totalPages}`
            ) : (
              `${currentPage} / ${totalPages}`
            )}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 transition-colors shadow-2xs"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* DOCUMENT BOOKMARKS DRAWER (List of saved pages in this document) */}
      {showBookmarksDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-72 sm:w-80 bg-white text-slate-900 shadow-2xl border-l border-slate-200 flex flex-col">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="font-bold text-[13px]">My Bookmarked Pages ({docBookmarks.length})</h3>
            </div>
            <button onClick={() => setShowBookmarksDrawer(false)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[12px]">
            {docBookmarks.length > 0 ? (
              docBookmarks.map((bm) => (
                <div key={bm.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">Page {bm.pageNumber}</span>
                    <span className="text-[10px] text-slate-400">{new Date(bm.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{bm.note || 'Bookmarked reference page'}</p>
                  <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <button
                      onClick={() => {
                        setCurrentPage(bm.pageNumber);
                        setShowBookmarksDrawer(false);
                      }}
                      className="px-2 py-0.5 rounded bg-teal-600 text-white font-bold text-[10px] hover:bg-teal-700"
                    >
                      Jump to Page
                    </button>
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="text-[10px] text-rose-600 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-slate-400 text-xs">No bookmarks in this document yet.</p>
            )}
          </div>
        </div>
      )}

      {/* BOOKMARK NOTE & EDIT MODAL */}
      {showBookmarkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 select-none">
          <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bookmark className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[13px] text-slate-900">Bookmark Page {bookmarkTargetPage}</h3>
                  <span className="text-[10px] text-slate-500">{resource.title}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowBookmarkModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Add Study Note or Reminder (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Important formula breakdown, key exam revision point..."
                  value={bookmarkNoteInput}
                  onChange={(e) => setBookmarkNoteInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white resize-none"
                />
              </div>

              <div className="p-2 rounded-lg bg-teal-50 border border-teal-100 text-[11px] text-teal-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                <span>Bookmarks sync to your Student Dashboard under "My Bookmarks".</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                {isPageBookmarked(resource.id, bookmarkTargetPage) ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveCurrentBookmark(bookmarkTargetPage)}
                    className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition-colors"
                  >
                    Remove Bookmark
                  </button>
                ) : <div />}

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowBookmarkModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBookmarkWithNote}
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-2xs"
                  >
                    Save Bookmark
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
