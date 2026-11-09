import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  BrainCircuit, 
  FileText, 
  HelpCircle, 
  Layers, 
  Calendar, 
  Send, 
  Copy, 
  Check, 
  RotateCw,
  BookOpen
} from 'lucide-react';

export const AiStudyToolsView: React.FC = () => {
  const { resources } = useApp();
  const [activeTab, setActiveTab] = useState<'tutor' | 'summarize' | 'questions' | 'flashcards' | 'planner'>('tutor');

  // Study Assistant State
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorLevel, setTutorLevel] = useState('Senior School (KCSE / Grade 10-12)');
  const [tutorSubject, setTutorSubject] = useState('Mathematics & Sciences');
  const [enableHighThinking, setEnableHighThinking] = useState(true);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [modelLabel, setModelLabel] = useState<string | null>(null);

  // Summarizer State
  const [selectedMaterialText, setSelectedMaterialText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);

  // Question Generator State
  const [qSubject, setQSubject] = useState('Biology');
  const [qTopic, setQTopic] = useState('Cell Division & Genetics');
  const [qLevel, setQLevel] = useState('Senior School');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [qLoading, setQLoading] = useState(false);

  // Flashcards State
  const [fcTopic, setFcTopic] = useState('Organic Chemistry');
  const [fcSubject, setFcSubject] = useState('Chemistry');
  const [fcCards, setFcCards] = useState<{ id: string; front: string; back: string; category: string }[]>([]);
  const [fcLoading, setFcLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Study Planner State
  const [planLevel, setPlanLevel] = useState('Senior School');
  const [planSubjects, setPlanSubjects] = useState('Mathematics, Physics, Chemistry, Biology');
  const [planHours, setPlanHours] = useState(3);
  const [planGoal, setPlanGoal] = useState('Aiming for an A in upcoming national examinations');
  const [planResult, setPlanResult] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  // Tutor Submit
  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuestion.trim() || tutorLoading) return;
    setTutorLoading(true);
    setTutorResponse(null);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: tutorQuestion,
          educationLevel: tutorLevel,
          subject: tutorSubject,
          complexReasoning: enableHighThinking
        })
      });
      const data = await res.json();
      setTutorResponse(data.text || 'No response generated.');
      setModelLabel(data.modelUsed || (enableHighThinking ? 'gemini-4-argon (High Thinking)' : 'gemini-3.8-flash'));
    } catch (err: any) {
      setTutorResponse(`Error: ${err?.message || 'Could not connect to Gemini AI'}`);
    } finally {
      setTutorLoading(false);
    }
  };

  // Summarizer Submit
  const handleSummarizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialText.trim() || summaryLoading) return;
    setSummaryLoading(true);
    setSummaryResult(null);

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Selected Study Notes',
          content: selectedMaterialText,
          educationLevel: tutorLevel
        })
      });
      const data = await res.json();
      setSummaryResult(data.summary || 'Summary unavailable');
    } catch (err: any) {
      setSummaryResult(`Error: ${err?.message || 'Failed to summarize notes'}`);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Questions Submit
  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setQLoading(true);
    try {
      const res = await fetch('/api/ai/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: qSubject,
          topic: qTopic,
          educationLevel: qLevel,
          count: 4
        })
      });
      const data = await res.json();
      setGeneratedQuestions(data.questions || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setQLoading(false);
    }
  };

  // Flashcards Submit
  const handleGenerateFlashcards = async (e: React.FormEvent) => {
    e.preventDefault();
    setFcLoading(true);
    try {
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: fcSubject,
          topic: fcTopic,
          educationLevel: 'Senior School'
        })
      });
      const data = await res.json();
      setFcCards(data.flashcards || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setFcLoading(false);
    }
  };

  // Planner Submit
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanLoading(true);
    setPlanResult(null);
    try {
      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          educationLevel: planLevel,
          subjects: planSubjects.split(',').map(s => s.trim()),
          hoursPerDay: planHours,
          goals: planGoal
        })
      });
      const data = await res.json();
      setPlanResult(data.plan || 'Plan could not be generated.');
    } catch (err: any) {
      setPlanResult(`Error: ${err?.message || 'Failed to create plan'}`);
    } finally {
      setPlanLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
            <span>Gemini-4-Argon Thinking Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Academic Study Suite
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed font-light">
            Ask complex multi-step reasoning questions, generate instant revision flashcards, summarize dense lecture chapters, and craft personalized exam schedules.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs sm:text-sm font-semibold">
        {[
          { id: 'tutor', label: 'AI Study Assistant', icon: BrainCircuit },
          { id: 'summarize', label: 'Notes Summarizer', icon: FileText },
          { id: 'questions', label: 'Question Generator', icon: HelpCircle },
          { id: 'flashcards', label: 'Interactive Flashcards', icon: Layers },
          { id: 'planner', label: 'Study Timetable Planner', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI STUDY ASSISTANT (HIGH THINKING) */}
      {activeTab === 'tutor' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Input */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-teal-600" />
              <span>Ask Your Personal Academic Tutor</span>
            </h2>

            <form onSubmit={handleTutorSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Education Level</label>
                <select
                  value={tutorLevel}
                  onChange={(e) => setTutorLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                >
                  <option>Primary School (Grade 1–6)</option>
                  <option>Junior Secondary (KJSEA / Grade 7–9)</option>
                  <option>Senior School (KCSE / Grade 10–12)</option>
                  <option>College & University (Undergraduate & Postgraduate)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Area</label>
                <input
                  type="text"
                  value={tutorSubject}
                  onChange={(e) => setTutorSubject(e.target.value)}
                  placeholder="e.g. Organic Chemistry, Calculus, English Literature"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* High Thinking Toggle */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Deep Thinking Mode (Gemini-4-Argon)
                  </span>
                  <span className="text-[11px] text-slate-600">
                    ThinkingLevel.HIGH enables deep step-by-step mathematical & scientific reasoning.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableHighThinking}
                  onChange={(e) => setEnableHighThinking(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Question or Concept to Explain</label>
                <textarea
                  rows={4}
                  value={tutorQuestion}
                  onChange={(e) => setTutorQuestion(e.target.value)}
                  placeholder="e.g. Derive the quadratic formula step-by-step and explain how the discriminant predicts roots..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={tutorLoading || !tutorQuestion.trim()}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                {tutorLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Reasoning Deeply...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate Academic Explanation</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Response Output */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Tutor Output</span>
                  {modelLabel && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                      {modelLabel}
                    </span>
                  )}
                </div>
                {tutorResponse && (
                  <button
                    onClick={() => copyToClipboard(tutorResponse)}
                    className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 font-medium"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {tutorResponse ? (
                <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed selection:bg-teal-500 selection:text-white max-h-[500px] overflow-y-auto pr-2">
                  {tutorResponse}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                  <BrainCircuit className="w-10 h-10 stroke-1 text-slate-300 mb-2" />
                  <p className="text-xs">Ask any question to receive comprehensive academic guidance tailored to your education syllabus.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Book Club AI Engine</span>
              <span>Tailored for Kenyan & Global Curricula</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOTES SUMMARIZER */}
      {activeTab === 'summarize' && (
        <div className="mt-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>AI Notes & Textbook Summarizer</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Paste textbook chapters, lecture notes, or topic summaries to get executive bullet points, core definitions, and exam takeaways.
          </p>

          <form onSubmit={handleSummarizeSubmit} className="space-y-4">
            {/* Quick pre-populate buttons from library */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs text-slate-600 pb-1">
              <span className="font-semibold text-slate-400">Quick Sample:</span>
              {resources.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedMaterialText(r.samplePages?.[0]?.content || r.fullDescription)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 truncate max-w-xs transition-colors"
                >
                  {r.title}
                </button>
              ))}
            </div>

            <textarea
              rows={6}
              value={selectedMaterialText}
              onChange={(e) => setSelectedMaterialText(e.target.value)}
              placeholder="Paste notes, lecture transcripts, or textbook paragraphs here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />

            <button
              type="submit"
              disabled={summaryLoading || !selectedMaterialText.trim()}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
            >
              {summaryLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Executive Study Summary</span>
                </>
              )}
            </button>
          </form>

          {summaryResult && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900">Summary & Key Concepts</h3>
                <button
                  onClick={() => copyToClipboard(summaryResult)}
                  className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Summary</span>
                </button>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {summaryResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUESTION GENERATOR */}
      {activeTab === 'questions' && (
        <div className="mt-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            <span>AI Revision Question & Quiz Generator</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Instantly generate curriculum-aligned test questions with options, answers, and scoring criteria.
          </p>

          <form onSubmit={handleGenerateQuestions} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={qSubject}
                onChange={(e) => setQSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={qTopic}
                onChange={(e) => setQTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Level</label>
              <input
                type="text"
                value={qLevel}
                onChange={(e) => setQLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={qLoading}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2"
              >
                {qLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Synthesizing Exam Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Revision Questions</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Generated Examination Questions</h3>
              {generatedQuestions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
                    <span>Q{idx + 1}: {q.question}</span>
                    <span className="text-teal-700 text-[10px] bg-teal-50 px-2 py-0.5 rounded">{q.marks} Marks</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                    {q.options?.map((opt: string, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        {String.fromCharCode(65 + i)}. {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-emerald-700 font-semibold">
                    Correct Answer: {q.correctAnswer}
                  </div>
                  <p className="mt-1 text-slate-500 text-[11px]">
                    <span className="font-semibold">Explanation:</span> {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="mt-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <span>Interactive Active-Recall Flashcards</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Click on any card to flip between front prompt and back solution. Perfect for spaced repetition revision.
          </p>

          <form onSubmit={handleGenerateFlashcards} className="flex gap-3 mb-6">
            <input
              type="text"
              value={fcTopic}
              onChange={(e) => setFcTopic(e.target.value)}
              placeholder="e.g. Enzymes & Digestion, Trigonometric Identities"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
            <button
              type="submit"
              disabled={fcLoading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              {fcLoading ? 'Generating...' : 'Create Flashcards'}
            </button>
          </form>

          {fcCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fcCards.map((card) => {
                const isFlipped = flippedCards[card.id];
                return (
                  <div
                    key={card.id}
                    onClick={() => setFlippedCards(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                    className={`min-h-[160px] p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-xs ${
                      isFlipped
                        ? 'bg-teal-700 text-white border-teal-800'
                        : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-2 opacity-75">
                        <span>{card.category}</span>
                        <span>{isFlipped ? 'ANSWER / BACK' : 'QUESTION / FRONT'}</span>
                      </div>
                      <p className="text-sm font-semibold leading-relaxed">
                        {isFlipped ? card.back : card.front}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-current/10 text-[10px] opacity-75 flex items-center justify-between">
                      <span>Click to flip</span>
                      <RotateCw className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Generate cards on any topic to begin your active recall study session.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: STUDY PLANNER */}
      {activeTab === 'planner' && (
        <div className="mt-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Personalized AI Study Timetable Planner</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Generates a customized, balanced weekly revision schedule with structured active recall blocks and break times.
          </p>

          <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Education Level</label>
              <input
                type="text"
                value={planLevel}
                onChange={(e) => setPlanLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subjects to Revise (comma separated)</label>
              <input
                type="text"
                value={planSubjects}
                onChange={(e) => setPlanSubjects(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daily Study Hours Available</label>
              <input
                type="number"
                min={1}
                max={12}
                value={planHours}
                onChange={(e) => setPlanHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Examination / Academic Goal</label>
              <input
                type="text"
                value={planGoal}
                onChange={(e) => setPlanGoal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={planLoading}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2"
              >
                {planLoading ? 'Generating Schedule...' : 'Generate 7-Day Study Timetable'}
              </button>
            </div>
          </form>

          {planResult && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900">Your Structured Weekly Timetable</h3>
                <button
                  onClick={() => copyToClipboard(planResult)}
                  className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Timetable</span>
                </button>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {planResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
