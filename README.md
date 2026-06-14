# Oddpeel — B2C website

> Weird looks good. / Oddly perfect. / 奇怪的刚刚好。

A fast, static B2C marketing + catalog site for **Oddpeel**, a fun statement-sock
brand. No build step, no framework — just HTML, CSS, and a little vanilla JS.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Homepage: hero, bestsellers, brand promise, build-a-box, story, reviews, newsletter |
| `shop.html` | Full catalog with category filters + build-a-box CTA |
| `about.html` | Brand story, values, sustainability stats |
| `contact.html` | Contact form, support channels, FAQ (with FAQ schema) |

## How it works

- **Styling** lives in `styles.css` — a single sticker-style design system
  (brand tokens, buttons, cards, layout, responsive rules).
- **Behavior** lives in `script.js`:
  - The product catalog is defined once in the `PRODUCTS` array.
  - Bestsellers (home) and the full grid + filters (shop) render from that array.
  - A lightweight cart counter persists in `localStorage` with an "added" toast.
  - Mobile nav, newsletter, and contact form handlers.
- **Brand art** is all SVG in `assets/`:
  - `mascot-banana.svg`, `favicon.svg`, `social-card.svg`
  - `assets/socks/*.svg` — patterned sock illustrations.

### Regenerating the sock illustrations

The sock SVGs are produced by a small generator so patterns stay consistent:

```bash
python3 assets/gen_socks.py
```

Edit the `SOCKS` list in `assets/gen_socks.py` to add styles or change colors.
The script is excluded from the published site via `.assetsignore`.

### Editing the catalog

Add or change products in the `PRODUCTS` array near the top of `script.js`.
Each product needs an `id`, `name`, `desc`, `price`, `img`, `tint` (background
class), `cat` (filter tags), and optional `tag`/`tagClass` badge.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Configured for Cloudflare (static assets) via `wrangler.toml` + `_headers`.
Set the project `name` in `wrangler.toml` and attach your domain before going live.
