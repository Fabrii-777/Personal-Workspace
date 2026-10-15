import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User, Sparkles } from 'lucide-react';
import { SpotlightCard } from '../components/Reactbits/SpotlightCard';
import { ShinyText } from '../components/Reactbits/ShinyText';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const Auth: React.FC = () => {
  const { user } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // En cuanto Google confirma la sesión, entra automáticamente al panel
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Iniciar sesión con Google
  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg('');
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Google');
      setLoading(false);
    }
  };

  // Registro e Inicio tradicional por Email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, username: email.split('@')[0].toLowerCase() },
          },
        });
        if (error) throw error;
        alert('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
        setIsRegister(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <SpotlightCard className="max-w-md w-full p-8 border-slate-200/80 dark:border-slate-800/80 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            <ShinyText text={isRegister ? 'Crear Cuenta' : 'Bienvenido de nuevo'} />
          </h2>
          <p className="text-xs text-slate-500 mt-1">Accede a tu espacio de proyectos, metas y notas</p>
        </div>

        {/* Botón Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm shadow-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 mb-5 disabled:opacity-50 cursor-pointer"
        >
          <GoogleIcon />
          <span>Continuar con Google</span>
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">o con correo</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white/50 dark:bg-slate-800/50 focus-within:border-indigo-500 transition-colors">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Carlos López"
                  className="w-full py-2.5 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white/50 dark:bg-slate-800/50 focus-within:border-indigo-500 transition-colors">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full py-2.5 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white/50 dark:bg-slate-800/50 focus-within:border-indigo-500 transition-colors">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            {loading ? 'Procesando...' : isRegister ? 'Registrarme' : 'Iniciar Sesión'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
            className="text-xs font-bold text-indigo-500 hover:underline cursor-pointer"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate gratis'}
          </button>
        </div>
      </SpotlightCard>
    </div>
  );
};