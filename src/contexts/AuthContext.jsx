import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
const Context = createContext(null);
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!supabase) { setLoading(false); setError('El acceso no está configurado.'); return; }
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) { setSession(next); setLoading(false); setError(''); }
    });

    const restoreSession = async () => {
      try {
        const callbackUrl = new URL(window.location.href);
        const code = callbackUrl.searchParams.get('code');
        const result = code
          ? await supabase.auth.exchangeCodeForSession(code)
          : await supabase.auth.getSession();
        if (!active) return;
        setSession(result.error ? null : result.data.session);
        if (result.error) {
          console.error('[Vigio Auth] No se pudo restaurar la sesión:', result.error);
          setError(code ? `No se pudo completar el inicio de sesión con Google: ${result.error.message}` : 'No se pudo recuperar tu sesión.');
        }
        if (code && !result.error) {
          callbackUrl.searchParams.delete('code');
          window.history.replaceState({}, '', `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`);
        }
      } catch {
        if (active) setError('No se pudo comprobar tu sesión.');
      } finally {
        if (active) setLoading(false);
      }
    };
    restoreSession();
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
