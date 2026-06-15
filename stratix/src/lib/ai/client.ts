"use client";

import type { AIAction } from "./service";
import {
  mockCompetitorXray,
  mockContent,
  mockExportReadiness,
  mockLeadScore,
  mockMarketRadar,
  mockProposalSections,
} from "./mock";
import { sleep } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────
// Client AI helper.
//
// The app is deployed as a static export (Cloudflare Pages), so there is no
// server route. AI generation therefore runs entirely in the browser using the
// deterministic mock generators — this is "Demo mode" and needs no API key.
//
// To enable a real model, set NEXT_PUBLIC_AI_ENABLED=true and host the included
// `/api/ai` route on a server runtime (e.g. Vercel, or Cloudflare via
// @cloudflare/next-on-pages); `generate()` will then POST to it instead.
// ──────────────────────────────────────────────────────────────

const MOCKS: Record<AIAction, (input: Record<string, unknown>) => unknown> = {
  exportReadiness: (i) => mockExportReadiness(i as never),
  marketRadar: (i) => mockMarketRadar(i as never),
  competitorXray: (i) => mockCompetitorXray(i as never),
  leadScore: (i) => mockLeadScore(i as never),
  content: (i) => mockContent(i as never),
  proposal: (i) => mockProposalSections(i as never),
};

export async function generate<T = unknown>(
  action: AIAction,
  input: Record<string, unknown>
): Promise<{ result: T; live: boolean }> {
  const serverEnabled = process.env.NEXT_PUBLIC_AI_ENABLED === "true";

  if (serverEnabled) {
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, input }),
      });
      if (res.ok) {
        const data = await res.json();
        return { result: data.result as T, live: data.live as boolean };
      }
    } catch {
      // fall through to client mock
    }
  }

  // Demo mode — run the deterministic generator in the browser.
  await sleep(650); // small latency so the loading state is visible
  return { result: MOCKS[action](input) as T, live: false };
}
