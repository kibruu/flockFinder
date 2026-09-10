"use client";

import dynamic from "next/dynamic";

export const MapView = dynamic(() => import("@/components/MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-sandstone dark:bg-forest">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        <p className="text-forest-deep dark:text-sandstone text-lg">Loading map...</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Initializing Leaflet & loading data</p>
      </div>
    </div>
  ),
});

export default MapView;