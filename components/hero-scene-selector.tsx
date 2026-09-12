"use client";

import { useSyncExternalStore } from "react";
import { Mountain, Waves } from "lucide-react";
import { HeroScene } from "@/components/hero-scene";
import { MountainPhotoScene } from "@/components/mountain-photo-scene";

const STORAGE_KEY = "flockfinder-hero-scene";
type Scene = "mountain" | "water";

const listeners = new Set<() => void>();

function readSavedScene(): Scene {
  if (typeof window === "undefined") return "mountain";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "mountain" || saved === "water" ? saved : "mountain";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): Scene {
  return readSavedScene();
}

function getServerSnapshot(): Scene {
  return "mountain";
}

function select(next: Scene) {
  window.localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((cb) => cb());
}

export function HeroSceneSelector() {
  const scene = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <>
      {scene === "mountain" ? <MountainPhotoScene /> : <HeroScene />}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-full border border-sandstone/30 bg-black/25 p-1 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          aria-label="Show the sunset flock background"
          aria-pressed={scene === "mountain"}
          onClick={() => select("mountain")}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            scene === "mountain"
              ? "bg-sandstone text-forest"
              : "text-sandstone hover:bg-sandstone/20"
          }`}
        >
          <Mountain className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Show the ocean bird background"
          aria-pressed={scene === "water"}
          onClick={() => select("water")}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            scene === "water"
              ? "bg-sandstone text-forest"
              : "text-sandstone hover:bg-sandstone/20"
          }`}
        >
          <Waves className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}