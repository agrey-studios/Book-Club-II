import React from 'react';
import { ResourceItem } from '../types';
import { useApp } from '../context/AppContext';
import { Star, Download, Eye, Bookmark, Check } from 'lucide-react';

interface ResourceCardProps {
  resource: ResourceItem;
  onSelect?: (resource: ResourceItem) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onSelect }) => {
  const { addToLibrary, removeFromLibrary, isInLibrary, openResourceDetail } = useApp();
  const saved = isInLibrary(resource.id);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(resource);
    } else {
      openResourceDetail(resource.id);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeFromLibrary(resource.id);
    } else {
      addToLibrary(resource);
    }
  };

  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'primary': return 'Primary';
      case 'jss': return 'JSS';
      case 'senior': return 'Senior';
      case 'college_uni': return 'University';
      default: return lvl;
    }
  };

  // Merge readers, novels and storybooks category badge
  const isLiterature = resource.category === 'novels' || resource.category === 'readers' || resource.category === 'storybooks';

  const getCategoryBadge = () => {
    if (isLiterature) {
      return {
        label: 'Novels & Stories',
        className: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    }
    switch (resource.category) {
      case 'notes': return { label: 'Notes', className: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'exams': return { label: 'Exams', className: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'textbooks': return { label: 'Textbooks', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default: return { label: resource.category, className: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const categoryBadge = getCategoryBadge();

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-teal-400 transition-all cursor-pointer flex flex-col justify-between m-[2px] sm:m-[3px]"
    >
      <div>
        {/* Taller Portrait Book Cover with reduced overall footprint */}
        <div className="relative aspect-[3/4.1] w-full bg-slate-100 overflow-hidden">
          <img 
            src={resource.coverImage} 
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90" />

          {/* Pricing Tag */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
            {resource.isFree ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-emerald-600/95 text-white shadow-xs">
                FREE
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-amber-500 text-slate-950 shadow-xs">
                KSh {resource.priceKsh}
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors ${
              saved 
                ? 'bg-teal-600 text-white shadow-xs' 
                : 'bg-white/90 hover:bg-white text-slate-700 backdrop-blur-xs'
            }`}
            title={saved ? "Saved in Library" : "Add to Library"}
          >
            {saved ? <Check className="w-3 h-3 stroke-[3]" /> : <Bookmark className="w-3 h-3" />}
          </button>

          {/* Format & Level on bottom edge of image */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 flex items-center justify-between text-[10px] sm:text-[11px] text-white">
            <span className="font-semibold truncate max-w-[100px] sm:max-w-[130px] drop-shadow-xs">
              {getLevelLabel(resource.educationLevel)}
            </span>
            <span className="uppercase text-[9px] font-bold tracking-wider bg-black/60 px-1.5 py-0.5 rounded">
              {resource.fileFormat}
            </span>
          </div>
        </div>

        {/* Content Body - Excerpt Removed & Tightened */}
        <div className="p-2 sm:p-2.5 space-y-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${categoryBadge.className}`}>
              {categoryBadge.label}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[90px]">
              {resource.gradeLevel}
            </span>
          </div>

          {/* Heading: 13px mobile, 15px desktop */}
          <h3 className="font-bold text-[13px] sm:text-[14px] text-slate-900 line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors">
            {resource.title}
          </h3>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-[12px] text-slate-500">
        <div className="flex items-center gap-1 text-amber-500 font-semibold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-slate-800">{resource.rating.toFixed(1)}</span>
        </div>

        <div className="flex items-center gap-2 text-[10px] sm:text-[11px]">
          <span className="flex items-center gap-0.5" title="Downloads">
            <Download className="w-3 h-3 text-slate-400" />
            {resource.downloadsCount}
          </span>
          <span className="hidden sm:flex items-center gap-0.5" title="Views">
            <Eye className="w-3 h-3 text-slate-400" />
            {resource.viewsCount}
          </span>
        </div>
      </div>
    </div>
  );
};
