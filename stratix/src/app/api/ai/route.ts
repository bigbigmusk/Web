import { NextRequest, NextResponse } from "next/server";
import { runAI, type AIAction } from "@/lib/ai/service";

export const runtime = "nodejs";

const VALID: AIAction[] = [
  "exportReadiness",
  "marketRadar",
  "competitorXray",
  "leadScore",
  "content",
  "proposal",
];

export async function POST(req: NextRequest) {
  try {
    const { action, input } = (await req.json()) as {
      action: AIAction;
      input: Record<string, unknown>;
    };

    if (!action || !VALID.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Expected one of: ${VALID.join(", ")}` },
        { status: 400 }
      );
    }

    const { result, live } = await runAI(action, input || {});
    return NextResponse.json({ ok: true, live, result });
  } catch (err) {
    console.error("[STRATIX /api/ai] error:", err);
    return NextResponse.json(
      { error: "AI generation failed", detail: String(err) },
      { status: 500 }
    );
  }
}
