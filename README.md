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

## Files
```
index.html        # all sections / markup
styles.css        # design system + responsive layout
script.js         # nav, scroll reveals, RFQ form handler
assets/logo.svg   # Concord Trade mark
assets/favicon.svg
```

## Run locally
Just open `index.html`, or serve the folder:
```bash
python3 -m http.server 8000
# → http://localhost:8000
```
