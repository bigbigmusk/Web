import Link from "next/link";
import { ArrowRight, Check, FileSearch, Handshake } from "lucide-react";
import { StratixLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PRICING_PLANS,
  ONE_TIME_REPORTS,
  CONSULTING_OFFERS,
} from "@/lib/mock/pricing";

const NAV_LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#modules", label: "Modules" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
];

const FAQS = [
  {
    q: "Can I change or cancel my plan anytime?",
    a: "Yes. Upgrade, downgrade, or cancel from your workspace at any time. Changes take effect on your next billing cycle and you keep access until then.",
  },
  {
    q: "How does STRATIX use AI?",
    a: "Every module is powered by strategic AI that diagnoses products, scores markets, dissects competitors, and drafts sales assets. You stay in control and can edit every output.",
  },
  {
    q: "What can I export?",
    a: "Free plans export watermarked PDFs. Pro and above unlock clean, no-watermark proposals, CSV lead exports, and white-label reports on Agency.",
  },
  {
    q: "Do you offer refunds?",
    a: "Monthly plans can be cancelled anytime. One-time reports and consulting engagements are scoped up front, so reach out before purchase if you have questions.",
  },
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

function PricingHeader() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-charcoal via-navy-900 to-navy text-ivory">
      <div className="absolute inset-0 grid-bg opacity-[0.3]" aria-hidden />
      <div
        className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-accent/25 blur-[130px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-accent-glow">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-glow" />
          Plans &amp; pricing
        </span>
        <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          Pricing that scales with your global growth
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ivory/70">
          Start free with your first strategic scan, then upgrade as your
          export engine, team, and client roster grow. Subscriptions,
          one-time reports, and done-for-you consulting — all in one place.
        </p>
      </div>
    </section>
  );
}

function PlanGrid() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-5">
          {PRICING_PLANS.map((plan) => {
            const highlighted = plan.highlighted ?? false;
            const isFree = plan.price_usd === 0;
            return (
              <div
                key={plan.id}
                className={
                  "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md " +
                  (highlighted
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-border")
                }
              >
                {highlighted && (
                  <Badge variant="accent" className="absolute -top-3 left-6">
                    Most popular
                  </Badge>
                )}
                <h2 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">
                  {plan.tagline}
                </p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight tabular-nums text-foreground">
                    {isFree ? "Free" : `$${plan.price_usd}`}
                  </span>
                  {!isFree && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>
                {!isFree && (
                  <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                    ¥{plan.price_rmb}/mo
                  </p>
                )}
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm"
                    >
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
                    {isFree ? "Start free" : "Get started"}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OneTimeReports() {
  return (
    <section className="border-y border-border bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="accent" className="mb-4">
            Pay as you go
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            One-time strategic reports
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Not ready for a subscription? Buy a single, low-ticket strategic
            report and get export-grade intelligence on one product or market.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ONE_TIME_REPORTS.map((report) => (
            <div
              key={report.name}
              className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <FileSearch className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">
                {report.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {report.description}
              </p>
              <p className="mt-5 text-2xl font-bold tabular-nums text-foreground">
                ¥{report.price_rmb}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConsultingOffers() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="accent" className="mb-4">
            Done with you
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Done-for-you consulting
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Want our strategists to build it with you? Engage a packaged
            consulting offer and we deliver the system end to end.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONSULTING_OFFERS.map((offer) => (
            <div
              key={offer.name}
              className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Handshake className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">
                {offer.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {offer.description}
              </p>
              <p className="mt-5 text-2xl font-bold tabular-nums text-foreground">
                ¥{offer.price_rmb.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild variant="accent" size="lg">
            <Link href="/projects/new">
              Talk to our strategists
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="border-t border-border bg-secondary/40 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <div className="mt-12 space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <p className="text-base font-semibold text-foreground">
                {faq.q}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Modules", href: "/#modules" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    heading: "Use cases",
    links: [
      { label: "Manufacturers", href: "/#use-cases" },
      { label: "DTC brands", href: "/#use-cases" },
      { label: "Consultants", href: "/#use-cases" },
      { label: "Agencies", href: "/#use-cases" },
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
            <p className="text-sm font-semibold text-foreground">
              {col.heading}
            </p>
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

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-1">
        <PricingHeader />
        <PlanGrid />
        <OneTimeReports />
        <ConsultingOffers />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}
