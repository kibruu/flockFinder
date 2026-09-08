"use client";

import { createContext, useContext, useState, useEffect, ReactNode, createElement } from "react";
import type { UserSession } from "@/lib/auth";

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  setUser: (user: UserSession | null) => void;
  switchDemo: (demo: string) => Promise<void>;
  demos: readonly string[];
  switching: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const demos = ["elena", "marcus", "maya"] as const;

  useEffect(() => {
    let mounted = true;
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (mounted) setUser(data.user);
        } else {
          if (mounted) setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchSession();
    return () => { mounted = false; };
  }, []);

  const switchDemo = async (demo: string) => {
    setSwitching(demo);
    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to switch demo:", error);
    } finally {
      setSwitching(null);
    }
  };

  const value = { user, loading, setUser, switchDemo, demos, switching };
  return createElement(AuthContext.Provider, { value }, children);
};

export { AuthProvider };

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useSession() {
  const { user, loading, setUser } = useAuth();
  return { user, loading, setUser };
}

export function useDemoSwitch() {
  const { switchDemo, demos, switching } = useAuth();
  return { switchDemo, demos, switching };
}