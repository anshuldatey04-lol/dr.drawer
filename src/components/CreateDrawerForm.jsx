import { useState } from 'react';
import { X, Type, FileText, Plus } from 'lucide-react';
import { GRADIENT_PRESETS } from '../data';
import { generateId } from '../utils';

export default function CreateDrawerForm({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [selectedGradient, setSelectedGradient] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const preset = GRADIENT_PRESETS[selectedGradient];
    onAdd({
      id: generateId(),
      name: name.trim(),
      description: desc.trim() || 'A new drawer',
      gradient: preset.gradient,
      gradientColors: preset.colors,
      emoji,
      links: [],
    });
    onClose();
  };

  const drawerEmojis = ['📁', '🗂️', '💼', '🎯', '🚀', '💎', '🔮', '⚡', '🌐', '🎨', '📚', '🛠️', '🎮', '🎧', '💰', '❤️'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative w-full max-w-md glass-modal p-10 sm:p-12 shadow-2xl animate-zoom-in" onClick={(e) => e.stopPropagation()}>
        <button id="close-create-drawer" onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <h2 className="text-3xl font-black text-white tracking-tighter mb-2">New Drawer</h2>
        <p className="text-slate-500 mb-8 font-medium">Create a workspace for your curated resources.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="drawer-name" className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2 ml-1">Drawer Name</label>
            <input id="drawer-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Design Resources" className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-slate-800 focus:outline-none transition-all" autoFocus />
          </div>

          <div>
            <label htmlFor="drawer-desc" className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2 ml-1">Short Description</label>
            <textarea id="drawer-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Curated links for the next project..." rows={2} className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-slate-800 focus:outline-none transition-all resize-none" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2 ml-1">Pick an Icon</label>
            <div className="grid grid-cols-6 gap-2 p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] h-32 overflow-y-auto custom-scrollbar">
              {drawerEmojis.map((em) => (
                <button key={em} type="button" onClick={() => setEmoji(em)} className={`flex items-center justify-center h-10 rounded-xl text-lg transition-all ${emoji === em ? 'bg-white/10 border border-white/20 scale-110 shadow-lg' : 'hover:bg-white/5 border border-transparent opacity-50 hover:opacity-100'}`}>{em}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2 ml-1">Theme Color</label>
            <div className="grid grid-cols-4 gap-3">
              {GRADIENT_PRESETS.map((p, i) => (
                <button key={p.name} type="button" onClick={() => setSelectedGradient(i)} className={`h-12 rounded-2xl bg-gradient-to-r ${p.gradient} transition-all duration-300 ${selectedGradient === i ? 'ring-4 ring-indigo-500/30 scale-105 border-2 border-white/40' : 'opacity-40 hover:opacity-100'}`} title={p.name} />
              ))}
            </div>
          </div>

          <button id="submit-create-drawer" type="submit" disabled={!name.trim()} className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed">
            <Plus size={20} />Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
}
