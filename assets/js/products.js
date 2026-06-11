/* =====================================================================
   GAWU OBJECTS — Site config + catalogue data
   ---------------------------------------------------------------------
   This is the ONE file to edit for content. It is plain JavaScript (not
   a fetched .json file) so the site works when opened directly from disk
   (file://) without a server. Everything is exposed on window.* so the
   other scripts and every page can read it.

   ▸ CHANGE BRAND NAME, TAGLINE, EMAIL, WHATSAPP, ANNOUNCEMENT  → SITE below
   ▸ CHANGE / ADD PRODUCTS                                      → PRODUCTS
   ▸ CHANGE COLLECTIONS                                         → COLLECTIONS
   ▸ CHANGE JOURNAL ARTICLES                                    → ARTICLES
   Images live in /assets/images/ — replace the .svg placeholders with
   your real .jpg/.webp photography and update the `image` paths.
   ===================================================================== */

/* -------------------------------------------------------------------- */
/*  SITE CONFIG  — edit your brand identity here                         */
/* -------------------------------------------------------------------- */
window.SITE = {
  brand: "GAWU OBJECTS",                 // ← your brand name
  tagline: "Objects for Memory, Protection and Scent",
  // Checkout / inquiry contacts ---------------------------------------
  email: "hello@gawuobjects.com",        // ← REPLACE with your real email
  whatsapp: "10000000000",               // ← REPLACE: country code + number, digits only (e.g. 14155550123)
  // Announcement bar (use " / " as separators) ------------------------
  announcement: [
    "Free Shipping Over $199",
    "Buy 2 Get 5% Off",
    "Join the Ritual Club",
  ],
  currency: "$",                          // ← currency symbol
  currencyCode: "USD",
};

/* -------------------------------------------------------------------- */
/*  COLLECTIONS                                                          */
/* -------------------------------------------------------------------- */
window.COLLECTIONS = [
  { slug: "guardian-vessel", title: "Guardian Vessel",
    desc: "Sealed silver vessels that hold what protects you.",
    image: "assets/images/collection-guardian.svg" },
  { slug: "sacred-lake", title: "Sacred Lake",
    desc: "Lake-blue stones and the memory of still water.",
    image: "assets/images/collection-lake.svg" },
  { slug: "moon-silver", title: "Moon Silver",
    desc: "Quiet silver forms shaped by lunar ritual.",
    image: "assets/images/collection-silver.svg" },
  { slug: "trauma-scent", title: "Trauma Scent",
    desc: "Wearable fragrance vessels for emotional healing.",
    image: "assets/images/collection-scent.svg" },
  { slug: "nomadic-memory", title: "Nomadic Memory",
    desc: "Travelling objects that carry where you have been.",
    image: "assets/images/collection-memory.svg" },
  { slug: "ritual-objects", title: "Ritual Objects",
    desc: "Adornments made for daily, deliberate ceremony.",
    image: "assets/images/collection-ritual.svg" },
];

/* -------------------------------------------------------------------- */
/*  CATEGORIES  (used by the Shop filter)                                */
/* -------------------------------------------------------------------- */
window.CATEGORIES = [
  "Necklaces", "Charms", "Fragrance Pendants", "Bracelets", "Ritual Objects",
];

