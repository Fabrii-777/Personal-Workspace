import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Goal, Subtask, Priority, GoalStatus } from '../types/database';
import { Plus, CheckCircle, Circle, Trash2, Calendar, X } from 'lucide-react';

export const Goals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'en_progreso' | 'completado'>('todos');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const fetchGoals = async () => {
    if (!user) return;
    const { data } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
    if (data) setGoals(data);
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    const progress = subtasks.length > 0 
      ? Math.round((subtasks.filter(s => s.completed).length / subtasks.length) * 100) 
      : 0;

    await supabase.from('goals').insert([{
      user_id: user.id,
      title,
      description,
      category,
      deadline: deadline || null,
      priority,
      status: progress === 100 ? 'completado' : 'en_progreso',
      progress,
      subtasks
    }]);

    setModalOpen(false);
    setTitle('');
    setDescription('');
    setSubtasks([]);
    fetchGoals();
  };

  const handleToggleSubtask = async (goal: Goal, subtaskId: string) => {
    const updatedSubtasks = goal.subtasks.map((st) => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const completedCount = updatedSubtasks.filter(s => s.completed).length;
    const progress = Math.round((completedCount / updatedSubtasks.length) * 100);
    const status: GoalStatus = progress === 100 ? 'completado' : 'en_progreso';

    await supabase.from('goals').update({ subtasks: updatedSubtasks, progress, status }).eq('id', goal.id);
    fetchGoals();
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('¿Eliminar este objetivo?')) {
      await supabase.from('goals').delete().eq('id', id);
      fetchGoals();
    }
  };

  const filteredGoals = goals.filter(g => filter === 'todos' || g.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Plan de Objetivos</h1>
          <p className="text-slate-500 text-sm">Gestiona tus metas con seguimiento de subtareas.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" /> Nuevo Objetivo
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(['todos', 'pendiente', 'en_progreso', 'completado'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
              filter === tab
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                  goal.priority === 'urgente' || goal.priority === 'alta' 
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {goal.priority}
                </span>
                {goal.deadline && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" /> {goal.deadline}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{goal.title}</h3>
              {goal.description && <p className="text-xs text-slate-500 mt-1">{goal.description}</p>}

              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Progreso</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{goal.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      goal.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              {goal.subtasks && goal.subtasks.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <p className="text-xs font-bold text-slate-400">Subtareas:</p>
                  {goal.subtasks.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleToggleSubtask(goal, st.id)}
                      className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-left text-xs text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {st.completed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={st.completed ? 'line-through text-slate-400' : ''}>{st.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => handleDeleteGoal(goal.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nuevo Objetivo</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Desarrollar mi proyecto personal"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pasos o Subtareas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                    placeholder="Escribe un paso y pulsa +"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
                  />
                  <button type="button" onClick={handleAddSubtask} className="px-4 bg-indigo-600 text-white rounded-xl font-bold">
                    +
                  </button>
                </div>
                {subtasks.length > 0 && (
                  <ul className="space-y-1">
                    {subtasks.map((st, i) => (
                      <li key={st.id} className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-lg flex items-center justify-between">
                        <span>{i + 1}. {st.title}</span>
                        <button type="button" onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))}>
                          <X className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md">
                  Guardar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};