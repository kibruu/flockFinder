import type { Metadata } from "next";
import AuthForm from "./AuthForm";

export const metadata: Metadata = {
  title: "Sign in — FlockFinder",
  description: "Sign in to your FlockFinder account, register, or continue as a demo birder.",
};

type SearchParams = { mode?: string | string[] };

export default async function AuthPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const mode = params.mode === "register" ? "register" : "login";

  return <AuthForm mode={mode} />;
}