// ──────────────────────────────────────────────────────────────
// STRATIX domain types — mirror the Supabase schema (see supabase/schema.sql)
// ──────────────────────────────────────────────────────────────

export type PlanId = "free" | "starter" | "pro" | "business" | "agency";

export type BusinessType =
  | "Manufacturer"
  | "DTC Brand"
  | "Export Company"
  | "Consultant / Agency"
  | "B2B Startup"
  | "Other";

export type BusinessGoal =
  | "Find overseas buyers"
  | "Test a new market"
  | "Build a DTC brand"
  | "Generate English sales assets"
  | "Create client proposal"
  | "Analyze competitors"
  | "Prepare for trade show"
  | "Build outbound sales system";

export interface User {
  id: string;
  name: string;
  email: string;
  company_name: string;
  role: string;
  plan: PlanId;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  project_name: string;
  business_type: BusinessType;
  business_goal: BusinessGoal;
  product_category: string;
  target_market: string;
  status: "draft" | "active" | "archived";
  export_readiness_score?: number;
  opportunity_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  project_id: string;
  product_name: string;
  category: string;
  description: string;
  cost_price: number;
  target_price: number;
  moq: number;
  certifications: string;
  current_channels: string;
  selling_points: string;
  images: string[];
  oem_odm_support: string;
  factory_background?: string;
  main_customer_type?: string;
  existing_website?: string;
  created_at: string;
}

export interface ExportReadinessDiagnosis {
  export_readiness_score: number;
  product_market_fit: string;
  priority_markets: { country: string; reason: string; score: number }[];
  channel_recommendation: string[];
  target_customer_profile: string;
  pricing_insight: string;
  key_risks: string[];
  required_certifications: string[];
  differentiation_angles: string[];
  english_usp: string;
  action_plan: { day: number; task: string }[];
}

export interface MarketReport {
  id: string;
  project_id: string;
  export_readiness_score: number;
  countries: CountryOpportunity[];
  pricing_insight: string;
  channel_recommendation: string;
  risk_notes: string;
  certification_notes: string;
  usp: string;
  diagnosis?: ExportReadinessDiagnosis;
  created_at: string;
}

export interface CountryOpportunity {
  country: string;
  opportunity_score: number;
  demand_level: "Low" | "Moderate" | "High" | "Very High";
  competition_level: "Low" | "Moderate" | "High" | "Intense";
  price_potential: "Low" | "Medium" | "High" | "Premium";
  channel_fit: string;
  risk_notes: string;
  recommendation: string;
  recommended_first?: boolean;
}

export interface Competitor {
  id: string;
  project_id: string;
  brand_name: string;
  website_url: string;
  platform_url: string;
  price_range: string;
  positioning: string;
  target_audience: string;
  key_message: string;
  visual_style: string;
  sales_angles: string[];
  channel_strategy: string;
  trust_signals?: string[];
  hero_product?: string;
  product_structure?: string;
  what_to_learn?: string[];
  what_to_avoid?: string[];
  differentiation_opportunity?: string;
  notes: string;
  created_at: string;
}

export type LeadStatus =
  | "New"
  | "Qualified"
  | "Contacted"
  | "Replied"
  | "Meeting Booked"
  | "Quoted"
  | "Won"
  | "Lost";

export type LeadPriority = "High" | "Medium" | "Low";

export interface Lead {
  id: string;
  project_id: string;
  company_name: string;
  country: string;
  website: string;
  customer_type: string;
  contact_name: string;
  email: string;
  linkedin_url: string;
  source: string;
  priority: LeadPriority;
  status: LeadStatus;
  fit_score?: number;
  last_contacted_at: string | null;
  notes: string;
  created_at: string;
}

export type ContentType =
  | "LinkedIn Company Profile"
  | "Founder LinkedIn Post"
  | "Company LinkedIn Post"
  | "Cold Email Sequence"
  | "Follow-up Email"
  | "Product Page Copy"
  | "Website Hero Copy"
  | "About Page"
  | "FAQ"
  | "Amazon Listing Copy"
  | "TikTok / Instagram Script"
  | "Trade Show Invitation"
  | "Distributor Pitch"
  | "One-Page Product Intro"
  | "B2B Brochure Copy";

export interface Content {
  id: string;
  project_id: string;
  content_type: ContentType;
  title: string;
  target_audience: string;
  platform: string;
  tone: string;
  main_message: string;
  body: string;
  cta: string;
  language: string;
  created_at: string;
}

export type ReportType =
  | "Export Readiness Report"
  | "Market Entry Report"
  | "Competitor Analysis Report"
  | "B2B Lead Generation Plan"
  | "30-Day Global Growth Plan"
  | "DTC Launch Plan"
  | "Consulting Proposal"
  | "Investor / Partner Brief";

export interface ReportSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface Report {
  id: string;
  project_id: string;
  report_type: ReportType;
  title: string;
  summary: string;
  sections: ReportSection[];
  status: "draft" | "final";
  export_url?: string;
  created_at: string;
}

export type TaskStatus = "Todo" | "In Progress" | "Done";
export type TaskType =
  | "Strategy"
  | "Outbound"
  | "Content"
  | "Competitor"
  | "Report"
  | "Research";

export interface Task {
  id: string;
  project_id: string;
  task_name: string;
  task_type: TaskType;
  day?: number;
  week?: number;
  due_date: string;
  status: TaskStatus;
  owner: string;
  notes: string;
  created_at: string;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  price_usd: number;
  price_rmb: number;
  tagline: string;
  features: string[];
  limits: { scans: number | "unlimited"; competitors: number | "unlimited"; content: number | "unlimited" };
  highlighted?: boolean;
}
