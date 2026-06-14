"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileBarChart,
  Plus,
  Download,
  FileText,
  CheckCircle2,
  PencilLine,
  Loader2,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProject, getReports } from "@/lib/mock/data";
import { exportReportPDF } from "@/lib/export";
import { formatDate } from "@/lib/utils";
import type { Report } from "@/lib/types";

// Free-plan simulation: every export is watermarked, white-label is locked.
const WATERMARK = true;

export default function ReportsPage() {
  const reports = getReports(); // ALL reports, across projects
  const [exportingId, setExportingId] = useState<string | null>(null);

  const total = reports.length;
  const finalCount = reports.filter((r) => r.status === "final").length;
  const draftCount = reports.filter((r) => r.status === "draft").length;

  async function handleExport(report: Report) {
    setExportingId(report.id);
    try {
      await exportReportPDF(report, WATERMARK);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExportingId(null);
    }
  }

  const stats: { label: string; value: number; icon: typeof FileText }[] = [
    { label: "Total reports", value: total, icon: FileText },
    { label: "Final", value: finalCount, icon: CheckCircle2 },
    { label: "Drafts", value: draftCount, icon: PencilLine },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Every strategy report and client proposal you've generated."
        icon={FileBarChart}
      >
        <Button variant="accent" asChild>
          <Link href="/proposal-builder">
            <Plus />
            New report
          </Link>
        </Button>
      </PageHeader>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg border border-border bg-secondary/60 p-3">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums tracking-tight">
                  {value}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Export</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const project = getProject(report.project_id);
                const isDraft = report.status === "draft";
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {report.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted-foreground">
                        {report.summary}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {project?.project_name ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="accent" className="whitespace-nowrap">
                        {report.report_type.replace(" Report", "")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {formatDate(report.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isDraft ? "secondary" : "success"}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={exportingId === report.id}
                          onClick={() => handleExport(report)}
                        >
                          {exportingId === report.id ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Download />
                          )}
                          Export
                        </Button>
                        {isDraft && (
                          <UpgradePrompt
                            variant="inline"
                            description="White-label export locked"
                            cta="Upgrade"
                            className="w-max"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Free plan exports include a STRATIX watermark. Upgrade to Pro for clean,
        white-label PDFs you can send straight to clients.
      </p>

      <UpgradePrompt
        variant="card"
        title="Unlock white-label proposals"
        description="Remove watermarks, add your own logo, and generate premium market-entry and consulting templates clients are happy to pay for."
        cta="See plans"
      />
    </>
  );
}
