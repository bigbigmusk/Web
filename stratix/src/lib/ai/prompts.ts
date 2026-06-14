// ──────────────────────────────────────────────────────────────
// STRATIX AI prompt architecture
// Reusable, structured prompt builders. Each returns a system + user
// message pair plus a JSON schema hint so outputs are business-ready,
// not free-form chat text.
// ──────────────────────────────────────────────────────────────

import type { BusinessType, ContentType, ReportType } from "@/lib/types";

const STRATEGIST_SYSTEM = `You are STRATIX, an elite global market-entry strategist and B2B export intelligence analyst.
You advise manufacturers, DTC brands, and export consultants on international expansion.
You are sharp, analytical, and commercial. You never produce generic filler.
Always respond with STRICT, valid JSON matching the requested schema — no prose, no markdown fences.`;

export interface PromptPayload {
  system: string;
  user: string;
  schemaHint: string;
}

export function exportReadinessDiagnosisPrompt(input: {
  productName: string;
  category: string;
  description: string;
  costPrice: number;
  targetPrice: number;
  moq: number;
  sellingPoints: string;
  businessType: BusinessType;
  targetMarket: string;
  certifications?: string;
}): PromptPayload {
  return {
    system: STRATEGIST_SYSTEM,
    user: `Produce an Export Readiness Diagnosis for this product.
Product: ${input.productName}
Category: ${input.category}
Description: ${input.description}
Cost price: ${input.costPrice} | Target price: ${input.targetPrice} | MOQ: ${input.moq}
Core selling points: ${input.sellingPoints}
Certifications: ${input.certifications || "none stated"}
Business type: ${input.businessType}
Target market focus: ${input.targetMarket || "open — recommend the best"}

Score export readiness 0-100. Recommend 3-4 priority markets with reasons, channels, an ICP,
pricing insight, key risks, required certifications, differentiation angles, an English USP, and a
day-by-day 30-day action plan (10-12 milestone days).`,
    schemaHint: `{
  "export_readiness_score": number,
  "product_market_fit": string,
  "priority_markets": [{"country": string, "reason": string, "score": number}],
  "channel_recommendation": string[],
  "target_customer_profile": string,
  "pricing_insight": string,
  "key_risks": string[],
  "required_certifications": string[],
  "differentiation_angles": string[],
  "english_usp": string,
  "action_plan": [{"day": number, "task": string}]
}`,
  };
}

export function marketRadarPrompt(input: {
  category: string;
  productName: string;
  targetCountries: string[];
}): PromptPayload {
  return {
    system: STRATEGIST_SYSTEM,
    user: `Run a Market Radar scan for "${input.productName}" (category: ${input.category}).
Evaluate these candidate countries: ${input.targetCountries.join(", ") || "recommend 6 strong candidates"}.
For each, score opportunity 0-100 and rate demand, competition, price potential, channel fit, and risks.
Flag the single recommended first market.`,
    schemaHint: `{
  "countries": [{
    "country": string,
    "opportunity_score": number,
    "demand_level": "Low"|"Moderate"|"High"|"Very High",
    "competition_level": "Low"|"Moderate"|"High"|"Intense",
    "price_potential": "Low"|"Medium"|"High"|"Premium",
    "channel_fit": string,
    "risk_notes": string,
    "recommendation": string,
    "recommended_first": boolean
  }],
  "pricing_insight": string,
  "channel_recommendation": string,
  "risk_notes": string
}`,
  };
}

export function competitorXrayPrompt(input: {
  brandName: string;
  websiteUrl?: string;
  platformUrl?: string;
  productCategory: string;
  notes?: string;
}): PromptPayload {
  return {
    system: STRATEGIST_SYSTEM,
    user: `Perform a Competitor X-Ray on "${input.brandName}" in the ${input.productCategory} space.
Website: ${input.websiteUrl || "unknown"} | Other links: ${input.platformUrl || "none"}
Analyst notes: ${input.notes || "none"}
Extract their positioning, audience, price range, product structure, hero product, website messaging,
visual style, sales angles, trust signals, channel strategy — then give what to learn, what to avoid,
and our differentiation opportunity.`,
    schemaHint: `{
  "positioning": string,
  "target_audience": string,
  "price_range": string,
  "product_structure": string,
  "hero_product": string,
  "key_message": string,
  "visual_style": string,
  "sales_angles": string[],
  "trust_signals": string[],
  "channel_strategy": string,
  "what_to_learn": string[],
  "what_to_avoid": string[],
  "differentiation_opportunity": string
}`,
  };
}

export function leadScoringPrompt(input: {
  productName: string;
  productCategory: string;
  sellingPoints: string;
  lead: { company: string; country: string; customerType: string; notes?: string };
}): PromptPayload {
  return {
    system: STRATEGIST_SYSTEM,
    user: `Score this lead's fit for "${input.productName}" (${input.productCategory}).
Selling points: ${input.sellingPoints}
Lead: ${input.lead.company} | ${input.lead.country} | ${input.lead.customerType}
Notes: ${input.lead.notes || "none"}
Return a 0-100 fit score, the reasoning, the best outreach angle, and a short personalized cold-email opener.`,
    schemaHint: `{
  "fit_score": number,
  "reason": string,
  "outreach_angle": string,
  "suggested_message": string
}`,
  };
}

export function contentGenerationPrompt(input: {
  contentType: ContentType;
  productName: string;
  productCategory: string;
  sellingPoints: string;
  targetAudience: string;
  platform: string;
  tone: string;
}): PromptPayload {
  return {
    system: STRATEGIST_SYSTEM,
    user: `Write a "${input.contentType}" asset for "${input.productName}" (${input.productCategory}).
Audience: ${input.targetAudience} | Platform: ${input.platform} | Tone: ${input.tone}
Selling points: ${input.sellingPoints}
Make it export-ready, native English, and conversion-focused. Provide a version name, the main message,
final copy, a CTA, and two short alternative variants.`,
    schemaHint: `{
  "version_name": string,
  "main_message": string,
  "body": string,
  "cta": string,
  "variants": string[]
}`,
  };
}

export function proposalBuilderPrompt(input: {
  reportType: ReportType;
  projectName: string;
  productName: string;
  productCategory: string;
  targetMarket: string;
}): PromptPayload {
  return {
    system: STRATEGIST_SYSTEM,
    user: `Build a "${input.reportType}" for project "${input.projectName}".
Product: ${input.productName} (${input.productCategory}) | Target market: ${input.targetMarket}
Produce a client-ready structured report: executive summary plus sections for product overview,
market opportunity, competitor analysis, target customer profile, channel strategy, sales assets,
outreach plan, timeline, budget/pricing, risk notes, and next steps.`,
    schemaHint: `{
  "title": string,
  "summary": string,
  "sections": [{"heading": string, "body": string, "bullets": string[]}]
}`,
  };
}
