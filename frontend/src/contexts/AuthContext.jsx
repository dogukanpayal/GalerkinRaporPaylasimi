import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profileInserted, setProfileInserted] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    return () => listener?.subscription.unsubscribe();
  }, []);

  // Kullanıcı giriş yaptıktan sonra kendi users tablosuna ekle
  useEffect(() => {
    if (user && !profileInserted) {
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .then(({ data, error }) => {
          if (!data || data.length === 0) {
            supabase.from('users').insert([{
              id: user.id,
              email: user.email,
              first_name: firstName,
              last_name: lastName
            }]).then(() => {
              setProfileInserted(true);
            });
          } else {
            setProfileInserted(true);
          }
        });
    }
  }, [user, profileInserted]);

  // Kayıt sırasında ad/soyadı metadata ile kaydet
  const signUp = async (email, password, firstName, lastName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    if (error) throw error;
  };

  const signIn = async (email, password) => {
    setProfileInserted(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfileInserted(false);
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 