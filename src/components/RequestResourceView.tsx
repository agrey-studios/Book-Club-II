import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceRequest, ResourceCategory, EducationLevel } from '../types';
import { 
  HelpCircle, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send, 
  BookOpen, 
  ChevronRight,
  Filter
} from 'lucide-react';

export const RequestResourceView: React.FC = () => {
  const { 
    user, 
    resourceRequests, 
    submitResourceRequest, 
    currentRole, 
    setActiveView, 
    setSelectedResourceId 
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'fulfilled'>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('senior');
  const [gradeLevel, setGradeLevel] = useState('Grade 11–12 (Form 3–4)');
  const [subject, setSubject] = useState('Chemistry');
  const [category, setCategory] = useState<ResourceCategory>('notes');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    await submitResourceRequest({
      studentId: user?.uid || 'guest-student',
      studentName: user?.displayName || 'Active Student',
      studentEmail: user?.email,
      title,
      educationLevel,
      gradeLevel,
      subject,
      category,
      description
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(false);
      setTitle('');
      setDescription('');
    }, 2000);
  };

  const filtered = resourceRequests.filter(r => filterStatus === 'all' || r.status === filterStatus);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-2 border border-teal-500/30">
            <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Community Academic Sourcing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Request a Missing Resource</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Cannot find a specific textbook, revision past paper, or lecture module? Post a request to our community of verified educators.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Request</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {['all', 'open', 'fulfilled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filterStatus === st ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Requests' : st}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} requests</span>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.map((req) => (
          <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  req.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {req.status}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{req.category}</span>
                <span className="text-[11px] text-slate-400">•</span>
                <span className="text-[11px] text-slate-500">{req.educationLevel}</span>
                <span className="text-[11px] text-slate-400">•</span>
                <span className="text-[11px] text-slate-700 font-medium">{req.subject} ({req.gradeLevel})</span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{req.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{req.description}</p>
              <div className="text-[11px] text-slate-400 pt-1">
                Requested by {req.studentName} on {new Date(req.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {req.status === 'fulfilled' && req.fulfilledResourceId ? (
                <button
                  onClick={() => {
                    setSelectedResourceId(req.fulfilledResourceId!);
                    setActiveView('resource-detail');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Material</span>
                </button>
              ) : currentRole !== 'student' ? (
                <button
                  onClick={() => setActiveView('upload')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <span>Upload & Fulfill</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">Under review by educators</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal to Submit New Request */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 my-auto">
            <h3 className="font-bold text-lg text-slate-900 mb-1">Submit Resource Request</h3>
            <p className="text-xs text-slate-500 mb-6">Describe the educational materials you need.</p>

            {submitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900">Request Broadcasted!</h4>
                <p className="text-xs text-slate-500">Educators and teachers have been alerted.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. KCSE Chemistry Form 3 Gas Laws Topical Questions"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Education Level</label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="primary">Primary School</option>
                      <option value="jss">Junior Secondary</option>
                      <option value="senior">Senior School</option>
                      <option value="college_uni">College & University</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="notes">Notes</option>
                      <option value="exams">Exams & Papers</option>
                      <option value="textbooks">Textbooks</option>
                      <option value="readers">Readers</option>
                      <option value="novels">Novels</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Grade or Level</label>
                    <input
                      type="text"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Specify target curriculum (e.g. CBC, KCSE), particular sub-topics or past years needed..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs text-xs"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
