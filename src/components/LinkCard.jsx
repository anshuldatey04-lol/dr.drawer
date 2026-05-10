import { ExternalLink, Trash2 } from 'lucide-react';
import { normalizeUrl, truncateUrl, extractDomain, getYouTubeVideoId } from '../utils';
import FaviconImage from './FaviconImage';

export default function LinkCard({ link, onDelete, index }) {
  const handleClick = () => {
    window.open(normalizeUrl(link.url), '_blank', 'noopener,noreferrer');
  };

  const videoId = getYouTubeVideoId(link.url);
  const domain = extractDomain(link.url);

  return (
    <div
      id={`link-card-${link.id}`}
      onClick={handleClick}
      className="group relative w-full text-left bg-white/[0.02] border border-white/[0.05] rounded-[2rem] overflow-hidden transition-all duration-500 hover:bg-white/[0.05] hover:border-white/[0.1] hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40 animate-slide-up cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Thumbnail Area */}
      <div className="relative h-48 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        
        <FaviconImage
          url={link.url}
          emoji={link.emoji}
          size={512}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Delete Button (Overlay) */}
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(link.id);
            }}
            className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-red-400 hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Category/Type Badge */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="px-3 py-1 rounded-lg bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest text-indigo-300">
            {videoId ? 'YouTube' : domain}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight mb-2 group-hover:text-indigo-300 transition-colors">
          {link.name}
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-white/5 border border-white/10">
             <ExternalLink size={10} className="text-slate-500" />
          </div>
          <p className="text-xs text-slate-500 truncate font-medium">
            {truncateUrl(link.url)}
          </p>
        </div>
      </div>

      {/* Hover Shimmer */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
      </div>
    </div>
  );
}
