import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceItem } from '../types';
import { 
  X, 
  BookOpen, 
  Download, 
  Bookmark, 
  Check, 
  Star, 
  Share2, 
  Flag, 
  Sparkles, 
  User, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  CreditCard,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { ResourceCard } from './ResourceCard';

interface ResourceDetailModalProps {
  resource: ResourceItem;
  onClose: () => void;
  onOpenReader: (resource: ResourceItem) => void;
  onPurchase: (resource: ResourceItem) => void;
  onAiSummarize: (resource: ResourceItem) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  onClose,
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
    setSelectedResourceId 
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
    // Simulate real file download trigger
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
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
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
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition-colors backdrop-blur-xs"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto">
          {/* Main Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
            {/* Left Cover & Actions */}
            <div className="md:col-span-5 flex flex-col">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 shadow-md border border-slate-200">
                <img 
                  src={resource.coverImage} 
                  alt={resource.title}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-3 left-3">
                  {resource.isFree ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                      FREE RESOURCE
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-xs">
                      KSh {resource.priceKsh}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-2.5">
                {/* Read Online Button */}
                <button
                  onClick={() => onOpenReader(resource)}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Read Online Now</span>
                </button>

                {/* Purchase or Download */}
                {!resource.isFree ? (
                  <button
                    onClick={() => onPurchase(resource)}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Purchase via M-Pesa (KSh {resource.priceKsh})</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDownload}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {resource.fileFormat.toUpperCase()}</span>
                  </button>
                )}

                {/* Secondary buttons */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => saved ? removeFromLibrary(resource.id) : addToLibrary(resource)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
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
                    className="py-2 px-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedShare ? 'Copied!' : 'Share'}</span>
                  </button>

                  <button
                    onClick={handleReport}
                    className="py-2 px-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{reported ? 'Reported' : 'Report'}</span>
                  </button>
                </div>

                {/* AI Study Companion Fast Action */}
                <button
                  onClick={() => onAiSummarize(resource)}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-50 to-amber-50 text-teal-900 border border-teal-200 flex items-center justify-center gap-1.5 hover:shadow-xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>AI Study Summary & Questions</span>
                </button>
              </div>
            </div>

            {/* Right Details & Metadata */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                {/* Categories & Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800">
                    {resource.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {resource.gradeLevel}
                  </span>
                  {resource.curriculum && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {resource.curriculum}
                    </span>
                  )}
                  {resource.examSystem && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      {resource.examSystem}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {resource.title}
                </h1>

                {/* Author row */}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                    {resource.authorName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">{resource.authorName}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-slate-500">{resource.authorRole}</span>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center justify-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {resource.rating.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{resource.reviewsCount} reviews</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{resource.downloadsCount}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Downloads</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{resource.pagesCount}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Pages</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 uppercase">{resource.fileFormat}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{resource.fileSize}</div>
                  </div>
                </div>

                {/* Full Description */}
                <div className="mt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">About This Resource</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {resource.fullDescription}
                  </p>
                </div>

                {/* Subject & Topic Details */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Subject</span>
                    <span className="font-semibold text-slate-800">{resource.subject}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Topic / Area</span>
                    <span className="font-semibold text-slate-800">{resource.topic || 'General Overview'}</span>
                  </div>
                </div>

                {/* Copyright Declaration */}
                <div className="mt-4 p-3 rounded-xl bg-teal-50/50 border border-teal-100 flex items-start gap-2 text-xs text-teal-900">
                  <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[11px] block">Copyright & Distribution Protection:</span>
                    <p className="text-[11px] text-teal-800 leading-relaxed mt-0.5">{resource.copyrightDeclaration}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-slate-200 p-6 sm:p-8 bg-slate-50/50">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>Learner Reviews & Ratings</span>
            </h3>

            {/* Submit Review Form */}
            <form onSubmit={handleAddReview} className="mb-6 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-700">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
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
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Post Review
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-3">
              {reviewsList.map((rev, index) => (
                <div key={index} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{rev.name}</span>
                    <span className="text-slate-400 text-[11px]">{rev.date}</span>
                  </div>
                  <div className="flex gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-slate-600 mt-1">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Resources */}
          {relatedResources.length > 0 && (
            <div className="border-t border-slate-200 p-6 sm:p-8 bg-white">
              <h3 className="font-bold text-base text-slate-900 mb-4">Related Study Materials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedResources.map((rel) => (
                  <ResourceCard 
                    key={rel.id} 
                    resource={rel} 
                    onSelect={(r) => {
                      setSelectedResourceId(r.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
