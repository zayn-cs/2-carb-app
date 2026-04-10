import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface User {
  id: string;
  nom: string;
  email?: string;
  ipAddress?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: false, signIn: () => {}, signOut: () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for existing session immediately (synchronous)
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
    // No loading state - check is synchronous
    setLoading(false);
  }, []);

  const signIn = (user: User) => {
    setUser(user);
  };

  const signOut = () => {
    sessionStorage.removeItem("currentUser");
    setUser(null);
    // Redirect to login
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
