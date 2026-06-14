# China West Journeys — Private Western China Tours

A premium, editorial website for **China West Journeys**, a boutique inbound
travel company specializing in **private, tailor-made Western China tours** for
international travelers. Built as a fast, dependency-free static site
(HTML + CSS + vanilla JS) — no build step — so it can be hosted anywhere
(Cloudflare Pages, GitHub Pages, Netlify, Vercel, any static host).

> **Positioning:** Western China, thoughtfully planned. Private journeys across
> Tibet, Xinjiang, Sichuan & Chengdu, Yunnan, Qinghai, and Gansu & the Silk Road.

## Brand & visual system
- **Palette:** warm ivory `#f7f3ec` background · deep charcoal `#23211d` text ·
  sand/stone `#e3d8c5` · muted terracotta `#b3623f` accent · deep teal /
  mountain green `#1f4a45` · Silk Road rust `#9a4a2b` (sparing).
- **Type:** Fraunces (serif display) for headlines · Inter (sans) for body.
- **Style:** premium, editorial, cinematic, calm — National Geographic /
  Monocle / Aman influences. No red-and-gold cliché, no dragons/pandas/lanterns,
  no heavy stock-photo feeling.
- **Imagery:** scenic placeholders are built from layered CSS gradients
  (`.scene-tibet`, `.scene-xinjiang`, `.scene-gansu`, …) so there are no image
  assets to manage. Swap in real photography later by replacing the `.scene`
  backgrounds in `styles.css` with `background-image`.

## Pages & URL structure
```
/                                        Home
/destinations/                           Destinations hub
/destinations/tibet/
/destinations/xinjiang/
/destinations/sichuan-chengdu/
/destinations/yunnan/
/destinations/qinghai/
/destinations/gansu-silk-road/
/tours/                                  Filterable tour listing
/tours/xinjiang-silk-road-adventure/     Sample tour detail page
/custom-trips/                           Tailor-made inquiry form
/travel-guide/                           SEO article index
/about/
/faq/
/contact/
```

## Files
```
index.html        Home (all 10 sections, SEO + structured data)
styles.css        Design system + responsive layout
script.js         Nav, scroll reveals, FAQ accordions, tour filters, form handling
sitemap.xml       All page URLs
robots.txt        Crawl directives + sitemap reference
llms.txt          AI-search / GEO summary of the brand and site
assets/favicon.svg  Sun-over-mountain brand mark
```

## SEO & GEO (AI search)
- Per-page `<title>`, meta description, canonical, Open Graph + Twitter tags.
- Entity-based copy throughout (brand entity: *“China West Journeys is a boutique
  inbound travel company specializing in private Western China tours for
  international travelers.”*).
- Structured data (JSON-LD): `TravelAgency` / `Organization`, `WebSite`,
  `TouristTrip`, `FAQPage`, `BreadcrumbList`, and article/collection schema on
  the travel guide.
- `llms.txt` provides a clean, link-rich brand summary for AI search engines.
- Strong internal linking: destinations ↔ tours ↔ custom-trip inquiry.

## Forms
All inquiry forms are static-host friendly. On submit (`form[data-inquiry]`)
the handler in `script.js` validates required fields and composes a structured
`mailto:` to `hello@chinawestjourneys.com`. To deliver straight to an inbox
(no mail-app popup), point the handler at a form backend such as
[Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) — replace
the `mailto:` block in `script.js` with a `fetch()` POST to your endpoint.

## Customising before launch
- Replace placeholder contact details: `hello@chinawestjourneys.com`, the
  WhatsApp number (`wa.me/000000000000` and `+00 0000 000000`).
- Set the real domain in `sitemap.xml`, `robots.txt`, `llms.txt`, and the
  `canonical` / Open Graph URLs in each page.
- Add real photography by swapping the `.scene-*` gradient backgrounds.

## Run locally
```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## Deployment
Static site, no build step. `_headers` (Cloudflare syntax) applies security
headers and long-cache rules for assets. Point your static host's output
directory at the repo root.
