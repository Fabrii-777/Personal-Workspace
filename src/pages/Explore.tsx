import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
import { Search, Compass, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SpotlightCard } from '../components/Reactbits/SpotlightCard';
import { ShinyText } from '../components/Reactbits/ShinyText';

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const Explore: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_public', true)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          setProfiles(data);
        }
      } catch (err) {
        console.error('Error cargando perfiles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfiles();
  }, []);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const nameMatch = p.full_name?.toLowerCase().includes(q);
    const bioMatch = p.bio?.toLowerCase().includes(q);
    const techMatch = p.technologies?.some(t => t.toLowerCase().includes(q));
    const skillMatch = p.skills?.some(s => s.toLowerCase().includes(q));
    return nameMatch || bioMatch || techMatch || skillMatch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-black uppercase mb-2">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Comunidad de Creadores</span>
          </div>
          <h1 className="text-3xl font-black">
            Explorar <ShinyText text="Perfiles Públicos" />
          </h1>
          <p className="text-slate-500 text-sm">Descubre a otros usuarios, sus habilidades, Instagram y proyectos destacados.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, tecnología o habilidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-sm focus:outline-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
          <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-3 opacity-60" />
          <p className="text-slate-600 dark:text-slate-300 font-bold">No se encontraron perfiles públicos con esa búsqueda.</p>
          <p className="text-xs text-slate-500 mt-1">Asegúrate de marcar "Hacer mi perfil público" en la sección Mi Perfil para aparecer aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((userProfile) => (
            <SpotlightCard key={userProfile.id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                    {userProfile.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-base truncate text-slate-800 dark:text-slate-100">
                      {userProfile.full_name}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 truncate">
                      {userProfile.studies || `@${userProfile.username}`}
                    </p>
                  </div>
                </div>

                {userProfile.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {userProfile.bio}
                  </p>
                )}

                {userProfile.technologies && userProfile.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {userProfile.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                    {userProfile.technologies.length > 4 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5 font-bold">
                        +{userProfile.technologies.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {userProfile.social_links?.instagram && (
                    <a
                      href={userProfile.social_links.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/40 rounded-lg transition-colors"
                      title="Instagram"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                  )}
                  {userProfile.social_links?.github && (
                    <a
                      href={userProfile.social_links.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                      title="GitHub"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {userProfile.social_links?.website && (
                    <a
                      href={userProfile.social_links.website}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                      title="Sitio Web"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <Link
                  to={`/p/${userProfile.username}`}
                  target="_blank"
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-500 font-bold text-xs rounded-xl transition-all"
                >
                  Ver Perfil <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}
    </div>
  );
};