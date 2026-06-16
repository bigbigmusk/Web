# VANTAIRE — Architectural Openwork Leather Footwear

A luxury, minimalist single-page brand site for **VANTAIRE**, a fictional
international designer shoe house. Built as a fast, dependency-free static
website (HTML + CSS + vanilla JS) so it can be hosted anywhere.

**Positioning:** architectural summer leather footwear — black openwork
leather, woven lattice structures, breathable cut-outs, and low heels, in a
quiet-luxury register.
> *Leather, Cut With Air.*

## Design system
- **Colors:** Obsidian black `#0B0B0B` · Ivory bone `#F4EFE7` · Warm stone
  `#C8BBA8` · Oxide gold `#A88755` · Deep oxblood `#4B1118`.
- **Type:** Cormorant Garamond (high-contrast serif headings) + Inter (clean
  sans body & uppercase nav). Large whitespace, editorial spacing.
- **Look:** quiet luxury, editorial / gallery layout, warm minimalism — no
  gradients, no bright colors, no cheap-template ecommerce styling.

## Page structure
1. **Hero** — `Leather, Cut With Air.` + Shop The Lattice Collection CTA.
2. **Manifesto** — *The shoe that breathes.*
3. **Collection grid** — The Cage Flat · The Split Slide · The Knot Mule ·
   The Woven Loafer · The Ribbon Mary Jane.
4. **Craft** — *Built from absence.* (lattice leather, breathable structure,
   hand-woven feeling, cushioned footbed, flexible outsole).
5. **Lookbook** — editorial scenes across galleries and quiet hotels.
6. **Newsletter** — *Enter the air.* + Join the list.

## Product imagery
The five products are rendered as **crisp inline SVG** shoe silhouettes filled
with distinct woven/lattice leather patterns (defined once in `<defs>` and
reused) — architectural and on-brand, with no image assets to manage and
perfect scaling on every screen.

**To swap in real product photography:** replace the `<svg class="shoe …">`
inside each `.product-media` (and the hero `.hero-frame`) with an `<img>`
pointing at your photo. Keep the warm-stone backdrop for a consistent gallery feel.

## Files
```
index.html   # all sections + inline SVG art + SEO meta
styles.css   # design system + responsive layout
script.js    # nav, header state, scroll reveals, newsletter
```

## Run locally
```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## Deployment
Static site, no build step — hosts on Cloudflare Pages, Netlify, Vercel, or
GitHub Pages. `_headers` carries security headers and asset caching
(Cloudflare syntax). `wrangler.toml` configures the Cloudflare Worker.
