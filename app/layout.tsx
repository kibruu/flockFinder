import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/hooks/useAuth";
import { FieldCompanionLauncher } from "@/components/FieldCompanion/launcher";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlockFinder — Birding Expeditions & Carpool Community",
  description: "Join birders for field trips, coordinate carpools to remote hotspots, log sightings, and build your Life List.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#1A2421" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-text-primary font-sans">
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem("darkMode");var d=s!==null?s==="true":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();` }} />
        <AuthProvider>
          <FieldCompanionLauncher>
            <Navbar />
            <main className="flex-1">{children}</main>
          </FieldCompanionLauncher>
        </AuthProvider>
      </body>
    </html>
  );
}