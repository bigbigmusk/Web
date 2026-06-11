/* =====================================================================
   GAWU OBJECTS — main.js
   ---------------------------------------------------------------------
   Builds the shared header/footer/announcement from window.SITE, wires up
   the mobile menu + cart badge, runs scroll reveals, and renders each
   page's dynamic content (home, shop, collection, product, journal,
   article, cart, contact) from the catalogue in products.js.
   ===================================================================== */
(function () {
  "use strict";
  var SITE = window.SITE, G = window.GAWU;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- */
  /*  Shared chrome: announcement + header + footer                    */
  /* ---------------------------------------------------------------- */
  var NAV = [
    ["Shop", "shop.html"], ["Collections", "collection.html"],
    ["Story", "story.html"], ["Journal", "journal.html"],
    ["FAQ", "faq.html"], ["Contact", "contact.html"],
  ];

  function announcementHTML() {
    var items = SITE.announcement.map(function (t) { return "<span>" + t + "</span>"; })
      .join('<span class="sep">/</span>');
    return '<div class="announcement">' + items + "</div>";
  }

  function headerHTML(current) {
    var links = NAV.map(function (n) {
      var cur = n[1] === current ? ' aria-current="page"' : "";
      return '<li><a href="' + n[1] + '"' + cur + ">" + n[0] + "</a></li>";
    }).join("");
    var brand = '<a class="brand" href="index.html">' + brandMarkup() + "</a>";
    return (
      '<header class="site-header"><div class="container"><nav class="nav" aria-label="Primary">' +
        brand +
        '<ul class="nav-links">' + links + "</ul>" +
        '<div class="nav-actions">' +
          '<a class="icon-btn" href="cart.html" aria-label="Cart">' +
            cartIcon() + '<span class="cart-count" data-cart-count>0</span>' +
          "</a>" +
          '<button class="icon-btn nav-toggle" data-menu-open aria-label="Open menu" aria-expanded="false">' + menuIcon() + "</button>" +
        "</div>" +
      "</nav></div></header>" +
      mobileMenuHTML(links)
    );
  }

  function mobileMenuHTML(links) {
    return (
      '<div class="mobile-menu" id="mobileMenu" aria-hidden="true">' +
        '<div class="mobile-menu__top">' +
          '<span class="brand">' + brandMarkup() + "</span>" +
          '<button class="icon-btn" data-menu-close aria-label="Close menu">' + closeIcon() + "</button>" +
        "</div>" +
        "<ul>" + links + '<li><a href="cart.html">Cart</a></li></ul>' +
      "</div>"
    );
  }

  function footerHTML() {
    var col = function (h, items) {
      return "<div><h4>" + h + "</h4><ul>" +
        items.map(function (i) { return '<li><a href="' + i[1] + '">' + i[0] + "</a></li>"; }).join("") +
        "</ul></div>";
    };
    return (
      '<footer class="site-footer"><div class="container">' +
        '<div class="footer-grid">' +
          '<div class="footer-brand">' +
            '<a class="brand" href="index.html">' + brandMarkup() + "</a>" +
            "<p>" + SITE.tagline + ". Symbolic adornments for memory, protection and scent — made slowly, in small batches.</p>" +
          "</div>" +
          col("Shop", [
            ["Necklaces", "shop.html?category=Necklaces"], ["Charms", "shop.html?category=Charms"],
            ["Fragrance Pendants", "shop.html?category=Fragrance%20Pendants"],
            ["Bracelets", "shop.html?category=Bracelets"], ["Ritual Objects", "shop.html?category=Ritual%20Objects"],
          ]) +
          col("Support", [
            ["Materials & Care", "faq.html#materials"], ["Shipping & Returns", "faq.html#shipping"],
            ["Size Guide", "faq.html#sizing"], ["Order Tracking", "contact.html"],
            ["FAQ", "faq.html"], ["Contact", "contact.html"],
          ]) +
          col("Brand", [
            ["Our Story", "story.html"], ["Journal", "journal.html"],
            ["Affiliate", "contact.html"], ["Privacy Policy", "faq.html#privacy"], ["Terms of Use", "faq.html#terms"],
          ]) +
        "</div>" +
        '<div class="footer-bottom">' +
          "<span>© " + new Date().getFullYear() + " " + SITE.brand + ". All rights reserved.</span>" +
          "<span>Made for memory, protection &amp; scent.</span>" +
        "</div>" +
      "</div></footer>"
    );
  }

  function brandMarkup() {
    // Splits "GAWU OBJECTS" so the second word can carry the accent colour.
    var parts = SITE.brand.split(" ");
    if (parts.length < 2) return SITE.brand;
    var last = parts.pop();
    return parts.join(" ") + " <span>" + last + "</span>";
  }

  /* Inline SVG icons (no icon font / no external requests) ----------- */
  function cartIcon() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>'; }
  function menuIcon() { return '<svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'; }
  function closeIcon() { return '<svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'; }

  /* ---------------------------------------------------------------- */
  /*  Mount shared chrome + wire interactions                          */
  /* ---------------------------------------------------------------- */
  function mountChrome() {
    var current = (location.pathname.split("/").pop() || "index.html");
    var top = $("[data-include=header]");
    if (top) top.outerHTML = announcementHTML() + headerHTML(current);
    var foot = $("[data-include=footer]");
    if (foot) foot.outerHTML = footerHTML();

    // Mobile menu
    var menu = $("#mobileMenu");
    if (menu) {
      $$("[data-menu-open]").forEach(function (b) {
        b.addEventListener("click", function () { menu.classList.add("open"); menu.setAttribute("aria-hidden", "false"); b.setAttribute("aria-expanded", "true"); });
      });
      $$("[data-menu-close]").forEach(function (b) {
        b.addEventListener("click", function () { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); });
      });
    }
    syncCartBadge();
    window.Cart.onChange(syncCartBadge);
  }

  function syncCartBadge() {
    var n = window.Cart.count();
    $$("[data-cart-count]").forEach(function (el) {
      el.textContent = n;
      el.style.display = n > 0 ? "inline-flex" : "none";
    });
  }

  /* ---------------------------------------------------------------- */
  /*  Reusable card renderers                                          */
  /* ---------------------------------------------------------------- */
  function productCard(p) {
    return (
      '<article class="product-card reveal">' +
        '<a class="product-card__media" href="product.html?id=' + p.id + '">' +
          '<img src="' + p.images[0] + '" alt="' + p.name + '" loading="lazy" width="800" height="1000">' +
          '<span class="product-card__tag">' + G.collectionTitle(p.collection) + "</span>" +
          '<div class="product-card__add"><button class="btn btn--sm btn--block" data-add="' + p.id + '">Add to cart</button></div>' +
        "</a>" +
        '<div class="product-card__body">' +
          '<h3 class="product-card__name"><a href="product.html?id=' + p.id + '">' + p.name + "</a></h3>" +
          '<p class="product-card__meta">' + p.material + "</p>" +
          '<p class="product-card__price">' + G.money(p.price) + "</p>" +
        "</div>" +
      "</article>"
    );
  }

  function collectionCard(c) {
    return (
      '<a class="collection-card reveal" href="collection.html?c=' + c.slug + '">' +
        '<img src="' + c.image + '" alt="' + c.title + '" loading="lazy" width="900" height="1100">' +
        '<div class="collection-card__body"><h3>' + c.title + "</h3><p>" + c.desc + "</p></div>" +
      "</a>"
    );
  }

  function articleCard(a) {
    return (
      '<article class="article-card reveal">' +
        '<a class="article-card__media" href="article.html?slug=' + a.slug + '">' +
          '<img src="' + a.image + '" alt="' + a.title + '" loading="lazy" width="1000" height="700"></a>' +
        '<div class="article-card__body">' +
          '<span class="article-card__date">' + G.formatDate(a.date) + "</span>" +
          '<h3><a href="article.html?slug=' + a.slug + '">' + a.title + "</a></h3>" +
          '<p class="muted">' + a.excerpt + "</p>" +
          '<a class="link-underline" href="article.html?slug=' + a.slug + '">Read</a>' +
        "</div>" +
      "</article>"
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Page renderers                                                   */
  /* ---------------------------------------------------------------- */
  function renderHome() {
    var fg = $("#featured-grid");
    if (fg) fg.innerHTML = window.PRODUCTS.filter(function (p) { return p.featured; }).map(productCard).join("");
    var cg = $("#collections-grid");
    if (cg) cg.innerHTML = window.COLLECTIONS.map(collectionCard).join("");
    var jg = $("#journal-grid");
    if (jg) jg.innerHTML = window.ARTICLES.slice(0, 3).map(articleCard).join("");
  }

  function renderJournal() {
    var jg = $("#journal-list");
    if (jg) jg.innerHTML = window.ARTICLES.map(articleCard).join("");
  }

  /* ---- SHOP ------------------------------------------------------- */
  function renderShop() {
    var grid = $("#shop-grid");
    if (!grid) return;
    var params = new URLSearchParams(location.search);
    var state = {
      category: params.get("category") || "all",
      collection: params.get("c") || "all",
      maxPrice: 400,
      sort: "featured",
    };

    // Build filter controls
    var catBox = $("#filter-category");
    if (catBox) {
      catBox.innerHTML = radioRow("category", "all", "All", state.category) +
        window.CATEGORIES.map(function (c) { return radioRow("category", c, c, state.category); }).join("");
    }
    var colBox = $("#filter-collection");
    if (colBox) {
      colBox.innerHTML = radioRow("collection", "all", "All", state.collection) +
        window.COLLECTIONS.map(function (c) { return radioRow("collection", c.slug, c.title, state.collection); }).join("");
    }

    function radioRow(name, val, label, sel) {
      return '<label><input type="radio" name="' + name + '" value="' + val + '"' + (val === sel ? " checked" : "") + ">" + label + "</label>";
    }

    function apply() {
      var list = window.PRODUCTS.filter(function (p) {
        if (state.category !== "all" && p.category !== state.category) return false;
        if (state.collection !== "all" && p.collection !== state.collection) return false;
        if (p.price > state.maxPrice) return false;
        return true;
      });
      if (state.sort === "low") list.sort(function (a, b) { return a.price - b.price; });
      else if (state.sort === "high") list.sort(function (a, b) { return b.price - a.price; });
      grid.innerHTML = list.length ? list.map(productCard).join("")
        : '<p class="muted">No objects match these filters yet.</p>';
      var rc = $("#result-count");
      if (rc) rc.textContent = list.length + (list.length === 1 ? " object" : " objects");
      revealObserve();
      bindAdd();
    }

    $$('input[name="category"]').forEach(function (el) { el.addEventListener("change", function () { state.category = el.value; apply(); }); });
    $$('input[name="collection"]').forEach(function (el) { el.addEventListener("change", function () { state.collection = el.value; apply(); }); });
    var range = $("#filter-price");
    var out = $("#price-output");
    if (range) {
      range.value = state.maxPrice;
      if (out) out.textContent = G.money(state.maxPrice);
      range.addEventListener("input", function () { state.maxPrice = +range.value; if (out) out.textContent = G.money(state.maxPrice); apply(); });
    }
    var sort = $("#sort-by");
    if (sort) sort.addEventListener("change", function () { state.sort = sort.value; apply(); });
    var ft = $("[data-filters-toggle]");
    if (ft) ft.addEventListener("click", function () { $(".filters").classList.toggle("open"); });

    apply();
  }

  /* ---- COLLECTION listing / index --------------------------------- */
  function renderCollection() {
    var host = $("#collection-page");
    if (!host) return;
    var slug = new URLSearchParams(location.search).get("c");

    if (!slug) {
      // No collection chosen → show the index of all collections
      $("#collection-title").textContent = "Collections";
      $("#collection-desc").textContent = "Six worlds of memory, protection and scent.";
      $("#collection-grid").innerHTML = window.COLLECTIONS.map(collectionCard).join("");
      $("#collection-products").innerHTML = "";
      return;
    }
    var c = G.collection(slug);
    if (!c) { $("#collection-title").textContent = "Collection not found"; return; }
    $("#collection-title").textContent = c.title;
    $("#collection-desc").textContent = c.desc;
    document.title = c.title + " — " + SITE.brand;
    $("#collection-grid").innerHTML = "";
    var items = window.PRODUCTS.filter(function (p) { return p.collection === slug; });
    $("#collection-products").innerHTML = items.length ? items.map(productCard).join("")
      : '<p class="muted">New objects for this collection are arriving soon.</p>';
    var bc = $("#collection-crumb");
    if (bc) bc.textContent = c.title;
  }

  /* ---- PRODUCT DETAIL --------------------------------------------- */
  function renderProduct() {
    var host = $("#pdp");
    if (!host) return;
    var id = new URLSearchParams(location.search).get("id");
    var p = G.product(id) || window.PRODUCTS[0];
    window.Cart.pushViewed(p.id);

    document.title = p.name + " — " + SITE.brand;
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", p.short);
    $("#pdp-crumb").textContent = p.name;
    $("#pdp-collection").innerHTML = '<a href="collection.html?c=' + p.collection + '">' + G.collectionTitle(p.collection) + "</a>";
    $("#pdp-name").textContent = p.name;
    $("#pdp-price").textContent = G.money(p.price);
    $("#pdp-short").textContent = p.short;
    $("#pdp-story").textContent = p.story;

    // Gallery
    $("#gallery-main").innerHTML = '<img id="gallery-img" src="' + p.images[0] + '" alt="' + p.name + '" width="1000" height="1250">';
    $("#gallery-thumbs").innerHTML = p.images.map(function (src, i) {
      return '<button data-thumb="' + src + '" aria-current="' + (i === 0) + '"><img src="' + src + '" alt="' + p.name + ' view ' + (i + 1) + '"></button>';
    }).join("");
    $$("#gallery-thumbs button").forEach(function (b) {
      b.addEventListener("click", function () {
        $("#gallery-img").src = b.getAttribute("data-thumb");
        $$("#gallery-thumbs button").forEach(function (x) { x.setAttribute("aria-current", "false"); });
        b.setAttribute("aria-current", "true");
      });
    });

    // Specs
    $("#pdp-specs").innerHTML = [
      ["Material", p.material], ["Size", p.size], ["Weight", p.weight],
      ["Origin", p.origin], ["Care", p.care],
    ].map(function (r) { return '<li><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></li>"; }).join("");

    // Add to cart with qty
    var qtyInput = $("#pdp-qty");
    $("#pdp-minus").addEventListener("click", function () { qtyInput.value = Math.max(1, (+qtyInput.value || 1) - 1); });
    $("#pdp-plus").addEventListener("click", function () { qtyInput.value = (+qtyInput.value || 1) + 1; });
    $("#pdp-add").addEventListener("click", function () {
      window.Cart.add(p.id, Math.max(1, +qtyInput.value || 1));
      toast(p.name + " added to your cart");
    });

    // Related (same collection, else featured)
    var related = window.PRODUCTS.filter(function (x) { return x.collection === p.collection && x.id !== p.id; });
    if (related.length < 4) related = related.concat(window.PRODUCTS.filter(function (x) { return x.id !== p.id && related.indexOf(x) < 0; }));
    $("#related-grid").innerHTML = related.slice(0, 4).map(productCard).join("");

    // Recently viewed
    var viewedIds = window.Cart.viewed(p.id);
    var rv = $("#viewed-section");
    if (viewedIds.length && rv) {
      rv.style.display = "";
      $("#viewed-grid").innerHTML = viewedIds.map(G.product.bind(G)).filter(Boolean).slice(0, 4).map(productCard).join("");
    } else if (rv) { rv.style.display = "none"; }
  }

  /* ---- CART ------------------------------------------------------- */
  function renderCart() {
    var host = $("#cart-page");
    if (!host) return;

    function draw() {
      var lines = window.Cart.lines();
      var listEl = $("#cart-lines"), emptyEl = $("#cart-empty"), summaryEl = $("#cart-summary");
      if (!lines.length) {
        listEl.innerHTML = ""; emptyEl.style.display = ""; summaryEl.style.display = "none"; return;
      }
      emptyEl.style.display = "none"; summaryEl.style.display = "";
      listEl.innerHTML = lines.map(function (l) {
        var p = l.product;
        return (
          '<div class="cart-line">' +
            '<a class="cart-line__media" href="product.html?id=' + p.id + '"><img src="' + p.images[0] + '" alt="' + p.name + '"></a>' +
            "<div>" +
              '<div class="cart-line__name">' + p.name + "</div>" +
              '<div class="cart-line__meta">' + G.collectionTitle(p.collection) + " · " + G.money(p.price) + "</div>" +
              '<button class="cart-line__remove" data-remove="' + p.id + '">Remove</button>' +
            "</div>" +
            '<div class="cart-line__qtycell" style="text-align:right">' +
              '<div class="qty-stepper"><button data-dec="' + p.id + '" aria-label="Decrease">–</button><span>' + l.qty + '</span><button data-inc="' + p.id + '" aria-label="Increase">+</button></div>' +
              '<div style="margin-top:6px">' + G.money(l.lineTotal) + "</div>" +
            "</div>" +
          "</div>"
        );
      }).join("");

      var sub = window.Cart.subtotal();
      $("#cart-subtotal").textContent = G.money(sub);
      $("#cart-total").textContent = G.money(sub);

      $$("[data-inc]").forEach(function (b) { b.onclick = function () { var id = b.getAttribute("data-inc"); window.Cart.setQty(id, qtyOf(id) + 1); }; });
      $$("[data-dec]").forEach(function (b) { b.onclick = function () { var id = b.getAttribute("data-dec"); window.Cart.setQty(id, qtyOf(id) - 1); }; });
      $$("[data-remove]").forEach(function (b) { b.onclick = function () { window.Cart.remove(b.getAttribute("data-remove")); }; });
    }
    function qtyOf(id) { var i = window.Cart.get().find(function (x) { return x.id === id; }); return i ? i.qty : 1; }

    window.Cart.onChange(draw);
    draw();

    // Checkout via email (mailto) ------------------------------------
    $("#checkout-email").addEventListener("click", function (e) {
      e.preventDefault();
      var lines = window.Cart.lines();
      if (!lines.length) return;
      var body = "Hello " + SITE.brand + ",%0D%0A%0D%0AI would like to order the following objects:%0D%0A%0D%0A";
      lines.forEach(function (l) {
        body += "• " + l.product.name + " ×" + l.qty + " — " + G.money(l.lineTotal) + "%0D%0A";
      });
      body += "%0D%0ASubtotal: " + G.money(window.Cart.subtotal()) + "%0D%0A%0D%0AName:%0D%0AShipping address:%0D%0ANotes:%0D%0A";
      var subject = SITE.brand + " order inquiry";
      window.location.href = "mailto:" + SITE.email + "?subject=" + encodeURIComponent(subject) + "&body=" + body;
    });

    // Checkout via WhatsApp ------------------------------------------
    $("#checkout-whatsapp").addEventListener("click", function (e) {
      e.preventDefault();
      var lines = window.Cart.lines();
      if (!lines.length) return;
      var text = "Hello " + SITE.brand + ", I would like to order:\n";
      lines.forEach(function (l) { text += "• " + l.product.name + " x" + l.qty + " — " + G.money(l.lineTotal) + "\n"; });
      text += "Subtotal: " + G.money(window.Cart.subtotal());
      window.open("https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(text), "_blank");
    });
  }

  /* ---- ARTICLE ---------------------------------------------------- */
  function renderArticle() {
    var host = $("#article-page");
    if (!host) return;
    var slug = new URLSearchParams(location.search).get("slug");
    var a = G.article(slug) || window.ARTICLES[0];
    document.title = a.title + " — " + SITE.brand;
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", a.excerpt);
    $("#article-crumb").textContent = a.title;
    $("#article-date").textContent = G.formatDate(a.date);
    $("#article-title").textContent = a.title;
    $("#article-hero").innerHTML = '<img src="' + a.image + '" alt="' + a.title + '" width="1200" height="700">';
    $("#article-body").innerHTML = a.body.map(function (par) { return "<p>" + par + "</p>"; }).join("");
    $("#article-more").innerHTML = window.ARTICLES.filter(function (x) { return x.slug !== a.slug; }).slice(0, 3).map(articleCard).join("");
  }

  /* ---------------------------------------------------------------- */
  /*  Global interactions: add-to-cart, newsletter, contact, toast     */
  /* ---------------------------------------------------------------- */
  function bindAdd() {
    $$("[data-add]").forEach(function (b) {
      if (b.__bound) return; b.__bound = true;
      b.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        var id = b.getAttribute("data-add");
        window.Cart.add(id, 1);
        var p = G.product(id);
        toast((p ? p.name : "Object") + " added to your cart");
      });
    });
  }

  function bindForms() {
    // Newsletter (static, no backend) — shows confirmation only.
    $$("[data-newsletter]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = form.querySelector(".form-note");
        if (note) note.textContent = "Thank you — you have joined the Ritual Club.";
        form.reset();
      });
    });
    // Contact form → composes a mailto (no backend needed).
    var contact = $("#contact-form");
    if (contact) {
      contact.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = $("#cf-name").value, email = $("#cf-email").value, msg = $("#cf-message").value, topic = $("#cf-topic").value;
        var body = "Name: " + name + "%0D%0AEmail: " + email + "%0D%0ATopic: " + topic + "%0D%0A%0D%0A" + encodeURIComponent(msg);
        window.location.href = "mailto:" + SITE.email + "?subject=" + encodeURIComponent(topic + " — " + name) + "&body=" + body;
      });
    }
  }

  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  /* ---------------------------------------------------------------- */
  /*  Scroll reveal                                                    */
  /* ---------------------------------------------------------------- */
  var io;
  function revealObserve() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); return; }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px" });
    }
    $$(".reveal:not(.in)").forEach(function (el) { io.observe(el); });
  }

  /* Fill any element with [data-site=brand|email|whatsapp|tagline] ---- */
  function fillSiteTokens() {
    $$("[data-site]").forEach(function (el) {
      var k = el.getAttribute("data-site");
      if (k === "brand") el.textContent = SITE.brand;
      else if (k === "tagline") el.textContent = SITE.tagline;
      else if (k === "email") { el.textContent = SITE.email; if (el.tagName === "A") el.href = "mailto:" + SITE.email; }
      else if (k === "whatsapp" && el.tagName === "A") el.href = "https://wa.me/" + SITE.whatsapp;
    });
  }

  /* ---------------------------------------------------------------- */
  /*  Boot                                                             */
  /* ---------------------------------------------------------------- */
  function init() {
    mountChrome();
    fillSiteTokens();
    renderHome();
    renderJournal();
    renderShop();
    renderCollection();
    renderProduct();
    renderCart();
    renderArticle();
    bindAdd();
    bindForms();
    revealObserve();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
