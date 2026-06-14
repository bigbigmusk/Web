"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Upload,
  Download,
  Plus,
  Search,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Globe,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/components/project-context";
import { getLeads, getProduct } from "@/lib/mock/data";
import { generate } from "@/lib/ai/client";
import { exportLeadsCSV } from "@/lib/export";
import { cn, formatDate, scoreTone } from "@/lib/utils";
import type { Lead, LeadStatus, LeadPriority } from "@/lib/types";

const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Qualified",
  "Contacted",
  "Replied",
  "Meeting Booked",
  "Quoted",
  "Won",
  "Lost",
];

const PRIORITIES: LeadPriority[] = ["High", "Medium", "Low"];

const priorityBadge: Record<LeadPriority, "danger" | "warning" | "secondary"> = {
  High: "danger",
  Medium: "warning",
  Low: "secondary",
};

const fitTone: Record<"high" | "medium" | "low", string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-rose-500",
};

interface LeadScoreResult {
  fit_score: number;
  reason: string;
  outreach_angle: string;
  suggested_message: string;
}

interface NewLeadForm {
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
  notes: string;
}

const EMPTY_FORM: NewLeadForm = {
  company_name: "",
  country: "",
  website: "",
  customer_type: "Distributor",
  contact_name: "",
  email: "",
  linkedin_url: "",
  source: "Manual",
  priority: "Medium",
  status: "New",
  notes: "",
};

