"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "login";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (mode === "register") {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    } else {
      if (!formData.email.trim()) newErrors.email = "Email is required";
    }
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (mode === "register" && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error || "Something went wrong" });
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 1000);
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demo: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo }),
      });
      if (res.ok) {
        router.push("/");
      }
    } catch {
      setErrors({ form: "Failed to switch demo user" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="h-10 w-10 text-amber" />
            <span className="text-2xl font-bold text-forest dark:text-sandstone">FlockFinder</span>
          </Link>
          <h1 className="text-3xl font-bold text-forest dark:text-sandstone mb-2">
            {mode === "register" ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-forest/60 dark:text-sandstone/60">
            {mode === "register"
              ? "Join the birding community"
              : "Sign in to continue your birding journey"}
          </p>
        </div>

        <div className="bg-sandstone dark:bg-forest rounded-2xl border border-sage/20 dark:border-sage/20 p-8 shadow-xl">
          {success && (
            <div className="mb-6 flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
              <span>Success! Redirecting...</span>
            </div>
          )}

          {errors.form && (
            <div className="mb-6 flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-forest/80 dark:text-sandstone/80 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/40" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-sandstone dark:bg-forest text-forest dark:text-sandstone placeholder-forest/40 focus:outline-none focus:ring-2 focus:ring-sage/50 ${
                      errors.name ? "border-red-500" : "border-sage/30 dark:border-sage/600"
                    }`}
                    placeholder="Elena Rostova"
                    disabled={loading}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-forest/80 dark:text-sandstone/80 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/40" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-sandstone dark:bg-forest text-forest dark:text-sandstone placeholder-forest/40 focus:outline-none focus:ring-2 focus:ring-sage/50 ${
                    errors.email ? "border-red-500" : "border-sage/30 dark:border-sage/600"
                  }`}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-forest/80 dark:text-sandstone/80 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/40" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2.5 rounded-lg border bg-sandstone dark:bg-forest text-forest dark:text-sandstone placeholder-forest/40 focus:outline-none focus:ring-2 focus:ring-sage/50 ${
                    errors.password ? "border-red-500" : "border-sage/30 dark:border-sage/600"
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/40 hover:text-forest/60"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {mode === "register" && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-forest/80 dark:text-sandstone/80 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/40" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-sandstone dark:bg-forest text-forest dark:text-sandstone placeholder-forest/40 focus:outline-none focus:ring-2 focus:ring-sage/50 ${
                      errors.confirmPassword ? "border-red-500" : "border-sage/30 dark:border-sage/600"
                    }`}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-forest text-sandstone font-medium hover:bg-forest/90 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 focus:ring-offset-sandstone dark:focus:ring-offset-forest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Please wait..." : mode === "register" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sage/20 dark:border-sage/600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-sandstone dark:bg-forest text-forest/60 dark:text-sandstone/60">
                  Or continue as demo
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {["elena", "marcus", "maya"].map((demo) => (
                <button
                  key={demo}
                  type="button"
                  onClick={() => handleDemoClick(demo)}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-lg bg-sage/20 dark:bg-sage/30 text-forest/80 dark:text-sandstone/80 font-medium hover:bg-sage/30 dark:hover:bg-sage/40 transition-colors disabled:opacity-50 text-sm"
                >
                  {demo.charAt(0).toUpperCase() + demo.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-forest/60 dark:text-sandstone/60">
            {mode === "register" ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              href={`/auth?mode=${mode === "register" ? "login" : "register"}`}
              className="text-forest font-medium hover:underline dark:text-sage"
            >
              {mode === "register" ? "Sign in" : "Register"}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-forest/40 dark:text-sandstone/40">
          Demo accounts: Elena (Trip Host), Marcus (Driver), Maya (Newbie)
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sandstone dark:bg-forest flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}