import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error cargando perfil:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Obtener la sesión almacenada en el navegador
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        fetchProfile(currentSession.user.id);
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // 2. Escuchar cambios de sesión de forma segura
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        // Solo aquí limpiamos al usuario
        setUser(null);
        setSession(null);
        setProfile(null);
        setLoading(false);
      } else if (newSession?.user) {
        // Si hay una sesión activa o refresco de token, la mantenemos firme
        setUser(newSession.user);
        setSession(newSession);
        setLoading(false);
        // Evitamos el deadlock ejecutando la consulta en el siguiente ciclo
        setTimeout(() => {
          if (mounted && newSession?.user?.id) {
            fetchProfile(newSession.user.id);
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);