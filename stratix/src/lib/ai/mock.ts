// ──────────────────────────────────────────────────────────────
// Deterministic mock AI outputs. Used when no AI_API_KEY is configured
// so every STRATIX feature is fully explorable offline. Outputs are rich
// and structured to mirror what a strong model returns for the schemas
// in prompts.ts.
// ──────────────────────────────────────────────────────────────

import type {
  Competitor,
  Content,
  CountryOpportunity,
  ExportReadinessDiagnosis,
  ReportSection,
} from "@/lib/types";

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function seedFrom(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function mockExportReadiness(input: {
  productName: string;
  category: string;
  targetPrice: number;
  costPrice: number;
}): ExportReadinessDiagnosis {
  const seed = seedFrom(input.productName + input.category);
  const score = 58 + (seed % 34); // 58-91
  const margin = input.targetPrice && input.costPrice
    ? Math.round(((input.targetPrice - input.costPrice) / input.targetPrice) * 100)
    : 55;

  const marketSets = [
    [
      { country: "United States", reason: "Largest premium buyer base with fast DTC adoption and high willingness to pay.", score: 88 },
      { country: "Germany", reason: "Quality-led EU gateway; strong B2B distributor network and certification trust.", score: 79 },
      { country: "United Kingdom", reason: "English-first market, mature e-commerce, lower entry friction for first launch.", score: 76 },
      { country: "Australia", reason: "High disposable income, underserved niche, limited local competition.", score: 71 },
    ],
    [
      { country: "United Arab Emirates", reason: "Re-export hub into MENA, premium positioning rewarded, trade-show driven.", score: 80 },
      { country: "Canada", reason: "Adjacent to US demand with simpler compliance and loyal distributors.", score: 74 },
      { country: "Netherlands", reason: "Logistics gateway to the EU, efficient B2B procurement culture.", score: 73 },
    ],
  ];

  return {
    export_readiness_score: score,
    product_market_fit: `${input.productName} shows strong product-market fit for premium overseas buyers. The category benefits from rising demand for differentiated, quality-certified ${input.category.toLowerCase()} products, and your ${margin}% target margin leaves room for distributor and channel economics. Positioning should lead with quality, compliance, and a clear English value proposition rather than price.`,
    priority_markets: pick(marketSets, seed),
    channel_recommendation: [
      "B2B distributor & wholesale partnerships (highest leverage for first 90 days)",
      "Amazon / marketplace launch in the priority market for demand validation",
      "LinkedIn-led outbound to category buyers and procurement managers",
      "Trade-show sampling to build credibility with serious importers",
    ],
    target_customer_profile: `Mid-market importers, category distributors, and DTC retailers (10-200 staff) sourcing ${input.category.toLowerCase()} for quality-conscious end customers. Decision-makers: founders, procurement leads, and category buyers who value certifications, reliable MOQ flexibility, and ready-to-use English sales assets.`,
    pricing_insight: `Your ${margin}% gross margin supports a two-tier export price: a distributor price protecting 25-35% partner margin, and an MSRP positioned in the upper-mid band. Avoid racing to the bottom — buyers in priority markets pay for compliance, consistency, and brand-ready packaging.`,
    key_risks: [
      "Certification / compliance gaps could block customs clearance in the EU and US.",
      "Undifferentiated messaging vs. established local brands.",
      "MOQ and lead-time expectations may not match distributor cash-flow cycles.",
      "FX and freight volatility can compress margin if not priced in.",
    ],
    required_certifications: [
      "CE marking (EU market access)",
      "FDA / FCC registration where applicable (US)",
      "REACH / RoHS compliance documentation",
      "ISO 9001 quality management proof for B2B buyers",
    ],
    differentiation_angles: [
      "Lead with verifiable certifications and quality control as trust signals.",
      "Offer flexible MOQ and white-label / OEM support as a partner advantage.",
      "Package an English brand kit so distributors can sell on day one.",
      "Tell a credible factory / origin story to counter generic 'China supplier' perception.",
    ],
    english_usp: `Premium, certification-ready ${input.category.toLowerCase()} engineered for global buyers — reliable quality, flexible MOQ, and a complete English sales kit so partners can launch in days, not months.`,
    action_plan: [
      { day: 1, task: "Finalize the priority target market and confirm compliance requirements." },
      { day: 2, task: "Build the Ideal Customer Profile (ICP) and value proposition." },
      { day: 3, task: "Identify and qualify 20 target leads in the priority market." },
      { day: 5, task: "Generate the cold-email sequence and LinkedIn outreach assets." },
      { day: 6, task: "Publish the first company LinkedIn post and product one-pager." },
      { day: 8, task: "Launch outbound to the first 20 leads; log replies in Lead Finder." },
      { day: 12, task: "Run a Competitor X-Ray on the top 3 incumbents and refine messaging." },
      { day: 15, task: "Book 3-5 discovery calls; prepare distributor pitch deck." },
      { day: 20, task: "Send samples / quotes to engaged leads; follow-up sequence #1." },
      { day: 25, task: "Generate the Market Entry proposal for stakeholders or clients." },
      { day: 30, task: "Review pipeline metrics and lock the next 30-day growth sprint." },
    ],
  };
}

export function mockMarketRadar(input: {
  category: string;
  targetCountries: string[];
}): { countries: CountryOpportunity[]; pricing_insight: string; channel_recommendation: string; risk_notes: string } {
  const base: CountryOpportunity[] = [
    {
      country: "United States",
      opportunity_score: 88,
      demand_level: "Very High",
      competition_level: "Intense",
      price_potential: "Premium",
      channel_fit: "Amazon + DTC + distributor partnerships",
      risk_notes: "Crowded; needs strong differentiation and compliance (FDA/FCC where relevant).",
      recommendation: "Enter with a sharp niche wedge and English brand kit.",
      recommended_first: true,
    },
    {
      country: "Germany",
      opportunity_score: 79,
      demand_level: "High",
      competition_level: "High",
      price_potential: "High",
      channel_fit: "B2B distributors, trade fairs (e.g. category expos)",
      risk_notes: "Strict CE/REACH compliance; buyers expect documentation.",
      recommendation: "Lead with certifications and reliability.",
    },
    {
      country: "United Kingdom",
      opportunity_score: 76,
      demand_level: "High",
      competition_level: "Moderate",
      price_potential: "High",
      channel_fit: "DTC + marketplace + retail buyers",
      risk_notes: "Post-Brexit customs paperwork; manageable with a freight partner.",
      recommendation: "Strong English-first first-launch market.",
    },
    {
      country: "United Arab Emirates",
      opportunity_score: 72,
      demand_level: "High",
      competition_level: "Moderate",
      price_potential: "Premium",
      channel_fit: "Re-export hub, distributors, trade shows",
      risk_notes: "Relationship-driven; agents expect exclusivity.",
      recommendation: "Use as a MENA springboard via a local distributor.",
    },
    {
      country: "Australia",
      opportunity_score: 70,
      demand_level: "Moderate",
      competition_level: "Moderate",
      price_potential: "High",
      channel_fit: "DTC + niche retailers",
      risk_notes: "Smaller volume; freight cost and lead time.",
      recommendation: "Good low-competition validation market.",
    },
    {
      country: "Canada",
      opportunity_score: 68,
      demand_level: "Moderate",
      competition_level: "Moderate",
      price_potential: "High",
      channel_fit: "Distributors adjacent to US demand",
      risk_notes: "Bilingual labelling requirements in some provinces.",
      recommendation: "Pairs well with a US launch.",
    },
  ];

  // If the user named specific countries, surface those first.
  let countries = base;
  if (input.targetCountries.length) {
    const named = input.targetCountries.map((c) => c.trim().toLowerCase());
    countries = [...base].sort((a, b) => {
      const ai = named.indexOf(a.country.toLowerCase());
      const bi = named.indexOf(b.country.toLowerCase());
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }

  return {
    countries,
    pricing_insight: `Across priority markets, ${input.category.toLowerCase()} buyers reward a premium-but-fair position. Hold a distributor margin of 25-35% and an MSRP in the upper-mid band; avoid the commodity floor where Chinese-origin perception drags pricing.`,
    channel_recommendation:
      "Sequence: validate demand on a marketplace, sign 1-2 distributors per market, and run continuous LinkedIn outbound to category buyers.",
    risk_notes:
      "Compliance documentation and freight/FX volatility are the most common deal-blockers. Resolve certifications before outbound.",
  };
}

export function mockCompetitorXray(input: {
  brandName: string;
  productCategory: string;
}): Partial<Competitor> {
  const seed = seedFrom(input.brandName);
  return {
    positioning: `${input.brandName} positions as a premium, design-led ${input.productCategory.toLowerCase()} brand for discerning Western consumers, emphasizing lifestyle and trust over raw specs.`,
    target_audience: "Quality-conscious 28-45 urban buyers and category retailers who value brand assurance and aesthetics.",
    price_range: pick(["$$ mid-premium", "$$$ premium", "$$ value-premium"], seed),
    product_structure:
      "A tight hero range (3-5 SKUs) plus accessories and consumables that drive repeat purchase and bundle revenue.",
    hero_product: `Flagship ${input.productCategory.toLowerCase()} bundle marketed as the 'starter set'.`,
    key_message:
      "Effortless quality you can trust — clean design, proven results, and friendly guarantees.",
    visual_style:
      "Minimal, bright, editorial photography; soft neutral palette with one bold accent; heavy use of lifestyle imagery and UGC.",
    sales_angles: [
      "Risk reversal (money-back guarantee, free returns)",
      "Social proof (reviews, UGC, press logos)",
      "Bundle & subscription to lift AOV/LTV",
      "Sustainability / safety story",
    ],
    trust_signals: [
      "Thousands of verified reviews",
      "Press & 'as seen in' logos",
      "Certifications displayed on PDP",
      "Transparent guarantee and returns policy",
    ],
    channel_strategy:
      "DTC site as the brand hub, Amazon for discovery, Instagram/TikTok for demand, and selective retail for credibility.",
    what_to_learn: [
      "Their trust-signal stacking on product pages.",
      "Bundle architecture that raises average order value.",
      "Consistent, ownable visual identity.",
    ],
    what_to_avoid: [
      "Thin technical/compliance detail that B2B buyers need.",
      "Over-reliance on paid social with weak organic moat.",
    ],
    differentiation_opportunity: `Out-position ${input.brandName} on verifiable certification depth, flexible MOQ/OEM for B2B partners, and a credible origin story — winning the distributor channel they under-serve.`,
  };
}

export function mockLeadScore(input: {
  company?: string;
  country?: string;
  lead?: { company: string; country: string };
}): {
  fit_score: number;
  reason: string;
  outreach_angle: string;
  suggested_message: string;
} {
  const company = input.lead?.company ?? input.company ?? "This company";
  const country = input.lead?.country ?? input.country ?? "the target market";
  input = { company, country };
  const seed = seedFrom(input.company! + input.country!);
  const score = 52 + (seed % 44);
  return {
    fit_score: score,
    reason: `${input.company} operates in a priority market (${input.country}) and matches the target customer type. ${
      score > 75
        ? "Strong fit — category alignment and buying power are high."
        : "Moderate fit — qualify budget and current supplier before heavy investment."
    }`,
    outreach_angle:
      "Lead with a market-specific insight + a ready-to-sell English brand kit and flexible MOQ.",
    suggested_message: `Hi — I noticed ${input.company} serves the ${input.country} market. We help partners launch certification-ready products fast with a complete English sales kit and flexible MOQ. Worth a 15-min look at how this could add a high-margin line for you?`,
  };
}

export function mockContent(input: {
  contentType: string;
  productName: string;
  targetAudience: string;
  platform: string;
  tone: string;
}): Pick<Content, "title" | "main_message" | "body" | "cta"> & { variants: string[] } {
  return {
    title: `${input.contentType} — ${input.productName}`,
    main_message: `${input.productName}: premium, certification-ready, and built for global buyers who value quality and reliability.`,
    body: `Subject: A high-margin ${input.productName} line your customers will reorder\n\nHi {{first_name}},\n\nMost ${input.targetAudience.toLowerCase()} struggle to find a supplier that combines real quality, the right certifications, and sales-ready English assets. ${input.productName} delivers all three.\n\n• Certification-ready for ${input.platform} and Western retail\n• Flexible MOQ and OEM/ODM support\n• A complete English brand kit so you can launch in days\n\nWorth a short call to see if it fits your range?\n\nBest,\n{{sender_name}}`,
    cta: "Book a 15-minute intro call",
    variants: [
      `Short hook: "Add a high-margin, certification-ready ${input.productName} line — English sales kit included. Open to a quick look?"`,
      `Curiosity hook: "We help ${input.targetAudience.toLowerCase()} launch ${input.productName} in days, not months. Worth 15 minutes?"`,
    ],
  };
}

export function mockProposalSections(input: {
  reportType: string;
  productName: string;
  targetMarket: string;
}): { title: string; summary: string; sections: ReportSection[] } {
  return {
    title: `${input.reportType}: ${input.productName}`,
    summary: `This ${input.reportType.toLowerCase()} lays out a prioritized, execution-ready plan to take ${input.productName} into ${input.targetMarket || "priority overseas markets"}. It covers the opportunity, the competitive landscape, the ideal customer, the channel and pricing strategy, the sales assets required, and a 30-day outbound plan with clear next steps.`,
    sections: [
      {
        heading: "Executive Summary",
        body: `${input.productName} is well-positioned for premium overseas demand. The fastest path to revenue is a focused entry into one priority market, led by B2B distributor partnerships and validated through marketplace demand. Success hinges on compliance readiness, sharp differentiation, and a complete English sales kit.`,
        bullets: [
          "Single-market focus beats spreading thin across regions.",
          "Distributor channel offers the highest 90-day leverage.",
          "Certification and English assets are the gating prerequisites.",
        ],
      },
      {
        heading: "Product Overview",
        body: `${input.productName} combines verifiable quality, flexible MOQ, and OEM/ODM support — a strong fit for partners seeking a differentiated, high-margin line.`,
      },
      {
        heading: "Market Opportunity",
        body: `Priority market: ${input.targetMarket || "United States"}. Demand is high and rising for differentiated, certification-ready products. A premium-but-fair price holds 25-35% distributor margin while signalling quality.`,
        bullets: ["High demand", "Premium price potential", "Underserved B2B partner channel"],
      },
      {
        heading: "Competitor Analysis",
        body: "Incumbents win on brand and trust signals but under-serve the distributor channel and offer limited compliance depth — our wedge.",
      },
      {
        heading: "Target Customer Profile",
        body: "Mid-market importers, category distributors, and DTC retailers (10-200 staff). Decision-makers value certifications, reliability, and ready-to-sell assets.",
      },
      {
        heading: "Channel Strategy",
        body: "Validate on marketplace → sign 1-2 distributors → continuous LinkedIn outbound → trade-show credibility.",
      },
      {
        heading: "Sales Assets",
        body: "Company profile, cold-email sequence, LinkedIn content plan, product one-pager, distributor pitch, and FAQ — all generated in Content Studio.",
      },
      {
        heading: "Outreach Plan",
        body: "20 qualified leads, a 4-touch email + LinkedIn sequence, and weekly reply-driven iteration. Target: 3-5 discovery calls in 30 days.",
      },
      {
        heading: "Timeline",
        body: "30-day sprint: market lock (week 1), assets + leads (week 2), outbound (week 3), pipeline + proposal (week 4).",
      },
      {
        heading: "Budget / Pricing",
        body: "Two-tier export pricing with protected distributor margin; modest budget for samples, freight, and optional marketplace ads.",
      },
      {
        heading: "Risk Notes",
        body: "Compliance gaps, undifferentiated messaging, MOQ/lead-time mismatch, and FX/freight volatility — each with a mitigation in the plan.",
      },
      {
        heading: "Next Steps",
        body: "Approve the priority market, finalize compliance, and trigger the 30-day Growth Command Center sprint.",
      },
    ],
  };
}