/* -------------------------------------------------------------------- */
/*  PRODUCTS                                                             */
/*  id        unique slug (used in product.html?id=...)                  */
/*  featured  show on homepage featured row                              */
/*  images    first image is the card / main image                      */
/* -------------------------------------------------------------------- */
window.PRODUCTS = [
  {
    id: "lake-vessel-pendant",
    name: "Lake Vessel Pendant",
    collection: "sacred-lake",
    category: "Necklaces",
    price: 248,
    featured: true,
    material: "Recycled 925 silver · lake-blue agate",
    short: "A sealed vessel holding the stillness of high mountain water.",
    story: "Cast from a single pour of recycled silver, the Lake Vessel holds a sliver of lake-blue agate behind a hand-set window. It is made to be worn against the sternum, where breath gathers — a small reservoir for the things you cannot say aloud.",
    size: "Pendant 32 mm · chain 50 cm (adjustable to 45 cm)",
    weight: "11 g",
    origin: "Hand-finished in a small studio, ethically sourced stone",
    care: "Wipe with a soft cloth. Keep dry. Store flat, away from other metals.",
    images: ["assets/images/product-lake-vessel.svg", "assets/images/product-lake-vessel-2.svg", "assets/images/product-lake-vessel-3.svg"],
  },
  {
    id: "moon-snuff-bottle-necklace",
    name: "Moon Snuff Bottle Necklace",
    collection: "moon-silver",
    category: "Necklaces",
    price: 286,
    featured: true,
    material: "Recycled 925 silver · mother-of-pearl inlay",
    short: "A miniature vessel inspired by antique snuff bottles and the full moon.",
    story: "The snuff bottle was always a private object — small enough to close inside a palm. Ours opens with a quarter-turn and is sized for a single drop of oil or a folded note. The moon-pale inlay shifts with the light you stand in.",
    size: "Bottle 38 mm · chain 55 cm",
    weight: "14 g",
    origin: "Hand-assembled, recycled silver",
    care: "Open gently. Re-seal after each use. Avoid perfume on the silver itself.",
    images: ["assets/images/product-moon-snuff.svg", "assets/images/product-moon-snuff-2.svg", "assets/images/product-moon-snuff-3.svg"],
  },
  {
    id: "guardian-scent-charm",
    name: "Guardian Scent Charm",
    collection: "trauma-scent",
    category: "Fragrance Pendants",
    price: 198,
    featured: true,
    material: "925 silver · porous lava stone",
    short: "A protective charm that holds a single scent close to the pulse.",
    story: "Add one drop of your chosen oil to the lava stone and it will breathe for days. Worn high on the chest, the Guardian Scent Charm becomes a grounding ritual — a scent you can return to when the body needs reminding that it is safe.",
    size: "Charm 26 mm · chain 48 cm",
    weight: "8 g",
    origin: "Volcanic stone, hand-set",
    care: "Re-scent the stone as needed. Clean silver with a dry cloth only.",
    images: ["assets/images/product-guardian-scent.svg", "assets/images/product-guardian-scent-2.svg", "assets/images/product-guardian-scent-3.svg"],
  },
  {
    id: "silver-prayer-capsule",
    name: "Silver Prayer Capsule",
    collection: "ritual-objects",
    category: "Charms",
    price: 168,
    featured: true,
    material: "Recycled 925 silver",
    short: "A sealed capsule for a folded intention, prayer or name.",
    story: "Write a word on the thinnest paper, roll it, and seal it inside. The Prayer Capsule is meant to be carried, not opened — a way of keeping something sacred against the skin without ever explaining it.",
    size: "Capsule 30 mm · chain 50 cm",
    weight: "9 g",
    origin: "Recycled silver, studio-made",
    care: "Keep sealed and dry. Polish lightly with a silver cloth.",
    images: ["assets/images/product-prayer-capsule.svg", "assets/images/product-prayer-capsule-2.svg", "assets/images/product-prayer-capsule-3.svg"],
  },
  {
    id: "memory-holder-pendant",
    name: "Memory Holder Pendant",
    collection: "nomadic-memory",
    category: "Necklaces",
    price: 224,
    featured: true,
    material: "925 silver · smoky quartz",
    short: "A locket-vessel for a fragment of where you have been.",
    story: "A pinch of sand, a thread, a flake of stone from a place that changed you — the Memory Holder keeps it. Smoky quartz softens the light it catches, the way memory softens what it keeps.",
    size: "Pendant 34 mm · chain 52 cm",
    weight: "12 g",
    origin: "Hand-finished, natural quartz",
    care: "Open carefully to refill. Keep away from water and heat.",
    images: ["assets/images/product-memory-holder.svg", "assets/images/product-memory-holder-2.svg", "assets/images/product-memory-holder-3.svg"],
  },
  {
    id: "blue-stone-ritual-necklace",
    name: "Blue Stone Ritual Necklace",
    collection: "sacred-lake",
    category: "Necklaces",
    price: 312,
    featured: true,
    material: "925 silver · raw lapis lazuli",
    short: "An unpolished blue stone set for daily ceremony.",
    story: "Left deliberately raw, the lapis keeps the texture of the earth it came from. Worn as the opening gesture of a morning ritual, it asks for nothing but attention — a blue weight to begin the day against.",
    size: "Stone 22 mm · chain 46 cm",
    weight: "16 g",
    origin: "Natural lapis lazuli, hand-set",
    care: "Avoid water and oils. Wipe stone with a dry cloth.",
    images: ["assets/images/product-blue-stone.svg", "assets/images/product-blue-stone-2.svg", "assets/images/product-blue-stone-3.svg"],
  },
  {
    id: "nomadic-silver-bracelet",
    name: "Nomadic Silver Bracelet",
    collection: "nomadic-memory",
    category: "Bracelets",
    price: 176,
    featured: true,
    material: "Recycled 925 silver",
    short: "An open silver band shaped to be worn and re-shaped.",
    story: "Made to be slightly bent to your wrist and back again, the Nomadic band carries the marks of being worn — the small scratches of a life in motion become its finish.",
    size: "Inner width 58 mm · adjustable",
    weight: "20 g",
    origin: "Recycled silver, studio-made",
    care: "Adjust gently with both hands. Polish to taste — patina is welcome.",
    images: ["assets/images/product-nomadic-silver.svg", "assets/images/product-nomadic-silver-2.svg", "assets/images/product-nomadic-silver-3.svg"],
  },
  {
    id: "quiet-relic-pendant",
    name: "Quiet Relic Pendant",
    collection: "ritual-objects",
    category: "Ritual Objects",
    price: 264,
    featured: true,
    material: "925 silver · river stone",
    short: "A worn-smooth relic form for grounding and protection.",
    story: "Shaped like something already old, the Quiet Relic feels found rather than made. A single river stone sits in a silver cradle — heavy enough to notice, quiet enough to forget you are wearing protection.",
    size: "Pendant 36 mm · chain 54 cm",
    weight: "18 g",
    origin: "Natural river stone, hand-cradled in silver",
    care: "Wipe clean. The stone may darken with wear — this is intended.",
    images: ["assets/images/product-quiet-relic.svg", "assets/images/product-quiet-relic-2.svg", "assets/images/product-quiet-relic-3.svg"],
  },
];

