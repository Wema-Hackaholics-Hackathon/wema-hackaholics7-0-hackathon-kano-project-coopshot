"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type User = {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);

      // First, try to get user from cookie (fastest)
      const cookieRow = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_user="));

      if (cookieRow) {
        const rawValue = cookieRow.substring("auth_user=".length);
        const userData = JSON.parse(decodeURIComponent(rawValue));
        setUser(userData);
        setIsLoading(false);
        return;
      }

      // Fallback: fetch from server endpoint if cookie missing
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetch = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return context;
}
