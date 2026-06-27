# GOGO CHINA TRIPS — C-end website

Customer-facing marketing & booking site for **GOGO CHINA TRIPS**, a platform that
makes it easy for foreign travellers and business visitors to discover, book and
enjoy local experiences in China.

Built as a fast, dependency-free static website (HTML + CSS + vanilla JS) so it can
be hosted anywhere — Cloudflare Pages/Workers, GitHub Pages, Netlify, Vercel, or any
static host.

> **Positioning (PRD):** not a traditional travel-agency brochure — a *standard
> China-travel product marketplace + human service desk + partner distribution
> network*. The C-end builds trust and takes the order.

**Core claim:** *China, made easy. — 让来中国这件事，变简单。*

## Implements the PRD

This site implements the C-end scope of the GOGO CHINA TRIPS PRD v1.0:

- **Information architecture (§5.1):** Trips · Destinations · Private Guides ·
  Business Travel · Plan My Trip · Help · Order lookup, plus a partner entry near
  the footer.
- **Homepage requirements (§7.1):** first-screen search (`WEB-HOME-001`), quick
  entries (`-002`), popular/hero products (`-003`), browse-by-purpose (`-004`),
  trust module (`-005`), dark business module (`-006`), city entries (`-007`) and a
  low-prominence partner entry (`-008`).
- **Hero products (§4.3):** First Day in China, Private Guide 4H / 8H, Trade Fair
  Companion, with honest *“request to confirm” / project quote* labelling and real
  “from” prices (§10.2 — no fake inventory or bait pricing).
- **Booking flow (§6.1):** a four-step “choose & pay → we confirm → trip card →
  enjoy & review” explainer, including the no-order-left-waiting rule.
- **Lead capture (§7.5):** business and custom-trip request forms with attribution
  (partner invite code) and separate consent.
- **Design system (§12):** brand tokens, type and radii applied exactly (see below).
- **Content rules (§12.3):** no fabricated star ratings, reviewer counts or partner
  logos — trust is built from real support, transparent pricing and the confirmation
  process instead.
- **Accessibility (§12.4):** skip link, keyboard-operable nav/forms, status conveyed
  with text (not colour alone), 44px-friendly targets, `prefers-reduced-motion`.

## Brand & visual system (PRD §12.1)

| Token | Name | Value | Use |
|---|---|---|---|
| Primary | GoGo Orange | `#FF5A36` | Main CTAs, prices, active state |
| Dark | China Night | `#13233A` | Titles, nav, business module |
| Background | Rice White | `#FFF8F0` | Warm main background |
| Accent | Jade Mint | `#32B6A5` | Confirmation, reliable, local service |
| Highlight | Electric Yellow | `#FFD84D` | Small highlights |
| Neutral | Cloud Grey / Border | `#F3F5F6` / `#DDE2E5` | Surfaces, lines |

- **Type:** Sora (headings) + Inter (body) + Noto Sans SC (Chinese) via Google Fonts.
- **Radii:** Card 16px / Button 12px.
- **Graphics:** brand mark and icons are inline SVG / emoji and CSS gradients — crisp
  on every screen, no image assets to manage. Replace the gradient product/city
  panels with licensed photography per §12.3 (record source, licence and expiry).

## Page structure

1. **Utility bar** — claim, Help, Order lookup, Partners, language.
2. **Header / nav** — IA navigation + Explore trips CTA + mobile menu.
3. **Hero** — “China, made easy.” + first-screen search + quick-start chips.
4. **Trust bar** — English support · transparent prices · secure payment · real guides.
5. **Browse by purpose** — First Day in China, Private Guides, Food, Culture, Family, Business.
6. **Popular / hero products** — First Day in China, Private Guide 4H / 8H, Trade Fair Companion.
7. **Destinations** — Beijing / Shanghai / Guangzhou (+ coming-soon cities).
8. **Business module** (dark) — services + project-quote request form.
9. **How booking works** — 4-step reliable booking flow.
10. **Why GoGo** — Easy · Local · Reliable · Human · Scalable.
11. **Plan My Trip** — custom-trip request form.
12. **Help & order lookup** — FAQ + order-number/email lookup.
13. **Partner CTA** — become a partner (near footer).
14. **Footer** — explore / support / company links.

## Forms

Forms are static-host friendly: on submit they validate and show an inline
confirmation. To deliver to an inbox, point them at a form backend (Formspree,
Web3Forms) or the real API/checkout (`WEB-CHK`, `WEB-BIZ`, `WEB-CUS`) in `script.js`.
The hero search currently scrolls to Trips and writes filters to the URL; in
production it routes to the product list (`WEB-LIST`) with the filters preserved.

## Files

```
index.html    # all sections / markup + SEO + structured data
styles.css    # design system (brand tokens) + responsive layout
script.js     # nav, scroll reveals, search routing, form handlers
sitemap.xml   # sitemap
robots.txt    # crawl rules
llms.txt      # LLM-readable site summary
```

## Run locally

```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## Deployment (Cloudflare)

Static site, no build step. `wrangler.toml` keeps the existing Worker name so the
custom domain stays attached. `_headers` applies security headers and asset caching.
Point the production custom domain to `www.gogochinatrips.com` in the Cloudflare
dashboard.
