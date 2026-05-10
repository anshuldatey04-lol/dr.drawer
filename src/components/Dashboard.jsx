import { useState, useMemo } from 'react';
import { Search, Plus, Menu, Inbox, Sparkles, LogOut, Trash2 } from 'lucide-react';
import Sidebar from './Sidebar';
import LinkCard from './LinkCard';
import AddLinkForm from './AddLinkForm';
import CreateDrawerForm from './CreateDrawerForm';

export default function Dashboard({ 
  user, 
  drawers, 
  onAddDrawer, 
  onDeleteDrawer, 
  onAddLink, 
  onDeleteLink, 
  onLogout 
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddLink, setShowAddLink] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derive active drawer ID: use selected, fallback to first drawer
  const activeDrawerId = selectedId || (drawers.length > 0 ? drawers[0].id : null);
  const activeDrawer = drawers.find((d) => d.id === activeDrawerId);

  const filteredLinks = useMemo(() => {
    if (!activeDrawer) return [];
    if (!search.trim()) return activeDrawer.links;
    const q = search.toLowerCase();
    return activeDrawer.links.filter(
      (l) => l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)
    );
  }, [activeDrawer, search]);

  const handleCreateDrawer = (newDrawer) => {
    onAddDrawer(newDrawer);
    setSelectedId(newDrawer.id);
    setShowCreateDrawer(false);
  };

  const handleDeleteDrawer = () => {
    if (!activeDrawerId) return;
    if (window.confirm('Are you sure you want to delete this drawer and all its links?')) {
      onDeleteDrawer(activeDrawerId);
      if (selectedId === activeDrawerId) setSelectedId(null);
    }
  };

  const handleAddLink = (newLink) => {
    if (!activeDrawerId) return;
    onAddLink(activeDrawerId, newLink);
    setShowAddLink(false);
  };

  const handleDeleteLink = (linkId) => {
    if (!activeDrawerId) return;
    onDeleteLink(activeDrawerId, linkId);
  };

  const handleSelectDrawer = (id) => {
    setSelectedId(id);
    setSearch('');
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar — visible on desktop, slide-in on mobile */}
      <div className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 z-40`}>
        <Sidebar
          user={user}
          drawers={drawers}
          activeDrawerId={activeDrawerId}
          onSelectDrawer={handleSelectDrawer}
          onCreateDrawer={() => setShowCreateDrawer(true)}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#08080C]">
        {/* Top bar */}
        <header className="flex items-center gap-4 h-16 px-6 sm:px-8 border-b border-white/[0.03] bg-[#050508]/80 backdrop-blur-xl shrink-0 z-20">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button
              onClick={onLogout}
              className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
          {activeDrawer ? (
            <div className="animate-fade-in">
              {/* Large Banner */}
              <div className="px-6 sm:px-8 pt-8">
                <div 
                  className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-14 shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${activeDrawer.gradientColors?.[0] || '#6366f1'} 0%, ${activeDrawer.gradientColors?.[2] || '#8b5cf6'} 100%)`
                  }}
                >
                  {/* Decorative circles */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-black/10 blur-2xl" />

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                         <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-3xl">
                           {activeDrawer.emoji || '📁'}
                         </div>
                         <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-tighter text-white">
                           {activeDrawer.links.length} Links
                         </div>
                         <button
                           onClick={handleDeleteDrawer}
                           className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white/50 hover:text-white transition-all border border-white/10"
                           title="Delete Drawer"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                      <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter leading-none mb-2">
                        {activeDrawer.name}
                      </h1>
                      <p className="text-white/70 text-lg font-medium max-w-xl">
                        {activeDrawer.description || 'Manage your collection of links and resources.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddLink(true)}
                      className="group flex items-center gap-3 px-8 py-5 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
                    >
                      <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                      Add New Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar Row */}
              <div className="px-6 sm:px-8 mt-10">
                <div className="relative max-w-2xl">
                  <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="search-input"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search your links..."
                    className="w-full pl-14 pr-6 py-5 bg-white/[0.03] border border-white/[0.08] rounded-[1.5rem] text-lg text-white placeholder:text-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-white/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Link Grid */}
              <div className="px-6 sm:px-8 mt-10">
                {filteredLinks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Add New Link Shortcut Card */}
                    {!search && (
                      <button
                        onClick={() => setShowAddLink(true)}
                        className="group relative flex flex-col items-center justify-center min-h-[300px] rounded-[2rem] border-2 border-dashed border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] transition-all duration-500"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all">
                          <Plus size={32} className="text-slate-500 group-hover:text-indigo-400" />
                        </div>
                        <span className="text-lg font-bold text-slate-500 group-hover:text-slate-300">Add New Link</span>
                      </button>
                    )}
                    
                    {filteredLinks.map((link, i) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        onDelete={handleDeleteLink}
                        index={i}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
                      <Search size={40} className="text-slate-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-400 mb-2">No links found</h3>
                    <p className="text-slate-600 max-w-sm">We couldn't find any links matching your search criteria in this drawer.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8 animate-float">
                <Inbox size={40} className="text-indigo-400" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Your Drawer is Ready</h1>
              <p className="text-slate-500 text-lg max-w-md mb-10 leading-relaxed">
                Select a drawer from the sidebar or create a new one to start organizing your visual workspace.
              </p>
              <button
                onClick={() => setShowCreateDrawer(true)}
                className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              >
                Create Your First Drawer
              </button>
            </div>
          )}
        </div>

        {/* Bottom status bar */}
        <footer className="flex items-center justify-between h-12 px-8 border-t border-white/[0.03] bg-[#050508] text-[10px] font-bold uppercase tracking-widest text-slate-600 shrink-0">
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-500/50" />
            Dr. Drawer Cloud
          </span>
          <span className="text-slate-700">Encrypted Workspace</span>
        </footer>
      </main>

      {/* Modals */}
      {showAddLink && (
        <AddLinkForm
          onAdd={handleAddLink}
          onClose={() => setShowAddLink(false)}
        />
      )}
      {showCreateDrawer && (
        <CreateDrawerForm
          onAdd={handleCreateDrawer}
          onClose={() => setShowCreateDrawer(false)}
        />
      )}
    </div>
  );
}
