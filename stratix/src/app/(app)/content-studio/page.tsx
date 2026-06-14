"use client";

import { useState } from "react";
import {
  PenLine,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Save,
  Download,
  FileText,
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject } from "@/components/project-context";
import { getContents, getProduct } from "@/lib/mock/data";
import { generate } from "@/lib/ai/client";
import { formatDate } from "@/lib/utils";
import type { Content, ContentType } from "@/lib/types";

const CONTENT_TYPES: ContentType[] = [
  "LinkedIn Company Profile",
  "Founder LinkedIn Post",
  "Company LinkedIn Post",
  "Cold Email Sequence",
  "Follow-up Email",
  "Product Page Copy",
  "Website Hero Copy",
  "About Page",
  "FAQ",
  "Amazon Listing Copy",
  "TikTok / Instagram Script",
  "Trade Show Invitation",
  "Distributor Pitch",
  "One-Page Product Intro",
  "B2B Brochure Copy",
];

const TONES = [
  "Professional",
  "Confident",
  "Warm",
  "Direct",
  "Premium",
  "Playful",
];

const PLATFORMS = [
  "LinkedIn",
  "Website",
  "Email",
  "Amazon",
  "TikTok / Instagram",
  "Trade Show",
  "Print / PDF",
];

interface ContentResult {
  title: string;
  main_message: string;
  body: string;
  cta: string;
  variants: string[];
}

export default function ContentStudioPage() {
  const { activeProjectId, activeProject } = useProject();
  const product = getProduct(activeProjectId);

  const [contentType, setContentType] = useState<ContentType>(
    "LinkedIn Company Profile"
  );
  const [targetAudience, setTargetAudience] = useState(
    product?.main_customer_type ?? "B2B distributors and retailers"
  );
  const [platform, setPlatform] = useState("LinkedIn");
  const [tone, setTone] = useState("Professional");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [editedBody, setEditedBody] = useState("");
  const [copied, setCopied] = useState(false);

  const [library, setLibrary] = useState<Content[]>(() =>
    getContents(activeProjectId)
  );

  const sellingPoints = product?.selling_points ?? "";
  const productName = product?.product_name ?? activeProject.project_name;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const { result } = await generate<ContentResult>("content", {
        contentType,
        productName,
        productCategory: activeProject.product_category,
        sellingPoints,
        targetAudience,
        platform,
        tone,
      });
      setResult(result);
      setEditedBody(result.body);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Generation failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function copyCopy() {
    if (!editedBody) return;
    navigator.clipboard.writeText(editedBody).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function saveToLibrary() {
    if (!result) return;
    const item: Content = {
      id: `cnt_${Date.now()}`,
      project_id: activeProjectId,
      content_type: contentType,
      title: result.title,
      target_audience: targetAudience,
      platform,
      tone,
      main_message: result.main_message,
      body: editedBody,
      cta: result.cta,
      language: "English",
      created_at: new Date().toISOString(),
    };
    setLibrary((prev) => [item, ...prev]);
  }

  function loadFromLibrary(item: Content) {
    setContentType(item.content_type);
    setTargetAudience(item.target_audience);
    setPlatform(item.platform);
    setTone(item.tone);
    setResult({
      title: item.title,
      main_message: item.main_message,
      body: item.body,
      cta: item.cta,
      variants: [],
    });
    setEditedBody(item.body);
  }

  return (
    <>
      <PageHeader
        title="Content Studio"
        description="Generate structured, export-ready English sales and marketing assets."
        icon={PenLine}
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* LEFT: config */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Asset configuration</CardTitle>
              <CardDescription>
                Tuned to {productName} · {activeProject.product_category}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Content type</Label>
                <Select
                  value={contentType}
                  onValueChange={(v) => setContentType(v as ContentType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Target audience</Label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. US pet retail buyers"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="accent"
                className="w-full"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Generate asset
              </Button>
              {error && <p className="text-sm text-rose-600">{error}</p>}
            </CardContent>
          </Card>

          <UpgradePrompt
            variant="card"
            title="Unlimited generations"
            description="Free plans are capped. Upgrade to Pro for unlimited assets, full multi-email sequences, and brand-voice memory."
            cta="Go Pro"
          />
        </div>

        {/* RIGHT: output */}
        <div className="space-y-5">
          {result ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <Badge variant="accent">{contentType}</Badge>
                  <CardTitle className="mt-2 text-lg">{result.title}</CardTitle>
                  <CardDescription className="mt-1">
                    Audience: {targetAudience}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5">
                  <Badge variant="secondary">{platform}</Badge>
                  <Badge variant="outline">{tone}</Badge>
                  <Badge variant="outline">English</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Main message
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {result.main_message}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Final copy (editable)</Label>
                  <Textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    rows={12}
                    className="text-sm leading-relaxed"
                  />
                </div>

                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Suggested CTA
                  </p>
                  <Badge variant="accent" className="mt-2">
                    {result.cta}
                  </Badge>
                </div>

                {result.variants.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Variants
                    </p>
                    <ul className="space-y-2">
                      {result.variants.map((v, i) => (
                        <li
                          key={i}
                          className="rounded-md border border-border bg-card p-3 text-sm text-muted-foreground"
                        >
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={copyCopy}>
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copy
                  </Button>
                  <Button variant="accent" size="sm" onClick={saveToLibrary}>
                    <Save className="h-3.5 w-3.5" />
                    Save to library
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <div className="rounded-lg border border-border bg-secondary/60 p-3">
                  <PenLine className="h-6 w-6 text-accent" />
                </div>
                <p className="font-medium">No asset generated yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Configure a content type, audience, and tone, then generate an
                  export-ready asset — or open one from your library below.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Library */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content library</CardTitle>
              <CardDescription>
                {library.length} saved assets · click to load into the editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {library.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadFromLibrary(item)}
                    className="group rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-accent/40 hover:bg-accent/5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {item.content_type}
                      </Badge>
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent" />
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {item.target_audience}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.platform}</span>
                      <span className="tabular-nums">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </button>
                ))}
                {library.length === 0 && (
                  <p className="py-6 text-sm text-muted-foreground">
                    No saved assets yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
