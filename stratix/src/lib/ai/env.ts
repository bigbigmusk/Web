// Client-safe AI status flag. The real AI_API_KEY is server-only, so the
// client reads an optional public flag to badge "AI Live" vs "AI Demo".
// Set NEXT_PUBLIC_AI_ENABLED=true when you have configured AI_API_KEY.
export function isAILiveClient(): boolean {
  return process.env.NEXT_PUBLIC_AI_ENABLED === "true";
}
