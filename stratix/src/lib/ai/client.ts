"use client";

import type { AIAction } from "./service";

/** Client helper to call the STRATIX AI endpoint from React components. */
export async function generate<T = unknown>(
  action: AIAction,
  input: Record<string, unknown>
): Promise<{ result: T; live: boolean }> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, input }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error || `AI request failed (${res.status})`);
  }
  const data = await res.json();
  return { result: data.result as T, live: data.live as boolean };
}
