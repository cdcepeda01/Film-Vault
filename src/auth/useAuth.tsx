import { createContext, useContext, useEffect, useState } from "react";
import type { User as LocalUser } from "../types";
import { auth, googleProvider } from "../lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

// Adaptamos el User a nuestro tipo local
const mapUser = (u: any): LocalUser | null => {
  if (!u) return null;
  return {
    id: u.uid,
    username: u.displayName || u.email?.split("@")[0] || "user",
    avatarUrl: u.photoURL || undefined
  };
};

const AuthCtx = createContext<{
  user: LocalUser | null;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  loginGoogle: async () => {},
  logout: async () => {}
});

export const AuthProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [user,setUser]=useState<LocalUser|null>(null);
  const [ready,setReady]=useState(false);

  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(mapUser(fbUser));
      setReady(true);
    });
    return unsub;
  },[]);

  const loginGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    // onAuthStateChanged actualizará user
  };

  const logout = async () => { await signOut(auth); };

  if(!ready) return <div className="p-4">Cargando…</div>;

  return (
    <AuthCtx.Provider value={{user, loginGoogle, logout}}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = ()=> useContext(AuthCtx);
