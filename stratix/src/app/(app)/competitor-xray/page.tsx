"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Eye,
  Lightbulb,
  Loader2,
  Plus,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProject } from "@/components/project-context";
import { getCompetitors } from "@/lib/mock/data";
import { generate } from "@/lib/ai/client";
import { cn } from "@/lib/utils";
import type { Competitor } from "@/lib/types";

export default function CompetitorXrayPage() {
  const { activeProject, activeProjectId } = useProject();

  const initial = useMemo(
    () => getCompetitors(activeProjectId),
    [activeProjectId]
  );

  const [competitors, setCompetitors] = useState<Competitor[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(
    initial[0]?.id ?? null
  );
  const [live, setLive] = useState<boolean | null>(null);

  // ── Add-competitor form state ─────────────────────────────────
  const [open, setOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = competitors.find((c) => c.id === selectedId) ?? null;

  async function handleRunXray() {
    if (!brandName.trim()) {
      setError("Enter a brand name to run the X-Ray.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { result, live: isLive } = await generate<Partial<Competitor>>(
        "competitorXray",
        {
          brandName,
          websiteUrl,
          platformUrl,
          productCategory: activeProject.product_category,
          notes,
        }
      );
      const newCompetitor: Competitor = {
        id: `cmp_${Date.now()}`,
        project_id: activeProjectId,
        brand_name: brandName,
        website_url: websiteUrl,
        platform_url: platformUrl,
        price_range: result.price_range ?? "—",
        positioning: result.positioning ?? "",
        target_audience: result.target_audience ?? "",
        key_message: result.key_message ?? "",
        visual_style: result.visual_style ?? "",
        sales_angles: result.sales_angles ?? [],
        channel_strategy: result.channel_strategy ?? "",
        trust_signals: result.trust_signals ?? [],
        hero_product: result.hero_product ?? "",
        product_structure: result.product_structure ?? "",
        what_to_learn: result.what_to_learn ?? [],
        what_to_avoid: result.what_to_avoid ?? [],
        differentiation_opportunity: result.differentiation_opportunity ?? "",
        notes,
        created_at: new Date().toISOString(),
      };
      setCompetitors((prev) => [newCompetitor, ...prev]);
      setSelectedId(newCompetitor.id);
      setLive(isLive);
      setOpen(false);
      setBrandName("");
      setWebsiteUrl("");
      setPlatformUrl("");
      setNotes("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Competitor X-Ray failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Competitor X-Ray"
        description="Reverse-engineer competitor positioning, pricing, and sales angles."
        icon={ScanSearch}
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="accent" size="sm">
              <Plus /> Add competitor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Run a Competitor X-Ray</DialogTitle>
              <DialogDescription>
                Drop in a competitor brand and we&apos;ll reverse-engineer their
                positioning, pricing, and sales playbook.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Brand name</Label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Skout's Honor"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Website URL</Label>
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Amazon / Shopify / Social link</Label>
                <Input
                  value={platformUrl}
                  onChange={(e) => setPlatformUrl(e.target.value)}
                  placeholder="https://amazon.com/stores/…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Anything you already know about this competitor"
                />
              </div>
              {error && (
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="accent"
                onClick={handleRunXray}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Running X-Ray…
                  </>
                ) : (
                  <>
                    <Sparkles /> Run X-Ray
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── LEFT: competitor list ────────────────────────────── */}
        <div className="space-y-3 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Competitors ({competitors.length})
          </p>
          {competitors.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No competitors yet. Add one to run an X-Ray.
              </CardContent>
            </Card>
          )}
          {competitors.map((c) => {
            const isSelected = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-accent/40",
                  isSelected && "border-accent bg-accent/5 ring-1 ring-accent/30"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    {c.brand_name}
                  </span>
                  <Badge variant="outline">{c.price_range}</Badge>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                  {c.positioning}
                </p>
              </button>
            );
          })}

          <UpgradePrompt
            variant="card"
            title="Go deeper with Pro"
            description="Advanced competitor analysis (visual teardown, ad library, traffic sources) is a Pro feature."
            cta="Upgrade to Pro"
            className="mt-4"
          />
        </div>

        {/* ── RIGHT: detail view ───────────────────────────────── */}
        <div className="lg:col-span-2">
          {selected ? (
            <CompetitorDetail competitor={selected} live={live} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <ScanSearch className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Select a competitor or add one to view its full X-Ray.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="mt-1.5 text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

function CompetitorDetail({
  competitor: c,
  live,
}: {
  competitor: Competitor;
  live: boolean | null;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-xl">{c.brand_name}</CardTitle>
            <CardDescription className="mt-1">{c.positioning}</CardDescription>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="accent">{c.price_range}</Badge>
              {c.hero_product && (
                <Badge variant="outline">Hero: {c.hero_product}</Badge>
              )}
              {live !== null && (
                <Badge variant={live ? "success" : "accent"}>
                  {live ? "AI Live" : "AI Demo"}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Core analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4 text-accent" /> Positioning teardown
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Section title="Target audience">{c.target_audience}</Section>
          <Section title="Key message">{c.key_message}</Section>
          {c.product_structure && (
            <Section title="Product structure">{c.product_structure}</Section>
          )}
          {c.hero_product && (
            <Section title="Hero product">{c.hero_product}</Section>
          )}
          <Section title="Visual style">{c.visual_style}</Section>
          <Section title="Channel strategy">{c.channel_strategy}</Section>
        </CardContent>
      </Card>

      {/* Sales angles + trust signals */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales angles</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {c.sales_angles.length ? (
              c.sales_angles.map((a) => (
                <Badge key={a} variant="secondary">
                  {a}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-accent" /> Trust signals
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {c.trust_signals?.length ? (
              c.trust_signals.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* What to learn vs avoid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-success/30 bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Check className="h-4 w-4 text-success" /> What to learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(c.what_to_learn ?? []).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <X className="h-4 w-4 text-warning" /> What to avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(c.what_to_avoid ?? []).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Differentiation opportunity */}
      {c.differentiation_opportunity && (
        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <div className="rounded-lg bg-accent/15 p-2">
              <Lightbulb className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                Differentiation opportunity
              </p>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground">
                {c.differentiation_opportunity}
              </p>
              <Button variant="accent" size="sm" className="mt-3" asChild>
                <a href="/content-studio">
                  Turn into sales messaging
                  <ArrowRight />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <UpgradePrompt
        variant="inline"
        description="Unlock visual teardown, ad library, and traffic-source analysis for this competitor."
        cta="Upgrade to Pro"
      />
    </div>
  );
}
