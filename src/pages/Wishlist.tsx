import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { WishlistItem, Currency, WishlistStatus } from '../types/database';
import { Plus, Check, Trash2, ExternalLink, X } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>('PYG');
  const [category, setCategory] = useState('Tecnología');
  const [productUrl, setProductUrl] = useState('');
  const [priority, setPriority] = useState<'baja' | 'media' | 'alta'>('media');

  const fetchItems = async () => {
    if (!user) return;
    const { data } = await supabase.from('wishlist_items').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    await supabase.from('wishlist_items').insert([{
      user_id: user.id,
      name,
      price,
      currency,
      category,
      product_url: productUrl || null,
      priority,
      status: 'pendiente'
    }]);

    setModalOpen(false);
    setName('');
    setPrice(0);
    setProductUrl('');
    setCategory('Tecnología');
    setPriority('media');
    fetchItems();
  };

  const handleToggleBought = async (item: WishlistItem) => {
    const nextStatus: WishlistStatus = item.status === 'comprado' ? 'pendiente' : 'comprado';
    await supabase.from('wishlist_items').update({ status: nextStatus }).eq('id', item.id);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este artículo de la lista?')) {
      await supabase.from('wishlist_items').delete().eq('id', id);
      fetchItems();
    }
  };

  const formatPrice = (val: number, cur: Currency) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: cur === 'PYG' ? 0 : 2
    }).format(val);
  };

  const pendingItems = items.filter(i => i.status === 'pendiente');
  const totalEstimatedPYG = pendingItems
    .filter(i => i.currency === 'PYG')
    .reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Lista de Deseos & Compras</h1>
          <p className="text-slate-500 text-sm">Gestiona tus planes de compras y presupuesto estimado.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" /> Agregar Artículo
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-purple-200">Presupuesto Pendiente en Guaraníes</p>
          <h2 className="text-3xl font-black mt-1">{formatPrice(totalEstimatedPYG, 'PYG')}</h2>
        </div>
        <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl font-bold self-start sm:self-auto">
          {pendingItems.length} artículos por comprar
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              item.status === 'comprado'
                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-75'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                  {item.category}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  item.priority === 'alta' ? 'bg-rose-100 dark:bg-rose-950 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {item.priority}
                </span>
              </div>
              <h3 className={`font-bold text-base ${item.status === 'comprado' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                {item.name}
              </h3>
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-2">
                {formatPrice(item.price, item.currency)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {item.product_url ? (
                <a href={item.product_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1">
                  Ver tienda <ExternalLink className="w-3 h-3" />
                </a>
              ) : <div />}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleBought(item)}
                  title={item.status === 'comprado' ? 'Pendiente' : 'Comprado'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    item.status === 'comprado'
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Agregar a la Lista</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Artículo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Mouse Inalámbrico"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'baja' | 'media' | 'alta')}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio Estimado</label>
                  <input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Moneda</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500 font-semibold"
                  >
                    <option value="PYG">PYG (Gs.)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Enlace del Producto (Opcional)</label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://tienda.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};