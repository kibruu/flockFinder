const RARITY_STYLES: Record<string, string> = {
  Common: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Uncommon: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Rare: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Accidental: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};

const CONSERVATION_STYLES: Record<string, string> = {
  Endangered: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Threatened: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Vulnerable: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  "Near Threatened": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export function RarityBadge({ rarity }: { rarity: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RARITY_STYLES[rarity] ?? "bg-gray-200 text-gray-700"}`}>
      {rarity}
    </span>
  );
}

export function ConservationBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CONSERVATION_STYLES[status] ?? "bg-gray-200 text-gray-700"}`}>
      {status}
    </span>
  );
}