import { Plus, ChevronLeft, ChevronRight, LogOut, Sparkles } from 'lucide-react';

export default function Sidebar({
  user,
  drawers,
  activeDrawerId,
  onSelectDrawer,
  onCreateDrawer,
  onLogout,
  collapsed,
  onToggleCollapse,
}) {
  return (
    <aside
      className={`
        fixed lg:relative z-40 top-0 left-0 h-screen flex flex-col
        bg-[#050508] border-r border-white/[0.03]
        transition-all duration-500 ease-out
        ${collapsed ? 'w-[80px]' : 'w-72'}
      `}
    >
      {/* Header */}
      <div className={`flex items-center h-20 px-6 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
              <Sparkles size={20} className="text-indigo-400" />
            </div>
            <span className="font-black text-white text-lg tracking-tighter uppercase">Dr. Drawer</span>
          </div>
        )}
        <button
          id="sidebar-toggle"
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/5 text-slate-600 hover:text-white transition-all"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User Area */}
      {!collapsed && user && (
        <div className="px-6 mb-8">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Authenticated as</p>
             <p className="text-sm font-bold text-slate-200 truncate">{user.name}</p>
          </div>
        </div>
      )}

      {/* Drawer label */}
      {!collapsed && (
        <div className="px-6 mb-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Your Drawers</p>
        </div>
      )}

      {/* Drawer list */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar">
        {drawers.map((drawer) => {
          const isActive = drawer.id === activeDrawerId;
          return (
            <button
              key={drawer.id}
              id={`drawer-${drawer.id}`}
              onClick={() => onSelectDrawer(drawer.id)}
              className={`
                w-full flex items-center gap-3 rounded-2xl transition-all duration-300
                ${collapsed ? 'justify-center p-3' : 'p-3'}
                ${isActive
                  ? 'bg-white/[0.04] border border-white/[0.08] text-white shadow-xl'
                  : 'text-slate-500 hover:bg-white/[0.02] hover:text-slate-300'
                }
              `}
              title={collapsed ? drawer.name : undefined}
            >
              <div
                className={`shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ${collapsed ? 'w-10 h-10 text-xl' : 'w-10 h-10 text-xl'}`}
                style={{
                  background: isActive ? `linear-gradient(135deg, ${drawer.gradientColors[0]}20, ${drawer.gradientColors[2]}15)` : 'rgba(255,255,255,0.02)',
                  border: isActive ? `1px solid ${drawer.gradientColors[0]}30` : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {drawer.emoji}
              </div>

              {!collapsed && (
                <div className="min-w-0 text-left">
                  <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {drawer.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{drawer.links.length} links</p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className={`p-4 border-t border-white/[0.03] space-y-2 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <button
          id="create-drawer-button"
          onClick={onCreateDrawer}
          className={`
            flex items-center gap-2.5 rounded-2xl transition-all duration-300
            bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5
            ${collapsed ? 'p-3.5 justify-center' : 'w-full px-5 py-4'}
          `}
          title="Create New Drawer"
        >
          <Plus size={20} />
          {!collapsed && <span className="text-sm">New Drawer</span>}
        </button>

        <button
          id="logout-button"
          onClick={onLogout}
          className={`
            flex items-center gap-2.5 rounded-2xl transition-all duration-200
            hover:bg-red-500/5 text-slate-600 hover:text-red-400
            ${collapsed ? 'p-3.5 justify-center' : 'w-full px-5 py-3'}
          `}
          title="Sign Out"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm font-bold">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
