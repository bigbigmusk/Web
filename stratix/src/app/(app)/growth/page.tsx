"use client";

import { useMemo, useState } from "react";
import {
  Rocket,
  CheckCircle2,
  Circle,
  Clock,
  Send,
  PenLine,
  UserCheck,
  Swords,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProject } from "@/components/project-context";
import { getLeads, getTasks } from "@/lib/mock/data";
import { cn, formatDate } from "@/lib/utils";
import type { Task, TaskStatus, TaskType } from "@/lib/types";

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  Todo: "In Progress",
  "In Progress": "Done",
  Done: "Todo",
};

const typeBadge: Record<TaskType, "default" | "secondary" | "accent" | "warning" | "success" | "danger"> = {
  Strategy: "accent",
  Outbound: "warning",
  Content: "success",
  Competitor: "danger",
  Report: "secondary",
  Research: "default",
};

const statusBadge: Record<TaskStatus, "secondary" | "warning" | "success"> = {
  Todo: "secondary",
  "In Progress": "warning",
  Done: "success",
};

export default function GrowthPage() {
  const { activeProjectId } = useProject();
  const [tasks, setTasks] = useState<Task[]>(() => getTasks(activeProjectId));
  const leads = useMemo(() => getLeads(activeProjectId), [activeProjectId]);

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const todoCount = tasks.filter((t) => t.status === "Todo").length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  // Current week = first week with an unfinished task
  const currentWeek = useMemo(() => {
    const pending = tasks
      .filter((t) => t.status !== "Done" && typeof t.week === "number")
      .sort((a, b) => (a.week ?? 0) - (b.week ?? 0));
    return pending[0]?.week ?? 4;
  }, [tasks]);

  const byDay = useMemo(
    () => [...tasks].sort((a, b) => (a.day ?? 0) - (b.day ?? 0)),
    [tasks]
  );

  const weeks = useMemo(() => {
    const map: Record<number, Task[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const t of tasks) {
      const w = t.week ?? 1;
      if (!map[w]) map[w] = [];
      map[w].push(t);
    }
    for (const w of Object.keys(map)) {
      map[Number(w)].sort((a, b) => (a.day ?? 0) - (b.day ?? 0));
    }
    return map;
  }, [tasks]);

  function cycleStatus(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: STATUS_CYCLE[t.status] } : t
      )
    );
  }

  const nextTasks = byDay.filter((t) => t.status !== "Done").slice(0, 4);
  const contentTasks = tasks.filter((t) => t.task_type === "Content");
  const competitorTasks = tasks.filter((t) => t.task_type === "Competitor");
  const followUps = leads
    .filter((l) => l.status === "Contacted" || l.status === "Replied")
    .slice(0, 4);

  const stats: {
    label: string;
    value: number;
    icon: typeof Circle;
    tint: string;
  }[] = [
    { label: "To do", value: todoCount, icon: Circle, tint: "text-muted-foreground" },
    { label: "In progress", value: inProgressCount, icon: Clock, tint: "text-amber-500" },
    { label: "Done", value: doneCount, icon: CheckCircle2, tint: "text-emerald-500" },
  ];

  return (
    <>
      <PageHeader
        title="Growth Command Center"
        description="Your 30-day outbound execution system."
        icon={Rocket}
      />

      {/* Overview */}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="flex items-center justify-center">
          <CardContent className="flex flex-col items-center gap-2 p-6">
            <ScoreGauge score={pct} label="Complete" />
            <p className="text-xs text-muted-foreground">
              {doneCount} of {total} tasks done
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  30-day plan progress
                </p>
                <Badge variant="accent">Week {currentWeek} of 4</Badge>
              </div>
              <Progress value={pct} className="h-2.5" />
              <p className="text-xs tabular-nums text-muted-foreground">
                {pct}% complete
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, icon: Icon, tint }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-lg border border-border bg-secondary/60 p-3">
                    <Icon className={cn("h-5 w-5", tint)} />
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
        </div>
      </div>

      {/* Weekly milestones */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Weekly milestones
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((w) => {
            const wTasks = weeks[w] ?? [];
            const wDone = wTasks.filter((t) => t.status === "Done").length;
            return (
              <Card
                key={w}
                className={cn(
                  w === currentWeek && "border-accent/40 ring-1 ring-accent/20"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Week {w}</CardTitle>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {wDone}/{wTasks.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {wTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => cycleStatus(t.id)}
                      className="flex w-full items-start gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-secondary/60"
                    >
                      <StatusIcon status={t.status} />
                      <span
                        className={cn(
                          "text-sm leading-snug",
                          t.status === "Done"
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        )}
                      >
                        {t.task_name}
                      </span>
                    </button>
                  ))}
                  {wTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground">No tasks.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 30-day timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">30-day action plan</CardTitle>
          <CardDescription>
            Click a status to cycle Todo → In Progress → Done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-1 border-l border-border pl-6">
            {byDay.map((t) => (
              <li key={t.id} className="relative py-2.5">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {t.day ?? "–"}
                </span>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium",
                        t.status === "Done"
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      )}
                    >
                      {t.status === "Done" && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                      {t.task_name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Due {formatDate(t.due_date)} · {t.owner}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={typeBadge[t.task_type]}>{t.task_type}</Badge>
                    <button onClick={() => cycleStatus(t.id)}>
                      <Badge
                        variant={statusBadge[t.status]}
                        className="cursor-pointer"
                      >
                        {t.status}
                      </Badge>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Bottom rail */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RailCard
          title="Daily outbound tasks"
          icon={Send}
          count={nextTasks.length}
          empty="All caught up."
        >
          {nextTasks.map((t) => (
            <RailRow key={t.id} primary={t.task_name} secondary={`Day ${t.day} · ${t.status}`} />
          ))}
        </RailCard>

        <RailCard
          title="Content calendar"
          icon={PenLine}
          count={contentTasks.length}
          empty="No content tasks."
        >
          {contentTasks.map((t) => (
            <RailRow
              key={t.id}
              primary={t.task_name}
              secondary={`Due ${formatDate(t.due_date)}`}
            />
          ))}
        </RailCard>

        <RailCard
          title="Lead follow-up reminders"
          icon={UserCheck}
          count={followUps.length}
          empty="No leads awaiting follow-up."
        >
          {followUps.map((l) => (
            <RailRow
              key={l.id}
              primary={l.company_name}
              secondary={`${l.country} · ${l.status}`}
            />
          ))}
        </RailCard>

        <RailCard
          title="Competitor review tasks"
          icon={Swords}
          count={competitorTasks.length}
          empty="No competitor reviews scheduled."
        >
          {competitorTasks.map((t) => (
            <RailRow
              key={t.id}
              primary={t.task_name}
              secondary={`Due ${formatDate(t.due_date)} · ${t.status}`}
            />
          ))}
        </RailCard>
      </div>
    </>
  );
}

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === "Done")
    return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />;
  if (status === "In Progress")
    return <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />;
  return <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />;
}

function RailCard({
  title,
  icon: Icon,
  count,
  empty,
  children,
}: {
  title: string;
  icon: typeof Send;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {count > 0 ? (
          children
        ) : (
          <p className="text-xs text-muted-foreground">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}

function RailRow({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-2.5">
      <p className="line-clamp-1 text-sm font-medium text-foreground">
        {primary}
      </p>
      <p className="text-xs text-muted-foreground">{secondary}</p>
    </div>
  );
}
