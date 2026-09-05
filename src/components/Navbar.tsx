"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, useDemoSwitch } from "@/hooks/useAuth";
import { Menu, X, Sun, Moon, User, LogOut, LayoutDashboard, MapPin, BookOpen, MessageSquare, Zap } from "lucide-react";

const NAV_ITEMS = [
  { href: "/trips", label: "Trips & Carpools", icon: LayoutDashboard },
  { href: "/map", label: "Field Map", icon: MapPin },
  { href: "/species", label: "Species Catalog", icon: BookOpen },
  { href: "/hotspots", label: "Hotspots", icon: MapPin },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

export function Navbar() {
  const { user, loading } = useSession();
  const { switchDemo, demos, switching } = useDemoSwitch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) {
      setDarkMode(saved === "true");
      document.documentElement.classList.toggle("dark", saved === "true");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.documentElement.classList.toggle("dark", newMode);
  };

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-sandstone/95 backdrop-blur-sm border-b border-sage/20 dark:bg-forest/95 dark:border-sage/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-amber" />
              <span className="text-xl font-bold text-forest dark:text-sandstone">FlockFinder</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-sage/20 animate-pulse rounded dark:bg-sage/30" />
              <div className="h-8 w-24 bg-sage/20 animate-pulse rounded dark:bg-sage/30" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-sandstone/95 backdrop-blur-sm border-b border-sage/20 dark:bg-forest/95 dark:border-sage/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-amber" />
              <span className="text-xl font-bold text-forest dark:text-sandstone">FlockFinder</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm font-medium text-forest/80 hover:text-forest dark:text-sandstone/80 dark:hover:text-sandstone transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-forest/70 hover:bg-sage/20 dark:text-sandstone/70 dark:hover:bg-sage/800 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-sage/20 dark:hover:bg-sage/800 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-8 w-8 text-forest/60 dark:text-sandstone/60" />
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-sandstone border border-sage/20 shadow-lg dark:bg-forest dark:border-sage/20 py-2">
                    <div className="px-4 py-2 border-b border-sage/20 dark:border-sage/20">
                      <p className="text-sm font-medium text-forest dark:text-sandstone">{user.name}</p>
                      <p className="text-xs text-forest/60 dark:text-sandstone/60">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-forest/80 hover:bg-sage/100 dark:text-sandstone/80 dark:hover:bg-sage/800"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={async () => {
                        const res = await fetch("/api/auth/logout", { method: "POST" });
                        if (res.ok) window.location.href = "/";
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-forest/80 hover:bg-sage/100 dark:text-sandstone/80 dark:hover:bg-sage/800"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="px-4 py-2 text-sm font-medium text-sandstone bg-forest rounded-lg hover:bg-forest/90 dark:bg-sage dark:hover:bg-sage/90 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="px-4 py-2 text-sm font-medium text-forest bg-sage/20 rounded-lg hover:bg-sage/30 dark:bg-sage/30 dark:hover:bg-sage/40 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-forest/70 hover:bg-sage/20 dark:text-sandstone/70 dark:hover:bg-sage/800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-sage/20 dark:border-sage/20">
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-forest/80 hover:bg-sage/100 dark:text-sandstone/80 dark:hover:bg-sage/800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              {!user && (
                <div className="flex flex-col gap-2 pt-4 border-t border-sage/20 dark:border-sage/20">
                  <Link
                    href="/auth"
                    className="px-3 py-2 text-center text-sm font-medium text-sandstone bg-forest rounded-lg hover:bg-forest/90"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="px-3 py-2 text-center text-sm font-medium text-forest bg-sage/20 rounded-lg hover:bg-sage/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-sage/20 dark:border-sage/20 bg-sandstone/95 dark:bg-forest/95 px-4 py-2">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber" />
            <span className="text-sm font-medium text-forest dark:text-sandstone">Quick Demo Switch:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {demos.map((demo) => (
              <button
                key={demo}
                onClick={() => switchDemo(demo)}
                disabled={switching === demo}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  user?.email?.includes(demo)
                    ? "bg-amber text-forest font-bold"
                    : "bg-sage/20 text-forest/70 hover:bg-sage/30 dark:bg-sage/30 dark:text-sandstone/70 dark:hover:bg-sage/40"
                }`}
              >
                {demo.charAt(0).toUpperCase() + demo.slice(1)}
                {switching === demo && <span className="ml-1">⟳</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}