import Link from "next/link";
import { Bird } from "lucide-react";

const footerLinks = [
  {
    title: "Explore",
    links: [
      { href: "/trips", label: "Expeditions" },
      { href: "/map", label: "Field Map" },
      { href: "/species", label: "Species Catalog" },
      { href: "/hotspots", label: "Hotspots" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/messages", label: "Messages" },
      { href: "/auth?mode=register", label: "Join FlockFinder" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-sage/20 bg-sandstone dark:bg-forest-deep">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2" aria-label="FlockFinder home">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/15">
                <Bird className="h-5 w-5 text-teal" />
              </div>
              <span className="text-lg font-bold text-forest-deep dark:text-sandstone">FlockFinder</span>
            </Link>
            <p className="mt-3 text-sm text-forest-mid dark:text-sandstone/60">
              Meetup + Strava for Birders
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-forest-deep dark:text-sandstone">
                {group.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-forest-mid hover:text-teal dark:text-sandstone/60 dark:hover:text-teal transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-sage/20 pt-6">
          <p className="text-xs text-forest-mid dark:text-sandstone/40">
            &copy; {new Date().getFullYear()} FlockFinder. Built with love for the birding community.
          </p>
        </div>
      </div>
    </footer>
  );
}