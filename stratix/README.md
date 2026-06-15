# STRATIX — AI Strategic Intelligence Workspace for Global Market Expansion

> **Decode markets. Map competitors. Build global growth systems.**

STRATIX turns a product into a complete global growth system — analyzing
overseas market opportunities, identifying target customers, mapping
competitors, generating export-ready English sales assets, building outbound
campaigns, and producing client-ready strategy reports.

It is built as a **strategic operating workspace**, not a chatbot. Every AI
output is structured into cards, tables, timelines, and reports, saved to the
project, editable, and exportable.

```
Product Input → Export Readiness Diagnosis → Market Opportunity → Competitor
Intelligence → Target Customer Profile → Lead Management → English Sales Assets
→ Outbound Campaigns → Proposal / Report Export → Paid Report / SaaS / Consulting
```

---

## ✨ Modules

| Module | What it does |
| --- | --- |
| **Dashboard** | Command center: readiness & opportunity scores, leads, tasks, reports, 30-day progress |
| **New Project** | Spin up a global expansion project (business type + goal + product seed) |
| **Product Lab** | Input product data → AI **Export Readiness Diagnosis** (score, markets, ICP, pricing, risks, USP, 30-day plan) |
| **Market Radar** | Score & rank overseas markets (demand, competition, price potential, channel fit, risk) |
| **Competitor X-Ray** | Reverse-engineer positioning, pricing, messaging, visual style, sales angles, differentiation |
| **Lead Finder** | Lightweight CRM — manual/CSV/AI-assisted leads, fit scoring, outreach drafts, pipeline statuses |
| **Content Studio** | Export-ready English sales assets (cold emails, LinkedIn, product copy, FAQ, brochures…) |
| **Proposal Builder** | Client/investor-ready structured reports → PDF / Word-style / CSV export |
| **Growth Command Center** | 30-day action plan, weekly milestones, daily outbound tasks |
| **Reports** | Every generated report with export + premium template prompts |
| **Settings** | Profile, company, brand voice, markets, subscription, API keys |

---

## 🧱 Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**-style component library
- **Supabase** for auth + Postgres (graceful demo mode without it)
- **OpenAI-compatible** AI integration (works with OpenAI, Azure, OpenRouter, DeepSeek, Moonshot…)
- **PDF export** (jsPDF) + **CSV/Excel export**
- Clean, modular architecture; mock data everywhere external APIs aren't available

---

## 🚀 Getting started

```bash
cd stratix
npm install
cp .env.example .env.local   # optional — app runs fully in mock mode without it
npm run dev                  # http://localhost:3000
```

Open <http://localhost:3000> for the landing page, or
<http://localhost:3000/dashboard> to jump straight into the workspace.

### Mock mode (zero config)

With **no environment variables**, STRATIX runs fully:

- **Auth** → any credentials log you straight into the workspace.
- **AI** → deterministic, business-ready mock generators (`src/lib/ai/mock.ts`)
  back every "Generate" button, so the whole product is explorable offline.
- **Data** → a realistic seed dataset (`src/lib/mock/data.ts`) spanning pet
  deodorizer, surgical sutures, sports bra, travel bag, and home-cleaning
  products populates every screen.

### Live mode

