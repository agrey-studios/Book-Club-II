import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Examination, ExamAttempt, ExamQuestion } from '../types';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  PlusCircle, 
  ArrowLeft, 
  Sparkles,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnlineExamView: React.FC = () => {
  const { 
    user, 
    examinations, 
    recordExamAttempt, 
    examAttempts, 
    currentRole 
  } = useApp();

  const [activeExam, setActiveExam] = useState<Examination | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<ExamAttempt | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // Examination Creation Form (For Teachers/Authors)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newLevel, setNewLevel] = useState<'primary' | 'jss' | 'senior' | 'college_uni'>('senior');
  const [newDuration, setNewDuration] = useState(15);
  const [newQuestions, setNewQuestions] = useState<ExamQuestion[]>([
    {
      id: 'nq1',
      question: 'Which element is essential for organic compounds?',
      type: 'multiple_choice',
      options: ['Carbon', 'Helium', 'Argon', 'Neon'],
      correctAnswer: 'Carbon',
      explanation: 'Carbon has a valency of 4 and forms stable covalent chains, forming the basis of all organic chemistry.',
      marks: 5
    }
  ]);

  // Timer countdown
  useEffect(() => {
    if (!activeExam || isExamCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam, isExamCompleted, timeLeft]);

  const handleStartExam = (exam: Examination) => {
    setActiveExam(exam);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(exam.durationMinutes * 60);
    setIsExamCompleted(false);
    setLatestAttempt(null);
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;

    let score = 0;
    const totalMarks = activeExam.totalMarks;

    activeExam.questions.forEach((q) => {
      const studentAns = selectedAnswers[q.id];
      if (studentAns && studentAns.toLowerCase() === q.correctAnswer.toLowerCase()) {
        score += q.marks;
      }
    });

    const percentage = Math.round((score / (totalMarks || 1)) * 100);
    const timeSpent = (activeExam.durationMinutes * 60) - timeLeft;

    const attempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      examId: activeExam.id,
      examTitle: activeExam.title,
      studentId: user?.uid || 'guest',
      studentName: user?.displayName || 'Learner',
      score,
      totalMarks,
      percentage,
      answers: selectedAnswers,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: timeSpent
    };

    setLatestAttempt(attempt);
    setIsExamCompleted(true);
    recordExamAttempt(attempt);

    // Fire celebratory confetti if student passes
    if (score >= activeExam.passingScore) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe confetti fallback
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredExams = examinations.filter(e => filterLevel === 'all' || e.educationLevel === filterLevel);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* If in active exam mode */}
      {activeExam ? (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Active Exam Header */}
          <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                {activeExam.subject} • {activeExam.gradeLevel}
              </span>
              <h2 className="text-lg sm:text-xl font-bold truncate max-w-md mt-0.5">
                {activeExam.title}
              </h2>
            </div>

            {/* Timer Badge */}
            {!isExamCompleted && (
              <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-mono font-bold text-sm shadow-xs ${
                timeLeft < 180 ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {!isExamCompleted ? (
            /* Live Question View */
            <div className="p-6 sm:p-8">
              {/* Question Progress Tracker */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
                <span>
                  Question {currentQuestionIndex + 1} of {activeExam.questions.length}
                </span>
                <span className="font-semibold text-teal-700">
                  Worth {activeExam.questions[currentQuestionIndex].marks} Marks
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
                <div 
                  className="bg-teal-600 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / activeExam.questions.length) * 100}%` }}
                />
              </div>

              {/* Current Question */}
              {(() => {
                const q = activeExam.questions[currentQuestionIndex];
                return (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-6">
                      {q.question}
                    </h3>

                    {/* Options */}
                    <div className="space-y-3">
                      {q.options?.map((opt, idx) => {
                        const isSelected = selectedAnswers[q.id] === opt;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-teal-50 border-teal-500 text-teal-950 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Question Navigation Controls */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>

                {currentQuestionIndex < activeExam.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(i => Math.min(activeExam.questions.length - 1, i + 1))}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitExam}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                  >
                    Submit Exam & View Results
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results & Report Card */
            <div className="p-6 sm:p-8">
              <div className="text-center py-6">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg mb-4 ${
                  (latestAttempt?.score || 0) >= activeExam.passingScore ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <Award className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  {(latestAttempt?.score || 0) >= activeExam.passingScore ? 'Congratulations, You Passed!' : 'Exam Completed'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Passing mark is {activeExam.passingScore} / {activeExam.totalMarks} Marks
                </p>

                {/* Score Big Display */}
                <div className="mt-6 inline-flex items-baseline gap-2 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-200">
                  <span className="text-4xl font-extrabold text-slate-900">{latestAttempt?.score}</span>
                  <span className="text-slate-400 font-semibold">/ {activeExam.totalMarks} Marks</span>
                  <span className="ml-3 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                    {latestAttempt?.percentage}%
                  </span>
                </div>
              </div>

              {/* Explanations Breakdown */}
              <div className="mt-6 space-y-4">
                <h4 className="font-bold text-sm text-slate-900">Detailed Answer Review & Examiner Explanations</h4>
                {activeExam.questions.map((q, idx) => {
                  const studentAnswer = selectedAnswers[q.id];
                  const isCorrect = studentAnswer?.toLowerCase() === q.correctAnswer.toLowerCase();
                  return (
                    <div key={q.id} className={`p-4 rounded-2xl border text-xs ${
                      isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">Q{idx + 1}: {q.question}</span>
                        {isCorrect ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white flex-shrink-0">
                            +{q.marks} Marks
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white flex-shrink-0">
                            0 Marks
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-slate-700">
                        <span className="font-semibold">Your Answer:</span> {studentAnswer || 'Unanswered'}
                      </div>
                      <div className="text-slate-700">
                        <span className="font-semibold">Correct Answer:</span> {q.correctAnswer}
                      </div>
                      <p className="mt-2 text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                        <span className="font-semibold text-teal-700">Explanation:</span> {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Back to all exams button */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => handleStartExam(activeExam)}
                  className="flex-1 py-3 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Examination</span>
                </button>
                <button
                  onClick={() => setActiveExam(null)}
                  className="flex-1 py-3 rounded-xl font-semibold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
                >
                  Browse Other Exams
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Exams Directory View */
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Online Examination & Practice</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Curriculum Assessment Quizzes
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Sharpen your exam technique with timed questions, instant scoring & step-by-step marking schemes
              </p>
            </div>

            {/* Level Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
              {['all', 'primary', 'jss', 'senior', 'college_uni'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-3 py-1.5 rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                    filterLevel === lvl ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl === 'all' ? 'All Levels' : lvl.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* List of Exams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                      {exam.subject}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {exam.gradeLevel}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {exam.title}
                  </h3>

                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                    {exam.description}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
                    <div>
                      <span className="block text-slate-400 text-[10px]">Duration</span>
                      <span className="font-bold text-slate-800">{exam.durationMinutes} mins</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px]">Questions</span>
                      <span className="font-bold text-slate-800">{exam.questionsCount}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px]">Pass Mark</span>
                      <span className="font-bold text-teal-700">{exam.passingScore}/{exam.totalMarks}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    By {exam.creatorName}
                  </div>
                  <button
                    onClick={() => handleStartExam(exam)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Start Practice</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Past Attempts Section */}
          {examAttempts.length > 0 && (
            <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-base text-slate-900 mb-4">Your Recent Examination Transcripts</h3>
              <div className="divide-y divide-slate-100">
                {examAttempts.map((att) => (
                  <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">{att.examTitle}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Completed {new Date(att.completedAt).toLocaleDateString()} • {Math.round(att.timeSpentSeconds / 60)} mins taken
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-teal-700">{att.score}/{att.totalMarks}</span>
                      <div className="text-[10px] font-semibold text-slate-500">{att.percentage}% Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
