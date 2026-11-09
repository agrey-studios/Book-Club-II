import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Bookmark, 
  DownloadCloud, 
  Award, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  FileText,
  User,
  Settings,
  Camera,
  Upload,
  Trash2,
  ExternalLink,
  Save,
  Check,
  X,
  File,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import { UserMediaFile } from '../types';

const SCHOLARLY_AVATARS = [
  { name: 'Scholar', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { name: 'Researcher', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { name: 'Educator', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
  { name: 'Student', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
  { name: 'Scientist', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
  { name: 'Reader', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
];

export const StudentDashboardView: React.FC = () => {
  const { 
    user, 
    updateUserProfile,
    userMediaFiles,
    uploadUserMediaFile,
    deleteUserMediaFile,
    library, 
    downloads, 
    bookmarks, 
    removeBookmark,
    openReader,
    readingProgress, 
    examAttempts, 
    resources, 
    setSelectedResourceId, 
    activeView,
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'library' | 'media' | 'downloads' | 'reading' | 'bookmarks' | 'exams' | 'subscription'>(() => {
    if (activeView === 'downloads') return 'downloads';
    if (activeView === 'library') return 'library';
    return 'overview';
  });

  React.useEffect(() => {
    if (activeView === 'downloads') setActiveTab('downloads');
    if (activeView === 'library') setActiveTab('library');
  }, [activeView]);

  // Account Edit Modal state
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || 'Academic Learner');
  const [editEmail, setEditEmail] = useState(user?.email || 'learner@bookclub.org');
  const [editInstitution, setEditInstitution] = useState(user?.institution || 'National Academic Network');
  const [editBio, setEditBio] = useState(user?.bio || 'Dedicated student preparing for national examinations and continuous assessment tests.');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '+254 700 000 000');
  const [editLevel, setEditLevel] = useState(user?.educationLevel || 'senior');
  const [editPhotoURL, setEditPhotoURL] = useState(user?.photoURL || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Picture File Upload input ref
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  // User Media/File Upload state
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaCategory, setMediaCategory] = useState('Study Notes');
  const [mediaDescription, setMediaDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaDataUrl, setMediaDataUrl] = useState<string>('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaUploadSuccess, setMediaUploadSuccess] = useState(false);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  // Sync edit form with user when opening
  const handleOpenEditModal = () => {
    setEditName(user?.displayName || 'Academic Learner');
    setEditEmail(user?.email || 'learner@bookclub.org');
    setEditInstitution(user?.institution || 'National Academic Network');
    setEditBio(user?.bio || 'Dedicated student preparing for national examinations and continuous assessment tests.');
    setEditPhone(user?.phoneNumber || '+254 700 000 000');
    setEditLevel(user?.educationLevel || 'senior');
    setEditPhotoURL(user?.photoURL || '');
    setSaveSuccess(false);
    setShowEditAccountModal(true);
  };

  // Direct Profile Photo File Selection
  const handleProfilePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        setEditPhotoURL(resultUrl);
        // Also update immediately if modal not open
        updateUserProfile({ photoURL: resultUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUserProfile({
      displayName: editName,
      email: editEmail,
      institution: editInstitution,
      bio: editBio,
      phoneNumber: editPhone,
      educationLevel: editLevel as any,
      photoURL: editPhotoURL || undefined
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowEditAccountModal(false);
    }, 1200);
  };

  // Media / File Upload Handler
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!mediaTitle) {
        setMediaTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      const reader = new FileReader();
      reader.onload = () => {
        setMediaDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !mediaTitle.trim()) return;

    setIsUploadingMedia(true);
    const fileName = selectedFile?.name || `${mediaTitle.replace(/\s+/g, '_')}.pdf`;
    const fileSize = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB';
    
    // Determine file type
    const ext = fileName.split('.').pop()?.toLowerCase();
    let fileType: UserMediaFile['fileType'] = 'document';
    if (ext === 'pdf') fileType = 'pdf';
    else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) fileType = 'image';
    else if (['mp3', 'wav', 'm4a'].includes(ext || '')) fileType = 'audio';
    else if (['mp4', 'mov'].includes(ext || '')) fileType = 'video';

    await uploadUserMediaFile({
      userId: user?.uid || 'guest',
      title: mediaTitle || fileName,
      fileName,
      fileType,
      fileSize,
      fileUrl: mediaDataUrl || '#',
      dataUrl: mediaDataUrl,
      description: mediaDescription || 'Personal educational study resource.',
      category: mediaCategory
    });

    setIsUploadingMedia(false);
    setMediaUploadSuccess(true);
    setSelectedFile(null);
    setMediaTitle('');
    setMediaDescription('');
    setMediaDataUrl('');
    if (mediaFileInputRef.current) mediaFileInputRef.current.value = '';

    setTimeout(() => setMediaUploadSuccess(false), 3000);
  };

  // Find resources in library
  const libraryResources = resources.filter(r => library.some(l => l.resourceId === r.id));

  // Find resources with reading progress
  const inProgressResources = resources
    .filter(r => readingProgress[r.id])
    .map(r => ({
      resource: r,
      progress: readingProgress[r.id]
    }));

  return (
    <div className="w-[99%] md:w-[95%] mx-auto px-1 sm:px-2 py-2.5 sm:py-3 space-y-3">
      {/* Hidden File Input for Direct Profile Picture Changing */}
      <input
        type="file"
        ref={profilePhotoInputRef}
        onChange={handleProfilePhotoFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Student Profile Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 m-[2px] sm:m-[3px]">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Avatar with Interactive Change Photo Overlay */}
          <div className="relative group cursor-pointer" onClick={() => profilePhotoInputRef.current?.click()}>
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-teal-500 shadow-2xs group-hover:opacity-85 transition-opacity" 
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center text-xl sm:text-2xl font-bold shadow-2xs group-hover:opacity-85 transition-opacity">
                {(user?.displayName || 'Learner').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4" />
              <span className="text-[9px] font-bold">Change</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                profilePhotoInputRef.current?.click();
              }}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs border border-white hover:bg-teal-700"
              title="Change profile picture"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-[14px] sm:text-[17px] font-bold text-slate-900 leading-tight">
                {user?.displayName || 'Academic Learner'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
                {user?.subscriptionTier || 'Free'} Tier
              </span>
            </div>
            <p className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">{user?.email || 'learner@bookclub.org'}</p>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-600 mt-1 flex-wrap">
              <span className="font-medium text-slate-700">{user?.institution || 'National Academic Network'}</span>
              <span>•</span>
              <span className="capitalize">{user?.role || 'student'}</span>
              <span>•</span>
              <span className="capitalize text-teal-700 font-semibold">{user?.educationLevel || 'Senior'} Level</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Edit Account & Upgrade */}
        <div className="flex items-center gap-2 pt-1 md:pt-0">
          <button
            onClick={handleOpenEditModal}
            className="px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit Account</span>
          </button>

          <button
            onClick={() => setActiveView('pricing')}
            className="px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>Upgrade Tier</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[5px] m-[2px] sm:m-[3px]">
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between text-teal-600 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">Library</span>
          </div>
          <div className="text-[17px] sm:text-[20px] font-bold text-slate-900 leading-none">{library.length}</div>
          <div className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Saved Books & Notes</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <FolderOpen className="w-4 h-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">My Uploads</span>
          </div>
          <div className="text-[17px] sm:text-[20px] font-bold text-slate-900 leading-none">{userMediaFiles.length}</div>
          <div className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Uploaded Files & Media</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <DownloadCloud className="w-4 h-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">Downloads</span>
          </div>
          <div className="text-[17px] sm:text-[20px] font-bold text-slate-900 leading-none">{downloads.length}</div>
          <div className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Offline Materials</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">Exams</span>
          </div>
          <div className="text-[17px] sm:text-[20px] font-bold text-slate-900 leading-none">{examAttempts.length}</div>
          <div className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Quizzes Attempted</div>
        </div>
      </div>

      {/* Dashboard Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1.5 overflow-x-auto text-[11px] sm:text-[12px] font-semibold">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'library', label: `My Library (${library.length})` },
          { id: 'media', label: `My Files & Media (${userMediaFiles.length})` },
          { id: 'reading', label: `Continue Reading (${inProgressResources.length})` },
          { id: 'downloads', label: `Downloads (${downloads.length})` },
          { id: 'bookmarks', label: `Bookmarks (${bookmarks.length})` },
          { id: 'exams', label: `Exam Transcripts (${examAttempts.length})` },
          { id: 'subscription', label: 'Subscription & Benefits' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Continue Reading Section */}
          {inProgressResources.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 shadow-2xs">
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
                  Continue Reading
                </h2>
                <button onClick={() => setActiveTab('reading')} className="text-[11px] font-bold text-teal-700 hover:underline">
                  View All ({inProgressResources.length})
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[5px]">
                {inProgressResources.slice(0, 3).map(({ resource, progress }) => (
                  <div
                    key={resource.id}
                    onClick={() => {
                      setSelectedResourceId(resource.id);
                      setActiveView('reader');
                    }}
                    className="bg-slate-50 rounded-xl border border-slate-200 p-2.5 hover:border-teal-400 transition-all cursor-pointer flex gap-2.5 m-[2px]"
                  >
                    <img src={resource.coverImage} alt={resource.title} className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-[12px] sm:text-[13px] text-slate-900 truncate">{resource.title}</h4>
                        <span className="text-[10px] text-slate-500">{resource.category.toUpperCase()} • p. {progress.currentPage} of {progress.totalPages}</span>
                      </div>
                      <div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mb-1">
                          <div className="bg-teal-600 h-full" style={{ width: `${progress.percentage}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-teal-700">{progress.percentage}% Read</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Access to Library - 6 Columns on Desktop */}
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
                Recently Saved to Library
              </h2>
              <button onClick={() => setActiveTab('library')} className="text-[11px] font-bold text-teal-700 hover:underline">
                Explore Library
              </button>
            </div>
            {libraryResources.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[5px]">
                {libraryResources.slice(0, 12).map((res) => (
                  <ResourceCard key={res.id} resource={res} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center text-[12px] text-slate-500">
                <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="font-medium text-slate-700">Your personal digital bookshelf is currently empty.</p>
                <button
                  onClick={() => setActiveView('explore')}
                  className="mt-2 px-3 py-1 bg-teal-600 text-white rounded-lg font-bold text-[11px] shadow-2xs"
                >
                  Discover Educational Resources
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MY LIBRARY TAB - 6 Columns on Desktop */}
      {activeTab === 'library' && (
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 shadow-2xs space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
              Your Saved Academic Resources
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">{libraryResources.length} items</span>
          </div>
          {libraryResources.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[5px]">
              {libraryResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-[12px] text-slate-500">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-800">No resources saved yet</p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                Click the bookmark icon on any notes, exam, or textbook card across the site to add it to your bookshelf.
              </p>
              <button
                onClick={() => setActiveView('explore')}
                className="mt-2.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] shadow-2xs"
              >
                Browse Catalog
              </button>
            </div>
          )}
        </div>
      )}

      {/* MY FILES & MEDIA TAB (Upload files, assignments, audio, photos) */}
      {activeTab === 'media' && (
        <div className="space-y-3">
          {/* File Upload Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-teal-600" />
                <h3 className="text-[13px] sm:text-[15px] font-bold text-slate-900">
                  Upload Personal Academic Files & Media
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">PDF, DOCX, Images, Audio, Notes</span>
            </div>

            <form onSubmit={handleUploadMediaSubmit} className="space-y-2 text-[12px]">
              {/* Dropzone File Selector */}
              <div 
                onClick={() => mediaFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-3 sm:p-4 text-center cursor-pointer bg-slate-50/70 hover:bg-teal-50/30 transition-colors"
              >
                <input
                  type="file"
                  ref={mediaFileInputRef}
                  onChange={handleMediaFileChange}
                  accept=".pdf,.doc,.docx,.txt,.epub,.jpg,.jpeg,.png,.webp,.mp3"
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                <p className="font-bold text-slate-800 text-[12px]">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop your file/media'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB • Ready to upload` : 'Supports PDF documents, summary sheets, images, and audio lectures (Max 50MB)'}
                </p>
              </div>

              {/* Title, Category & Description Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Document / Media Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Form 4 History Term 1 Paper Summary"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Category</label>
                  <select
                    value={mediaCategory}
                    onChange={(e) => setMediaCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Study Notes">Study Notes</option>
                    <option value="Assignments">Assignments</option>
                    <option value="Diagrams & Media">Diagrams & Media</option>
                    <option value="Past Exam Solutions">Past Exam Solutions</option>
                    <option value="Audio Lecture">Audio Lecture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Brief Notes / Summary</label>
                <input
                  type="text"
                  placeholder="Optional brief description of key concepts in this file"
                  value={mediaDescription}
                  onChange={(e) => setMediaDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {mediaUploadSuccess && (
                  <div className="flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>File uploaded and saved to your personal media cloud!</span>
                  </div>
                )}
                {!mediaUploadSuccess && <div />}
                <button
                  type="submit"
                  disabled={isUploadingMedia || (!selectedFile && !mediaTitle.trim())}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-[11px] sm:text-[12px] shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  {isUploadingMedia ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving File...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload to My Cloud</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* List of Uploaded Media Files */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
            <h3 className="text-[13px] sm:text-[15px] font-bold text-slate-900 mb-2">
              My Uploaded Files & Media Repository ({userMediaFiles.length})
            </h3>
            {userMediaFiles.length > 0 ? (
              <div className="divide-y divide-slate-100 text-[12px]">
                {userMediaFiles.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 border border-teal-200">
                        {item.fileType === 'pdf' ? (
                          <FileText className="w-4 h-4 text-rose-600" />
                        ) : item.fileType === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <File className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{item.title}</h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                            {item.category || item.fileType}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {item.fileName} • {item.fileSize} • Uploaded {new Date(item.uploadedAt).toLocaleDateString()}
                        </p>
                        {item.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.dataUrl && item.fileType === 'image' && (
                        <a
                          href={item.dataUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="hidden sm:inline">Preview</span>
                        </a>
                      )}
                      <button
                        onClick={() => deleteUserMediaFile(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 text-center py-6">
                No personal files uploaded yet. Upload your study notes or assignments above.
              </p>
            )}
          </div>
        </div>
      )}

      {/* DOWNLOADS TAB */}
      {activeTab === 'downloads' && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-2">
          <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
            Downloaded Materials History
          </h2>
          {downloads.length > 0 ? (
            <div className="divide-y divide-slate-100 text-[12px]">
              {downloads.map((dl) => (
                <div key={dl.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <DownloadCloud className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800">{dl.resourceTitle}</span>
                      <p className="text-[10px] text-slate-400">
                        Downloaded {new Date(dl.downloadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Offline Available
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 text-center py-6">No downloads recorded yet.</p>
          )}
        </div>
      )}

      {/* BOOKMARKS TAB */}
      {activeTab === 'bookmarks' && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
                My Bookmarked Pages
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Quickly jump back to saved pages, notes, and study sections.</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-lg">
              {bookmarks.length} Bookmarks
            </span>
          </div>

          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {bookmarks.map((bm) => {
                const parentResource = resources.find(r => r.id === bm.resourceId);
                const title = bm.resourceTitle || parentResource?.title || 'Academic Resource';
                const cover = bm.coverImage || parentResource?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                const subject = bm.subject || parentResource?.subject || 'Curriculum';
                const grade = bm.gradeLevel || parentResource?.gradeLevel || '';

                return (
                  <div 
                    key={bm.id} 
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-400 hover:shadow-xs transition-all flex flex-col justify-between text-[12px]"
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail with Page Ribbon */}
                      <div className="relative w-14 sm:w-16 aspect-[3/4] rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 shadow-2xs border border-slate-200">
                        <img src={cover} alt={title} className="w-full h-full object-cover" />
                        <div className="absolute top-0 right-1 w-4 h-6 bg-red-600 rounded-b flex items-center justify-center shadow-xs">
                          <Bookmark className="w-2.5 h-2.5 text-white fill-white" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-bold text-center py-0.5">
                          p. {bm.pageNumber}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                            {subject}
                          </span>
                          {grade && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {grade}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-[13px] text-slate-900 mt-1 truncate">
                          {title}
                        </h4>

                        <p className="text-[11px] font-semibold text-teal-800 mt-0.5 truncate">
                          {bm.chapterTitle || `Page ${bm.pageNumber}`}
                        </p>

                        {bm.note ? (
                          <p className="text-[11px] text-slate-600 mt-1 bg-white p-1.5 rounded-lg border border-slate-200/80 line-clamp-2">
                            "{bm.note}"
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">No personal note saved.</p>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                      <span className="text-[10px] text-slate-400">
                        Saved {new Date(bm.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeBookmark(bm.id)}
                          className="px-2 py-1 rounded hover:bg-rose-50 text-rose-600 font-semibold transition-colors flex items-center gap-1"
                          title="Remove this bookmark"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>

                        <button
                          onClick={() => openReader(bm.resourceId, bm.pageNumber)}
                          className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-2xs flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read from Page {bm.pageNumber}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-[12px] text-slate-500">
              <Bookmark className="w-8 h-8 text-amber-400 fill-amber-300 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-[13px]">No Page Bookmarks Saved Yet</p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                While reading textbooks, past papers, or novels in the Digital Reader, click the bookmark ribbon or toolbar button to save specific pages and key revision notes here.
              </p>
              <button
                onClick={() => setActiveView('explore')}
                className="mt-3 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] shadow-2xs"
              >
                Browse Books to Read & Bookmark
              </button>
            </div>
          )}
        </div>
      )}

      {/* EXAMS TAB */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-2">
          <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
            Official Examination Transcripts
          </h2>
          {examAttempts.length > 0 ? (
            <div className="space-y-2">
              {examAttempts.map((att) => (
                <div key={att.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-[12px]">
                  <div>
                    <h4 className="font-bold text-slate-900">{att.examTitle}</h4>
                    <span className="text-[10px] text-slate-500">
                      Completed {new Date(att.completedAt).toLocaleString()} • Duration: {Math.round(att.timeSpentSeconds / 60)} mins
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-extrabold text-teal-700">{att.score} / {att.totalMarks}</div>
                    <span className="text-[10px] font-bold text-slate-600">{att.percentage}% Grade</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[12px] text-slate-400">
              <Award className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
              <p>You have not attempted any online exams yet.</p>
              <button
                onClick={() => setActiveView('exams')}
                className="mt-2 px-3 py-1 bg-teal-600 text-white rounded-lg font-bold text-[11px] shadow-2xs"
              >
                Take a Practice Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBSCRIPTION TAB */}
      {activeTab === 'subscription' && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-2xs space-y-2">
          <h2 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-tight">
            Subscription & Membership
          </h2>
          <p className="text-[11px] text-slate-500 mb-2">Manage your Book Club educational subscription tier.</p>

          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-amber-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Current Plan</span>
              <h3 className="text-[16px] font-bold text-slate-900 capitalize">{user?.subscriptionTier || 'Free'} Plan</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {user?.subscriptionTier === 'premium'
                  ? 'Unlimited AI Study Assistant, all premium textbooks, advanced exams & ad-free access.'
                  : user?.subscriptionTier === 'plus'
                    ? 'Ad-free reading, enhanced cloud library & access to standard plus notes.'
                    : 'Basic free resources and limited downloads. Upgrade to unlock full academic potential.'}
              </p>
            </div>
            <button
              onClick={() => setActiveView('pricing')}
              className="px-4 py-2 rounded-lg font-bold text-[11px] sm:text-[12px] bg-slate-950 hover:bg-slate-800 text-white shadow-2xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Change Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* EDIT ACCOUNT & PROFILE PICTURE MODAL */}
      {showEditAccountModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Account Settings</span>
                <h3 className="text-[14px] sm:text-[16px] font-bold mt-0.5">Edit Profile & Account Information</h3>
              </div>
              <button
                onClick={() => setShowEditAccountModal(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-4 sm:p-5 space-y-3 text-[12px]">
              {/* Profile Picture Change Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative group cursor-pointer" onClick={() => profilePhotoInputRef.current?.click()}>
                  {editPhotoURL ? (
                    <img src={editPhotoURL} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-teal-500 shadow-2xs" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl font-bold">
                      {(editName || 'L').charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="font-bold text-slate-800 text-[12px]">Profile Picture</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Upload a photo from your device or choose a scholar avatar.</p>
                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    className="mt-1.5 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload New Photo</span>
                  </button>
                </div>
              </div>

              {/* Scholar Avatar Quick Pickers */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Or Pick a Scholar Avatar:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {SCHOLARLY_AVATARS.map((av) => (
                    <button
                      key={av.name}
                      type="button"
                      onClick={() => setEditPhotoURL(av.url)}
                      className={`relative rounded-xl overflow-hidden border-2 flex-shrink-0 transition-transform ${
                        editPhotoURL === av.url ? 'border-teal-600 scale-105 shadow-2xs' : 'border-transparent hover:border-slate-300'
                      }`}
                      title={av.name}
                    >
                      <img src={av.url} alt={av.name} className="w-10 h-10 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">School / University</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Phone Number (M-Pesa)</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Education Level</label>
                <select
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="primary">Primary School (Grade 1–6 CBC)</option>
                  <option value="jss">Junior Secondary School (Grade 7–9 KJSEA)</option>
                  <option value="senior">Senior Secondary (Grade 10–12 KCSE)</option>
                  <option value="college_uni">College & University Programmes</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Academic Bio / Goals</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                />
              </div>

              {saveSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-[11px] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditAccountModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1.5"
                >
                  {isSaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
