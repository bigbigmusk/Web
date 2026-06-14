# Concord Trade — B2B Sourcing & Trade Website

International sourcing & trade partner showcase site. Built as a fast,
dependency-free static website (HTML + CSS + vanilla JS) so it can be hosted
anywhere — GitHub Pages, Netlify, Vercel, or any static host.

**Positioning:** not a product marketplace — a sourcing & trade execution partner.
> *Tell us what you need. We help you find, compare, verify, and source the right products from reliable suppliers.*

## Brand & visual system
- **Colors:** navy `#16335a` + silver `#8f99a5` on clean white / light-grey (`#f4f7fb`).
- **Style:** corporate, global, procurement-led. Abstract global-trade network graphics
  and clean SVG iconography instead of ship/container/plane stock photos or 1688-style product dumps.
- **Typography:** Inter (Google Fonts).
- All graphics are inline SVG — crisp on every screen, no image assets to manage.

## Page structure
1. **Hero** — Global Sourcing & Trade Solutions (+ RFQ / View Categories CTAs, animated world-network background)
2. **About** — who we are + capability stats
3. **What We Do** — Product Sourcing · Supplier Coordination · OEM/ODM · Quality & Sample Follow-up · Import & Export · Supply Chain Solutions
4. **Product Categories We Source** — Pet Care · Home Hygiene & Odor Control · Medical Disposables & PPE · Bags & Travel Accessories · Athleisure & Wearables
5. **How We Work** — 6-step sourcing workflow (Requirement → Long-term Supply)
6. **Why Concord Trade** — key advantages
7. **Trust & Execution** — Supplier Verification · Quality Control · Packaging Customization · Export Documentation
8. **RFQ form** — structured request for quotation
9. **Footer** — contact, LinkedIn, mission

## Sourcing Intelligence Toolkit (`/tools/`)
Two data-driven, dependency-free web apps for cross-border e-commerce product
selection — same navy/silver design system, no build step, no external libraries
(canvas charts are hand-rolled).

1. **Product Decision Engine** (`/tools/product-engine/`) — multi-factor product
   scoring (demand · growth · competition · margin · customs trade momentum ·
   logistics) with adjustable weights / strategy presets, a sortable ranking
   table, a per-category factor radar, and an automatic **blue-ocean** flag
   (high-growth × low-competition).
2. **Trend Forecasting Engine** (`/tools/trend-engine/`) — 36-month customs
   export history + 12-month forecast using a **trend (linear regression) ×
   multiplicative seasonality** ensemble with an ~80% confidence band, a
   seasonality-index chart, demand-vs-export overlay, and stocking-timing advice.

### Data & the pluggable live-data layer
- `tools/data.js` — a *representative* cross-border trade dataset (20 categories)
  calibrated against China customs (海关总署) export structure, UN Comtrade HS-code
  flows and marketplace demand signals. Monthly series are generated
  deterministically (seeded) so results are stable and reproducible. It also holds
  the shared analytics (momentum, linear regression, seasonal indices, forecast).
- `tools/charts.js` — tiny canvas chart engine (line/area + bars + radar).
- **Connecting real data:** implement the async hooks in
  `CBData.sources.customs` / `.comtrade` / `.trends` (e.g. a China Customs or
  UN Comtrade proxy, Google Trends, or a vendor like Tendata / Jungle Scout).
  Each should resolve to an array shaped like the bundled dataset. The tools call
  `CBData.load()`, which uses live data when a provider is configured and falls
  back to the bundled dataset otherwise — no UI changes needed.

> The toolkit is decision support, not a guarantee; pair it with compliance,
> logistics and supplier due-diligence.

## Contact
- Sales: `tj@concord-trade.com`
- General: `info@concord-trade.com`
- LinkedIn: https://www.linkedin.com/company/concord-trade/

## RFQ form
The form is static-host friendly: on submit it validates the required fields and
composes a structured email to `info@concord-trade.com` via `mailto:`.

**To upgrade to direct inbox delivery** (no email app popup), point the form at a
form backend such as [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com):
in `script.js`, replace the `mailto:` handler with a `fetch()` POST to your endpoint.

## Languages (i18n)
The site ships in **English · 简体中文 · Español · Français** via a header language
switcher (EN / 中文 / ES / FR). Implementation is dependency-free:
- `translations.js` — all copy for the four languages, keyed by short ids.
- `i18n.js` — applies translations to `[data-i18n]` / `[data-i18n-html]` /
  `[data-i18n-ph]` elements, keeps `<html lang>`, `<title>` and the meta
  description in sync, and remembers the choice in `localStorage`.
- Language is auto-selected on first visit from `?lang=xx`, then the saved
  choice, then the browser language (fallback English). `hreflang` alternates
  are declared in `<head>`.

## SEO & social sharing
- **Open Graph + Twitter Card** meta so links shared on LinkedIn / X / chat render a
  branded preview card (`assets/social-card.png`, 1200×630).
- **JSON-LD `Organization`** structured data (logo, slogan, product focus areas,
  LinkedIn `sameAs`, and `sales` / `customer service` contact emails) for richer
  search-engine results.
- Canonical URL + `theme-color`.

## Brand assets
The logo is the customer's official artwork (`assets/7BAC…PNG` master). The header /
footer / favicon / share card are cropped straight from it — no redrawn approximation:
```
assets/logo-mark.png          # emblem, transparent (header + JSON-LD logo)
assets/logo-wordmark.png      # "CONCORD TRADE" wordmark, transparent (header)
assets/logo-mark-white.png    # white emblem for the dark footer
assets/logo-wordmark-white.png# white wordmark for the dark footer
assets/favicon.png            # emblem on a white rounded tile
assets/social-card.svg        # source for the 1200×630 share card
assets/social-card.png        # Open Graph / Twitter share image (uses the real emblem)
```

## Files
```
index.html              # all sections / markup + i18n hooks + SEO + structured data
styles.css              # design system + responsive layout
script.js               # nav, scroll reveals, RFQ form handler
translations.js         # EN / ZH / ES / FR copy
i18n.js                 # language switcher engine
```

## Run locally
Just open `index.html`, or serve the folder:
```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deployment (Cloudflare Pages)
Static site, no build step. Hosted on **Cloudflare Pages**, connected to this
repo and auto-deploying on every push to **`main`**.

Cloudflare Pages project settings:
- Production branch: `main`
- Framework preset: `None`
- Build command: *(empty)*
- Build output directory: `/`

`_headers` (Cloudflare syntax) applies the security headers and asset caching.
The custom domain `www.concord-trade.com` is configured in the Cloudflare Pages
dashboard (Custom domains), not via a repo file.

