import { useState, useEffect, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawers, setDrawers] = useState([]);

  const fetchDrawers = useCallback(async () => {
    try {
      const res = await fetch('/api/drawers', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDrawers(data.drawers);
      }
    } catch (err) {
      console.error('Failed to fetch drawers', err);
    }
  }, []);

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then(data => {
        setUser(data.user);
        fetchDrawers();
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchDrawers]);

  const handleLogin = (userData) => {
    setUser(userData);
    fetchDrawers();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      setDrawers([]);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleAddDrawer = async (newDrawer) => {
    try {
      const res = await fetch('/api/drawers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDrawer),
        credentials: 'include'
      });
      if (res.ok) {
        setDrawers(prev => [...prev, { ...newDrawer, links: [] }]);
      }
    } catch (err) {
      console.error('Failed to add drawer', err);
    }
  };

  const handleDeleteDrawer = async (drawerId) => {
    try {
      const res = await fetch(`/api/drawers/${drawerId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setDrawers(prev => prev.filter(d => d.id !== drawerId));
      }
    } catch (err) {
      console.error('Failed to delete drawer', err);
    }
  };

  const handleAddLink = async (drawerId, newLink) => {
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newLink, drawerId }),
        credentials: 'include'
      });
      if (res.ok) {
        setDrawers(prev => prev.map(d => 
          d.id === drawerId ? { ...d, links: [...d.links, newLink] } : d
        ));
      }
    } catch (err) {
      console.error('Failed to add link', err);
    }
  };

  const handleDeleteLink = async (drawerId, linkId) => {
    try {
      const res = await fetch(`/api/links/${linkId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setDrawers(prev => prev.map(d => 
          d.id === drawerId ? { ...d, links: d.links.filter(l => l.id !== linkId) } : d
        ));
      }
    } catch (err) {
      console.error('Failed to delete link', err);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-medium">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <span className="animate-pulse">Initializing Security...</span>
    </div>
  </div>;

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      user={user}
      drawers={drawers}
      onAddDrawer={handleAddDrawer}
      onDeleteDrawer={handleDeleteDrawer}
      onAddLink={handleAddLink}
      onDeleteLink={handleDeleteLink}
      onLogout={handleLogout}
    />
  );
}
