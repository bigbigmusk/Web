"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Plus,
  Users,
  ListChecks,
  FileText,
  Crosshair,
  PenLine,
  ArrowUpRight,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { ScoreGauge } from "@/components/score-gauge";
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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProject } from "@/components/project-context";
import {
  PROJECTS,
  getCompetitors,
  getContents,
  getLeads,
  getReports,
  getTasks,
} from "@/lib/mock/data";
import { cn, formatDate, scoreTone } from "@/lib/utils";

const OPEN_LEAD_STATUSES = new Set(["New", "Qualified", "Contacted"]);

const statusBadgeVariant: Record<string, "success" | "warning" | "secondary"> = {
  active: "success",
  draft: "warning",
  archived: "secondary",
};

export default function DashboardPage() {
  const { activeProject, activeProjectId } = useProject();

  const leads = getLeads(activeProjectId);
  const pendingLeads = leads.filter((l) => OPEN_LEAD_STATUSES.has(l.status));

  const tasks = getTasks(activeProjectId);
  const contentTasks = tasks.filter((t) => t.task_type === "Content");
  const openTasks = tasks.filter((t) => t.status !== "Done");

  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const todoCount = tasks.filter((t) => t.status === "Todo").length;
  const progressPct = tasks.length
    ? Math.round((doneCount / tasks.length) * 100)
    : 0;

  const reports = getReports(activeProjectId);
  const competitors = getCompetitors(activeProjectId);
  const contents = getContents(activeProjectId);

  const kpis = [
    {
      label: "Export Readiness",
      gauge: activeProject.export_readiness_score ?? 0,
    },
    {
      label: "Market Opportunity",
      gauge: activeProject.opportunity_score ?? 0,
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your global expansion command center."
        icon={LayoutDashboard}
      >
        <Button variant="accent" asChild>
          <Link href="/projects/new">
            <Plus />
            New Project
          </Link>
        </Button>
      </PageHeader>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <ScoreGauge score={kpi.gauge} size={72} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {scoreTone(kpi.gauge) === "high"
                    ? "Strong — ready to act"
                    : scoreTone(kpi.gauge) === "medium"
                      ? "Building momentum"
                      : "Needs attention"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        <KpiCard
          icon={Users}
          value={pendingLeads.length}
          label="Pending Leads"
          sub={`${leads.length} total in pipeline`}
        />
        <KpiCard
          icon={ListChecks}
          value={openTasks.length}
          label="Content & Open Tasks"
          sub={`${contentTasks.length} content · ${tasks.length} total`}
        />
      </div>

      {/* 2-column area */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT — active projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Active projects</CardTitle>
              <CardDescription>
                Every global expansion play you&apos;re running.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects/new">
                New <ArrowUpRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Market</TableHead>
                  <TableHead className="text-center">Readiness</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROJECTS.map((project) => (
                  <TableRow
                    key={project.id}
                    className={cn(
                      "cursor-pointer",
                      project.id === activeProjectId && "bg-secondary/40"
                    )}
                  >
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {project.project_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project.product_category}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {project.business_type}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {project.target_market}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <ScoreGauge
                          score={project.export_readiness_score ?? 0}
                          size={44}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusBadgeVariant[project.status] ?? "secondary"}
                        className="capitalize"
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* RIGHT — growth progress + upgrade */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>30-day growth progress</CardTitle>
              <CardDescription>
                {activeProject.project_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold tabular-nums tracking-tight">
                    {progressPct}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {doneCount}/{tasks.length} tasks done
                  </span>
                </div>
                <Progress value={progressPct} className="mt-3" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Breakdown label="Done" value={doneCount} tone="success" />
                <Breakdown
                  label="In Progress"
                  value={inProgressCount}
                  tone="warning"
                />
                <Breakdown label="Todo" value={todoCount} tone="muted" />
              </div>
            </CardContent>
          </Card>

          <UpgradePrompt
            variant="card"
            title="Unlock advanced reports"
            description="Upgrade to generate white-label market-entry reports and monthly strategy briefings."
            cta="See plans"
          />
        </div>
      </div>

      {/* 3-column row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              <CardTitle>Recent reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.length === 0 && (
              <EmptyNote text="No reports yet for this project." />
            )}
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {report.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(report.created_at)}
                  </p>
                </div>
                <Badge variant="accent" className="shrink-0">
                  {report.report_type.replace(" Report", "")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Competitor updates */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-accent" />
              <CardTitle>Competitor updates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {competitors.length === 0 && (
              <EmptyNote text="No competitors tracked yet." />
            )}
            {competitors.map((competitor) => (
              <div
                key={competitor.id}
                className="border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {competitor.brand_name}
                  </p>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {competitor.price_range}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {competitor.positioning}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content tasks / recent content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-accent" />
              <CardTitle>Recent content</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {contents.length === 0 && (
              <EmptyNote text="No content generated yet." />
            )}
            {contents.map((content) => (
              <div
                key={content.id}
                className="border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <p className="text-sm font-medium text-foreground">
                  {content.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{content.content_type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {content.platform}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function KpiCard({
  icon: Icon,
  value,
  label,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  sub: string;
}) {
  return (
    <Card>
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
          <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Breakdown({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-2">
      <p className={cn("text-lg font-bold tabular-nums", toneClass)}>{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
