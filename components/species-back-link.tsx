"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface SpeciesBackLinkProps {
  from?: string;
}

export function SpeciesBackLink({ from }: SpeciesBackLinkProps) {
  const router = useRouter();
  const isFromTrip = from === "trip";
  const label = isFromTrip ? "Back to the expedition" : "Back to Species Catalog";

  function handleBack(event: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof window !== "undefined" && window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href="/species"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}