export default function LeadFinderPage() {
  const { activeProjectId, activeProject } = useProject();
  const product = getProduct(activeProjectId);

  const [leads, setLeads] = useState<Lead[]>(() => getLeads(activeProjectId));
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<NewLeadForm>(EMPTY_FORM);
  const [addOpen, setAddOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const sellingPoints = product?.selling_points ?? "";

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (priorityFilter !== "all" && l.priority !== priorityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !l.company_name.toLowerCase().includes(q) &&
          !l.country.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [leads, statusFilter, priorityFilter, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of LEAD_STATUSES) map[s] = 0;
    for (const l of leads) map[l.status] = (map[l.status] ?? 0) + 1;
    return map;
  }, [leads]);

  const avgFit = useMemo(() => {
    const scored = leads.filter((l) => typeof l.fit_score === "number");
    if (!scored.length) return 0;
    return Math.round(
      scored.reduce((sum, l) => sum + (l.fit_score ?? 0), 0) / scored.length
    );
  }, [leads]);

  function updateStatus(id: string, status: LeadStatus) {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              last_contacted_at:
                status === "Contacted" && !l.last_contacted_at
                  ? new Date().toISOString()
                  : l.last_contacted_at,
            }
          : l
      )
    );
  }

  function addLead() {
    if (!form.company_name.trim()) return;
    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      project_id: activeProjectId,
      ...form,
      fit_score: undefined,
      last_contacted_at: null,
      created_at: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    setForm(EMPTY_FORM);
    setAddOpen(false);
  }

  async function handleExport() {
    setExporting(true);
    try {
      exportLeadsCSV(leads);
    } catch (err) {
      console.error("Lead CSV export failed", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Lead Finder"
        description="Manage, score, and prioritize overseas target customers."
        icon={Users}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload />
              Import CSV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import leads from CSV</DialogTitle>
              <DialogDescription>
                Map your existing buyer list into STRATIX.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your CSV should include the columns:{" "}
                <span className="font-medium text-foreground">
                  Company, Country, Website, Customer Type, Contact, Email,
                  LinkedIn, Source, Priority, Status, Notes
                </span>
                .
              </p>
              <p>
                STRATIX will auto-score every imported lead against your product
                ICP and surface the highest-fit buyers first.
              </p>
              <UpgradePrompt
                variant="inline"
                description="Bulk CSV import is a Pro feature"
                cta="Upgrade"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="accent" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="animate-spin" /> : <Download />}
          Export CSV
        </Button>
      </PageHeader>

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-9">
        {LEAD_STATUSES.map((s) => (
          <Card key={s}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {counts[s] ?? 0}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {s}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <p className="text-2xl font-bold tabular-nums tracking-tight text-accent">
              {avgFit}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Avg fit score
            </p>
          </CardContent>
        </Card>
      </div>

      <UpgradePrompt
        variant="inline"
        description="CSV lead export and bulk enrichment are Pro features — export works in demo mode."
        cta="Go Pro"
      />

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search company or country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="md:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="accent">
                <Plus />
                Add lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add a lead</DialogTitle>
                <DialogDescription>
                  New leads are added to your pipeline as “New”.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Company name" className="sm:col-span-2">
                  <Input
                    value={form.company_name}
                    onChange={(e) =>
                      setForm({ ...form, company_name: e.target.value })
                    }
                  />
                </Field>
                <Field label="Country">
                  <Input
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                  />
                </Field>
                <Field label="Website">
                  <Input
                    value={form.website}
                    onChange={(e) =>
                      setForm({ ...form, website: e.target.value })
                    }
                  />
                </Field>
                <Field label="Customer type">
                  <Input
                    value={form.customer_type}
                    onChange={(e) =>
                      setForm({ ...form, customer_type: e.target.value })
                    }
                  />
                </Field>
                <Field label="Contact name">
                  <Input
                    value={form.contact_name}
                    onChange={(e) =>
                      setForm({ ...form, contact_name: e.target.value })
                    }
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </Field>
                <Field label="LinkedIn URL">
                  <Input
                    value={form.linkedin_url}
                    onChange={(e) =>
                      setForm({ ...form, linkedin_url: e.target.value })
                    }
                  />
                </Field>
                <Field label="Source">
                  <Input
                    value={form.source}
                    onChange={(e) =>
                      setForm({ ...form, source: e.target.value })
                    }
                  />
                </Field>
                <Field label="Priority">
                  <Select
                    value={form.priority}
                    onValueChange={(v) =>
                      setForm({ ...form, priority: v as LeadPriority })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm({ ...form, status: v as LeadStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Notes" className="sm:col-span-2">
                  <Textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </Field>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="accent" onClick={addLead}>
                  Add to pipeline
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Leads table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead>Fit</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden xl:table-cell">
                  Last contacted
                </TableHead>
                <TableHead className="text-right">AI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => {
                const tone = scoreTone(lead.fit_score ?? 0);
                return (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {lead.company_name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {lead.country}
                      </p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {lead.customer_type}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-foreground">
                        {lead.contact_name || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.email || ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      {typeof lead.fit_score === "number" ? (
                        <div className="w-20">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tabular-nums">
                              {lead.fit_score}
                            </span>
                          </div>
                          <Progress
                            value={lead.fit_score}
                            className="mt-1 h-1.5"
                            indicatorClassName={fitTone[tone]}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={priorityBadge[lead.priority]}>
                        {lead.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(v) =>
                          updateStatus(lead.id, v as LeadStatus)
                        }
                      >
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {lead.last_contacted_at
                          ? formatDate(lead.last_contacted_at)
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <LeadAIDialog
                        lead={lead}
                        productName={product?.product_name ?? ""}
                        productCategory={activeProject.product_category}
                        sellingPoints={sellingPoints}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No leads match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function LeadAIDialog({
  lead,
  productName,
  productCategory,
  sellingPoints,
}: {
  lead: Lead;
  productName: string;
  productCategory: string;
  sellingPoints: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function runScore() {
    setLoading(true);
    setError(null);
    try {
      const { result } = await generate<LeadScoreResult>("leadScore", {
        productName,
        productCategory,
        sellingPoints,
        lead: {
          company: lead.company_name,
          country: lead.country,
          customerType: lead.customer_type,
          notes: lead.notes,
        },
      });
      setResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "AI request failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function copyMessage() {
    if (!result?.suggested_message) return;
    navigator.clipboard.writeText(result.suggested_message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const angle = result?.outreach_angle ?? "Run the score to generate a tailored outreach angle.";
  const message =
    result?.suggested_message ??
    "Click “Score & draft outreach” to generate a personalized message for this lead.";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-3.5 w-3.5" />
          AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>AI assist · {lead.company_name}</DialogTitle>
          <DialogDescription>
            Score this lead and draft outreach tuned to {productCategory}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Button variant="accent" size="sm" onClick={runScore} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Score &amp; draft outreach
          </Button>
          {result && (
            <Badge variant="success">Fit {result.fit_score}</Badge>
          )}
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {result && (
          <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
            <p className="font-medium text-foreground">Why this fits</p>
            <p className="mt-1 text-muted-foreground">{result.reason}</p>
          </div>
        )}

        <Tabs defaultValue="cold" className="mt-1">
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger value="icp">ICP</TabsTrigger>
            <TabsTrigger value="cold">Cold email</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="followup">Follow-up</TabsTrigger>
            <TabsTrigger value="call">Call points</TabsTrigger>
          </TabsList>

          <TabsContent value="icp" className="space-y-2 text-sm">
            <p className="font-medium">Ideal customer profile match</p>
            <p className="text-muted-foreground">
              {lead.customer_type} in {lead.country}. Outreach angle: {angle}
            </p>
          </TabsContent>

          <TabsContent value="cold" className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Suggested cold email</p>
              <Button variant="ghost" size="sm" onClick={copyMessage}>
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy
              </Button>
            </div>
            <Textarea
              readOnly
              value={message}
              rows={8}
              className="text-sm"
            />
          </TabsContent>

          <TabsContent value="linkedin" className="space-y-2 text-sm">
            <p className="font-medium">LinkedIn connection note</p>
            <Textarea
              readOnly
              rows={5}
              className="text-sm"
              value={`Hi ${lead.contact_name || "there"} — I help ${productCategory} brands like ${lead.company_name} source ${productName || "vetted product"}. ${angle} Open to a quick chat?`}
            />
          </TabsContent>

          <TabsContent value="followup" className="space-y-2 text-sm">
            <p className="font-medium">4-touch follow-up sequence</p>
            <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>Day 0 — value-first intro ({angle}).</li>
              <li>Day 3 — share a relevant case study / sample offer.</li>
              <li>Day 7 — short bump referencing prior email.</li>
              <li>Day 14 — break-up email with a clear CTA.</li>
            </ol>
          </TabsContent>

          <TabsContent value="call" className="space-y-2 text-sm">
            <p className="font-medium">Discovery call talking points</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Confirm current {productCategory} sourcing &amp; pain points.</li>
              <li>Position differentiators: {sellingPoints || "key selling points"}.</li>
              <li>Discuss MOQ, lead time, and private-label / OEM options.</li>
              <li>Agree next step: samples, quote, or follow-up call.</li>
            </ul>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
