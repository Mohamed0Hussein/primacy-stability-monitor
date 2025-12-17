import { useState, ReactNode, useEffect } from "react";
import { AuthContext } from "./auth-context";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<object | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        currentUser.getIdToken().then(setAccessToken);
      } else {
        setAccessToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
