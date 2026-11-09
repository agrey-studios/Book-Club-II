import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceItem } from '../types';
import { 
  ArrowLeft, 
  BookOpen, 
  Download, 
  Bookmark, 
  Check, 
  Star, 
  Share2, 
  Flag, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { ResourceCard } from './ResourceCard';

interface ResourceDetailViewProps {
  resource: ResourceItem;
  onBack: () => void;
  onOpenReader: (resource: ResourceItem) => void;
  onPurchase: (resource: ResourceItem) => void;
  onAiSummarize: (resource: ResourceItem) => void;
}

export const ResourceDetailView: React.FC<ResourceDetailViewProps> = ({
  resource,
  onBack,
  onOpenReader,
  onPurchase,
  onAiSummarize
}) => {
  const { 
    user, 
    addToLibrary, 
    removeFromLibrary, 
    isInLibrary, 
    recordDownload, 
    resources, 
    openResourceDetail 
  } = useApp();

  const saved = isInLibrary(resource.id);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [copiedShare, setCopiedShare] = useState(false);
  const [reported, setReported] = useState(false);
  const [reviewsList, setReviewsList] = useState<{ name: string; date: string; rating: number; comment: string }[]>([
    {
      name: 'Faith Wanjiku',
      date: '2 days ago',
      rating: 5,
      comment: 'Exceptionally clear explanations! Helped me understand the difficult calculus concepts easily.'
    },
    {
      name: 'Kevin Ouma',
      date: '1 week ago',
      rating: 5,
      comment: 'The exam questions closely match the actual national assessment format. Highly recommended.'
    }
  ]);

  const handleDownload = () => {
    recordDownload(resource);
    const element = document.createElement("a");
    const file = new Blob([
      `BOOK CLUB ACADEMIC ARCHIVE\n\nTitle: ${resource.title}\nCategory: ${resource.category.toUpperCase()}\nEducation Level: ${resource.educationLevel}\nSubject: ${resource.subject}\nAuthor: ${resource.authorName}\nCopyright: ${resource.copyrightDeclaration}\n\nSummary:\n${resource.fullDescription}\n\nSample Content:\n${resource.samplePages?.map(p => `--- Page ${p.pageNumber}: ${p.title || ''} ---\n${p.content}`).join('\n\n') || ''}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = resource.fileName || `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleReport = () => {
    setReported(true);
    setTimeout(() => setReported(false), 3000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setReviewsList([
      {
        name: user?.displayName || 'Active Student',
        date: 'Just now',
        rating: newRating,
        comment: newReviewText
      },
      ...reviewsList
    ]);
    setNewReviewText('');
  };

  const relatedResources = resources
    .filter(r => r.id !== resource.id && (r.educationLevel === resource.educationLevel || r.category === resource.category))
    .slice(0, 6);

  return (
    <div className="w-[99%] md:w-[95%] mx-auto px-1 sm:px-2 py-3 sm:py-4 space-y-4">
      {/* Navigation Breadcrumb & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-400 font-semibold text-[12px] sm:text-[13px] shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-slate-500">
          <span className="capitalize">{resource.educationLevel}</span>
          <span>/</span>
          <span className="capitalize">{resource.category}</span>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-xs">{resource.title}</span>
        </div>
      </div>

      {/* Main Resource Card (Single Page View) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 sm:p-7">
          {/* Left Column: Taller Cover & Actions */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col">
            <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
              <img 
                src={resource.coverImage} 
                alt={resource.title}
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-2.5 left-2.5">
                {resource.isFree ? (
                  <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                    FREE RESOURCE
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-amber-500 text-slate-950 shadow-2xs">
                    KSh {resource.priceKsh}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2 text-[12px] sm:text-[13px]">
              {/* Read Online Button */}
              <button
                onClick={() => onOpenReader(resource)}
                className="w-full py-2.5 px-4 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Online (Book View)</span>
              </button>

              {/* Purchase or Download */}
              {!resource.isFree ? (
                <button
                  onClick={() => onPurchase(resource)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Purchase with M-Pesa (KSh {resource.priceKsh})</span>
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className="w-full py-2 px-4 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4 text-teal-600" />
                  <span>Download {resource.fileFormat.toUpperCase()} ({resource.fileSize})</span>
                </button>
              )}

              {/* Secondary Actions */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <button
                  onClick={() => saved ? removeFromLibrary(resource.id) : addToLibrary(resource)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1 transition-colors ${
                    saved 
                      ? 'bg-teal-50 text-teal-800 border-teal-200' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Saved' : 'Library'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center gap-1 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShare ? 'Copied!' : 'Share'}</span>
                </button>

                <button
                  onClick={handleReport}
                  className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center gap-1 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{reported ? 'Reported' : 'Report'}</span>
                </button>
              </div>

              {/* AI Study Companion Fast Action */}
              <button
                onClick={() => onAiSummarize(resource)}
                className="w-full py-2 px-3 rounded-xl text-[11px] sm:text-[12px] font-bold bg-gradient-to-r from-teal-50 to-amber-50 text-teal-950 border border-teal-200 flex items-center justify-center gap-1.5 hover:shadow-2xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>AI Study Summary & Revision Drill</span>
              </button>
            </div>
          </div>

          {/* Right Column: Resource Details & Content */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between">
            <div>
              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800">
                  {resource.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                  {resource.gradeLevel}
                </span>
                {resource.curriculum && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {resource.curriculum}
                  </span>
                )}
                {resource.examSystem && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    {resource.examSystem}
                  </span>
                )}
              </div>

              {/* Title: 15px desktop, 13px mobile */}
              <h1 className="text-[17px] sm:text-[22px] font-extrabold text-slate-900 leading-snug">
                {resource.title}
              </h1>

              {/* Author & Publication meta */}
              <div className="mt-2.5 flex items-center gap-2 text-[11px] sm:text-[12px] text-slate-600">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[11px]">
                  {resource.authorName.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-900">{resource.authorName}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="text-slate-500">{resource.authorRole}</span>
                </div>
              </div>

              {/* Academic Stats Strip */}
              <div className="mt-4 p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-4 gap-2 text-center text-[11px] sm:text-[12px]">
                <div>
                  <div className="font-bold text-slate-900 flex items-center justify-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {resource.rating.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{resource.reviewsCount} reviews</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">{resource.downloadsCount}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Downloads</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">{resource.pagesCount}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Pages</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 uppercase">{resource.fileFormat}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{resource.fileSize}</div>
                </div>
              </div>

              {/* Full Description: 13px desktop, 12px mobile */}
              <div className="mt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">About This Study Material</h3>
                <p className="text-[12px] sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
                  {resource.fullDescription}
                </p>
              </div>

              {/* Subject & Topic Details */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] sm:text-[12px]">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Subject Area</span>
                  <span className="font-bold text-slate-800">{resource.subject}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Topic / Core Theme</span>
                  <span className="font-bold text-slate-800">{resource.topic || 'Curriculum Overview'}</span>
                </div>
              </div>

              {/* Copyright Protection */}
              <div className="mt-4 p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-start gap-2 text-[11px] text-teal-950">
                <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[11px]">Academic Integrity & Distribution:</span>
                  <p className="text-[11px] text-teal-900 leading-relaxed mt-0.5">{resource.copyrightDeclaration}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-slate-200 p-4 sm:p-7 bg-slate-50/50 text-[12px]">
          <h3 className="font-bold text-[14px] sm:text-[15px] text-slate-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>Learner Reviews & Academic Feedback</span>
          </h3>

          {/* Submit Review */}
          <form onSubmit={handleAddReview} className="mb-4 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-700">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-3.5 h-3.5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Share your thoughts on this study material..."
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold shadow-2xs"
              >
                Post Review
              </button>
            </div>
          </form>

          {/* Reviews List */}
          <div className="space-y-2">
            {reviewsList.map((rev, index) => (
              <div key={index} className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{rev.name}</span>
                  <span className="text-slate-400 text-[10px]">{rev.date}</span>
                </div>
                <div className="flex gap-0.5 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-slate-600 mt-0.5 text-[11px] leading-snug">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Materials: 6 Columns on Desktop, 2 on Mobile */}
        {relatedResources.length > 0 && (
          <div className="border-t border-slate-200 p-4 sm:p-7 bg-white">
            <h3 className="font-bold text-[14px] sm:text-[15px] text-slate-900 mb-3">Related Curriculum Resources</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[5px]">
              {relatedResources.map((rel) => (
                <ResourceCard 
                  key={rel.id} 
                  resource={rel} 
                  onSelect={(r) => {
                    openResourceDetail(r.id);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
