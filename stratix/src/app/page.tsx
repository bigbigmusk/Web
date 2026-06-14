import Link from "next/link";
import {
  ArrowRight,
  Beaker,
  Radar,
  ScanSearch,
  Users,
  PenSquare,
  FileText,
  Gauge,
  BarChart3,
  Check,
  Factory,
  ShoppingBag,
  Briefcase,
  Send,
  Boxes,
} from "lucide-react";
import { StratixLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING_PLANS } from "@/lib/mock/pricing";

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#modules", label: "Modules" },
  { href: "#use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
];

const FAILURE_POINTS = [
  {
    title: "Which market?",
    body: "Teams guess at geography instead of scoring real demand, competition, and price potential.",
  },
  {
    title: "Who to sell to?",
    body: "No clear ideal customer profile, so outreach is scattered and conversion stays low.",
  },
  {
    title: "Competitor blind spots",
    body: "You never see how rivals position, price, and message the same product abroad.",
  },
  {
    title: "No sales assets",
    body: "Great products arrive with no English collateral, decks, or proof to close buyers.",
  },
];

const FLOW_STEPS = [
  "Product Input",
  "Export Readiness",
  "Market Opportunity",
  "Competitor Intel",
  "Target Customers",
  "Sales Assets",
  "Outbound",
  "Proposal",
];

const MODULES = [
  { icon: Beaker, name: "Product Lab", desc: "Diagnose export readiness and product-market fit in minutes." },
  { icon: Radar, name: "Market Radar", desc: "Score and rank target countries by real demand and risk." },
  { icon: ScanSearch, name: "Competitor X-Ray", desc: "Teardown rival positioning, pricing, and sales angles." },
  { icon: Users, name: "Lead Finder", desc: "Surface fitting buyers and score them for outreach." },
  { icon: PenSquare, name: "Content Studio", desc: "Generate English sales assets, emails, and launch copy." },
  { icon: FileText, name: "Proposal Builder", desc: "Export client-ready market entry proposals on demand." },
  { icon: Gauge, name: "Growth Command Center", desc: "Run a 30-day outbound plan with daily execution tasks." },
  { icon: BarChart3, name: "Reports", desc: "Package intelligence into branded strategic reports." },
];

const USE_CASES = [
  {
    icon: Factory,
    title: "For manufacturers",
    body: "Find overseas buyers and arm your team with polished English sales materials.",
  },
  {
    icon: ShoppingBag,
    title: "For DTC brands",
    body: "Test new markets and ship launch content before you commit a budget.",
  },
  {
    icon: Briefcase,
    title: "For consultants",
    body: "Deliver client-ready market entry proposals without weeks of manual research.",
  },
  {
    icon: Send,
    title: "For export teams",
    body: "Manage leads, content, and outbound execution from one shared workspace.",
  },
  {
    icon: Boxes,
    title: "For agencies",
    body: "Package repeatable global expansion services and scale them across clients.",
  },
];

const SIX_QUESTIONS = [
  "Which market should we enter first?",
  "Who exactly should we be selling to?",
  "Who are our competitors and how are they positioned?",
  "What sales assets do we need to win deals?",
  "What outbound should we run in the next 30 days?",
  "How do we make export repeatable, not a one-off?",
];

function TopNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" aria-label="STRATIX home">
          <StratixLogo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Log in</Link>
          </Button>
          <Button asChild variant="accent" size="sm">
            <Link href="/projects/new">Run Free Scan</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroDashboardMock() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-navy-800/70 p-5 shadow-2xl backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-glow" />
          <span className="text-xs font-medium uppercase tracking-wider text-ivory/60">
            Export Readiness
          </span>
        </div>
        <Badge variant="accent">Live scan</Badge>
      </div>

      <div className="grid grid-cols-[auto_1fr] items-center gap-5">
        {/* Gauge ring */}
        <div className="relative inline-flex h-[124px] w-[124px] items-center justify-center">
          <svg width={124} height={124} className="-rotate-90">
            <circle cx={62} cy={62} r={54} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={9} />
            <circle
              cx={62}
              cy={62}
              r={54}
              fill="none"
              stroke="#22d3ee"
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 54}
              strokeDashoffset={(2 * Math.PI * 54) * (1 - 0.82)}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold tabular-nums text-ivory">82</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-ivory/50">
              Ready
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { label: "Product-market fit", value: 88 },
            { label: "Price competitiveness", value: 74 },
            { label: "Certification coverage", value: 91 },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="text-ivory/70">{row.label}</span>
                <span className="font-semibold tabular-nums text-ivory">{row.value}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-accent-glow"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        {[
          { k: "Priority market", v: "Germany" },
          { k: "Buyer fit", v: "High" },
          { k: "Assets ready", v: "12" },
        ].map((stat) => (
          <div key={stat.k}>
            <p className="text-[10px] uppercase tracking-wide text-ivory/45">{stat.k}</p>
            <p className="text-sm font-semibold text-ivory">{stat.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-charcoal via-navy-900 to-navy text-ivory">
      <div className="absolute inset-0 grid-bg opacity-[0.35]" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[480px] rounded-full bg-accent/30 blur-[140px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-[320px] w-[320px] rounded-full bg-accent-blue/20 blur-[120px]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-accent-glow">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-glow" />
            AI Strategic Intelligence Workspace
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Turn products into global growth systems.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory/70">
            STRATIX helps manufacturers, DTC brands, and consultants decode
            markets, map competitors, generate sales assets, and build outbound
            growth systems in one AI-powered strategic workspace.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="accent" size="lg">
              <Link href="/projects/new">
                Run Free Scan
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-white/5 text-ivory hover:bg-white/10 hover:text-ivory"
            >
              <Link href="/dashboard">View Demo</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6">
            {[
              { stat: "6", label: "strategic modules" },
              { stat: "30-day", label: "growth plans" },
              { stat: "Days", label: "to export-ready assets" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-bold tabular-nums text-ivory">{item.stat}</p>
                <p className="text-xs text-ivory/55">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:pl-6">
          <HeroDashboardMock />
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Global expansion fails for one reason.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Most companies do not fail at global expansion because their products
            are bad. They fail because they do not know which market to enter, who
            to sell to, how competitors position similar products, and what sales
            assets to use.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FAILURE_POINTS.map((point) => (
            <div
              key={point.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-base font-semibold text-foreground">{point.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="accent" className="mb-4">
            How it works
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            One structured global expansion workflow.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            STRATIX turns scattered global expansion work into one structured
            workflow: product diagnosis, market radar, competitor intelligence,
            lead management, content generation, proposal export, and daily
            outbound execution.
          </p>
        </div>

        <div className="relative mt-16">
          <div
            className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent lg:block"
            aria-hidden
          />
          <ol className="grid grid-cols-2 gap-y-10 sm:grid-cols-4 lg:grid-cols-8">
            {FLOW_STEPS.map((step, i) => (
              <li key={step} className="relative flex flex-col items-center text-center">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-sm font-bold tabular-nums text-accent">
                  {i + 1}
                </span>
                <span className="mt-3 px-1 text-xs font-medium leading-snug text-foreground">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  return (
    <section id="modules" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Six modules. One growth system.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Every stage of global expansion, from product diagnosis to daily
            outbound, in a single connected workspace.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.name}
                className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{mod.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {mod.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section id="use-cases" className="border-y border-border bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for everyone going global.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Whether you make the product or sell the strategy, STRATIX adapts to
            how you expand.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="rounded-xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{uc.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {uc.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SixQuestions() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-24 text-ivory">
      <div className="absolute inset-0 grid-bg opacity-20" aria-hidden />
      <div
        className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-accent/20 blur-[120px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="accent" className="mb-4">
            The six questions
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            STRATIX answers the questions that decide global growth.
          </h2>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {SIX_QUESTIONS.map((q, i) => (
            <div
              key={q}
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold tabular-nums text-accent-glow">
                {i + 1}
              </span>
              <p className="text-base font-medium leading-snug text-ivory/90">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  const plans = PRICING_PLANS.filter((p) =>
    ["free", "pro", "agency"].includes(p.id)
  );
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing that scales with your growth.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Start free, then upgrade as your global expansion engine grows.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const highlighted = plan.highlighted ?? false;
            return (
              <div
                key={plan.id}
                className={
                  "relative flex flex-col rounded-2xl border bg-card p-7 shadow-sm " +
                  (highlighted
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-border")
                }
              >
                {highlighted && (
                  <Badge variant="accent" className="absolute -top-3 left-7">
                    Most popular
                  </Badge>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight tabular-nums">
                    {plan.price_usd === 0 ? "Free" : `$${plan.price_usd}`}
                  </span>
                  {plan.price_usd !== 0 && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={highlighted ? "accent" : "outline"}
                  className="mt-7 w-full"
                >
                  <Link href="/projects/new">
                    {plan.price_usd === 0 ? "Start free" : "Get started"}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            See all plans
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy via-charcoal to-navy-900 py-24 text-ivory">
      <div className="absolute inset-0 grid-bg opacity-25" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[150px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Decode markets. Map competitors. Build global growth systems.
        </h2>
        <p className="mt-5 text-lg text-ivory/70">
          Run your first strategic scan in minutes. No credit card required.
        </p>
        <div className="mt-9 flex justify-center">
          <Button asChild variant="accent" size="lg">
            <Link href="/projects/new">
              Run a Free STRATIX Scan
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Modules", href: "#modules" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    heading: "Use cases",
    links: [
      { label: "Manufacturers", href: "#use-cases" },
      { label: "DTC brands", href: "#use-cases" },
      { label: "Consultants", href: "#use-cases" },
      { label: "Agencies", href: "#use-cases" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Pricing", href: "/pricing" },
      { label: "Run Free Scan", href: "/projects/new" },
      { label: "Log in", href: "/dashboard" },
    ],
  },
];

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <StratixLogo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Strategic Intelligence for Global Market Expansion
          </p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="text-sm font-semibold text-foreground">{col.heading}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-xs text-muted-foreground">© 2026 STRATIX</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <ModulesSection />
        <UseCasesSection />
        <SixQuestions />
        <PricingPreview />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
