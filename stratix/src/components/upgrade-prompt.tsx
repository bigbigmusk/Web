"use client";

import { Sparkles, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UpgradePrompt({
  title = "Unlock with a STRATIX upgrade",
  description,
  cta = "View plans",
  variant = "card",
  className,
}: {
  title?: string;
  description: string;
  cta?: string;
  variant?: "card" | "inline" | "banner";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-foreground",
          className
        )}
      >
        <Lock className="h-3.5 w-3.5 text-accent" />
        <span className="text-muted-foreground">{description}</span>
        <Link
          href="/pricing"
          className="ml-auto font-semibold text-accent hover:underline"
        >
          {cta}
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-accent/25 bg-gradient-to-br from-navy to-charcoal p-6 text-ivory shadow-sm",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex items-start gap-3">
        <div className="rounded-lg bg-accent/20 p-2">
          <Sparkles className="h-5 w-5 text-accent-glow" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="mt-1 text-sm text-ivory/70">{description}</p>
          <Button asChild variant="accent" size="sm" className="mt-3">
            <Link href="/pricing">{cta}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
