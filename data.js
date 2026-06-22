/* =====================================================================
   MONSTERPP — Data + SVG art engine (dependency-free)
   Exposes window.MP with catalog data and SVG builders.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     COLOR TOKENS (mirror of CSS, for inline SVG fills)
     --------------------------------------------------------------- */
  const C = {
    black: "#111111", cream: "#f7f3eb", white: "#fffdfc",
    pink: "#ff6bae", acid: "#c7ff3b", purple: "#8b5cf6",
    sky: "#4cc9f0", yellow: "#ffd93d", orange: "#ff7a2f",
  };

  /* ---------------------------------------------------------------
     MONSTER CHARACTER — programmatic furry blob
     monster(bodyColor, opts) -> svg string
     opts: { mood, horns, eyes, id, scale }
     --------------------------------------------------------------- */
  function furPath(cx, cy, r, spikes, jag) {
    let d = "";
    const n = spikes * 2;
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      // gentle pseudo-random lump using sine layering (deterministic)
      const wob = Math.sin(i * 1.7) * jag * 0.5 + Math.cos(i * 2.3) * jag * 0.5;
      const rr = (i % 2 === 0 ? r : r - jag) + wob;
      const x = cx + Math.cos(ang) * rr;
      const y = cy + Math.sin(ang) * (rr * 0.94);
      d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
    }
    return d + "Z";
  }

  // mouth shapes by mood
  function mouth(mood) {
    switch (mood) {
      case "happy":  return `<path d="M82,140 Q100,162 118,140" fill="none" stroke="${C.black}" stroke-width="4" stroke-linecap="round"/>`;
      case "angry":  return `<path d="M82,150 Q100,138 118,150" fill="none" stroke="${C.black}" stroke-width="4" stroke-linecap="round"/>`;
      case "bite":   return `<path d="M80,138 H120 L114,150 108,140 100,152 92,140 86,150 Z" fill="${C.white}" stroke="${C.black}" stroke-width="3" stroke-linejoin="round"/>`;
      case "shy":    return `<ellipse cx="100" cy="146" rx="7" ry="5" fill="${C.black}"/>`;
      case "flat":   return `<line x1="86" y1="146" x2="114" y2="146" stroke="${C.black}" stroke-width="4" stroke-linecap="round"/>`;
      case "ohh":    return `<ellipse cx="100" cy="148" rx="9" ry="11" fill="${C.black}"/>`;
      default:       return `<path d="M84,142 Q100,158 116,142" fill="none" stroke="${C.black}" stroke-width="4" stroke-linecap="round"/>`;
    }
  }

  function monster(bodyColor, opts) {
    opts = opts || {};
    const id = opts.id || ("m" + Math.random().toString(36).slice(2, 7));
    const mood = opts.mood || "happy";
    const stroke = bodyColor === C.black ? "#000" : C.black;
    const body = furPath(100, 112, 80, 14, 9);
    const ghost = opts.ghost;
    const eyeY = opts.lazy ? 96 : 92;
    // pupils carry class "pupil" so JS can move them toward the cursor
    const eyes = `
      <g class="mp-eyes">
        <ellipse cx="80" cy="${eyeY}" rx="20" ry="23" fill="${C.white}" stroke="${C.black}" stroke-width="3"/>
        <ellipse cx="124" cy="${eyeY}" rx="20" ry="23" fill="${C.white}" stroke="${C.black}" stroke-width="3"/>
        <circle class="pupil" cx="80" cy="${eyeY + (opts.lazy ? 6 : 2)}" r="8" fill="${C.black}"/>
        <circle class="pupil" cx="124" cy="${eyeY + (opts.lazy ? 6 : 2)}" r="8" fill="${C.black}"/>
        ${opts.lazy ? `<path d="M64,86 q16,-8 32,0" fill="none" stroke="${C.black}" stroke-width="3" stroke-linecap="round"/><path d="M108,86 q16,-8 32,0" fill="none" stroke="${C.black}" stroke-width="3" stroke-linecap="round"/>` : ""}
      </g>`;
    const horns = opts.horns === false ? "" : `
      <path d="M58,52 L70,86 L46,80 Z" fill="${bodyColor}" stroke="${C.black}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M142,52 L130,86 L154,80 Z" fill="${bodyColor}" stroke="${C.black}" stroke-width="3" stroke-linejoin="round"/>`;
    const cheeks = mood === "shy"
      ? `<circle cx="58" cy="124" r="9" fill="${C.pink}" opacity=".8"/><circle cx="146" cy="124" r="9" fill="${C.pink}" opacity=".8"/>` : "";
    const extra = ghost
      ? `<path d="M40,168 q10,18 20,0 q10,18 20,0 q10,18 20,0 q10,18 20,0 q10,18 20,0" fill="${bodyColor}" stroke="${C.black}" stroke-width="3" stroke-linejoin="round"/>` : "";

    return `<svg class="mon" viewBox="0 0 200 210" role="img" aria-label="Monsterpp character" xmlns="http://www.w3.org/2000/svg">
      ${horns}
      <path d="${body}" fill="${bodyColor}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      ${extra}
      ${cheeks}
      ${eyes}
      ${mouth(mood)}
    </svg>`;
  }

  /* ---------------------------------------------------------------
     LOGO marks
     --------------------------------------------------------------- */
  function logoWordmark(color) {
    color = color || C.black;
    // the two p's get eyes
    return `<svg viewBox="0 0 300 56" xmlns="http://www.w3.org/2000/svg" aria-label="monsterpp">
      <text x="0" y="44" font-family="'Bricolage Grotesque','Arial Black',sans-serif" font-weight="800" font-size="48" letter-spacing="-2" fill="${color}">monster</text>
      <g class="mp-eyes">
        <circle cx="221" cy="30" r="14" fill="${color}"/><circle cx="221" cy="42" r="7" fill="${color}"/>
        <circle cx="251" cy="30" r="14" fill="${color}"/><circle cx="251" cy="42" r="7" fill="${color}"/>
        <circle cx="221" cy="27" r="9" fill="${C.white}"/><circle cx="251" cy="27" r="9" fill="${C.white}"/>
        <circle class="pupil" cx="221" cy="28" r="4" fill="${C.black}"/>
        <circle class="pupil" cx="251" cy="28" r="4" fill="${C.black}"/>
      </g>
    </svg>`;
  }
  function logoMark(color) {
    color = color || C.black;
    return `<svg viewBox="0 0 70 56" xmlns="http://www.w3.org/2000/svg" aria-label="pp">
      <circle cx="18" cy="30" r="16" fill="${color}"/><circle cx="18" cy="44" r="8" fill="${color}"/>
      <circle cx="52" cy="30" r="16" fill="${color}"/><circle cx="52" cy="44" r="8" fill="${color}"/>
      <circle cx="18" cy="26" r="10" fill="${C.white}"/><circle cx="52" cy="26" r="10" fill="${C.white}"/>
      <circle class="pupil" cx="18" cy="27" r="4.5" fill="${C.black}"/>
      <circle class="pupil" cx="52" cy="27" r="4.5" fill="${C.black}"/>
    </svg>`;
  }

  /* ---------------------------------------------------------------
     DOODLES — quick marker-style graphics
     --------------------------------------------------------------- */
  const doodle = {
    star: (c) => `<svg viewBox="0 0 60 60"><path d="M30,3 L37,23 58,23 41,36 47,57 30,44 13,57 19,36 2,23 23,23 Z" fill="${c || C.yellow}" stroke="${C.black}" stroke-width="3" stroke-linejoin="round"/></svg>`,
    heart: (c) => `<svg viewBox="0 0 60 56"><path d="M30,52 C-8,28 8,2 30,18 C52,2 68,28 30,52 Z" fill="${c || C.pink}" stroke="${C.black}" stroke-width="3" stroke-linejoin="round"/></svg>`,
    bolt: (c) => `<svg viewBox="0 0 40 60"><path d="M24,2 L6,34 18,34 14,58 36,22 22,22 Z" fill="${c || C.acid}" stroke="${C.black}" stroke-width="3" stroke-linejoin="round"/></svg>`,
    spiral: (c) => `<svg viewBox="0 0 60 60"><path d="M30,30 m0,0 a4,4 0 1,1 8,4 a10,10 0 1,1 -18,-6 a18,18 0 1,1 30,12" fill="none" stroke="${c || C.purple}" stroke-width="4" stroke-linecap="round"/></svg>`,
    bang: (c) => `<svg viewBox="0 0 24 60"><path d="M8,4 H16 L14,38 H10 Z" fill="${c || C.orange}" stroke="${C.black}" stroke-width="2"/><circle cx="12" cy="50" r="6" fill="${c || C.orange}" stroke="${C.black}" stroke-width="2"/></svg>`,
    arrow: (c) => `<svg viewBox="0 0 80 50"><path d="M4,28 Q40,40 70,20" fill="none" stroke="${c || C.black}" stroke-width="4" stroke-linecap="round"/><path d="M58,12 L74,18 64,30" fill="none" stroke="${c || C.black}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    crown: (c) => `<svg viewBox="0 0 70 50"><path d="M6,44 L10,14 24,30 35,8 46,30 60,14 64,44 Z" fill="${c || C.yellow}" stroke="${C.black}" stroke-width="3" stroke-linejoin="round"/></svg>`,
    blob: (c) => `<svg viewBox="0 0 80 70"><path d="M16,16 Q40,2 64,16 Q80,40 60,58 Q36,72 16,56 Q2,36 16,16Z" fill="${c || C.sky}" stroke="${C.black}" stroke-width="3"/></svg>`,
  };

  /* ---------------------------------------------------------------
     PRODUCT ART — colored studio backdrop + garment silhouette
     --------------------------------------------------------------- */
  const garment = {
    hoodie: (c) => `<path d="M60,70 q40,-34 80,0 l28,16 -16,34 -18,-8 v68 q-42,12 -68,0 v-68 l-18,8 -16,-34 Z" fill="${c}" stroke="${C.black}" stroke-width="4" stroke-linejoin="round"/><path d="M84,66 q16,22 32,0" fill="none" stroke="${C.black}" stroke-width="3"/>`,
    tshirt: (c) => `<path d="M64,72 l26,-12 q10,14 20,0 l26,12 22,18 -16,26 -16,-8 v60 q-30,8 -52,0 v-60 l-16,8 -16,-26 Z" fill="${c}" stroke="${C.black}" stroke-width="4" stroke-linejoin="round"/>`,
    beanie: (c) => `<path d="M52,128 q0,-72 96,-72 q96,0 96,72 Z" fill="${c}" stroke="${C.black}" stroke-width="4" stroke-linejoin="round" transform="scale(.78) translate(28,18)"/><rect x="56" y="128" width="88" height="20" rx="8" fill="${c}" stroke="${C.black}" stroke-width="4"/>`,
    cap: (c) => `<path d="M56,118 q0,-58 88,-58 q60,0 60,40 l-2,18 Z" fill="${c}" stroke="${C.black}" stroke-width="4" stroke-linejoin="round" transform="scale(.8) translate(20,28)"/><path d="M52,128 q60,18 110,0 l24,4 q-6,16 -30,14 -52,8 -104,-6 Z" fill="${c}" stroke="${C.black}" stroke-width="4" stroke-linejoin="round"/>`,
    bag: (c) => `<rect x="64" y="78" width="80" height="92" rx="14" fill="${c}" stroke="${C.black}" stroke-width="4"/><path d="M78,78 q26,-30 52,0" fill="none" stroke="${C.black}" stroke-width="4"/><path d="M82,98 h44 l-6,12 -8,-8 -8,10 -8,-8 -8,8 Z" fill="${C.white}" stroke="${C.black}" stroke-width="2.5" stroke-linejoin="round"/>`,
    knit: (c) => `<path d="M62,72 l24,-10 q14,12 28,0 l24,10 20,18 -14,24 -14,-8 v62 q-30,8 -54,0 v-62 l-14,8 -14,-24 Z" fill="${c}" stroke="${C.black}" stroke-width="4" stroke-linejoin="round"/><g stroke="${C.black}" stroke-width="2" opacity=".5"><path d="M72,108 v52 M88,104 v60 M104,104 v60 M120,104 v60 M136,108 v52" fill="none"/></g>`,
    glasses: (c) => `<rect x="42" y="92" width="48" height="36" rx="14" fill="${c}" stroke="${C.black}" stroke-width="4"/><rect x="110" y="92" width="48" height="36" rx="14" fill="${c}" stroke="${C.black}" stroke-width="4"/><path d="M90,104 q10,-8 20,0" fill="none" stroke="${C.black}" stroke-width="4"/><path d="M42,100 l-18,-8 M158,100 l18,-8" stroke="${C.black}" stroke-width="4" stroke-linecap="round"/>`,
    flip: (c) => `<g stroke="${C.black}" stroke-width="4" stroke-linejoin="round"><path d="M74,60 q22,-8 22,40 q0,52 -10,72 q-18,6 -24,-2 q-6,-66 12,-110Z" fill="${c}"/><path d="M84,66 l-14,8 M84,72 q-10,2 -16,10" stroke-width="3"/></g>`,
    jewelry: (c) => `<circle cx="100" cy="108" r="50" fill="none" stroke="${c}" stroke-width="10"/><circle cx="100" cy="64" r="14" fill="${c}" stroke="${C.black}" stroke-width="4"/><circle cx="100" cy="64" r="5" fill="${C.white}"/>`,
    overalls: (c) => `<path d="M70,70 h60 v18 l10,4 v74 h-28 v-44 h-24 v44 h-28 v-74 l10,-4 Z" fill="${c}" stroke="${C.black}" stroke-width="4" stroke-linejoin="round"/><circle cx="84" cy="84" r="4" fill="${C.black}"/><circle cx="116" cy="84" r="4" fill="${C.black}"/>`,
    phone: (c) => `<rect x="72" y="52" width="56" height="108" rx="16" fill="${c}" stroke="${C.black}" stroke-width="4"/><rect x="82" y="62" width="20" height="14" rx="6" fill="${C.black}"/><circle cx="118" cy="68" r="4" fill="${C.black}"/>`,
  };

  function productArt(p, mode) {
    const v = (p.colors && p.colors[0]) || C.pink;
    if (mode === "model") {
      // colored studio backdrop with the product's character holding/being the vibe
      const bg = p.studio || C.sky;
      return `<svg viewBox="0 0 200 250" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="250" fill="${bg}"/>
        <ellipse cx="100" cy="232" rx="70" ry="14" fill="rgba(0,0,0,.12)"/>
        <g transform="translate(0,24) scale(.92)">${monster(p.char ? p.char.color : C.black, { mood: p.char ? p.char.mood : "happy" })}</g>
        <g transform="translate(120,150) scale(.5) rotate(-8)">${garment[p.type] ? garment[p.type](v) : ""}</g>
      </svg>`;
    }
    // flat product on soft white
    return `<svg viewBox="0 0 200 250" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="250" fill="${C.white}"/>
      <g transform="translate(0,30) scale(1)">${garment[p.type] ? garment[p.type](v) : garment.tshirt(v)}</g>
    </svg>`;
  }

  /* ---------------------------------------------------------------
     CHARACTERS
     --------------------------------------------------------------- */
  const characters = [
    { id: "lazy",  name: "Lazy PP",  color: C.black,  mood: "lazy",  role: "Professional napper", bio: "Avoids responsibility. Looks good doing nothing.", lazy: true },
    { id: "angry", name: "Angry PP", color: C.purple, mood: "angry", role: "Mildly furious", bio: "Hates mornings, loud chewing and group chats." },
    { id: "shy",   name: "Shy PP",   color: C.pink,   mood: "shy",   role: "Quietly iconic", bio: "Says nothing, means everything. Blushes a lot." },
    { id: "fancy", name: "Fancy PP", color: C.yellow, mood: "happy", role: "Delusional royalty", bio: "Believes it is extremely important. It is." },
    { id: "hungry",name: "Hungry PP",color: C.orange, mood: "bite",  role: "Always snacking", bio: "Has eaten your homework and three socks." },
    { id: "chaos", name: "Chaos PP", color: C.acid,   mood: "ohh",   role: "Agent of disorder", bio: "Pressed the button. All of the buttons." },
  ];
  const charById = Object.fromEntries(characters.map((c) => [c.id, c]));

  /* ---------------------------------------------------------------
     MOODS (shop by feeling)
     --------------------------------------------------------------- */
  const moods = [
    { id: "lazy",   label: "Feeling Lazy",   color: C.sky,    char: "lazy" },
    { id: "weird",  label: "Feeling Weird",  color: C.purple, char: "chaos" },
    { id: "loud",   label: "Feeling Loud",   color: C.orange, char: "angry" },
    { id: "shy",    label: "Feeling Shy",    color: C.pink,   char: "shy" },
    { id: "cute",   label: "Feeling Cute",   color: C.yellow, char: "fancy" },
    { id: "chaotic",label: "Feeling Chaotic",color: C.acid,   char: "chaos" },
  ];

  /* ---------------------------------------------------------------
     PRODUCTS
     --------------------------------------------------------------- */
  const P = (o) => Object.assign({
    colors: [C.pink], sizes: ["S", "M", "L", "XL"], tags: [], mood: "weird",
    studio: C.sky,
  }, o);

  const products = [
    P({ id: "monster-face-hoodie", name: "Monster Face Hoodie", price: 128, cat: "Hoodies", type: "hoodie",
        colors: [C.black, C.pink, C.acid], tags: ["new", "fav"], char: charById.lazy, mood: "lazy", studio: C.sky,
        line: "This hoodie is shy at first, but gets louder after midnight.",
        story: "Oversized brushed-back fleece with an embroidered monster face on the chest and a sneaky grin under the hood." }),
    P({ id: "two-eyes-knit", name: "Two Eyes Knit", price: 142, cat: "Knitwear", type: "knit",
        colors: [C.purple, C.yellow], tags: ["new"], char: charById.shy, mood: "shy", studio: C.pink,
        line: "Two eyes that judge your outfit choices, lovingly.",
        story: "Chunky hand-feel knit with intarsia eyes that watch the room. Slightly dropped shoulder, ribbed everything." }),
    P({ id: "bite-me-tee", name: "Bite Me T-Shirt", price: 48, cat: "T-Shirts", type: "tshirt",
        colors: [C.white, C.acid, C.orange], tags: ["fav"], char: charById.hungry, mood: "bite", studio: C.yellow,
        line: "Has opinions. Will share them unprompted.",
        story: "Heavyweight boxy tee, puff-print teeth across the front. Pre-shrunk so it stays weird at the right size." }),
    P({ id: "patch-overalls", name: "Patch Overalls", price: 168, cat: "Bottoms", type: "overalls",
        colors: [C.sky, C.acid], tags: ["limited"], char: charById.chaos, mood: "ohh", studio: C.purple,
        line: "Built for crawling under things and into trouble.",
        story: "Workwear-weight overalls covered in chaotic monster patches. Adjustable straps, hammer loop for no reason." }),
    P({ id: "monster-ear-beanie", name: "Monster Ear Beanie", price: 42, cat: "Hats", type: "beanie",
        colors: [C.pink, C.purple, C.black], tags: ["new", "almost"], char: charById.fancy, mood: "happy", studio: C.acid,
        line: "Gives you little ears. No further explanation.",
        story: "Soft rib-knit beanie with two stitched ears on top. Folds into a small annoyed creature when not worn." }),
    P({ id: "hungry-bag", name: "Hungry Monster Bag", price: 96, cat: "Bags", type: "bag",
        colors: [C.orange, C.pink], tags: ["fav", "limited"], char: charById.hungry, mood: "bite", studio: C.sky,
        line: "Eats your phone, keys and dignity. Returns them later.",
        story: "The opening is a mouth. The zip pull is a tongue. Tiny tooth hardware. Lined in all-over monster print." }),
    P({ id: "spiky-cap", name: "Spiky Logo Cap", price: 44, cat: "Hats", type: "cap",
        colors: [C.acid, C.black, C.yellow], tags: ["new"], char: charById.angry, mood: "angry", studio: C.orange,
        line: "Mildly aggressive. Excellent at blocking the sun.",
        story: "Six-panel cap with raised monster-mouth embroidery and a curved brim. Adjustable strap, soft structure." }),
    P({ id: "eye-sunnies", name: "Big Eye Sunnies", price: 58, cat: "Eyewear", type: "glasses",
        colors: [C.pink, C.purple, C.sky], tags: ["fav"], char: charById.fancy, mood: "happy", studio: C.yellow,
        line: "Makes everyone slightly afraid to talk to you. Worth it.",
        story: "Chunky acetate frames with oversized rounded lenses and tiny horn details at the hinge. UV400." }),
    P({ id: "flip-monsters", name: "Squish Flip-Flops", price: 38, cat: "Footwear", type: "flip",
        colors: [C.acid, C.pink, C.sky], tags: ["new"], char: charById.lazy, mood: "lazy", studio: C.purple,
        line: "Soft enough to nap standing up.",
        story: "Squishy molded footbed with a grumpy monster face on the sole — leave little monsters in the sand." }),
    P({ id: "tooth-chain", name: "Monster Tooth Chain", price: 64, cat: "Jewelry", type: "jewelry",
        colors: [C.yellow, C.purple], tags: ["limited"], char: charById.chaos, mood: "ohh", studio: C.pink,
        line: "A small monster lives here now. Be nice to it.",
        story: "Chunky enamel pendant shaped like a single grinning tooth on a bold curb chain. Lobster clasp." }),
    P({ id: "goo-phonecase", name: "Goo Phone Case", price: 32, cat: "Phone Cases", type: "phone",
        colors: [C.acid, C.pink, C.sky], tags: ["new", "fav"], char: charById.chaos, mood: "ohh", studio: C.acid,
        line: "Drops are fine. It bounces and giggles.",
        story: "Shock-absorbing case with a raised goo-monster face and grippy edges. Fits flagship models." }),
    P({ id: "chaos-tee", name: "Chaos All-Over Tee", price: 52, cat: "T-Shirts", type: "tshirt",
        colors: [C.acid, C.purple], tags: ["limited"], char: charById.chaos, mood: "ohh", studio: C.orange,
        line: "Loud on the inside. Louder on the outside.",
        story: "All-over print of every monster causing problems at once. Boxy heavyweight cotton." }),
  ];
  const prodById = Object.fromEntries(products.map((p) => [p.id, p]));

  const tagMeta = {
    new:     { label: "New Monster",     cls: "tag--new" },
    limited: { label: "Limited",         cls: "tag--limited" },
    almost:  { label: "Almost Gone",     cls: "tag--almost" },
    fav:     { label: "Monster Favorite",cls: "tag--fav" },
  };

  const NAV = [
    { label: "New In", href: "collection.html?tag=new" },
    { label: "Shop", href: "collection.html" },
    { label: "Collections", href: "collection.html" },
    { label: "Characters", href: "characters.html" },
    { label: "Monster World", href: "about.html" },
    { label: "About", href: "about.html" },
  ];

  window.MP = {
    C, monster, logoWordmark, logoMark, doodle, productArt, garment,
    products, prodById, characters, charById, moods, tagMeta, NAV,
    money: (n) => "$" + n,
  };
})();
