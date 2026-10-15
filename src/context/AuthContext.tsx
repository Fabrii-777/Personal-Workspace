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
  // Leemos la sesión existente para que el usuario nunca empiece en null
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const keys = Object.keys(localStorage);
      const authKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (authKey) {
        const item = localStorage.getItem(authKey);
        return item ? JSON.parse(item) : null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => session?.user ?? null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(!session?.user);

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
    let isMounted = true;

    // 1. Verificar sesión activa
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        fetchProfile(currentSession.user.id);
      }
      setLoading(false);
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // 2. Escuchador de eventos
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;

      // SOLO cerramos sesión si el usuario dio clic en Cerrar Sesión expresamente
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
        setLoading(false);
      } else if (newSession?.user) {
        setUser(newSession.user);
        setSession(newSession);
        setLoading(false);
        setTimeout(() => {
          if (isMounted && newSession?.user?.id) {
            fetchProfile(newSession.user.id);
          }
        }, 0);
      }
    });

    return () => {
      isMounted = false;
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