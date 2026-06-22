/* =====================================================================
   MONSTERPP — App engine
   Injects shared chrome, handles cart / search / menu / interactions.
   ===================================================================== */
(function () {
  "use strict";
  const MP = window.MP;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem("mp_" + k)) ?? d; } catch { return d; } },
    set(k, v) { localStorage.setItem("mp_" + k, JSON.stringify(v)); },
  };

  /* ----------------------------- ICONS ----------------------------- */
  const I = {
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 14.5-4 16 0"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 21C-2 12 4 3 12 8c8-5 14 4 0 13Z"/></svg>`,
    bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  };

  /* --------------------------- CART STATE -------------------------- */
  let cart = store.get("cart", []); // [{id, color, size, qty}]
  let wish = store.get("wish", []); // [id]
  const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = () => cart.reduce((n, l) => n + (MP.prodById[l.id]?.price || 0) * l.qty, 0);

  function addToCart(id, color, size, qty = 1) {
    const p = MP.prodById[id]; if (!p) return;
    color = color || p.colors[0]; size = size || p.sizes[0];
    const ex = cart.find((l) => l.id === id && l.color === color && l.size === size);
    if (ex) ex.qty += qty; else cart.push({ id, color, size, qty });
    store.set("cart", cart); renderCart(); syncCount(); openDrawer();
  }
  function changeQty(i, d) { cart[i].qty += d; if (cart[i].qty < 1) cart.splice(i, 1); store.set("cart", cart); renderCart(); syncCount(); }
  function syncCount() { $$(".bag-count").forEach((e) => { const n = cartCount(); e.textContent = n; e.dataset.count = n; }); }

  function toggleWish(id, btn) {
    const i = wish.indexOf(id);
    if (i >= 0) { wish.splice(i, 1); btn && btn.classList.remove("is-on"); }
    else { wish.push(id); btn && btn.classList.add("is-on"); toast("The monster likes it too.", "heart"); }
    store.set("wish", wish);
  }

  /* ----------------------------- CHROME ---------------------------- */
  const announcements = [
    "WE MAKE THINGS MORE FUN.", "FREE SHIPPING OVER $150.",
    "A LITTLE MONSTER IS WATCHING YOU.", "NEW DROP: SOMETHING IS LIVING INSIDE ME.",
  ];

  function buildChrome() {
    const page = document.body.dataset.page || "";
    const navHTML = MP.NAV.map((n) => `<a href="${n.href}"${n.label.toLowerCase().includes(page) ? ' aria-current="page"' : ""}>${n.label}</a>`).join("");
    const annHTML = announcements.concat(announcements).map((a) => `<span>★ ${a}</span>`).join(" ");

    // Insert as DIRECT children of <body> (via a fragment) so the sticky header
    // is constrained by the body, not a short wrapper div — keeps it stuck.
    const headTpl = document.createElement("template");
    headTpl.innerHTML = `
      <div class="announce" aria-hidden="true"><div class="announce__track">${annHTML}</div></div>
      <header class="header"><div class="wrap header__bar">
        <a class="logo" href="index.html" aria-label="Monsterpp home" data-eyes>${MP.logoWordmark()}</a>
        <nav class="nav" aria-label="Primary">${navHTML}</nav>
        <div class="header__actions">
          <button class="iconbtn" data-act="search" aria-label="Search" data-hide-mobile>${I.search}</button>
          <a class="iconbtn" href="club.html" aria-label="Account" data-hide-mobile>${I.user}</a>
          <a class="iconbtn" href="collection.html" aria-label="Wishlist" data-hide-mobile>${I.heart}</a>
          <button class="iconbtn" data-act="bag" aria-label="Bag">${I.bag}<span class="bag-count" data-count="0">0</span></button>
          <button class="iconbtn hamburger" data-act="menu" aria-label="Menu">${I.menu}</button>
        </div>
      </div></header>`;
    document.body.prepend(headTpl.content);

    // overlays + footer appended at end
    const tail = document.createElement("div");
    tail.innerHTML = `
      <div class="overlay-root">
      <div class="scrim" data-act="close"></div>

      <aside class="drawer" id="cart-drawer" aria-label="Shopping bag" aria-hidden="true">
        <div class="drawer__head"><h3>Your Bag</h3><button class="iconbtn" data-act="close" aria-label="Close">${I.close}</button></div>
        <div class="drawer__body" id="cart-body"></div>
        <div class="drawer__foot" id="cart-foot"></div>
      </aside>

      <aside class="drawer mmenu" id="mobile-menu" aria-label="Menu" style="left:0;right:auto;border-left:none;border-right:var(--bw-thick) solid var(--monster-black);transform:translateX(-105%)" aria-hidden="true">
        <div class="row between" style="margin-bottom:24px">
          <a class="logo" href="index.html">${MP.logoMark()}</a>
          <button class="iconbtn" data-act="close" aria-label="Close">${I.close}</button>
        </div>
        ${MP.NAV.map((n) => `<a class="mlink" href="${n.href}">${n.label}</a>`).join("")}
        <div class="row" style="margin-top:24px;gap:12px">
          <a class="btn btn--accent btn--block" href="club.html">Join the club</a>
        </div>
      </aside>

      <div class="search" id="search" aria-hidden="true">
        <div class="row between" style="max-width:var(--maxw);width:100%;margin:0 auto 24px">
          <span class="eyebrow">Search the monster world</span>
          <button class="iconbtn" data-act="close" aria-label="Close">${I.close}</button>
        </div>
        <div class="search__bar"><span class="iconbtn" style="pointer-events:none">${I.search}</span>
          <input id="search-input" type="search" placeholder="What are you feeling?" autocomplete="off"/></div>
        <div class="search__suggest">
          <p class="eyebrow" style="margin-bottom:12px">Try</p>
          <div class="search__chips">${["hoodie","bag","beanie","tee","sunnies","chaos"].map((t)=>`<button class="tag" data-search="${t}">${t}</button>`).join("")}</div>
          <div class="search__results" id="search-results"></div>
        </div>
      </div>
      </div><!-- /.overlay-root -->

      <footer class="footer"><div class="wrap">
        <div class="footer__grid">
          <div>
            <div class="footer__logo">${MP.logoWordmark("#fffdfc")}</div>
            <p style="margin-top:16px;max-width:30ch;opacity:.85">Clothes for the little monster living inside you. We make things more fun.</p>
            <div class="row" style="margin-top:20px;gap:10px">
              <a class="tag" href="#" style="background:#222;color:#fff;border-color:#444">Instagram</a>
              <a class="tag" href="#" style="background:#222;color:#fff;border-color:#444">TikTok</a>
              <a class="tag" href="#" style="background:#222;color:#fff;border-color:#444">Pinterest</a>
            </div>
          </div>
          <div><h4>Shop</h4><ul>
            <li><a href="collection.html?tag=new">New In</a></li>
            <li><a href="collection.html">All Products</a></li>
            <li><a href="characters.html">Characters</a></li>
            <li><a href="club.html">Monsterpp Club</a></li></ul></div>
          <div><h4>Help</h4><ul>
            <li><a href="#">Shipping</a></li><li><a href="#">Returns</a></li>
            <li><a href="#">Size Guide</a></li><li><a href="#">Contact</a></li></ul></div>
          <div><h4>World</h4><ul>
            <li><a href="about.html">About</a></li><li><a href="#">Sustainability</a></li>
            <li><a href="#">Stockists</a></li><li><a href="#">Careers</a></li></ul></div>
        </div>
        <div class="footer__sign">
          <div class="footer__mascot">${MP.monster(MP.C.black, { mood: "happy" })}
            <span>Thanks for visiting. Your monster misses you already.</span></div>
          <span style="opacity:.6">© ${new Date().getFullYear()} Monsterpp. Not normal is ok.</span>
        </div>
      </div></footer>

      <div class="toasts" id="toasts"></div>`;
    document.body.append(tail);

    renderCart(); syncCount(); buildSearchResults();
    // restore wish state on cards rendered later
  }

  /* --------------------------- OPEN/CLOSE -------------------------- */
  const scrim = () => $(".scrim");
  function openDrawer() { $("#cart-drawer").classList.add("is-open"); scrim().classList.add("is-open"); lock(true); }
  function openMenu() { $("#mobile-menu").classList.add("is-open"); scrim().classList.add("is-open"); lock(true); }
  function openSearch() { $("#search").classList.add("is-open"); lock(true); setTimeout(() => $("#search-input").focus(), 260); }
  function closeAll() {
    $$(".drawer, .search").forEach((e) => e.classList.remove("is-open"));
    scrim().classList.remove("is-open"); lock(false);
  }
  function lock(on) { document.body.style.overflow = on ? "hidden" : ""; }

  /* ----------------------------- CART UI --------------------------- */
  function renderCart() {
    const body = $("#cart-body"), foot = $("#cart-foot"); if (!body) return;
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty">${MP.monster(MP.C.orange, { mood: "ohh" })}
        <h3 style="font-size:1.4rem;margin-top:8px">Your monster is hungry.</h3>
        <p class="muted">Feed it something from the drop.</p>
        <a class="btn btn--accent" href="collection.html" style="margin-top:16px" data-act="close">Start shopping</a></div>`;
      foot.innerHTML = ""; return;
    }
    body.innerHTML = cart.map((l, i) => {
      const p = MP.prodById[l.id];
      return `<div class="cart-line">
        <a class="cart-line__img" href="product.html?id=${p.id}">${MP.productArt(p, "flat")}</a>
        <div>
          <div class="cart-line__name">${p.name}</div>
          <div class="cart-line__meta">${l.size} · ${MP.money(p.price)}</div>
          <div class="qty" style="margin-top:8px">
            <button data-qty="${i}" data-d="-1" aria-label="Decrease">–</button>
            <span>${l.qty}</span>
            <button data-qty="${i}" data-d="1" aria-label="Increase">+</button>
          </div>
        </div>
        <div style="text-align:right"><b>${MP.money(p.price * l.qty)}</b>
          <div class="cart-line__rm" data-rm="${i}">remove</div></div>
      </div>`;
    }).join("");
    const free = 150, left = free - cartTotal();
    foot.innerHTML = `
      <div class="row between" style="margin-bottom:6px"><span class="muted">Subtotal</span><b style="font-family:var(--font-display);font-size:1.2rem">${MP.money(cartTotal())}</b></div>
      <p class="muted" style="font-size:.8rem;margin-bottom:12px">${left > 0 ? `You're ${MP.money(left)} away from free shipping.` : "You unlocked free shipping. The monster approves."}</p>
      <a class="btn btn--block btn--lg" href="#">Checkout</a>
      <button class="btn btn--ghost btn--block" data-act="close" style="margin-top:10px">Keep looking</button>`;
  }

  /* --------------------------- SEARCH UI --------------------------- */
  function buildSearchResults(q) {
    const box = $("#search-results"); if (!box) return;
    const list = q ? MP.products.filter((p) =>
      (p.name + " " + p.cat + " " + p.mood).toLowerCase().includes(q.toLowerCase())) : MP.products.slice(0, 4);
    box.innerHTML = list.map((p) => cardHTML(p)).join("");
    hydrateCards(box);
  }

  /* ------------------------- PRODUCT CARD -------------------------- */
  function cardHTML(p) {
    const tags = (p.tags || []).map((t) => `<span class="tag ${MP.tagMeta[t].cls}">${MP.tagMeta[t].label}</span>`).join("");
    const sw = p.colors.map((c) => `<span class="swatch" style="background:${c}"></span>`).join("");
    const on = wish.includes(p.id) ? " is-on" : "";
    const words = ["boo!", "weird", "yes", "pick me", "mine"];
    const w = words[Math.floor(Math.random() * words.length)];
    return `<article class="pcard" data-id="${p.id}">
      <a class="pcard__media" href="product.html?id=${p.id}" aria-label="${p.name}">
        <div class="pcard__img">${MP.productArt(p, "flat")}</div>
        <div class="pcard__alt">${MP.productArt(p, "model")}</div>
        <div class="pcard__tags">${tags}</div>
        <span class="pcard__hoverword">${w}</span>
      </a>
      <button class="pcard__wish${on}" data-wish="${p.id}" aria-label="Add to wishlist">${I.heart}</button>
      <div class="pcard__info">
        <a href="product.html?id=${p.id}"><div class="pcard__name">${p.name}</div></a>
        <div class="pcard__row"><span class="pcard__price">${MP.money(p.price)}</span><span class="swatches">${sw}</span></div>
        ${p.char ? `<span class="charchip">★ ${p.char.name}</span>` : ""}
      </div>
    </article>`;
  }
  function hydrateCards(root = document) {
    $$(".pcard__wish", root).forEach((b) => {
      if (b._h) return; b._h = 1;
      b.addEventListener("click", (e) => { e.preventDefault(); toggleWish(b.dataset.wish, b); });
    });
  }

  /* ----------------------------- TOAST ----------------------------- */
  function toast(msg, icon) {
    const t = $("#toasts"); if (!t) return;
    const el = document.createElement("div"); el.className = "toast";
    el.innerHTML = (icon === "heart" ? I.heart : icon === "bag" ? I.bag : "🖤") + `<span>${msg}</span>`;
    t.append(el); setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(10px)"; }, 2400);
    setTimeout(() => el.remove(), 2800);
  }

  /* ----------------- FLYING ADD-TO-BAG ("eat") ---------------------- */
  function flyToBag(srcEl, p) {
    const bag = $('.header__actions [data-act="bag"]');
    if (!srcEl || !bag) return;
    const a = srcEl.getBoundingClientRect(), b = bag.getBoundingClientRect();
    const fly = document.createElement("div"); fly.className = "fly";
    fly.style.left = a.left + a.width / 2 - 30 + "px"; fly.style.top = a.top + a.height / 2 - 30 + "px";
    fly.innerHTML = MP.productArt(p, "flat");
    document.body.append(fly);
    requestAnimationFrame(() => {
      fly.style.transform = `translate(${b.left - a.left + b.width/2 - a.width/2}px, ${b.top - a.top}px) scale(.15) rotate(40deg)`;
      fly.style.opacity = ".2";
    });
    setTimeout(() => fly.remove(), 720);
  }

  /* ------------------------ CURSOR-EYES ---------------------------- */
  function initEyes() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf, mx = innerWidth / 2, my = innerHeight / 2;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(move); }, { passive: true });
    function move() {
      raf = null;
      $$(".pupil").forEach((p) => {
        const svg = p.ownerSVGElement; if (!svg) return;
        const r = svg.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return; // skip offscreen
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const ang = Math.atan2(my - cy, mx - cx);
        const dist = Math.min(3.5, Math.hypot(mx - cx, my - cy) / 40);
        p.style.transform = `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px)`;
      });
    }
  }

  /* --------------------------- REVEAL ------------------------------ */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { threshold: .12 });
    els.forEach((e) => io.observe(e));
  }

  /* ----------------------- PEEKING MONSTER ------------------------- */
  function initPeek() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const peek = document.createElement("div");
    peek.className = "peek"; peek.innerHTML = MP.monster(MP.C.black, { mood: "happy" });
    peek.setAttribute("aria-hidden", "true"); document.body.append(peek);
    setTimeout(() => peek.classList.add("in"), 1400);
    setTimeout(() => peek.classList.remove("in"), 5200);
  }

  /* --------------------------- EVENTS ------------------------------ */
  function wire() {
    document.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (act) {
        const a = act.dataset.act;
        if (a === "search") { e.preventDefault(); openSearch(); }
        if (a === "bag") openDrawer();
        if (a === "menu") openMenu();
        if (a === "close") closeAll();
      }
      const q = e.target.closest("[data-qty]"); if (q) changeQty(+q.dataset.qty, +q.dataset.d);
      const rm = e.target.closest("[data-rm]"); if (rm) { cart.splice(+rm.dataset.rm, 1); store.set("cart", cart); renderCart(); syncCount(); }
      const sc = e.target.closest("[data-search]"); if (sc) { $("#search-input").value = sc.dataset.search; buildSearchResults(sc.dataset.search); }
      const add = e.target.closest("[data-add]");
      if (add) {
        const p = MP.prodById[add.dataset.add];
        const color = add.dataset.color, size = add.dataset.size;
        flyToBag(add.dataset.flyfrom ? $(add.dataset.flyfrom) : add, p);
        addToCart(p.id, color, size, 1);
        toast("Nom. Added to bag.", "bag");
      }
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
    const si = $("#search-input"); if (si) si.addEventListener("input", () => buildSearchResults(si.value));
    // close mobile menu when following a link
    $$("#mobile-menu a.mlink").forEach((a) => a.addEventListener("click", closeAll));
  }

  /* ----------------------------- INIT ------------------------------ */
  function init() {
    buildChrome(); wire(); initEyes(); initReveal(); initPeek();
    hydrateCards(document);
    // expose for page scripts
    window.MP.app = { addToCart, toggleWish, toast, cardHTML, hydrateCards, openDrawer, openSearch, flyToBag, wish, cart, store, syncCount, renderCart };
  }
  // Scripts are loaded at the end of <body>, so the DOM above already exists and
  // page-level inline scripts run right after this file — init synchronously so
  // MP.app is ready before they call it.
  init();
})();
