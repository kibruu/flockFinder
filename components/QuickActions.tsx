"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Binoculars, Car, PlusCircle } from "lucide-react";
import { useFieldCompanion } from "@/components/FieldCompanion/launcher";
import { useSession } from "@/hooks/useAuth";

const cardClass =
  "group flex items-center justify-between rounded-xl border border-sage/20 bg-sandstone dark:bg-forest-deep p-5 shadow-sm transition-colors hover:border-teal/50";
const arrowClass =
  "h-4 w-4 text-forest-mid dark:text-sandstone/40 transition-transform group-hover:translate-x-1";

export function QuickActions() {
  const { user } = useSession();
  const { openCompanion } = useFieldCompanion();
  const router = useRouter();

  const handleLogSighting = () => {
    if (user) {
      openCompanion();
    } else {
      router.push("/auth");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Link
        href="/trips"
        className={cardClass}
      >
        <div className="flex items-center gap-3">
          <PlusCircle className="h-5 w-5 text-teal" />
          <span className="font-medium text-forest-deep dark:text-sandstone">Host an Outing</span>
        </div>
        <ArrowRight className={arrowClass} />
      </Link>
      <Link
        href="/trips?hasOpenSeats=true"
        className={cardClass}
      >
        <div className="flex items-center gap-3">
          <Car className="h-5 w-5 text-teal" />
          <span className="font-medium text-forest-deep dark:text-sandstone">Find a Ride</span>
        </div>
        <ArrowRight className={arrowClass} />
      </Link>
      <button
        type="button"
        onClick={handleLogSighting}
        className={`${cardClass} text-left`}
      >
        <div className="flex items-center gap-3">
          <Binoculars className="h-5 w-5 text-teal" />
          <span className="font-medium text-forest-deep dark:text-sandstone">Log Field Sighting</span>
        </div>
        <ArrowRight className={arrowClass} />
      </button>
    </div>
  );
}