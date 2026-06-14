"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderPlus,
  Factory,
  ShoppingBag,
  Ship,
  Briefcase,
  Rocket,
  Boxes,
  Search,
  Globe2,
  Sparkles,
  FileText,
  ClipboardList,
  Crosshair,
  Tent,
  Megaphone,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { BusinessGoal, BusinessType } from "@/lib/types";

const BUSINESS_TYPES: { value: BusinessType; icon: LucideIcon }[] = [
  { value: "Manufacturer", icon: Factory },
  { value: "DTC Brand", icon: ShoppingBag },
  { value: "Export Company", icon: Ship },
  { value: "Consultant / Agency", icon: Briefcase },
  { value: "B2B Startup", icon: Rocket },
  { value: "Other", icon: Boxes },
];

const BUSINESS_GOALS: { value: BusinessGoal; icon: LucideIcon }[] = [
  { value: "Find overseas buyers", icon: Search },
  { value: "Test a new market", icon: Globe2 },
  { value: "Build a DTC brand", icon: ShoppingBag },
  { value: "Generate English sales assets", icon: Sparkles },
  { value: "Create client proposal", icon: FileText },
  { value: "Analyze competitors", icon: Crosshair },
  { value: "Prepare for trade show", icon: Tent },
  { value: "Build outbound sales system", icon: Megaphone },
];

const CATEGORIES = [
  "Pet Care",
  "Medical Disposables",
  "Athleisure",
  "Bags & Travel",
  "Home Cleaning",
  "Other",
];

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState<BusinessType | null>(null);
  const [goal, setGoal] = useState<BusinessGoal | null>(null);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [targetMarket, setTargetMarket] = useState("");

  const [created, setCreated] = useState(false);

  const canSubmit = name.trim().length > 0 && type !== null && goal !== null;

  if (created) {
    return (
      <>
        <PageHeader
          title="New Project"
          description="Spin up a new global expansion project in under a minute."
          icon={FolderPlus}
        />
        <Card className="mx-auto max-w-xl">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="rounded-full bg-success/10 p-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Project created
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {name.trim()}
                </span>{" "}
                is ready. Run your Export Readiness Diagnosis in Product Lab to
                get a priority market and an action plan.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="accent" asChild>
                <Link href="/product-lab">
                  Open Product Lab
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCreated(false);
                  setName("");
                  setType(null);
                  setGoal(null);
                  setProductName("");
                  setCategory("");
                  setDescription("");
                  setTargetMarket("");
                }}
              >
                Create another
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="New Project"
        description="Spin up a new global expansion project in under a minute."
        icon={FolderPlus}
      />

      {/* Section 1 — project basics */}
      <Card>
        <CardHeader>
          <CardTitle>1 · Project basics</CardTitle>
          <CardDescription>
            Name your project and tell STRATIX who you are and what success looks
            like.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-md space-y-1.5">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              placeholder="e.g. PawFresh — US & EU Launch"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Business type</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BUSINESS_TYPES.map(({ value, icon: Icon }) => (
                <SelectableCard
                  key={value}
                  label={value}
                  icon={Icon}
                  selected={type === value}
                  onClick={() => setType(value)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Business goal</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BUSINESS_GOALS.map(({ value, icon: Icon }) => (
                <SelectableCard
                  key={value}
                  label={value}
                  icon={Icon}
                  selected={goal === value}
                  onClick={() => setGoal(value)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — product seed */}
      <Card>
        <CardHeader>
          <CardTitle>2 · Product seed</CardTitle>
          <CardDescription>
            A quick product snapshot so your first scan has something to chew on.
            Optional, but recommended.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product name</Label>
            <Input
              id="product-name"
              placeholder="e.g. PawFresh Pet Deodorizer Spray"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-category">Product category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="product-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="product-description">Short description</Label>
            <Textarea
              id="product-description"
              rows={3}
              placeholder="What is it, who is it for, and why does it win?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target-market">Target market</Label>
            <Input
              id="target-market"
              placeholder="e.g. United States"
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Card>
        <CardContent className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-medium text-foreground">Ready to launch?</p>
            <p className="text-muted-foreground">
              {canSubmit
                ? "We'll create the project and queue your first Export Readiness scan."
                : "Add a project name and pick a business type and goal to continue."}
            </p>
          </div>
          <Button
            variant="accent"
            size="lg"
            disabled={!canSubmit}
            onClick={() => setCreated(true)}
          >
            <Rocket />
            Create project &amp; run first scan
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function SelectableCard({
  label,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border bg-card p-3 text-left shadow-sm transition-all hover:border-accent/60 hover:bg-secondary/40",
        selected
          ? "border-accent ring-2 ring-accent/40"
          : "border-border"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5",
          selected ? "text-accent" : "text-muted-foreground"
        )}
      />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
}
