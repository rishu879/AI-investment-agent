"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthResponsePayload {
  success?: boolean;
  error?: string;
  data?: {
    token: string;
    user: {
      id?: string;
      email: string;
      name?: string;
    };
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem("ai-investment-agent-token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let payload: AuthResponsePayload | null = null;
      try {
        payload = text ? (JSON.parse(text) as AuthResponsePayload) : null;
      } catch (parseError) {
        console.error("Login response parse error", parseError, text);
      }

      if (!response.ok || !payload?.success || !payload.data) {
        setError(payload?.error ?? `Unable to log in. (${response.status})`);
        setIsSubmitting(false);
        return;
      }

      window.localStorage.setItem("ai-investment-agent-token", payload.data.token);
      window.localStorage.setItem("ai-investment-agent-user", payload.data.user.email);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login request failed", error);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.22),_transparent_25%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.22),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.16),_transparent_25%)] blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full gap-10 rounded-[2.5rem] border border-white/10 bg-slate-900/85 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.65)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-8">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 ring-1 ring-cyan-500/20">
                Smart investing made easy
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Access your AI research dashboard
              </h1>
              <p className="max-w-xl text-slate-400">
                Secure login for saved analysis, premium signals, and a more powerful portfolio workflow. Six free searches are included on every new account.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Free tier</p>
                <p className="mt-3 text-2xl font-semibold text-white">6 searches</p>
                <p className="mt-2 text-sm text-slate-400">Explore our AI recommendations at no charge.</p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:from-cyan-500/20 hover:to-blue-500/20">
                <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Premium</p>
                <p className="mt-3 text-2xl font-semibold text-white">Unlimited access</p>
                <p className="mt-2 text-sm text-slate-400">Unlock full history, research, and charts.</p>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/30">
            <div className="absolute -top-10 right-6 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative space-y-8">
              <div className="space-y-3 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Sign in</p>
                <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
                <p className="mx-auto max-w-sm text-sm text-slate-400">Log in now to continue your premium investment workflow.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-slate-300">
                  Email address
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    className="mt-3 rounded-[1.5rem] border-slate-800 bg-slate-950 px-4 py-3 text-white"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-300">
                  Password
                  <Input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Create a strong password"
                    required
                    minLength={8}
                    className="mt-3 rounded-[1.5rem] border-slate-800 bg-slate-950 px-4 py-3 text-white"
                  />
                </label>

                {error ? <p className="text-sm text-red-400">{error}</p> : null}

                <Button
                  type="submit"
                  className="w-full rounded-[1.75rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition duration-200 hover:scale-[1.01] hover:shadow-cyan-400/40"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-400">
                Don’t have an account?{' '}
                <Link href="/signup" className="font-semibold text-white transition hover:text-cyan-300">
                  Create one
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
