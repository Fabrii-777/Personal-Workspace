import React, { useState, useEffect } from 'react';
import { Search, FileText, Target, FolderGit2, ShoppingBag, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'note' | 'goal' | 'project' | 'wishlist';
  subtitle?: string;
  url: string;
}

export const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || !user) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = `%${query.trim()}%`;
      const combined: SearchResult[] = [];

      try {
        const [notesRes, goalsRes, projRes, wishRes] = await Promise.all([
          supabase.from('notes').select('id, title, category').ilike('title', q).limit(3),
          supabase.from('goals').select('id, title, category').ilike('title', q).limit(3),
          supabase.from('projects').select('id, name, category').ilike('name', q).limit(3),
          supabase.from('wishlist_items').select('id, name, category').ilike('name', q).limit(3)
        ]);

        notesRes.data?.forEach(n => combined.push({ id: n.id, title: n.title, type: 'note', subtitle: n.category, url: '/notes' }));
        goalsRes.data?.forEach(g => combined.push({ id: g.id, title: g.title, type: 'goal', subtitle: g.category, url: '/goals' }));
        projRes.data?.forEach(p => combined.push({ id: p.id, title: p.name, type: 'project', subtitle: p.category, url: '/projects' }));
        wishRes.data?.forEach(w => combined.push({ id: w.id, title: w.name, type: 'wishlist', subtitle: w.category, url: '/wishlist' }));

        setResults(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-indigo-500 mr-3" />
          <input
            type="text"
            className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-base"
            placeholder="Buscar notas, metas, proyectos, compras..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {loading && <p className="text-center py-6 text-sm text-slate-400">Buscando...</p>}
          {!loading && results.length === 0 && query.trim() !== '' && (
            <p className="text-center py-6 text-sm text-slate-400">No se encontraron resultados.</p>
          )}
          {!loading && results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => {
                navigate(item.url);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors"
            >
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                {item.type === 'note' && <FileText className="w-4 h-4" />}
                {item.type === 'goal' && <Target className="w-4 h-4" />}
                {item.type === 'project' && <FolderGit2 className="w-4 h-4" />}
                {item.type === 'wishlist' && <ShoppingBag className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{item.title}</p>
                {item.subtitle && <p className="text-xs text-slate-400">{item.subtitle}</p>}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {item.type === 'note' ? 'Nota' : item.type === 'goal' ? 'Meta' : item.type === 'project' ? 'Proyecto' : 'Compra'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};