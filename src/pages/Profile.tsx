import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Globe, Save, Share2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

export const Profile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [studies, setStudies] = useState(profile?.studies || '');
  const [techInput, setTechInput] = useState(profile?.technologies?.join(', ') || '');
  const [skillsInput, setSkillsInput] = useState(profile?.skills?.join(', ') || '');
  const [github, setGithub] = useState(profile?.social_links?.github || '');
  const [linkedin, setLinkedin] = useState(profile?.social_links?.linkedin || '');
  const [website, setWebsite] = useState(profile?.social_links?.website || '');
  const [isPublic, setIsPublic] = useState(profile?.is_public || false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const technologies = techInput.split(',').map((t) => t.trim()).filter(Boolean);
    const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);

    await supabase.from('profiles').update({
      full_name: fullName,
      bio,
      studies,
      technologies,
      skills,
      social_links: { github, linkedin, website },
      is_public: isPublic,
      updated_at: new Date().toISOString()
    }).eq('id', user.id);

    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Mi Perfil</h1>
          <p className="text-slate-500 text-sm">Gestiona tu identidad personal y qué compartir públicamente.</p>
        </div>
        {profile?.username && (
          <Link
            to={`/p/${profile.username}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold text-sm self-start sm:self-auto"
          >
            <Share2 className="w-4 h-4 text-indigo-500" /> Ver Perfil Público
          </Link>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
          <div>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Hacer mi perfil público</p>
            <p className="text-xs text-slate-500">Permite que otras personas visiten tu biografía y proyectos destacados.</p>
          </div>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-0"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estudios o Formación</label>
            <input
              type="text"
              value={studies}
              onChange={(e) => setStudies(e.target.value)}
              placeholder="Ej. Ing. en Informática"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción / Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Breve resumen sobre ti..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tecnologías (separadas por comas)</label>
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="React, TypeScript, Node.js, PostgreSQL"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Habilidades / Intereses (separados por comas)</label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="UI Design, Cloud, Música, Lectura"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-indigo-500"
          />
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-slate-500 uppercase">Redes Sociales y Enlaces</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-slate-50 dark:bg-slate-800">
              <GithubIcon className="w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="GitHub"
                className="w-full py-2 bg-transparent text-xs focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-slate-50 dark:bg-slate-800">
              <LinkedinIcon className="w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="LinkedIn"
                className="w-full py-2 bg-transparent text-xs focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-slate-50 dark:bg-slate-800">
              <Globe className="w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Sitio Web"
                className="w-full py-2 bg-transparent text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            {saved ? '¡Guardado con éxito!' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};