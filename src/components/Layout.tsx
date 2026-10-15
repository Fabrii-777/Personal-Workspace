import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Target, FolderGit2, ShoppingBag, User, Sun, Moon, LogOut, Menu, X, Search, Sparkles, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GlobalSearchModal } from './GlobalSearchModal';
import { AuroraBackground } from './Reactbits/AuroraBackground';
import { ShinyText } from './Reactbits/ShinyText';

export const Layout: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Panel Principal', path: '/', icon: LayoutDashboard },
    { name: 'Notas Privadas', path: '/notes', icon: FileText },
    { name: 'Objetivos', path: '/goals', icon: Target },
    { name: 'Proyectos', path: '/projects', icon: FolderGit2 },
    { name: 'Lista de Deseos', path: '/wishlist', icon: ShoppingBag },
    { name: 'Explorar Comunidad', path: '/explore', icon: Compass },
    { name: 'Mi Perfil', path: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors relative selection:bg-indigo-500 selection:text-white">
      <AuroraBackground />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* TopBar Móvil */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30">
        <span className="font-black text-xl tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          <ShinyText text="PersonalSpace" />
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(true)} className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={toggleTheme} className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Barra Lateral */}
      <aside className={`fixed md:sticky top-0 h-screen z-40 w-64 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-r border-slate-200/70 dark:border-slate-800/70 p-5 flex flex-col justify-between transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          <div className="hidden md:flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/30 transition-transform hover:rotate-6">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <ShinyText text="PersonalSpace" className="text-xl tracking-tight" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">Workspace Pro</span>
            </div>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="group w-full mb-6 flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-800/30 backdrop-blur-md text-slate-400 hover:border-indigo-400 hover:text-indigo-500 text-sm transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/10"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span>Buscar algo...</span>
            </span>
            <kbd className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 font-mono font-bold">⌘K</kbd>
          </button>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-500' : ''}`} />
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500 animate-ping" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Panel Inferior */}
        <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs text-slate-400 font-semibold">Aspecto</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all shadow-sm"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-slate-800 dark:text-slate-100">
                {profile?.full_name || 'Mi Perfil'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};