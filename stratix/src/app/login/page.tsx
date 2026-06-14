"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { StratixLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const fn =
          mode === "login"
            ? supabase.auth.signInWithPassword({ email, password })
            : supabase.auth.signUp({ email, password });
        const { error } = await fn;
        if (error) throw error;
      }
      // In demo/mock mode (no Supabase) we proceed straight into the workspace.
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-charcoal to-navy p-10 text-ivory lg:flex">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <Link href="/" className="relative">
          <StratixLogo className="[&_span]:text-ivory" />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-balance">
            Decode markets. Map competitors. Build global growth systems.
          </h2>
          <p className="mt-4 text-ivory/70">
            STRATIX turns a product into a complete, execution-ready global
            expansion system — diagnosis, market radar, competitor intelligence,
            leads, sales assets, and a 30-day outbound plan.
          </p>
        </div>
        <p className="relative text-xs text-ivory/50">
          © 2026 STRATIX · Strategic Intelligence for Global Market Expansion
        </p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <StratixLogo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to your strategic intelligence workspace."
              : "Start free — run your first STRATIX scan in minutes."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="accent" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {!isSupabaseConfigured() && (
            <p className="mt-4 rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              Demo mode — Supabase isn&apos;t configured, so any credentials take
              you straight into the workspace.
            </p>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? "New to STRATIX?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-accent hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
