import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FolderGit2, Target, FileText, ShoppingBag, Plus, ArrowUpRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SpotlightCard } from '../components/Reactbits/SpotlightCard';
import { ShinyText } from '../components/Reactbits/ShinyText';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    projectsCount: 0,
    goalsPending: 0,
    goalsCompleted: 0,
    notesRecent: [] as any[],
    wishlistPendingTotal: 0,
    currency: 'PYG',
    upcomingGoals: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [projects, goals, notes, wishlist] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact' }),
          supabase.from('goals').select('*'),
          supabase.from('notes').select('*').order('updated_at', { ascending: false }).limit(3),
          supabase.from('wishlist_items').select('*').eq('status', 'pendiente')
        ]);

        const allGoals = goals.data || [];
        const pendingGoals = allGoals.filter(g => g.status !== 'completado');
        const completedGoals = allGoals.filter(g => g.status === 'completado');

        const totalWish = (wishlist.data || []).reduce((acc, curr) => acc + Number(curr.price || 0), 0);

        setStats({
          projectsCount: projects.count || 0,
          goalsPending: pendingGoals.length,
          goalsCompleted: completedGoals.length,
          notesRecent: notes.data || [],
          wishlistPendingTotal: totalWish,
          currency: wishlist.data?.[0]?.currency || 'PYG',
          upcomingGoals: pendingGoals.slice(0, 3)
        });
      } catch (err) {
        console.error('Error cargando panel:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatPrice = (val: number, cur: string) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: cur === 'PYG' ? 0 : 2
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <Sparkles className="w-5 h-5 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Banner Futurista */}
      <SpotlightCard className="p-8 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-300 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Espacio Personal Activo</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              ¡Hola de nuevo, <ShinyText text={profile?.full_name?.split(' ')[0] || 'creador'} />! 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base max-w-xl leading-relaxed">
              Tus objetivos, notas privadas e ideas de desarrollo organizadas en un solo lugar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/notes"
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Nueva Nota
            </Link>
            <Link
              to="/goals"
              className="flex items-center gap-2 px-5 py-3 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
            >
              <Plus className="w-4 h-4 text-indigo-500" /> Objetivo
            </Link>
          </div>
        </div>
      </SpotlightCard>

      {/* Grid de Métricas con SpotlightCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Proyectos */}
        <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.2)" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Proyectos</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">{stats.projectsCount}</h3>
              <span className="text-[11px] font-bold text-blue-500 flex items-center gap-1 mt-1">
                Portafolio e ideas
              </span>
            </div>
            <div className="p-3.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20 shadow-inner">
              <FolderGit2 className="w-6 h-6" />
            </div>
          </div>
        </SpotlightCard>

        {/* Metas Pendientes */}
        <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.2)" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Por Cumplir</p>
              <h3 className="text-3xl font-black text-amber-500 mt-1.5">{stats.goalsPending}</h3>
              <span className="text-[11px] font-bold text-amber-500/80 flex items-center gap-1 mt-1">
                Metas en progreso
              </span>
            </div>
            <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-inner">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </SpotlightCard>

        {/* Metas Logradas */}
        <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.2)" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Logradas</p>
              <h3 className="text-3xl font-black text-emerald-500 mt-1.5">{stats.goalsCompleted}</h3>
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 mt-1">
                100% completadas
              </span>
            </div>
            <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </SpotlightCard>

        {/* Presupuesto Deseado */}
        <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.2)" className="p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Deseos (PYG)</p>
              <h3 className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1.5 truncate">
                {formatPrice(stats.wishlistPendingTotal, stats.currency)}
              </h3>
              <span className="text-[11px] font-bold text-purple-500 flex items-center gap-1 mt-1">
                Artículos pendientes
              </span>
            </div>
            <div className="p-3.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20 shadow-inner shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Grid de Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Objetivos con Barra de Neón */}
        <SpotlightCard className="p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Metas en Marcha
            </h2>
            <Link to="/goals" className="text-xs font-extrabold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 group">
              Ver todos <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          {stats.upcomingGoals.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-400 font-medium">No tienes objetivos pendientes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.upcomingGoals.map((g) => (
                <div key={g.id} className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-800/20 hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{g.title}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-300 font-mono">
                      {g.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>

        {/* Últimas Notas */}
        <SpotlightCard className="p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Notas Recientes
            </h2>
            <Link to="/notes" className="text-xs font-extrabold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 group">
              Ir al cuaderno <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          {stats.notesRecent.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-400 font-medium">No tienes notas creadas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.notesRecent.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-800/20 hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{n.title}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
};