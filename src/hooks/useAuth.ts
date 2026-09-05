"use client";

import { useState, useEffect } from "react";
import type { UserSession } from "@/lib/auth";

export function useSession() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  return { user, loading, setUser };
}

export function useDemoSwitch() {
  const { user, setUser } = useSession();
  const [switching, setSwitching] = useState<string | null>(null);
  const [demos] = useState(["elena", "marcus", "maya"]);

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

  return { switchDemo, demos, switching };
}

export function useAuth() {
  const session = useSession();
  const demoSwitch = useDemoSwitch();

  return { ...session, ...demoSwitch };
}