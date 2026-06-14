"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Download,
  FlaskConical,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ScoreGauge } from "@/components/score-gauge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject } from "@/components/project-context";
import { getDiagnosis, getProduct } from "@/lib/mock/data";
import { generate } from "@/lib/ai/client";
import { cn, scoreTone } from "@/lib/utils";
import type { ExportReadinessDiagnosis } from "@/lib/types";

const OEM_OPTIONS = ["OEM only", "ODM only", "OEM + ODM", "Neither"];

const toneBadge: Record<string, "success" | "warning" | "danger"> = {
  high: "success",
  medium: "warning",
  low: "danger",
};

export default function ProductLabPage() {
  const { activeProject, activeProjectId } = useProject();
  const product = useMemo(
    () => getProduct(activeProjectId),
    [activeProjectId]
  );

  // ── Form state (prefilled from mock product) ──────────────────
  const [productName, setProductName] = useState(product?.product_name ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [costPrice, setCostPrice] = useState(String(product?.cost_price ?? ""));
  const [targetPrice, setTargetPrice] = useState(
    String(product?.target_price ?? "")
  );
  const [moq, setMoq] = useState(String(product?.moq ?? ""));
  const [certifications, setCertifications] = useState(
    product?.certifications ?? ""
  );
  const [currentMarket, setCurrentMarket] = useState(
    product?.current_channels ?? ""
  );
  const [targetCountry, setTargetCountry] = useState(
    activeProject.target_market ?? ""
  );
  const [existingWebsite, setExistingWebsite] = useState(
    product?.existing_website ?? ""
  );
  const [salesChannels, setSalesChannels] = useState(
    product?.current_channels ?? ""
  );
  const [sellingPoints, setSellingPoints] = useState(
    product?.selling_points ?? ""
  );
  const [factoryBackground, setFactoryBackground] = useState(
    product?.factory_background ?? ""
  );
  const [oemSupport, setOemSupport] = useState(
    product?.oem_odm_support ?? OEM_OPTIONS[2]
  );
  const [customerType, setCustomerType] = useState(
    product?.main_customer_type ?? ""
  );

  // ── Result state (default to saved diagnosis so page is populated) ──
  const [diagnosis, setDiagnosis] = useState<ExportReadinessDiagnosis | null>(
    () => getDiagnosis(activeProjectId) ?? null
  );
  const [live, setLive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    setLoading(true);
    setError(null);
    try {
      const { result, live: isLive } = await generate<ExportReadinessDiagnosis>(
        "exportReadiness",
        {
          productName,
          category,
          description,
          costPrice: Number(costPrice) || 0,
          targetPrice: Number(targetPrice) || 0,
          moq: Number(moq) || 0,
          sellingPoints,
          businessType: activeProject.business_type,
          targetMarket: targetCountry,
          certifications,
        }
      );
      setDiagnosis(result);
      setLive(isLive);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Export readiness scan failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Product Lab"
        description="Diagnose export readiness and get an AI strategic playbook for your product."
        icon={FlaskConical}
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/proposal-builder">
            Send to Proposal Builder
            <ArrowRight />
          </Link>
        </Button>
        <Button variant="accent" size="sm" onClick={handleScan} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Run Scan
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ── LEFT: input form ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product profile</CardTitle>
              <CardDescription>
                Prefilled from {activeProject.project_name}. Edit and re-run the
                scan anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Product name">
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. PawFresh Pet Deodorizer"
                />
              </Field>
              <Field label="Category">
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Pet Care"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What the product is and what it does"
                />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Cost price">
                  <Input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="tabular-nums"
                  />
                </Field>
                <Field label="Target price">
                  <Input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="tabular-nums"
                  />
                </Field>
                <Field label="MOQ">
                  <Input
                    type="number"
                    value={moq}
                    onChange={(e) => setMoq(e.target.value)}
                    className="tabular-nums"
                  />
                </Field>
              </div>

              <Field label="Certifications">
                <Input
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder="e.g. ISO 9001, CE, REACH"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Current market">
                  <Input
                    value={currentMarket}
                    onChange={(e) => setCurrentMarket(e.target.value)}
                    placeholder="Domestic / regions"
                  />
                </Field>
                <Field label="Target country">
                  <Input
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    placeholder="e.g. United States"
                  />
                </Field>
              </div>

              <Field label="Existing website">
                <Input
                  value={existingWebsite}
                  onChange={(e) => setExistingWebsite(e.target.value)}
                  placeholder="https://"
                />
              </Field>
              <Field label="Current sales channels">
                <Input
                  value={salesChannels}
                  onChange={(e) => setSalesChannels(e.target.value)}
                  placeholder="e.g. 1688, Amazon, Shopify"
                />
              </Field>
              <Field label="Core selling points">
                <Textarea
                  value={sellingPoints}
                  onChange={(e) => setSellingPoints(e.target.value)}
                  rows={3}
                  placeholder="What makes this product stand out"
                />
              </Field>
              <Field label="Factory / brand background">
                <Textarea
                  value={factoryBackground}
                  onChange={(e) => setFactoryBackground(e.target.value)}
                  rows={2}
                  placeholder="Years of experience, facilities, etc."
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="OEM / ODM support">
                  <Select value={oemSupport} onValueChange={setOemSupport}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {OEM_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Main customer type">
                  <Input
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    placeholder="e.g. Distributors, retailers"
                  />
                </Field>
              </div>

              <Button
                variant="accent"
                size="lg"
                className="mt-2 w-full"
                onClick={handleScan}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Running scan…
                  </>
                ) : (
                  <>
                    <Sparkles /> Run Export Readiness Scan
                  </>
                )}
              </Button>

              {error && (
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: results ───────────────────────────────────── */}
        <div className="relative lg:col-span-3">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                Generating diagnosis…
              </div>
            </div>
          )}

          {diagnosis ? (
            <DiagnosisView diagnosis={diagnosis} live={live} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <FlaskConical className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Run the scan to generate an export readiness diagnosis.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function DiagnosisView({
  diagnosis,
  live,
}: {
  diagnosis: ExportReadinessDiagnosis;
  live: boolean | null;
}) {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ScoreGauge
              score={diagnosis.export_readiness_score}
              label="Readiness"
              size={120}
            />
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  English USP
                </p>
                <div className="mt-1.5 rounded-lg border border-accent/25 bg-accent/10 p-3 text-sm font-medium text-foreground">
                  {diagnosis.english_usp}
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Product–market fit
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {diagnosis.product_market_fit}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Badge variant={live ? "success" : "accent"}>
              {live ? "AI Live" : "AI Demo"}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-success" /> Saved to project
            </span>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm">
                <Download /> Export
              </Button>
              <Button variant="accent" size="sm" asChild>
                <Link href="/proposal-builder">
                  Send to Proposal Builder
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority markets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" /> Priority markets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {diagnosis.priority_markets.map((m) => (
            <div
              key={m.country}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <Badge variant={toneBadge[scoreTone(m.score)]} className="tabular-nums">
                {m.score}
              </Badge>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {m.country}
                </p>
                <p className="text-sm text-muted-foreground">{m.reason}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommended channels</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnosis.channel_recommendation.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-muted-foreground">{c}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target customer profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {diagnosis.target_customer_profile}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing insight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {diagnosis.pricing_insight}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Differentiation angles</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnosis.differentiation_angles.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-muted-foreground">{d}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Risks + certifications */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Key risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnosis.key_risks.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                  <span className="text-muted-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required certifications</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {diagnosis.required_certifications.map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 30-Day action plan timeline */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day action plan</CardTitle>
          <CardDescription>
            A sequenced playbook from diagnosis to first pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-5">
            {diagnosis.action_plan.map((step, i) => (
              <li key={step.day} className="relative flex gap-4 pl-2">
                {i < diagnosis.action_plan.length - 1 && (
                  <span className="absolute left-[1.6rem] top-8 h-[calc(100%-0.5rem)] w-px bg-border" />
                )}
                <span className="z-10 flex h-9 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground tabular-nums">
                  D{step.day}
                </span>
                <p className="pt-2 text-sm text-muted-foreground">{step.task}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
