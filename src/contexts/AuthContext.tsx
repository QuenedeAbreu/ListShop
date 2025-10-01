"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/client";
import type { Profile } from "@/lib/types";
import Loading from "@/components/Loading";
// import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";


interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setPageTitle: (title: string) => void;
  pageTitle: string;
  // opcional: função para forçar update após login
  forceSessionUpdate: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("...");
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    if (!userId) return;
    // console.log(userId);
    try {
      const { data: profile, error } = await supabase
        .from("Profile")
        .select("*")
        .eq("userId", userId)
        .maybeSingle();
      // console.log(error);

      if (error) throw new Error("Falha ao buscar perfil");

      setProfile(profile ?? null);
    } catch (err) {
      // console.log(err);
      console.error("Erro ao buscar perfil:", err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const forceSessionUpdate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      fetchProfile(currentUser.id);
    } else {
      setProfile(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/login");
  };

  useEffect(() => {
    const init = async () => {
      // console.log('init');
      try {
        // console.log('init try');
        const { data: { session }, error } = await supabase.auth.getSession();
        // console.log('session', session);
        // console.log('error', error);
        const currentUser = session?.user ?? null;
        // console.log('currentUser', currentUser);
        setUser(currentUser);
        setLoading(false); // libera a UI rápido

        if (currentUser) {
          // console.log('currentUser');
          fetchProfile(currentUser.id); // busca em paralelo
        }
      } catch (err) {
        console.error(err);
        setUser(null);
        setProfile(null);
        setLoading(false);
      } finally {
        // console.log('Finaly');
        setLoading(false);
      }
      // console.log('init finaly');
    };

    init();

    // Escuta mudanças de autenticação (login, logout, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // console.log(_event);
        const currentUser = session?.user ?? null;
        // console.log('currentUser', currentUser);
        setUser(currentUser);

        if (currentUser) {
          // console.log('currentUserIF');
          fetchProfile(currentUser.id);
          setLoading(false);
        } else {
          setProfile(null);
          setLoading(false);
        }

      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    setPageTitle,
    pageTitle,
    forceSessionUpdate,
  };

  if (loading) return <Loading fullScreen text="Carregando..." />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}
