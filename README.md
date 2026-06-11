# GAWU OBJECTS — Static Luxury Ecommerce Site

A zero-monthly-fee, static luxury ecommerce-style website for a symbolic
jewelry / ritual-object / scent-object brand. Built with **plain HTML, CSS and
vanilla JavaScript** — no React, no Shopify, no WordPress, no backend, no
database, no build step. Deploys free to Cloudflare Pages, GitHub Pages, Netlify
or Vercel.

> All imagery is original SVG placeholder art generated for this project. No
> protected code, images, logos, product names or brand assets from any other
> website are used. **GAWU OBJECTS** is a placeholder brand name.

---

## 1. File structure

```
/
├── index.html          # Homepage (hero, story, collections, featured, materials, journal, newsletter)
├── shop.html           # Product grid + category / collection / price filters + sort
├── collection.html     # Collections index, and single-collection view (?c=slug)
├── product.html        # Product detail (?id=slug): gallery, specs, accordion, related, recently viewed
├── story.html          # Brand story
├── journal.html        # Journal index
├── article.html        # Single article (?slug=slug)
├── faq.html            # FAQ + materials/shipping/sizing/privacy/terms anchors
├── contact.html        # Contact details + email/WhatsApp + mailto contact form
├── cart.html           # localStorage cart + email/WhatsApp inquiry checkout
├── sitemap.xml         # SEO sitemap (replace domain)
├── robots.txt          # SEO robots (replace domain)
├── _headers            # Cloudflare Pages security + cache headers
└── assets/
    ├── favicon.svg     # Brand mark
    ├── css/
    │   └── style.css   # Full design system (CSS variables) + all components + responsive
    ├── js/
    │   ├── products.js # ★ SITE config + all products / collections / articles (edit this)
    │   ├── cart.js     # localStorage cart module
    │   └── main.js     # Header/footer injection, page rendering, filters, cart UI
    └── images/         # SVG placeholder images (replace with real photography)
```

**How shared layout works:** the announcement bar, header/nav and footer are
injected by `main.js` from `SITE` (in `products.js`), so you edit them in *one*
place. Each page only contains its own unique content plus
`<div data-include="header"></div>` and `<div data-include="footer"></div>`.

---

## 2. Where to change the brand name

Open **`assets/js/products.js`** → the `window.SITE` object at the top:

```js
window.SITE = {
  brand: "GAWU OBJECTS",   // ← change this — updates header, footer, cart, emails everywhere
  tagline: "Objects for Memory, Protection and Scent",
  ...
};
```

Changing `brand` there updates the logo wordmark, footer, toast messages and the
checkout email subject automatically. Also update the human-written `<title>` and
`<meta>` tags at the top of each `*.html` file (these are static for SEO).

---

## 3. Where to change product data

All catalogue content lives in **`assets/js/products.js`**:

- **`window.PRODUCTS`** — name, collection, category, price, material, short
  description, full story, size, weight, origin, care, and `images` array.
  Copy a block to add a product; `id` must be unique (it's used in the URL).
- **`window.COLLECTIONS`** — the six collection cards (title, description, image).
- **`window.CATEGORIES`** — the category list used by the shop filter.
- **`window.ARTICLES`** — journal posts (title, date, excerpt, body paragraphs).

To swap images, drop your files into `assets/images/` and update the `image` /
`images` paths. Replace the `.svg` placeholders with real `.jpg`/`.webp` photos
(keep a ~4:5 portrait ratio for product shots).

---

## 4. How to update the checkout email (and WhatsApp)

In **`assets/js/products.js`** → `window.SITE`:

```js
email: "hello@gawuobjects.com",  // ← your real inbox (used by cart + contact form)
whatsapp: "10000000000",         // ← country code + number, digits only, e.g. 14155550123
```

- **Cart checkout** builds a `mailto:` to `SITE.email` containing the product
  list and total, and a `https://wa.me/<whatsapp>` link pre-filled with the same.
- **Contact form** composes a `mailto:` to the same address.
- No payment is taken on-site — checkout opens an inquiry; you reply with a
  secure payment link. (To accept payment later, paste a Stripe/PayPal payment
  link into the checkout buttons in `cart.html`.)

---

## 5. Deploy for free

### Cloudflare Pages
1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repo. **Framework preset:** *None*. **Build command:** *(empty)*.
   **Build output directory:** `/` (root).
4. Deploy. `_headers` is applied automatically. Add your custom domain under
   **Custom domains**.

### GitHub Pages (already wired)
- A workflow at `.github/workflows/deploy-pages.yml` auto-deploys on push to the
  project branch and `main`.
- In the repo: **Settings → Pages → Build and deployment → Source: GitHub
  Actions**. The live URL appears in the Actions run summary.

### Netlify / Vercel
- **Netlify:** drag-and-drop the folder, or connect the repo with build command
  empty and publish directory `/`.
- **Vercel:** import the repo, **Framework Preset: Other**, no build command,
  output `/`.

> Tip: because data is loaded from `products.js` (not `fetch`-ed JSON), the site
> also works by simply opening `index.html` locally. To preview with a server:
> `python3 -m http.server 8000` → http://localhost:8000

---

## 6. Final launch checklist

- [ ] Set `brand`, `tagline`, `email`, `whatsapp`, `announcement` in `products.js`.
- [ ] Replace all `assets/images/*.svg` placeholders with real photography.
- [ ] Update every page `<title>` and `<meta name="description">` / OG tags.
- [ ] Replace `https://example.com` in `index.html` canonical, `sitemap.xml` and `robots.txt` with your domain.
- [ ] Fill in real Privacy Policy and Terms of Use in `faq.html`.
- [ ] Add your studio city/address in `contact.html`.
- [ ] Confirm prices, materials, sizes and care text for every product.
- [ ] Test add-to-cart, quantity, remove, and both checkout buttons on mobile.
- [ ] Add a real `og:image` (1200×630) and a `.png` favicon fallback if desired.
- [ ] Verify the mobile menu, filters and accordions on a phone.
- [ ] Run Lighthouse; check color contrast and that all images have alt text.
- [ ] Point your custom domain and enable HTTPS.

---

Built dependency-free so it can live anywhere, forever, at no monthly cost.
