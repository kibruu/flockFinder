"use client";

import { useEffect } from "react";
import { Bird } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-sandstone dark:bg-forest">
      <div className="max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center shadow-sm">
        <Bird className="mx-auto h-10 w-10 text-teal-600 dark:text-teal-400" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          We couldn&apos;t load this page. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}