"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Loader2,
  Download,
  FileType2,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { StratixMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject } from "@/components/project-context";
import { getLeads, getProduct, getReports } from "@/lib/mock/data";
import { generate } from "@/lib/ai/client";
import { exportLeadsCSV, exportReportPDF } from "@/lib/export";
import { cn, formatDate } from "@/lib/utils";
import type { Report, ReportSection, ReportType } from "@/lib/types";

const REPORT_TYPES: ReportType[] = [
  "Export Readiness Report",
  "Market Entry Report",
  "Competitor Analysis Report",
  "B2B Lead Generation Plan",
  "30-Day Global Growth Plan",
  "DTC Launch Plan",
  "Consulting Proposal",
  "Investor / Partner Brief",
];

interface ProposalResult {
  title: string;
  summary: string;
  sections: ReportSection[];
}

// Free plan: proposals are watermarked, white-label is locked.
const FREE_WATERMARK = true;

export default function ProposalBuilderPage() {
  const { activeProjectId, activeProject } = useProject();
  const product = getProduct(activeProjectId);

  const existing = getReports(activeProjectId);
  const seed = existing[0];

  const [reportType, setReportType] = useState<ReportType>(
    seed?.report_type ?? "Market Entry Report"
  );
  const [result, setResult] = useState<ProposalResult | null>(
    seed
      ? { title: seed.title, summary: seed.summary, sections: seed.sections }
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [watermark, setWatermark] = useState(FREE_WATERMARK);

  const productName = product?.product_name ?? activeProject.project_name;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const { result } = await generate<ProposalResult>("proposal", {
        reportType,
        projectName: activeProject.project_name,
        productName,
        productCategory: activeProject.product_category,
        targetMarket: activeProject.target_market,
      });
      setResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Generation failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function buildReport(): Report | null {
    if (!result) return null;
    return {
      id: `rpt_${Date.now()}`,
      project_id: activeProjectId,
      report_type: reportType,
      title: result.title,
      summary: result.summary,
      sections: result.sections,
      status: "draft",
      created_at: new Date().toISOString(),
    };
  }

  async function handleExportPDF() {
    const report = buildReport();
    if (!report) return;
    setExporting(true);
    try {
      await exportReportPDF(report, watermark);
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setExporting(false);
    }
  }

  function handleExportLeads() {
    try {
      exportLeadsCSV(getLeads(activeProjectId));
    } catch (err) {
      console.error("Lead CSV export failed", err);
    }
  }

  return (
    <>
      <PageHeader
        title="Proposal Builder"
        description="Turn project intelligence into a client-ready or investor-ready report."
        icon={FileText}
      />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* LEFT: config + quick picks */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report type</CardTitle>
              <CardDescription>{activeProject.project_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={reportType}
                onValueChange={(v) => setReportType(v as ReportType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="accent"
                className="w-full"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Generate report
              </Button>
              {error && <p className="text-sm text-rose-600">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick pick</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {REPORT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setReportType(t)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    reportType === t
                      ? "border-accent/50 bg-accent/10 font-medium text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-accent/30 hover:bg-accent/5"
                  )}
                >
                  {t}
                </button>
              ))}
            </CardContent>
          </Card>

          <UpgradePrompt
            variant="card"
            title="White-label proposals"
            description="Remove the STRATIX watermark, add your logo, and ship investor-ready PDFs. Available on Pro & Agency."
            cta="See plans"
          />
        </div>

        {/* RIGHT: preview */}
        <div className="space-y-4">
          {/* Toolbar */}
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={watermark}
                  onChange={(e) => setWatermark(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-[#0ea5b7]"
                />
                Watermark{" "}
                <span className="text-xs">
                  (free plan — toggle requires Pro)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={exporting || !result}
                >
                  {exporting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title="Word export is available on Pro"
                >
                  <FileType2 className="h-3.5 w-3.5" />
                  Export Word
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportLeads}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Export CSV (leads)
                </Button>
              </div>
            </CardContent>
          </Card>

          {result ? (
            <Card className="overflow-hidden">
              {/* Cover */}
              <div className="grid-bg relative bg-gradient-to-br from-navy to-charcoal p-8 text-ivory">
                <div className="flex items-center gap-2">
                  <StratixMark />
                  <span className="text-sm font-semibold tracking-wide">
                    STRATIX
                  </span>
                </div>
                <Badge variant="accent" className="mt-6">
                  {reportType}
                </Badge>
                <h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tight">
                  {result.title}
                </h2>
                <p className="mt-2 text-sm text-ivory/70">
                  {activeProject.project_name} · {activeProject.target_market}
                </p>
                <p className="mt-6 flex items-center gap-1.5 text-xs text-ivory/60">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(new Date())}
                </p>
              </div>

              <CardContent className="p-8">
                <div className="mx-auto max-w-2xl space-y-8">
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Executive summary
                    </h3>
                    <p className="mt-2 text-[15px] leading-7 text-foreground">
                      {result.summary}
                    </p>
                  </section>

                  {result.sections.map((section, i) => (
                    <section key={i}>
                      <Separator className="mb-6" />
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        {section.heading}
                      </h3>
                      <p className="mt-2 text-[15px] leading-7 text-muted-foreground">
                        {section.body}
                      </p>
                      {section.bullets && section.bullets.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {section.bullets.map((b, bi) => (
                            <li
                              key={bi}
                              className="flex gap-2 text-[15px] leading-7 text-foreground"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <div className="rounded-lg border border-border bg-secondary/60 p-3">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <p className="font-medium">No report generated yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Pick a report type and generate a client-ready document.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
