import { Bird } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-sandstone dark:bg-forest">
      <div className="text-center">
        <Bird className="h-10 w-10 animate-pulse text-teal-600 dark:text-teal-400" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading FlockFinder...</p>
      </div>
    </div>
  );
}