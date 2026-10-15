import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Profile, Project } from '../types/database';
import { Globe, FolderGit2, ExternalLink } from 'lucide-react';

const GithubIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const { data: prof, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .eq('is_public', true)
          .single();

        if (error || !prof) {
          setLoading(false);
          return;
        }

        setProfile(prof);

        const { data: projs } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', prof.id)
          .eq('is_public', true);

        if (projs) setProjects(projs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Perfil no encontrado</h2>
        <p className="text-slate-400 mt-2 text-sm">Este perfil no existe o está configurado como privado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4">
            {profile.full_name.charAt(0)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{profile.full_name}</h1>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-0.5">{profile.studies || `@${profile.username}`}</p>
          {profile.bio && <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 max-w-lg mx-auto leading-relaxed">{profile.bio}</p>}

          <div className="flex justify-center gap-3 mt-5">
            {profile.social_links?.github && (
              <a 
                href={profile.social_links.github} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-indigo-600 hover:scale-110 transition-all"
                title="GitHub"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
            )}
            {/* Botón de Instagram */}
            {profile.social_links?.instagram && (
              <a 
                href={profile.social_links.instagram} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-pink-500 hover:scale-110 transition-all"
                title="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
            )}
            {profile.social_links?.website && (
              <a 
                href={profile.social_links.website} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-indigo-600 hover:scale-110 transition-all"
                title="Sitio Web"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {profile.technologies && profile.technologies.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Stack Tecnológico</h2>
            <div className="flex flex-wrap gap-2">
              {profile.technologies.map((t) => (
                <span key={t} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-black flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-500" /> Proyectos Destacados
          </h2>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-400">No hay proyectos públicos disponibles.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{proj.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{proj.description}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:underline">
                        Código <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:underline ml-auto">
                        Demo en vivo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};