Fill in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI (OpenAI-compatible)
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
NEXT_PUBLIC_AI_ENABLED=true
```

---

## 🗄️ Database

The full Postgres schema lives in [`supabase/schema.sql`](./supabase/schema.sql)
— tables (`users`, `projects`, `products`, `market_reports`, `competitors`,
`leads`, `contents`, `reports`, `tasks`, `pricing_plans`), enums, indexes, **Row
Level Security** policies (users only see their own data), seeded pricing plans,
and a trigger that auto-provisions a `users` row on signup.

```bash
# Option A: paste schema.sql into the Supabase SQL editor and run.
# Option B (CLI):
supabase db push   # or: psql "$DATABASE_URL" -f supabase/schema.sql
```

---

## 🤖 AI prompt architecture

Reusable, typed prompt builders in [`src/lib/ai/prompts.ts`](./src/lib/ai/prompts.ts):

| Function | Output |
| --- | --- |
| `exportReadinessDiagnosisPrompt` | score, market fit, channels, ICP, risks, USP, 30-day plan |
| `marketRadarPrompt` | country opportunity table + pricing/channel/risk insight |
| `competitorXrayPrompt` | positioning, audience, pricing, messaging, visual style, sales angles, differentiation |
| `leadScoringPrompt` | fit score, reason, outreach angle, suggested message |
| `contentGenerationPrompt` | structured final copy + CTA + variants |
| `proposalBuilderPrompt` | full structured multi-section report |

The service layer ([`src/lib/ai/service.ts`](./src/lib/ai/service.ts)) calls an
OpenAI-compatible endpoint in JSON mode when `AI_API_KEY` is set, and falls back
to the mock generators otherwise (and on any provider error). The client calls
through `POST /api/ai` via the `generate()` helper.

---

## 💳 Pricing & monetization

Plans (`src/lib/mock/pricing.ts`): **Free**, **Starter** ($29/¥199), **Pro**
($99/¥699), **Business** ($299/¥1999), **Agency** ($699/¥4999), plus one-time
reports and done-for-you consulting offers. Upgrade prompts surface at the
designed monetization moments — no-watermark PDF, >3 scans, CSV lead export,
white-label proposals, advanced competitor analysis, team collaboration.

---

## 📁 Project structure

```
stratix/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/page.tsx      # Pricing
│   │   ├── login/page.tsx        # Auth (Supabase or demo)
│   │   ├── api/ai/route.ts       # AI dispatch endpoint
│   │   └── (app)/                # Authed workspace shell (sidebar + topbar)
│   │       ├── dashboard/ projects/new/ product-lab/ market-radar/
│   │       ├── competitor-xray/ lead-finder/ content-studio/
│   │       └── proposal-builder/ growth/ reports/ settings/
│   ├── components/               # UI library + feature components
│   │   └── ui/                   # shadcn-style primitives
│   └── lib/
│       ├── ai/                   # prompts, service, mock, client
│       ├── mock/                 # seed data + pricing
│       ├── supabase/             # client
│       ├── export.ts             # PDF + CSV export
│       └── types.ts              # domain types (mirror schema)
└── supabase/schema.sql           # full DB schema + RLS + seeds
```

---

## ☁️ Deploy to Cloudflare Pages (recommended)

STRATIX is configured for **Next.js static export** (`output: "export"` in
`next.config.mjs`), so Cloudflare Pages serves the generated `out/` directory
with **no server runtime** — AI runs in the browser in Demo mode.

Create a **new, separate** Pages project (this keeps the existing root marketing
site untouched):

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick this repository and the branch to deploy.
3. **Build settings:**
   - **Root directory:** `stratix`
   - **Framework preset:** `Next.js (Static HTML Export)` *(or `None`)*
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
4. **Environment variables** → add `NODE_VERSION` = `20` (Next 14 needs Node ≥ 18.17).
   Everything else is optional — it deploys fully in Demo mode.
5. **Save and Deploy.** You'll get a `https://<project>.pages.dev` URL.

> Direct deep links work because every route is exported to its own
> `out/<route>/index.html` (with `trailingSlash: true`).

### Enabling a real model on Cloudflare

The static build runs AI client-side. For live model calls, deploy with a server
runtime instead — either Vercel (below) or Cloudflare via
[`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages) — then
re-add the `src/app/api/ai/route.ts` handler (logic preserved in
`src/lib/ai/service.ts`) and set `AI_API_KEY` + `NEXT_PUBLIC_AI_ENABLED=true`.

## ▲ Deploy to Vercel (alternative — supports live server AI)

1. Vercel → **New Project** → import the repo.
2. **Set the Root Directory to `stratix/`**.
3. Remove `output: "export"` from `next.config.mjs` and restore
   `src/app/api/ai/route.ts` if you want the server AI endpoint.
4. Add env vars from `.env.example` (optional). Deploy. 🎉

> The repository root also contains a separate static marketing site (Concord
> Trade) that deploys independently; keeping STRATIX in `stratix/` avoids any
> conflict.

---

## 📜 License

Prototype / MVP for demonstration. © 2026 STRATIX.
