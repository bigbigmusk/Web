// ──────────────────────────────────────────────────────────────
// AI service abstraction.
// If AI_API_KEY is set, calls an OpenAI-compatible chat completions
// endpoint with JSON-mode. Otherwise falls back to deterministic mock
// generators so the product is fully usable offline.
// ──────────────────────────────────────────────────────────────

import {
  competitorXrayPrompt,
  contentGenerationPrompt,
  exportReadinessDiagnosisPrompt,
  leadScoringPrompt,
  marketRadarPrompt,
  proposalBuilderPrompt,
  type PromptPayload,
} from "./prompts";
import {
  mockCompetitorXray,
  mockContent,
  mockExportReadiness,
  mockLeadScore,
  mockMarketRadar,
  mockProposalSections,
} from "./mock";

export type AIAction =
  | "exportReadiness"
  | "marketRadar"
  | "competitorXray"
  | "leadScore"
  | "content"
  | "proposal";

export function isAILive(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

async function callModel<T>(payload: PromptPayload): Promise<T> {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: payload.system },
        {
          role: "user",
          content: `${payload.user}\n\nRespond ONLY with valid JSON matching this schema:\n${payload.schemaHint}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`AI provider error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content) as T;
}

/**
 * Dispatch an AI action. Returns structured JSON for the given action.
 * `live` indicates whether the response came from a real model.
 */
export async function runAI(
  action: AIAction,
  input: Record<string, unknown>
): Promise<{ result: unknown; live: boolean }> {
  const live = isAILive();

  // MOCK MODE
  if (!live) {
    switch (action) {
      case "exportReadiness":
        return { result: mockExportReadiness(input as never), live };
      case "marketRadar":
        return { result: mockMarketRadar(input as never), live };
      case "competitorXray":
        return { result: mockCompetitorXray(input as never), live };
      case "leadScore":
        return { result: mockLeadScore(input as never), live };
      case "content":
        return { result: mockContent(input as never), live };
      case "proposal":
        return { result: mockProposalSections(input as never), live };
    }
  }

  // LIVE MODE
  let payload: PromptPayload;
  switch (action) {
    case "exportReadiness":
      payload = exportReadinessDiagnosisPrompt(input as never);
      break;
    case "marketRadar":
      payload = marketRadarPrompt(input as never);
      break;
    case "competitorXray":
      payload = competitorXrayPrompt(input as never);
      break;
    case "leadScore":
      payload = leadScoringPrompt(input as never);
      break;
    case "content":
      payload = contentGenerationPrompt(input as never);
      break;
    case "proposal":
      payload = proposalBuilderPrompt(input as never);
      break;
    default:
      throw new Error(`Unknown AI action: ${action}`);
  }

  try {
    const result = await callModel(payload);
    return { result, live: true };
  } catch (err) {
    // Graceful degradation: fall back to mock generators if the live call fails.
    console.error("[STRATIX AI] live call failed, falling back to mock:", err);
    const mock = {
      exportReadiness: () => mockExportReadiness(input as never),
      marketRadar: () => mockMarketRadar(input as never),
      competitorXray: () => mockCompetitorXray(input as never),
      leadScore: () => mockLeadScore(input as never),
      content: () => mockContent(input as never),
      proposal: () => mockProposalSections(input as never),
    }[action];
    return { result: mock(), live: false };
  }
}
