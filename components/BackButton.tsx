"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackHref: string;
  label?: string;
  className?: string;
}

export function BackButton({ fallbackHref, label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.history.length > 1 && document.referrer.includes(window.location.origin)) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-sm font-medium text-forest/60 dark:text-sandstone/60 hover:text-forest dark:hover:text-sandstone ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}