/* -------------------------------------------------------------------- */
/*  JOURNAL ARTICLES                                                     */
/* -------------------------------------------------------------------- */
window.ARTICLES = [
  {
    slug: "why-we-carry-objects-close-to-the-body",
    title: "Why We Carry Objects Close to the Body",
    date: "2026-05-18",
    excerpt: "On amulets, pockets and pendants — and the quiet human need to keep meaning within reach of the skin.",
    image: "assets/images/journal-1.svg",
    body: [
      "Long before jewellery was decoration, it was function — a way of keeping the sacred close enough to touch. The amulet at the throat, the stone in the pocket, the locket against the heart: these were not ornaments but instruments of memory and protection.",
      "We are tactile animals. A worry stone smoothed by a thumb, a ring turned in a moment of anxiety — the body reaches for objects to steady the mind. To wear something deliberately is to give the nervous system an anchor it can return to.",
      "GAWU objects are made for this returning. Each is sized for the hand and weighted for the chest, so that protection is never abstract. It is something you can feel.",
    ],
  },
  {
    slug: "history-of-small-vessels-as-personal-ritual-objects",
    title: "The History of Small Vessels as Personal Ritual Objects",
    date: "2026-04-30",
    excerpt: "From snuff bottles to reliquaries — the long tradition of the very small, sealed and carried.",
    image: "assets/images/journal-2.svg",
    body: [
      "Across cultures, the small sealed vessel recurs: the snuff bottle held in the palm, the reliquary worn at the neck, the scent locket passed between hands. Each shares a logic — that what matters most should be contained, protected, and kept near.",
      "The vessel is a paradox. It is closed, and yet it holds an opening to something interior. To carry one is to carry a private interior in public, unseen by anyone who does not know to look.",
      "Our vessels borrow this grammar without copying any single tradition. They are made to be filled by you — with scent, with a word, with a fragment of a place — so the meaning is never ours to assign.",
    ],
  },
  {
    slug: "scent-memory-and-the-nervous-system",
    title: "Scent, Memory and the Nervous System",
    date: "2026-04-12",
    excerpt: "Why a single familiar scent can ground the body faster than thought — and how to wear one on purpose.",
    image: "assets/images/journal-3.svg",
    body: [
      "Scent is the only sense wired directly into the brain's memory and emotion centres, bypassing the slower routes the other senses take. A single inhale can return you to a room, a person, a feeling — instantly, and without permission.",
      "This is why a worn scent can be a tool for regulation. Choosing one grounding scent and keeping it close means you can summon calm deliberately: a drop on a porous stone, a breath at the wrist, the nervous system reminded that it is safe.",
      "The Guardian Scent Charm and the Trauma Scent collection are built around this practice — wearable fragrance vessels designed not for performance, but for return.",
    ],
  },
];

/* -------------------------------------------------------------------- */
/*  Small helpers shared across pages                                   */
/* -------------------------------------------------------------------- */
window.GAWU = {
  money(n) { return window.SITE.currency + Number(n).toLocaleString("en-US"); },
  product(id) { return window.PRODUCTS.find(p => p.id === id); },
  collection(slug) { return window.COLLECTIONS.find(c => c.slug === slug); },
  collectionTitle(slug) { const c = this.collection(slug); return c ? c.title : slug; },
  article(slug) { return window.ARTICLES.find(a => a.slug === slug); },
  formatDate(iso) {
    try { return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return iso; }
  },
};
