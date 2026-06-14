"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Compass,
  Loader2,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { getProduct, getRadar } from "@/lib/mock/data";
import { generate } from "@/lib/ai/client";
import { cn, scoreTone } from "@/lib/utils";
import type { CountryOpportunity } from "@/lib/types";

interface RadarData {
  countries: CountryOpportunity[];
  pricing_insight: string;
  channel_recommendation: string;
  risk_notes: string;
}

const toneBadge: Record<string, "success" | "warning" | "danger"> = {
  high: "success",
  medium: "warning",
  low: "danger",
};

function demandVariant(
  level: CountryOpportunity["demand_level"]
): "success" | "warning" | "secondary" {
  if (level === "Very High" || level === "High") return "success";
  if (level === "Moderate") return "warning";
  return "secondary";
}

function competitionVariant(
  level: CountryOpportunity["competition_level"]
): "danger" | "warning" | "success" {
  if (level === "Intense") return "danger";
  if (level === "High") return "warning";
  return "success";
}

function priceVariant(
  level: CountryOpportunity["price_potential"]
): "accent" | "success" | "secondary" {
  if (level === "Premium") return "accent";
  if (level === "High") return "success";
  return "secondary";
}

export default function MarketRadarPage() {
  const { activeProject, activeProjectId } = useProject();
  const product = useMemo(
    () => getProduct(activeProjectId),
    [activeProjectId]
  );

  const [data, setData] = useState<RadarData | null>(
    () => getRadar(activeProjectId) ?? null
  );
  const [candidates, setCandidates] = useState(
    () => (getRadar(activeProjectId)?.countries ?? [])
      .slice(0, 3)
      .map((c) => c.country)
      .join(", ")
  );
  const [live, setLive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRescan() {
    setLoading(true);
    setError(null);
    try {
      const targetCountries = candidates
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      const { result, live: isLive } = await generate<RadarData>("marketRadar", {
        category: activeProject.product_category,
        productName: product?.product_name ?? activeProject.project_name,
        targetCountries,
      });
      setData(result);
      setLive(isLive);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Market radar scan failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const recommended = data?.countries.find((c) => c.recommended_first);

  return (
    <>
      <PageHeader
        title="Market Radar"
        description="Score and rank overseas markets by real opportunity, not guesswork."
        icon={Radar}
      >
        <Button variant="accent" size="sm" onClick={handleRescan} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Re-scan markets
        </Button>
      </PageHeader>

      {/* Control row */}
      <Card className="mt-6">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label>Candidate markets</Label>
            <Textarea
              value={candidates}
              onChange={(e) => setCandidates(e.target.value)}
              rows={2}
              placeholder="Add countries, comma separated — e.g. United States, Germany, Australia"
            />
            <p className="text-xs text-muted-foreground">
              Scanning <span className="font-medium text-foreground">{activeProject.product_category}</span>{" "}
              for {product?.product_name ?? activeProject.project_name}.
            </p>
          </div>
          <Button
            variant="accent"
            size="lg"
            className="sm:w-auto"
            onClick={handleRescan}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Scanning…
              </>
            ) : (
              <>
                <Radar /> Re-scan markets
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> {error}
        </p>
      )}

      <div className="relative mt-6 space-y-6">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-start justify-center pt-20">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              Scoring markets…
            </div>
          </div>
        )}

        {data ? (
          <div className={cn("space-y-6", loading && "opacity-50")}>
            {/* Recommended first market */}
            {recommended && (
              <Card className="border-accent/40 bg-accent/5">
                <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-center">
                  <ScoreGauge
                    score={recommended.opportunity_score}
                    label="Opportunity"
                    size={128}
                  />
                  <div className="flex-1 space-y-2">
                    <Badge variant="accent" className="gap-1">
                      <Target className="h-3 w-3" /> Recommended first market
                    </Badge>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                      {recommended.country}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {recommended.recommendation}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant={demandVariant(recommended.demand_level)}>
                        Demand: {recommended.demand_level}
                      </Badge>
                      <Badge variant={competitionVariant(recommended.competition_level)}>
                        Competition: {recommended.competition_level}
                      </Badge>
                      <Badge variant={priceVariant(recommended.price_potential)}>
                        Price: {recommended.price_potential}
                      </Badge>
                    </div>
                  </div>
                  {live !== null && (
                    <Badge variant={live ? "success" : "accent"}>
                      {live ? "AI Live" : "AI Demo"}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Country opportunity cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.countries.map((c) => (
                <Card
                  key={c.country}
                  className={cn(c.recommended_first && "border-accent/40")}
                >
                  <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                    <div>
                      <CardTitle className="text-base">{c.country}</CardTitle>
                      {c.recommended_first && (
                        <Badge variant="accent" className="mt-1.5">
                          First market
                        </Badge>
                      )}
                    </div>
                    <ScoreGauge score={c.opportunity_score} size={64} />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress
                      value={c.opportunity_score}
                      indicatorClassName={
                        scoreTone(c.opportunity_score) === "high"
                          ? "bg-success"
                          : scoreTone(c.opportunity_score) === "medium"
                            ? "bg-warning"
                            : "bg-destructive"
                      }
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={demandVariant(c.demand_level)}>
                        {c.demand_level} demand
                      </Badge>
                      <Badge variant={competitionVariant(c.competition_level)}>
                        {c.competition_level} competition
                      </Badge>
                      <Badge variant={priceVariant(c.price_potential)}>
                        {c.price_potential} price
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium text-foreground">Channel fit: </span>
                        <span className="text-muted-foreground">{c.channel_fit}</span>
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Risk: </span>
                        <span className="text-muted-foreground">{c.risk_notes}</span>
                      </p>
                    </div>
                    <p className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-2.5 text-sm">
                      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="text-muted-foreground">{c.recommendation}</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full output table */}
            <Card>
              <CardHeader>
                <CardTitle>Opportunity scorecard</CardTitle>
                <CardDescription>
                  Every candidate market ranked across the signals that decide entry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Demand</TableHead>
                      <TableHead>Competition</TableHead>
                      <TableHead>Price potential</TableHead>
                      <TableHead>Channel fit</TableHead>
                      <TableHead>Risk notes</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.countries.map((c) => (
                      <TableRow
                        key={c.country}
                        className={cn(c.recommended_first && "bg-accent/5")}
                      >
                        <TableCell className="font-medium text-foreground">
                          {c.country}
                          {c.recommended_first && (
                            <Badge variant="accent" className="ml-2">
                              1st
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={toneBadge[scoreTone(c.opportunity_score)]}
                            className="tabular-nums"
                          >
                            {c.opportunity_score}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={demandVariant(c.demand_level)}>
                            {c.demand_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={competitionVariant(c.competition_level)}>
                            {c.competition_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priceVariant(c.price_potential)}>
                            {c.price_potential}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[14rem] text-muted-foreground">
                          {c.channel_fit}
                        </TableCell>
                        <TableCell className="max-w-[16rem] text-muted-foreground">
                          {c.risk_notes}
                        </TableCell>
                        <TableCell className="max-w-[16rem] text-muted-foreground">
                          {c.recommendation}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Bottom insight cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-accent" /> Pricing insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {data.pricing_insight}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Compass className="h-4 w-4 text-accent" /> Channel recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {data.channel_recommendation}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-warning/30 bg-warning/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-warning" /> Risk notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {data.risk_notes}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Radar className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Add candidate markets and run a scan to rank opportunities.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
