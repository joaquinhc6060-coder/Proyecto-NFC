import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
const Context = createContext(null);
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!supabase) { setLoading(false); setError('El acceso no está configurado.'); return; }
    let active = true, revision = 0;
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) { revision++; setSession(next); setLoading(false); setError(''); }
    });
    const initial = revision;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || revision !== initial) return;
      setSession(error ? null : data.session);
      if (error) setError('No se pudo recuperar tu sesión.');
    }).catch(() => { if (active) setError('No se pudo comprobar tu sesión.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error('No se pudo cerrar la sesión.');
    setSession(null);
    for (const key of ['vigio_is_logged_in','vigio_user_role']) localStorage.removeItem(key);
  };
  return <Context.Provider value={{ session, user: session?.user || null, loading, error, signOut }}>{children}</Context.Provider>;
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error('Falta AuthProvider.');
  return value;
}
