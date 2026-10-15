import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FolderGit2, Target, FileText, ShoppingBag, Plus, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-3xl border border-indigo-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            ¡Hola, {profile?.full_name?.split(' ')[0] || 'amigo'}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
            Bienvenido a tu espacio personal. Esto es lo más relevante de tu día:
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/notes"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Nueva Nota
          </Link>
          <Link
            to="/goals"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo Objetivo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proyectos Activos</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.projectsCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Objetivos Pendientes</p>
            <h3 className="text-2xl font-black text-amber-500 mt-1">{stats.goalsPending}</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-500 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metas Logradas</p>
            <h3 className="text-2xl font-black text-emerald-500 mt-1">{stats.goalsCompleted}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presupuesto Deseado</p>
            <h3 className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1 truncate">
              {formatPrice(stats.wishlistPendingTotal, stats.currency)}
            </h3>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Próximos Objetivos
            </h2>
            <Link to="/goals" className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.upcomingGoals.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No tienes objetivos pendientes.</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingGoals.map((g) => (
                <div key={g.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{g.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-600">
                      {g.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${g.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Notas Recientes
            </h2>
            <Link to="/notes" className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1">
              Ir a notas <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.notesRecent.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No tienes notas creadas.</p>
          ) : (
            <div className="space-y-3">
              {stats.notesRecent.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                  <p className="text-xs text-slate-400 truncate mt-1">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};