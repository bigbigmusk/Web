import type { PricingPlan } from "@/lib/types";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price_usd: 0,
    price_rmb: 0,
    tagline: "Run your first strategic scan",
    features: [
      "3 STRATIX scans per month",
      "Basic Export Readiness report",
      "Basic content generation",
      "Market Radar preview",
      "Watermarked PDF export",
    ],
    limits: { scans: 3, competitors: 1, content: 5 },
  },
  {
    id: "starter",
    name: "Starter",
    price_usd: 29,
    price_rmb: 199,
    tagline: "For solo operators going global",
    features: [
      "20 export scans / month",
      "10 competitor analyses",
      "100 content generations",
      "Full Market Radar",
      "PDF export · basic templates",
    ],
    limits: { scans: 20, competitors: 10, content: 100 },
  },
  {
    id: "pro",
    name: "Pro",
    price_usd: 99,
    price_rmb: 699,
    tagline: "The full growth system",
    features: [
      "Everything in Starter",
      "Lead Finder + CSV lead export",
      "Advanced Competitor X-Ray",
      "Cold email sequences + LinkedIn plan",
      "Proposal Builder · no watermark",
    ],
    limits: { scans: "unlimited", competitors: "unlimited", content: "unlimited" },
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price_usd: 299,
    price_rmb: 1999,
    tagline: "For teams running multiple markets",
    features: [
      "Everything in Pro",
      "Team workspace + CRM pipeline",
      "Advanced reports & custom templates",
      "Monthly strategy report",
      "Multi-project management",
    ],
    limits: { scans: "unlimited", competitors: "unlimited", content: "unlimited" },
  },
  {
    id: "agency",
    name: "Agency",
    price_usd: 699,
    price_rmb: 4999,
    tagline: "White-label for consultants & agencies",
    features: [
      "Everything in Business",
      "White-label reports & client workspaces",
      "Batch project generation",
      "Proposal templates + team permissions",
      "Premium priority support",
    ],
    limits: { scans: "unlimited", competitors: "unlimited", content: "unlimited" },
  },
];

export const ONE_TIME_REPORTS = [
  {
    name: "Single Product Export Opportunity Report",
    price_rmb: 99,
    description: "A focused export-readiness diagnosis + priority market for one product.",
  },
  {
    name: "Competitor X-Ray Report",
    price_rmb: 299,
    description: "Deep teardown of up to 3 competitors with differentiation strategy.",
  },
  {
    name: "Market + Competitor + Sales Asset Bundle",
    price_rmb: 699,
    description: "Market radar, competitor intelligence, and a full English sales asset pack.",
  },
];

export const CONSULTING_OFFERS = [
  { name: "Export Starter Pack", price_rmb: 1999, description: "Done-for-you market + ICP + first outbound kit." },
  { name: "Brand Packaging + English Sales Assets", price_rmb: 3999, description: "Full English brand kit and sales collateral." },
  { name: "B2B Outbound System Setup", price_rmb: 9999, description: "End-to-end outbound engine, CRM, and sequences." },
  { name: "Full GTM Consulting Project", price_rmb: 30000, description: "Complete go-to-market strategy and execution partnership." },
];
