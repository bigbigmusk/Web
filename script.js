/* =========================================================
   Oddpeel — front-end behavior
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Product catalog ---------- */
  const PRODUCTS = [
    { id: "banana-split", name: "Banana Split", desc: "Sky-blue & white stripes with a pop-red toe.", price: 14, img: "assets/socks/sock-banana-split.svg", tint: "t-blue", cat: ["bestseller", "stripes"], tag: "Bestseller", tagClass: "hot" },
    { id: "rainbow-riot", name: "Rainbow Riot", desc: "A full arc of joy across the instep.", price: 14, img: "assets/socks/sock-rainbow-riot.svg", tint: "t-blue", cat: ["bestseller", "bright"], tag: "Bestseller", tagClass: "hot" },
    { id: "leopard-happy", name: "Leopard Happy", desc: "Bubblegum-pink leopard spots. Quietly feral.", price: 15, img: "assets/socks/sock-leopard-happy.svg", tint: "t-pink", cat: ["bestseller", "animal"], tag: "Hot", tagClass: "hot" },
    { id: "disco-dots", name: "Disco Dots", desc: "Pink, yellow & sky dots that never sit still.", price: 14, img: "assets/socks/sock-disco-dots.svg", tint: "t-pink", cat: ["bestseller", "bright"], tag: "New", tagClass: "new" },
    { id: "love-bug", name: "Love Bug", desc: "Tiny red hearts on banana yellow.", price: 14, img: "assets/socks/sock-love-bug.svg", tint: "t-yellow", cat: ["bright", "gift"], tag: "New", tagClass: "new" },
    { id: "star-power", name: "Star Power", desc: "Golden stars on midnight black.", price: 15, img: "assets/socks/sock-star-power.svg", tint: "t-purple", cat: ["bright", "gift"], tag: "", tagClass: "" },
    { id: "checker-pop", name: "Checker Pop", desc: "Retro red-and-cream checkerboard.", price: 14, img: "assets/socks/sock-checker-pop.svg", tint: "t-red", cat: ["stripes", "gift"], tag: "", tagClass: "" },
    { id: "cheese-dream", name: "Cheese Dream", desc: "Cheesy yellow with melty orange spots.", price: 14, img: "assets/socks/sock-cheese-dream.svg", tint: "t-yellow", cat: ["animal", "bright"], tag: "", tagClass: "" }
  ];

  const FILTERS = [
    { key: "all", label: "All socks" },
    { key: "bestseller", label: "Bestsellers" },
    { key: "bright", label: "Loud & bright" },
    { key: "stripes", label: "Stripes & checks" },
    { key: "animal", label: "Animal" },
    { key: "gift", label: "Giftable" }
  ];

  /* ---------- Cart (localStorage) ---------- */
  const CART_KEY = "oddpeel_cart";
  const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } };
  const setCart = (c) => localStorage.setItem(CART_KEY, JSON.stringify(c));
  const cartTotal = (c) => Object.values(c).reduce((a, b) => a + b, 0);

  function updateCartCount() {
    const n = cartTotal(getCart());
    document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = n; });
  }

  function addToCart(id) {
    const cart = getCart();
    cart[id] = (cart[id] || 0) + 1;
    setCart(cart);
    updateCartCount();
    const p = PRODUCTS.find((x) => x.id === id);
    showToast(`Added ${p ? p.name : "sock"} to cart`);
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    document.getElementById("toastMsg").textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
  }

  /* ---------- Card template ---------- */
  function cardHTML(p) {
    const tag = p.tag ? `<span class="tag ${p.tagClass}">${p.tag}</span>` : "";
    return `
      <article class="card">
        <div class="card-media ${p.tint}">
          ${tag}
          <img src="${p.img}" alt="${p.name} Oddpeel socks" loading="lazy" />
        </div>
        <div class="card-body">
          <h3>${p.name}</h3>
          <p class="card-desc">${p.desc}</p>
          <div class="card-foot">
            <span class="price">$${p.price}</span>
            <button class="btn btn-sm btn-dark" data-add="${p.id}">Add +</button>
          </div>
        </div>
      </article>`;
  }

  function renderGrid(el, list) {
    el.innerHTML = list.map(cardHTML).join("");
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();

    // Mobile nav
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    // Active nav link
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href && href.split("#")[0] === path) a.classList.add("active");
    });

    // Bestsellers grid (home)
    const best = document.getElementById("bestGrid");
    if (best) renderGrid(best, PRODUCTS.filter((p) => p.cat.includes("bestseller")).slice(0, 4));

    // Shop grid + filters
    const shop = document.getElementById("shopGrid");
    const filterBar = document.getElementById("filterBar");
    if (shop) {
      if (filterBar) {
        filterBar.innerHTML = FILTERS.map((f, i) =>
          `<button class="chip ${i === 0 ? "active" : ""}" data-filter="${f.key}">${f.label}</button>`
        ).join("");
        filterBar.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-filter]");
          if (!btn) return;
          filterBar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
          btn.classList.add("active");
          const key = btn.dataset.filter;
          renderGrid(shop, key === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.cat.includes(key)));
        });
      }
      renderGrid(shop, PRODUCTS);
    }

    // Add to cart (event delegation)
    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) { e.preventDefault(); addToCart(add.dataset.add); }
    });

    // Newsletter / contact fake submit
    document.querySelectorAll("[data-newsletter]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.reset();
        showToast("You're in! Check your inbox 🍌");
      });
    });
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        contactForm.style.display = "none";
        const ok = document.getElementById("contactSuccess");
        if (ok) ok.style.display = "block";
      });
    }
  });
})();
