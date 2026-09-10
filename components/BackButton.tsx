"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackHref: string;
  label?: string;
  className?: string;
}

function useCanGoBack(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      window.addEventListener("pageshow", onChange);
      return () => {
        window.removeEventListener("popstate", onChange);
        window.removeEventListener("pageshow", onChange);
      };
    },
    () => window.history.length > 1 && document.referrer.includes(window.location.origin),
    () => false
  );
}

export function BackButton({ fallbackHref, label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (canGoBack) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-sm font-medium text-forest-deep dark:text-sandstone hover:text-forest dark:hover:text-sandstone ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {canGoBack ? "Back" : label}
    </Link>
  );
}