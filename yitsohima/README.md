# Himalaya Atelier — Himalayan jewelry storefront (template)

A dependency-free static **e-commerce template** modeled on the *structure and
visual language* of a Himalayan spiritual-jewelry storefront (the kind of site
yitsohima.com is). It reproduces the layout, page flow, and shopping experience
of such a store so it can be used as a starting point — **all brand names, copy,
products, and imagery here are placeholders**, not copied from any live site.

> ⚠️ "Himalaya Atelier" is a fictional placeholder brand. Swap in your own brand,
> copy, product data, and photography before publishing. Do not reuse another
> store's trademark, product photos, or original copy.

## What's included

| Page | File | Notes |
|------|------|-------|
| Home | `index.html` | Announcement bar, hero, value props, featured grid, brand story, journal teaser, $10 community signup |
| Shop all | `collections/index.html` | Full product grid with hover "quick add" |
| Product detail | `products/index.html?id=<id>` | One dynamic page driven by `?id=`; gallery, finish swatches, qty, related products |
| Who is Charu | `about/index.html` | Brand story + sustainability + values |
| Journal | `journal/index.html` | Blog listing ("Charu · Living Himalaya") |

## How it works

- **No build step, no dependencies** — plain HTML + CSS + vanilla JS. Just open
  `index.html` or serve the folder.
- **`styles.css`** — full design system (Himalayan earthen palette: cream, deep
  indigo, copper, turquoise, antique gold; Cormorant Garamond + Jost fonts).
- **`script.js`** — the whole storefront engine:
  - `PRODUCTS` array = the catalog (edit here to change products).
  - Renders any `<div data-products="all|featured|related">` into a grid.
  - Renders the product page from `#pdpMount` + `?id=`.
  - **Cart drawer** persisted in `localStorage` (`himalaya_cart_v1`): add/remove,
    qty steppers, subtotal, and a free-shipping progress bar at $199.
  - Mobile nav, scroll-reveal animations, newsletter demo handler.
- **Placeholder media** — every image is an inline-SVG emblem (mountain, endless
  knot, lotus, bagua, om, mala bead, sun, leaf) on a tinted tile, labelled
  "Image placeholder". Replace `.ph` blocks with real `<img>` tags when ready.

`data-base` on `<body>` (`""` at root, `"../"` in subfolders) lets the shared JS
resolve links correctly from any depth.

## Promotions modeled (placeholder values)

Free shipping over $199 · Buy 2 save 5% · Buy 3 save 10% · $10 for joining the
community. These mirror the *kind* of offers such stores run — adjust to yours.

## Customise

1. **Brand** — replace "Himalaya Atelier", the inline SVG logo mark, and footer text.
2. **Products** — edit the `PRODUCTS` array in `script.js` (id, name, cat, price,
   was, tone, emblem, badge, rating, blurb).
3. **Images** — swap `.ph` placeholder blocks for real `<img src>`; remove the
   `.ph-label`.
4. **Checkout** — this is a front-end demo; wire the cart to a real backend
   (Shopify, Snipcart, Stripe, etc.) for live payments.

## Run locally

```bash
cd yitsohima
python3 -m http.server 8000
# → http://localhost:8000
```
