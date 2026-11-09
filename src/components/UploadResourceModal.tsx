import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceCategory, EducationLevel, ResourceItem } from '../types';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  DollarSign, 
  Image as ImageIcon 
} from 'lucide-react';

interface UploadResourceModalProps {
  onClose: () => void;
  onSuccess: (resource: ResourceItem) => void;
}

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({ onClose, onSuccess }) => {
  const { user, currentRole, publishResource, submitContributorApplication } = useApp();

  // If student tries to upload, allow them to fill out the application or demo publish
  const isAuthorizedContributor = currentRole !== 'student' || user?.role === 'admin';

  // Application form for learners
  const [qualifications, setQualifications] = useState('');
  const [institution, setInstitution] = useState('');
  const [roleRequested, setRoleRequested] = useState<'teacher' | 'author'>('teacher');
  const [appSubmitted, setAppSubmitted] = useState(false);

  // Upload fields
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('senior');
  const [gradeLevel, setGradeLevel] = useState('Grade 11–12 (Form 3–4)');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Electromagnetism & Waves');
  const [category, setCategory] = useState<ResourceCategory>('notes');
  const [curriculum, setCurriculum] = useState('KCSE / Senior Secondary');
  const [examSystem, setExamSystem] = useState('KCSE');
  const [fileFormat, setFileFormat] = useState<'pdf' | 'epub' | 'docx' | 'pptx' | 'txt'>('pdf');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80');
  const [fileName, setFileName] = useState('KCSE_Physics_Electromagnetism.pdf');
  const [pagesCount, setPagesCount] = useState(36);
  const [fileSize, setFileSize] = useState('3.8 MB');
  const [language, setLanguage] = useState('English');
  const [publicationYear, setPublicationYear] = useState('2026');
  const [isFree, setIsFree] = useState(true);
  const [priceKsh, setPriceKsh] = useState(150);
  const [copyrightDeclaration, setCopyrightDeclaration] = useState('I hereby declare and affirm that I own the copyright or have express authorized publishing permission for this academic educational material.');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim() || !agreedTerms) {
      setErrorMsg('Please complete all required fields and accept the copyright declaration.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    try {
      const created = await publishResource({
        title,
        shortDescription,
        fullDescription: fullDescription || shortDescription,
        educationLevel,
        gradeLevel,
        subject,
        topic,
        category,
        curriculum,
        examSystem,
        authorId: user?.uid || 'guest-contributor',
        authorName: user?.displayName || 'Educator Contributor',
        authorEmail: user?.email,
        authorRole: currentRole === 'author' ? 'Verified Author' : 'Senior Educator',
        coverImage,
        fileUrl: '#',
        fileName,
        fileFormat,
        fileSize,
        pagesCount: Number(pagesCount),
        language,
        publicationYear,
        isFree,
        priceKsh: isFree ? 0 : Number(priceKsh),
        copyrightDeclaration,
        downloadAllowed: true,
        readOnlineAllowed: true,
        status: user?.role === 'admin' ? 'published' : 'pending',
        samplePages: [
          {
            pageNumber: 1,
            title: `Unit 1: Introduction to ${topic}`,
            content: `Core foundational principles of ${subject} for ${educationLevel} learners. Designed to satisfy national curriculum learning benchmarks and assessment criteria.`
          },
          {
            pageNumber: 2,
            title: 'Sub-topic 1.2: Worked Examples & Revision Practice',
            content: 'Step 1: Identify given quantities.\nStep 2: Apply the governing scientific formula.\nStep 3: State the final unit clearly with appropriate precision.'
          }
        ]
      });

      onSuccess(created);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualifications.trim()) return;

    await submitContributorApplication({
      applicantId: user?.uid || 'guest-learner',
      applicantName: user?.displayName || 'Active Learner',
      applicantEmail: user?.email || 'learner@example.com',
      roleRequested,
      qualifications,
      institution
    });

    setAppSubmitted(true);
  };

  return (
    <div className="w-[99%] md:w-[95%] max-w-4xl mx-auto py-2 sm:py-3">
      <div className="relative bg-white rounded-2xl shadow-2xs border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
              Academic Resource Publishing
            </span>
            <h2 className="text-[15px] sm:text-[18px] font-bold mt-0.5">
              {isAuthorizedContributor ? 'Publish New Educational Resource' : 'Apply for Contributor Publishing Rights'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {!isAuthorizedContributor && !appSubmitted ? (
            /* Contributor Application Flow for Students */
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900">
                <h3 className="font-bold text-sm mb-1">Join the Book Club Educator Network</h3>
                <p className="text-xs text-teal-800 leading-relaxed">
                  To protect copyright and academic quality, publishing permissions for notes, exams, textbooks, and novels are reserved for verified Teachers, Lecturers, Authors, and Educational Institutions.
                </p>
              </div>

              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Publishing Role Requested</label>
                  <select
                    value={roleRequested}
                    onChange={(e) => setRoleRequested(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="teacher">Teacher / Lecturer (Notes, Past Papers & Marking Schemes)</option>
                    <option value="author">Author / Creator (Textbooks, Novels & Storybooks)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teaching Qualifications & Experience</label>
                  <textarea
                    rows={3}
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    placeholder="e.g. B.Ed in Mathematics / Chemistry, 6 years teaching in Senior Secondary..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Affiliated School or University</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Nairobi School, University of Nairobi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                  >
                    Submit Contributor Application
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : !isAuthorizedContributor && appSubmitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Application Submitted!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your application has been received by the Book Club editorial committee. You can check its status or test the Administrator panel to approve it immediately.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          ) : (
            /* Upload Resource Form */
            <form onSubmit={handleUploadSubmit} className="space-y-5 text-xs">
              {/* Title & Short Desc */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. KCSE Physics Form 4 Electromagnetism Comprehensive Notes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Short Summary (1–2 sentences) *</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Concise overview visible on resource cards..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Pedagogical Description</label>
                  <textarea
                    rows={3}
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Detailed topic outline, chapter list, and learning outcomes..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Categorization Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="notes">Notes</option>
                    <option value="exams">Exams & Revision</option>
                    <option value="textbooks">Textbooks</option>
                    <option value="readers">Readers</option>
                    <option value="novels">Novels</option>
                    <option value="storybooks">Storybooks</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Education Level *</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="primary">Primary School</option>
                    <option value="jss">Junior Secondary (JSS)</option>
                    <option value="senior">Senior School</option>
                    <option value="college_uni">College & University</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade or Level *</label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="e.g. Grade 8, Form 4, Year 2"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Subject & Curriculum */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic / Module</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Curriculum Framework</label>
                  <input
                    type="text"
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* File details & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format</label>
                  <select
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="epub">EPUB eBook</option>
                    <option value="docx">Microsoft Word (DOCX)</option>
                    <option value="pptx">PowerPoint (PPTX)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Access Tier</label>
                  <select
                    value={isFree ? 'free' : 'paid'}
                    onChange={(e) => setIsFree(e.target.value === 'free')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="free">Free (Open Access)</option>
                    <option value="paid">Premium (Paid Material)</option>
                  </select>
                </div>

                {!isFree && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Price (KSh)</label>
                    <input
                      type="number"
                      min={50}
                      step={10}
                      value={priceKsh}
                      onChange={(e) => setPriceKsh(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Real File Upload & Media Dropzone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Document File Selector */}
                <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-3 bg-slate-50/50 text-center">
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Select Document File (PDF, EPUB, DOCX) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.epub,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFileName(file.name);
                        setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                        const ext = file.name.split('.').pop()?.toLowerCase();
                        if (ext === 'pdf' || ext === 'epub' || ext === 'docx') {
                          setFileFormat(ext as any);
                        }
                        if (!title) {
                          setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
                        }
                      }
                    }}
                    className="text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer w-full"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {fileName} ({fileSize})
                  </p>
                </div>

                {/* Cover Image / Media Selector */}
                <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-3 bg-slate-50/50 text-center">
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Cover Image / Media (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) setCoverImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer w-full"
                  />
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <img src={coverImage} alt="Cover Preview" className="w-6 h-8 rounded object-cover border border-slate-200" />
                    <span className="text-[10px] text-slate-400">Preview</span>
                  </div>
                </div>
              </div>

              {/* Copyright & IP Declaration */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 mt-0.5"
                      required
                    />
                    <span className="text-[11px] leading-relaxed">
                      <strong>Copyright & License Declaration:</strong> I warrant that I am the author or have full legitimate license to publish this material on Book Club. I understand that unauthorized copyrighted content is strictly prohibited and subject to takedown and account suspension.
                    </span>
                  </label>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {uploading ? 'Publishing Material...' : 'Publish to Book Club'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
