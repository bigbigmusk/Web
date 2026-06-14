"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  User as UserIcon,
  Building2,
  Mic2,
  Globe2,
  CreditCard,
  KeyRound,
  Check,
  Sparkles,
  ArrowUpRight,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CURRENT_USER } from "@/lib/mock/data";
import { PRICING_PLANS } from "@/lib/mock/pricing";
import { cn } from "@/lib/utils";

const TONE_PRESETS = [
  "Confident",
  "Strategic",
  "Warm",
  "Direct",
  "Premium",
  "Analytical",
];

const MARKET_OPTIONS = [
  "United States",
  "United Kingdom",
  "Germany",
  "United Arab Emirates",
  "Canada",
  "Australia",
  "Japan",
  "France",
];

const LANGUAGES = ["English", "German", "French", "Spanish", "Japanese"];

export default function SettingsPage() {
  // Profile
  const [name, setName] = useState(CURRENT_USER.name);
  const [email, setEmail] = useState(CURRENT_USER.email);
  const [role, setRole] = useState(CURRENT_USER.role);

  // Company
  const [companyName, setCompanyName] = useState(CURRENT_USER.company_name);
  const [website, setWebsite] = useState("https://meridian-export.studio");
  const [about, setAbout] = useState(
    "Meridian Export Studio helps Chinese manufacturers and DTC brands launch into Western markets with sharp positioning, English sales assets, and outbound systems."
  );

  // Brand voice
  const [brandVoice, setBrandVoice] = useState(
    "Smart, strategic, and sharp. We speak like a senior export consultant — confident, analytical, and globally minded, never salesy or childish."
  );

  // Markets
  const [markets, setMarkets] = useState<string[]>([
    "United States",
    "United Kingdom",
    "Germany",
  ]);
  const [language, setLanguage] = useState("English");

  // API keys
  const [apiKey, setApiKey] = useState("");

  // Save state per-section
  const [saved, setSaved] = useState<string | null>(null);

  function markSaved(section: string) {
    setSaved(section);
    setTimeout(() => setSaved((cur) => (cur === section ? null : cur)), 2000);
  }

  function toggleMarket(market: string) {
    setMarkets((cur) =>
      cur.includes(market)
        ? cur.filter((m) => m !== market)
        : [...cur, market]
    );
  }

  const plan =
    PRICING_PLANS.find((p) => p.id === CURRENT_USER.plan) ?? PRICING_PLANS[0];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, brand voice, markets, and subscription."
        icon={Settings}
      />

      <Tabs defaultValue="profile">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="profile">
            <UserIcon className="mr-1.5 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="mr-1.5 h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="brand">
            <Mic2 className="mr-1.5 h-4 w-4" />
            Brand Voice
          </TabsTrigger>
          <TabsTrigger value="markets">
            <Globe2 className="mr-1.5 h-4 w-4" />
            Markets
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCard className="mr-1.5 h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="api">
            <KeyRound className="mr-1.5 h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* PROFILE */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                How you appear across STRATIX and on generated assets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field id="name" label="Full name">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field id="email" label="Email">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field id="role" label="Role" className="md:col-span-2">
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </Field>
              </div>
              <SaveRow
                section="profile"
                saved={saved}
                onSave={() => markSaved("profile")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPANY */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company</CardTitle>
              <CardDescription>
                Used to personalize proposals, brand kits, and outbound copy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field id="company-name" label="Company name">
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </Field>
                <Field id="website" label="Website">
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </Field>
                <Field id="about" label="About" className="md:col-span-2">
                  <Textarea
                    id="about"
                    rows={4}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                  />
                </Field>
              </div>
              <SaveRow
                section="company"
                saved={saved}
                onSave={() => markSaved("company")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRAND VOICE */}
        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle>Brand voice</CardTitle>
              <CardDescription>
                STRATIX writes every asset in this tone. Tap a preset to nudge
                it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field id="brand-voice" label="Voice & tone guidelines">
                <Textarea
                  id="brand-voice"
                  rows={5}
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                />
              </Field>
              <div className="space-y-2">
                <Label>Tone presets</Label>
                <div className="flex flex-wrap gap-2">
                  {TONE_PRESETS.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() =>
                        setBrandVoice((cur) =>
                          cur.includes(tone) ? cur : `${cur} ${tone}.`.trim()
                        )
                      }
                    >
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:border-accent hover:text-accent"
                      >
                        {tone}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
              <SaveRow
                section="brand"
                saved={saved}
                onSave={() => markSaved("brand")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* MARKETS */}
        <TabsContent value="markets">
          <Card>
            <CardHeader>
              <CardTitle>Target markets</CardTitle>
              <CardDescription>
                Preferred markets and default language for new projects and
                scans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Preferred target markets</Label>
                <div className="flex flex-wrap gap-2">
                  {MARKET_OPTIONS.map((market) => {
                    const active = markets.includes(market);
                    return (
                      <button
                        key={market}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleMarket(market)}
                      >
                        <Badge
                          variant={active ? "accent" : "outline"}
                          className={cn(
                            "cursor-pointer gap-1 transition-colors",
                            !active && "hover:border-accent hover:text-accent"
                          )}
                        >
                          {active && <Check className="h-3 w-3" />}
                          {market}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {markets.length} market{markets.length === 1 ? "" : "s"}{" "}
                  selected
                </p>
              </div>
              <div className="max-w-xs space-y-1.5">
                <Label htmlFor="language">Default language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <SaveRow
                section="markets"
                saved={saved}
                onSave={() => markSaved("markets")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBSCRIPTION */}
        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Current plan</CardTitle>
                  <CardDescription>{plan.tagline}</CardDescription>
                </div>
                <Badge variant="accent" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {plan.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums tracking-tight">
                  ${plan.price_usd}
                </span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <Separator />
              <ul className="grid gap-2 sm:grid-cols-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline">
                <Link href="/pricing">
                  Manage subscription
                  <ArrowUpRight />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <UpgradePrompt
            variant="card"
            title="Go white-label with Agency"
            description="Unlock white-label reports, client workspaces, batch project generation, and team permissions built for consultants and agencies."
            cta="Compare plans"
          />
        </TabsContent>

        {/* API KEYS */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API keys</CardTitle>
              <CardDescription>
                Bring your own OpenAI-compatible key to run live generations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field id="api-key" label="OpenAI-compatible API key">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </Field>
              <UpgradePrompt
                variant="inline"
                description="STRATIX runs in demo mode without a key — set AI_API_KEY in your environment to enable live AI generations."
                cta="Learn more"
              />
              <SaveRow
                section="api"
                saved={saved}
                onSave={() => markSaved("api")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Field({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function SaveRow({
  section,
  saved,
  onSave,
}: {
  section: string;
  saved: string | null;
  onSave: () => void;
}) {
  const isSaved = saved === section;
  return (
    <div className="flex items-center gap-3">
      <Button variant="accent" onClick={onSave}>
        Save changes
      </Button>
      {isSaved && (
        <span className="flex items-center gap-1 text-sm font-medium text-success">
          <Check className="h-4 w-4" />
          Saved
        </span>
      )}
    </div>
  );
}
