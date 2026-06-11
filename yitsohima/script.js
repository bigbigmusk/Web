/* ============================================================
   Himalaya Atelier — storefront interactions
   Dependency-free vanilla JS: product catalog, placeholder
   media, scroll reveals, mobile nav, and a localStorage cart.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Placeholder emblems (inline SVG, no image assets) ---------- */
  var EMBLEMS = {
    mountain: '<svg class="ph-emblem" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 74 L38 30 L52 52 L66 24 L88 74 Z"/><circle cx="66" cy="20" r="6" stroke-width="2"/></svg>',
    knot:     '<svg class="ph-emblem" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M35 35h30v30h-30z"/><path d="M35 50H20v15h15M65 50h15V35H65M50 35V20h15v15M50 65v15H35V65"/></svg>',
    lotus:    '<svg class="ph-emblem" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M50 24c8 12 8 26 0 40-8-14-8-28 0-40Z"/><path d="M50 64c-12-4-22-2-30 6 12 8 24 6 30-6Z"/><path d="M50 64c12-4 22-2 30 6-12 8-24 6-30-6Z"/><path d="M34 40c-6 6-8 16-4 26 8-4 12-14 4-26Z"/><path d="M66 40c6 6 8 16 4 26-8-4-12-14-4-26Z"/></svg>',
    bagua:    '<svg class="ph-emblem" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="50" cy="50" r="30"/><path d="M50 20v60M29 35h42M29 65h42M35 27v46M65 27v46"/></svg>',
    om:       '<svg class="ph-emblem" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="50" cy="50" r="30"/><path d="M38 44c0-8 14-8 14 2s-12 8-12 0M52 46c6-6 16-2 16 8s-12 12-18 4M64 30c2 0 4 2 4 4"/></svg>',
    bead:     '<svg class="ph-emblem" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="50" cy="50" r="26"/><circle cx="50" cy="50" r="10"/><path d="M50 24v8M50 68v8M24 50h8M68 50h8"/></svg>',
    sun:      '<svg class="ph-emblem spin" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="50" cy="50" r="16"/><g><path d="M50 18v10M50 72v10M18 50h10M72 50h10M28 28l7 7M65 65l7 7M72 28l-7 7M35 65l-7 7"/></g></svg>',
    leaf:     '<svg class="ph-emblem" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M30 70C30 44 50 26 72 26 72 52 52 70 30 70Z"/><path d="M40 60 64 36"/></svg>'
  };

  /* ---------- Catalog (placeholder data) ---------- */
  var PRODUCTS = [
    { id:'kailash-copper', name:'Mount Kailash Necklace', cat:'Necklaces', price:129, was:159, tone:'copper', emblem:'mountain', badge:'Bestseller', rating:5,
      blurb:'A sacred-peak pendant cast in warm copper, hung on an adjustable cord.' },
    { id:'kailash-silver', name:'Mount Kailash Necklace — Silver', cat:'Necklaces', price:189, tone:'night', emblem:'mountain', rating:5,
      blurb:'The same revered summit, rendered in oxidised sterling silver.' },
    { id:'bagua-pendant', name:'Nine-Palace Bagua Amulet', cat:'Pendants', price:99, tone:'gold', emblem:'bagua', badge:'New', rating:5,
      blurb:'A protective amulet of balance, centred on the eight trigrams.' },
    { id:'endless-knot', name:'Endless Knot Bracelet', cat:'Bracelets', price:79, was:95, tone:'turquoise', emblem:'knot', badge:'Sale', rating:4,
      blurb:'The unbroken knot of interdependence, woven in braided cord.' },
    { id:'om-ring', name:'Om Mani Padme Hum Ring', cat:'Rings', price:69, tone:'copper', emblem:'om', rating:5,
      blurb:'A spinning mantra band, hand-engraved for daily contemplation.' },
    { id:'turquoise-mala', name:'Turquoise Prayer Mala', cat:'Malas', price:149, tone:'turquoise', emblem:'bead', badge:'Limited', rating:5,
      blurb:'108 hand-knotted turquoise beads for breath and meditation.' },
    { id:'dzi-pendant', name:'Yak-Bone Dzi Pendant', cat:'Pendants', price:119, tone:'night', emblem:'sun', rating:4,
      blurb:'An ethically sourced bone bead carved with a radiant sun motif.' },
    { id:'lotus-earrings', name:'Lotus Meditation Earrings', cat:'Earrings', price:59, was:72, tone:'gold', emblem:'lotus', badge:'Sale', rating:5,
      blurb:'Featherlight blossoms that rise, like the lotus, untouched.' }
  ];
  window.PRODUCTS = PRODUCTS;
  function findProduct(id) { for (var i=0;i<PRODUCTS.length;i++){ if(PRODUCTS[i].id===id) return PRODUCTS[i]; } return null; }
  function money(n) { return '$' + n.toFixed(0); }

  /* ---------- Placeholder media markup ---------- */
  function phMarkup(p, tone) {
    var t = tone || p.tone;
    return '<div class="ph" data-tone="' + t + '">' + (EMBLEMS[p.emblem] || EMBLEMS.mountain) +
      '<span class="ph-label">Image placeholder</span></div>';
  }
  window.phMarkup = phMarkup;

  function stars(n) {
    var s = ''; for (var i=0;i<5;i++) s += i < n ? '★' : '☆'; return s;
  }

  /* ---------- Product card ---------- */
  function cardMarkup(p) {
    var sale = p.was && p.was > p.price;
    var badge = p.badge ? '<span class="badge' + (sale ? ' sale' : '') + '">' + p.badge + '</span>' : '';
    var price = sale
      ? '<span class="was">' + money(p.was) + '</span><span class="now sale">' + money(p.price) + '</span>'
      : '<span class="now">' + money(p.price) + '</span>';
    var href = rel('products/index.html') + '?id=' + p.id;
    return '<article class="product-card reveal">' +
      '<div class="media-wrap">' + badge +
        '<a href="' + href + '" aria-label="' + p.name + '">' + phMarkup(p) + '</a>' +
        '<button class="btn btn-dark btn-sm btn-block quick-add" data-add="' + p.id + '">Add to bag</button>' +
      '</div>' +
      '<div class="info">' +
        '<div class="cat">' + p.cat + '</div>' +
        '<h3><a href="' + href + '">' + p.name + '</a></h3>' +
        '<div class="stars" aria-label="' + p.rating + ' out of 5">' + stars(p.rating) + '</div>' +
        '<div class="price">' + price + '</div>' +
      '</div>' +
    '</article>';
  }

  /* relative-path helper so pages in /products and /collections still resolve to root */
  function rel(path) {
    var base = document.body.getAttribute('data-base') || '';
    return base + path;
  }
  window.rel = rel;

  /* ---------- Render any [data-products] grids ---------- */
  function renderGrids() {
    var grids = document.querySelectorAll('[data-products]');
    grids.forEach(function (grid) {
      var mode = grid.getAttribute('data-products'); // "all" | "featured" | "related"
      var list = PRODUCTS.slice();
      if (mode === 'featured') list = list.slice(0, 4);
      if (mode === 'related') {
        var exclude = grid.getAttribute('data-exclude');
        list = list.filter(function (p) { return p.id !== exclude; }).slice(0, 4);
      }
      grid.innerHTML = list.map(cardMarkup).join('');
    });
  }

  /* ---------- Product detail page ---------- */
  var TONES = ['copper','silver','gold','turquoise','night'];
  function renderPDP() {
    var mount = document.getElementById('pdpMount');
    if (!mount) return;
    var id = new URLSearchParams(location.search).get('id') || PRODUCTS[0].id;
    var p = findProduct(id) || PRODUCTS[0];
    document.title = p.name + ' — Himalaya Atelier';
    var sale = p.was && p.was > p.price;
    var variants = ['copper','silver','turquoise','gold'];

    var thumbs = variants.map(function (t, i) {
      return '<div class="ph thumb' + (i===0?' active':'') + '" data-tone="' + t + '" data-thumb="' + t + '">' + (EMBLEMS[p.emblem]||'') + '</div>';
    }).join('');

    var swatches = variants.map(function (t, i) {
      return '<button class="swatch' + (i===0?' active':'') + '" data-tone="' + t + '" data-variant="' + t + '" aria-label="' + cap(t) + '"></button>';
    }).join('');

    mount.innerHTML =
      '<div class="crumb"><a href="' + rel('index.html') + '">Home</a> / <a href="' + rel('collections/index.html') + '">Shop</a> / ' + p.name + '</div>' +
      '<div class="pdp">' +
        '<div class="pdp-gallery">' +
          '<div class="thumbs">' + thumbs + '</div>' +
          '<div class="main"><div class="ph" id="pdpMain" data-tone="' + p.tone + '">' + (EMBLEMS[p.emblem]||'') + '<span class="ph-label">Image placeholder</span></div></div>' +
        '</div>' +
        '<div class="pdp-info">' +
          '<div class="cat">' + p.cat + '</div>' +
          '<h1>' + p.name + '</h1>' +
          '<div class="stars" aria-label="' + p.rating + ' of 5">' + stars(p.rating) + ' <span style="color:var(--muted);font-family:var(--sans);font-size:.8rem">(' + (120 + p.price) + ' reviews)</span></div>' +
          '<div class="pdp-price">' + (sale ? '<span class="was">' + money(p.was) + '</span>' : '') + money(p.price) + '</div>' +
          '<p class="pdp-desc">' + p.blurb + ' Cast in small batches and finished by hand, each piece arrives in plastic-free packaging with a note on the symbol it carries.</p>' +
          '<div class="pdp-opts"><div class="label">Finish</div><div class="swatches">' + swatches + '</div></div>' +
          '<div class="pdp-buy">' +
            '<div class="qty"><button data-qd aria-label="Decrease">−</button><input id="pdpQty" value="1" inputmode="numeric" aria-label="Quantity" /><button data-qi aria-label="Increase">+</button></div>' +
            '<button class="btn btn-primary" id="pdpAdd" style="flex:1">Add to bag — ' + money(p.price) + '</button>' +
          '</div>' +
          '<ul class="pdp-trust">' +
            '<li><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z"/><path d="m9 12 2 2 4-4"/></svg>Ethically sourced materials &amp; recycled metals</li>' +
            '<li><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12h18M12 3v18"/><circle cx="12" cy="12" r="9"/></svg>Free worldwide shipping over $199</li>' +
            '<li><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12a9 9 0 1 1-3-6.7M21 5v4h-4"/></svg>30-day returns &amp; lifetime repairs</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<section class="section"><div class="center reveal"><div class="eyebrow">You may also love</div><h2 class="section-title">Complete the ritual</h2></div>' +
        '<div class="product-grid" data-products="related" data-exclude="' + p.id + '" style="margin-top:44px"></div></section>';

    // state
    var current = variants[0];
    var main = document.getElementById('pdpMain');
    mount.querySelectorAll('[data-thumb]').forEach(function (el) {
      el.addEventListener('click', function () { selectVariant(el.getAttribute('data-thumb')); });
    });
    mount.querySelectorAll('[data-variant]').forEach(function (el) {
      el.addEventListener('click', function () { selectVariant(el.getAttribute('data-variant')); });
    });
    function selectVariant(t) {
      current = t;
      main.setAttribute('data-tone', t);
      mount.querySelectorAll('[data-thumb]').forEach(function (el) { el.classList.toggle('active', el.getAttribute('data-thumb') === t); });
      mount.querySelectorAll('[data-variant]').forEach(function (el) { el.classList.toggle('active', el.getAttribute('data-variant') === t); });
    }
    var qty = document.getElementById('pdpQty');
    mount.querySelector('[data-qd]').addEventListener('click', function () { qty.value = Math.max(1, (parseInt(qty.value,10)||1) - 1); });
    mount.querySelector('[data-qi]').addEventListener('click', function () { qty.value = (parseInt(qty.value,10)||1) + 1; });
    document.getElementById('pdpAdd').addEventListener('click', function () {
      addToCart(p.id, Math.max(1, parseInt(qty.value,10)||1), current);
    });

    renderGrids(); // related grid
  }

  /* ============================================================
     CART (localStorage)
     ============================================================ */
  var CART_KEY = 'himalaya_cart_v1';
  var FREE_SHIP = 199;

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); }

  function cartCount(c) { return c.reduce(function (n, i) { return n + i.qty; }, 0); }
  function cartTotal(c) { return c.reduce(function (n, i) { return n + i.price * i.qty; }, 0); }

  function addToCart(id, qty, variant) {
    var p = findProduct(id); if (!p) return;
    qty = qty || 1;
    variant = variant || p.tone;
    var c = readCart();
    var key = id + '::' + variant;
    var found = null;
    for (var i=0;i<c.length;i++){ if (c[i].key === key) { found = c[i]; break; } }
    if (found) found.qty += qty;
    else c.push({ key:key, id:id, name:p.name, price:p.price, tone:variant, emblem:p.emblem, variant:variant, qty:qty });
    writeCart(c);
    renderCart();
    openCart();
  }
  function setQty(key, qty) {
    var c = readCart();
    c = c.map(function (i) { if (i.key === key) i.qty = qty; return i; }).filter(function (i) { return i.qty > 0; });
    writeCart(c); renderCart();
  }
  function removeItem(key) {
    writeCart(readCart().filter(function (i) { return i.key !== key; }));
    renderCart();
  }

  /* ---------- Cart UI ---------- */
  function renderCart() {
    var c = readCart();
    var count = cartCount(c);

    document.querySelectorAll('.cart-count').forEach(function (el) {
      el.textContent = count;
      el.classList.toggle('show', count > 0);
    });

    var body = document.getElementById('cartBody');
    var foot = document.getElementById('cartFoot');
    if (!body || !foot) return;

    if (!c.length) {
      body.innerHTML = '<div class="cart-empty">' +
        '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M6 6 5 3H2"/></svg>' +
        '<p>Your bag is empty.</p>' +
        '<a href="' + rel('collections/index.html') + '" class="btn btn-ghost btn-sm" style="margin-top:14px">Explore the collection</a></div>';
      foot.innerHTML = '';
      return;
    }

    body.innerHTML = c.map(function (i) {
      return '<div class="cart-item">' +
        '<div class="ph" data-tone="' + i.tone + '">' + (EMBLEMS[i.emblem] || EMBLEMS.mountain) + '</div>' +
        '<div>' +
          '<div class="ci-name">' + i.name + '</div>' +
          '<div class="ci-variant">Finish: ' + cap(i.variant) + '</div>' +
          '<div class="ci-qty"><button data-dec="' + i.key + '" aria-label="Decrease">−</button><span>' + i.qty + '</span><button data-inc="' + i.key + '" aria-label="Increase">+</button></div>' +
          '<button class="ci-remove" data-rm="' + i.key + '">Remove</button>' +
        '</div>' +
        '<div class="ci-price">' + money(i.price * i.qty) + '</div>' +
      '</div>';
    }).join('');

    var total = cartTotal(c);
    var remain = Math.max(0, FREE_SHIP - total);
    var pct = Math.min(100, (total / FREE_SHIP) * 100);
    var progress = remain > 0
      ? 'You are ' + money(remain) + ' away from <strong>free shipping</strong>.'
      : 'You have unlocked <strong>free shipping</strong> ✦';

    foot.innerHTML =
      '<div class="cart-progress">' + progress + '<div class="bar"><i style="width:' + pct + '%"></i></div></div>' +
      '<div class="cart-row"><span>Subtotal</span><span class="total">' + money(total) + '</span></div>' +
      '<button class="btn btn-primary btn-block" data-checkout>Checkout</button>' +
      '<div class="cart-note">Taxes &amp; shipping calculated at checkout. Demo store — no payment is taken.</div>';
  }

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* ---------- Drawer open/close ---------- */
  function openCart() {
    var d = document.getElementById('cartDrawer'), o = document.getElementById('drawerOverlay');
    if (d) d.classList.add('open');
    if (o) o.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    var d = document.getElementById('cartDrawer'), o = document.getElementById('drawerOverlay');
    if (d) d.classList.remove('open');
    if (o) o.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.HimalayaCart = { add: addToCart, open: openCart, close: closeCart };

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    // footer year
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

    renderPDP();
    renderGrids();
    renderCart();

    // header scroll shadow
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }

    // mobile nav
    var toggle = document.getElementById('navToggle');
    if (toggle && header) {
      toggle.addEventListener('click', function () { header.classList.toggle('menu-open'); });
      header.querySelectorAll('.main-nav a').forEach(function (a) {
        a.addEventListener('click', function () { header.classList.remove('menu-open'); });
      });
    }

    // reveal on scroll
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

    // cart open/close triggers
    document.querySelectorAll('[data-open-cart]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); openCart(); });
    });
    var ov = document.getElementById('drawerOverlay'); if (ov) ov.addEventListener('click', closeCart);
    var cx = document.getElementById('cartClose'); if (cx) cx.addEventListener('click', closeCart);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

    // delegated clicks: add / qty / remove / checkout
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-add],[data-inc],[data-dec],[data-rm],[data-checkout]');
      if (!t) return;
      if (t.hasAttribute('data-add'))   { e.preventDefault(); addToCart(t.getAttribute('data-add'), 1); }
      else if (t.hasAttribute('data-inc')) { var k=t.getAttribute('data-inc'); bump(k, +1); }
      else if (t.hasAttribute('data-dec')) { var k2=t.getAttribute('data-dec'); bump(k2, -1); }
      else if (t.hasAttribute('data-rm'))  { removeItem(t.getAttribute('data-rm')); }
      else if (t.hasAttribute('data-checkout')) {
        var foot = document.getElementById('cartFoot');
        if (foot) foot.insertAdjacentHTML('beforeend',
          '<div class="form-note ok" style="text-align:center">This is a demo storefront — checkout is not connected.</div>');
      }
    });

    function bump(key, d) {
      var c = readCart();
      for (var i=0;i<c.length;i++){ if (c[i].key === key) { setQty(key, c[i].qty + d); break; } }
    }

    // newsletter (demo)
    var nf = document.getElementById('subscribeForm');
    if (nf) nf.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('subscribeNote');
      var email = (document.getElementById('subscribeEmail') || {}).value || '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        note.textContent = 'Please enter a valid email address.'; note.className = 'form-note err'; return;
      }
      note.textContent = 'Welcome to the circle ✦ Your $10 code is on its way.'; note.className = 'form-note ok';
      nf.reset();
    });
  });
})();
