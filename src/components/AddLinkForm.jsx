import { useState, useMemo } from 'react';
import { X, Globe } from 'lucide-react';
import { EMOJI_OPTIONS } from '../data';
import { generateId, extractDomain, getYouTubeVideoId } from '../utils';
import FaviconImage from './FaviconImage';

export default function AddLinkForm({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [emoji, setEmoji] = useState('');
  const [iconMode, setIconMode] = useState('auto'); // 'auto' | 'emoji'

  // Live domain extraction for favicon preview
  const detectedDomain = useMemo(() => extractDomain(url), [url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onAdd({
      id: generateId(),
      name: name.trim(),
      url: url.trim(),
      emoji: iconMode === 'emoji' ? (emoji || '🔗') : '',
      category: 'custom',
    });
    setName('');
    setUrl('');
    setEmoji('');
    setIconMode('auto');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className="relative w-full max-w-4xl glass-modal overflow-hidden animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row min-h-[500px]">
          {/* Left: Form Area */}
          <div className="flex-1 p-8 sm:p-12 border-b md:border-b-0 md:border-r border-white/[0.05]">
            <button
              id="close-add-link"
              onClick={onClose}
              className="absolute top-6 left-6 p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors md:hidden"
            >
              <X size={20} />
            </button>

            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Add New Link</h2>
            <p className="text-slate-500 mb-8 font-medium">Visual organization for your digital resources.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL input */}
              <div>
                <label htmlFor="add-link-url" className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2 ml-1">URL Address</label>
                <input
                  id="add-link-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?..."
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-slate-800 focus:outline-none transition-all"
                  autoFocus
                />
              </div>

              {/* Name input */}
              <div>
                <label htmlFor="add-link-name" className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2 ml-1">Link Name</label>
                <input
                  id="add-link-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product Design Inspiration"
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-slate-800 focus:outline-none transition-all"
                />
              </div>

              {/* Icon mode toggle */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2 ml-1">Emoji (Optional)</label>
                   <div className="grid grid-cols-5 gap-2 p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] h-32 overflow-y-auto custom-scrollbar">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => { setEmoji(em); setIconMode('emoji'); }}
                        className={`flex items-center justify-center h-10 rounded-xl text-lg transition-all ${
                          emoji === em && iconMode === 'emoji'
                            ? 'bg-indigo-500/20 border border-indigo-500/40 scale-110 shadow-lg shadow-indigo-500/20'
                            : 'hover:bg-white/[0.06] border border-transparent'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2 ml-1">Category</label>
                  <select 
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white appearance-none focus:outline-none transition-all"
                    defaultValue="General"
                  >
                    <option>YouTube</option>
                    <option>Social</option>
                    <option>Article</option>
                    <option>Inspiration</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  id="submit-add-link"
                  type="submit"
                  disabled={!name.trim() || !url.trim()}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:-translate-y-1"
                >
                  Add to Drawer
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-4 bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Preview Area */}
          <div className="hidden md:flex w-[400px] bg-white/[0.02] p-8 flex-col justify-center items-center">
            <div className="w-full max-w-xs">
               <p className="text-xs font-black uppercase tracking-widest text-indigo-500/50 mb-6 text-center">Live Preview</p>
               
               <div className="relative w-full rounded-[2.5rem] bg-[#050508] border border-white/[0.08] overflow-hidden shadow-2xl animate-float">
                  <div className="h-48 overflow-hidden bg-slate-900">
                    {url ? (
                      <FaviconImage
                        url={url}
                        emoji={iconMode === 'emoji' ? emoji : ''}
                        size={512}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                        <Globe size={48} className="text-slate-800" />
                      </div>
                    )}
                    {getYouTubeVideoId(url) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                         <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                         </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white line-clamp-1 mb-1">
                      {name || 'Untitled Link'}
                    </h3>
                    <p className="text-xs text-slate-500 truncate font-medium">
                      {detectedDomain || 'No URL specified'}
                    </p>
                  </div>
               </div>

               <p className="mt-8 text-center text-[10px] font-bold text-slate-700 uppercase tracking-tighter">
                 Automatically extracted from source metadata
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
