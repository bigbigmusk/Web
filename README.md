# Monsterpp — brand & e-commerce site

> **We make things more fun.**
> Clothes for the little monster living inside you.

A complete, launch-ready, responsive brand + e-commerce site for **Monsterpp** — a
playful, gender-free, character-driven streetwear brand (phone cases, eyewear,
hats, tees, flip-flops, jewelry and more).

Built as a fast, **dependency-free static site** (HTML + CSS + vanilla JS) so it
hosts anywhere — Cloudflare Pages, GitHub Pages, Netlify, Vercel. No build step,
no framework, no image assets to manage (all art is inline SVG, generated in code).

---

## Design concept

The visual formula:

> Lazy Oaf's brand personality · ADER ERROR's page structure · GCDS-style hero
> products · Outsiders Division's character world · Brain Dead's graphic culture ·
> Golf Wang's colour discipline · Heaven's editorial feel · Madhappy's commercial clarity.

**Keywords:** Quirky · Playful · Bold · Graphic · Fashion-led · Character-driven ·
Color-disciplined · Editorial · Wearable · Memorable.

Disciplined colour use: ~60% black / cream / white, ~25% accent colours, ~15%
seasonal clashes. Big black ink lines, light rounding, marker-style doodles,
generous whitespace — never a children's website, never a cheap template.

---

## Pages

| File | Page |
|------|------|
| `index.html` | Homepage (hero, drop, characters, shop-by-mood, hero product story, editorial, club, social) |
| `collection.html` | Shop / collection page — live filters (category, color, character, mood, size, price), sort |
| `product.html` | Product detail — gallery, colour/size variants, accordion, character personality, recommendations, sticky mobile buy |
| `characters.html` | Character Universe — the six monsters + detail blocks |
| `about.html` | About / Monster World — manifesto, values, founder story |
| `club.html` | Monsterpp Club — membership, perks, "which monster are you?" quiz |
| `404.html` | Lost-monster 404 |

Shared chrome (announcement bar, header, **mobile menu**, **cart drawer**,
**search overlay**, footer) and all interactions are injected by `app.js` on every
page, so the experience stays consistent everywhere.

---

## Design system

Everything lives in `styles.css` as CSS custom properties (tokens):

- **Color tokens** — `--monster-black`, `--warm-cream`, `--soft-white` + accents
  `--pink #FF6BAE`, `--acid #C7FF3B`, `--purple #8B5CF6`, `--sky #4CC9F0`,
  `--yellow #FFD93D`, `--orange #FF7A2F`.
- **Typography tokens** — display `Bricolage Grotesque` (rounded, slightly
  irregular grotesk), body `Hanken Grotesk`; fluid type scale `--t-hero … --t-xs`.
- **Spacing system** — `--s-1 … --s-10` (8pt-based) used everywhere for a
  consistent grid & rhythm.
- **Components & states** — buttons (primary / accent / acid / ghost / disabled +
  hover / active), tags (new / limited / almost-gone / favorite), inputs (focus /
  disabled), product card (hover swaps to model shot, doodle word, wishlist),
  navigation (hover/active underline), accordions, drawers, toasts.

## Character & art engine

`data.js` exposes `window.MP` with the catalog (products, characters, moods),
plus **SVG builders** that generate every graphic in code:

- `MP.monster(color, {mood, lazy, horns, ghost})` — the furry blob mascot with
  cursor-tracking eyes. Variants: Lazy / Angry / Shy / Fancy / Hungry / Chaos PP.
- `MP.logoWordmark()` / `MP.logoMark()` — the `monsterpp` wordmark and `pp` mark
  (the two p's are eyes that follow the cursor).
- `MP.doodle.*` — star, heart, bolt, spiral, bang, arrow, crown, blob.
- `MP.productArt(product, "flat"|"model")` — flat product + coloured studio shot.

## Playful interactions (`app.js`)

Short, fast, and never in the way of shopping:

- Logo / mascot **eyes follow the cursor**.
- **Add to bag** → product flies into the bag ("eat") + toast *"Nom. Added to bag."*
- A little monster **peeks** from the screen edge on load.
- Product hover reveals a handwritten word + swaps to the model shot.
- Empty cart: *"Your monster is hungry."* · Wishlist: *"The monster likes it too."*
  · Newsletter: *"You are officially one of us."*
- 404 is a lost monster.
- Cart persists in `localStorage`.

---

## Responsive

Designed mobile-first and verified at **1440 / 768 / 390**:
hamburger menu, two-column product grid on mobile, sticky Add-to-Bag on PDP,
reduced character animation, collapsible filters. Honors
`prefers-reduced-motion`.

---

## Run locally

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy (Cloudflare Pages / Worker)

Static, no build step. `_headers` applies security headers and asset caching.
Build command empty, output directory `/`.

## Files

```
index.html  collection.html  product.html  characters.html  about.html  club.html  404.html
styles.css  # design system + all page styles + responsive
data.js     # catalog + SVG art/character engine (window.MP)
app.js      # shared chrome + cart/search/menu + interactions
assets/     # favicon.svg, social-card.svg (only inline-SVG art used)
```
