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

// Función para leer la sesión guardada al instante sin parpadeos
const getSavedAuth = (): { user: User | null; session: Session | null } => {
  try {
    const keys = Object.keys(localStorage);
    const authKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (authKey) {
      const parsed = JSON.parse(localStorage.getItem(authKey) || '{}');
      if (parsed?.user) {
        return { user: parsed.user, session: parsed };
      }
    }
  } catch (e) {
    console.error('Error leyendo sesión de localStorage:', e);
  }
  return { user: null, session: null };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialAuth = getSavedAuth();
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [session, setSession] = useState<Session | null>(initialAuth.session);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialAuth.user);

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

    // 1. Validar sesión persistida
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        fetchProfile(currentSession.user.id);
      } else if (!initialAuth.user) {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

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