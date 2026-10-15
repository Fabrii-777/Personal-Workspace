import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Globe, Save, Share2, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SpotlightCard } from '../components/Reactbits/SpotlightCard';

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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
  const [instagram, setInstagram] = useState(profile?.social_links?.instagram || '');
  const [website, setWebsite] = useState(profile?.social_links?.website || '');
  const [isPublic, setIsPublic] = useState(profile?.is_public || false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = profile?.username ? `${window.location.origin}/p/${profile.username}` : '';

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share && publicUrl) {
      try {
        await navigator.share({
          title: `Perfil de ${profile?.full_name}`,
          text: `Echa un vistazo a mi perfil y proyectos en PersonalSpace:`,
          url: publicUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

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
      social_links: { github, instagram, website },
      is_public: isPublic,
      updated_at: new Date().toISOString()
    }).eq('id', user.id);

    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Mi Perfil</h1>
          <p className="text-slate-500 text-sm">Gestiona tu identidad personal y comparte tu portafolio con otros.</p>
        </div>
      </div>

      <SpotlightCard className="p-6 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <h2 className="text-base font-black">Tu Enlace de Perfil Público</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isPublic ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
              }`}>
                {isPublic ? 'Público y Activo' : 'Privado (Actívalo abajo)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all">
              {publicUrl || 'Guarda tu perfil para generar tu enlace'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              disabled={!publicUrl}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? '¡Copiado!' : 'Copiar Enlace'}
            </button>
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={!publicUrl}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white transition-all text-xs font-bold"
              title="Compartir"
            >
              <Share2 className="w-4 h-4 text-indigo-500" />
            </button>
            {profile?.username && (
              <Link
                to={`/p/${profile.username}`}
                target="_blank"
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-500 transition-all text-xs font-bold"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </SpotlightCard>

      <form onSubmit={handleSave} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
          <div>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Hacer mi perfil público</p>
            <p className="text-xs text-slate-500">Aparecerás en la sección "Explorar" para que otros miembros de la comunidad te conozcan.</p>
          </div>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-0 cursor-pointer"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 text-sm focus:outline-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estudios o Formación</label>
            <input
              type="text"
              value={studies}
              onChange={(e) => setStudies(e.target.value)}
              placeholder="Ej. Ing. en Informática"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 text-sm focus:outline-indigo-500"
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
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 text-sm focus:outline-indigo-500"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tecnologías (separadas por comas)</label>
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="React, TypeScript, Node.js, PostgreSQL"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 text-sm focus:outline-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Habilidades / Intereses (separados por comas)</label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="UI Design, Cloud, Música, Lectura"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 text-sm focus:outline-indigo-500"
          />
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-slate-500 uppercase">Redes Sociales y Enlaces</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white/60 dark:bg-slate-800/60 focus-within:border-indigo-500 transition-colors">
              <GithubIcon className="w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full py-2 bg-transparent text-xs focus:outline-none"
              />
            </div>
            {/* Instagram */}
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white/60 dark:bg-slate-800/60 focus-within:border-pink-500 transition-colors">
              <InstagramIcon className="w-4 h-4 text-pink-500" />
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full py-2 bg-transparent text-xs focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white/60 dark:bg-slate-800/60 focus-within:border-indigo-500 transition-colors">
              <Globe className="w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://misitio.com"
                className="w-full py-2 bg-transparent text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            {saved ? '¡Guardado con éxito!' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};