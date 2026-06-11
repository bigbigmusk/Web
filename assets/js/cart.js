/* =====================================================================
   GAWU OBJECTS — Cart (localStorage, no backend)
   ---------------------------------------------------------------------
   Exposes window.Cart with: get, count, subtotal, add, setQty, remove,
   clear, and an onChange subscription used to keep the header badge and
   cart page in sync. Stored under the key below.
   ===================================================================== */
(function () {
  var KEY = "gawu_cart_v1";          // localStorage key for the cart
  var VIEWED_KEY = "gawu_viewed_v1"; // recently-viewed product ids
  var listeners = [];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    listeners.forEach(function (fn) { try { fn(items); } catch (e) {} });
  }

  var Cart = {
    /* items: [{ id, qty }] -------------------------------------------- */
    get: function () { return read(); },

    /* total number of units in the cart ------------------------------ */
    count: function () {
      return read().reduce(function (n, i) { return n + i.qty; }, 0);
    },

    /* full line data joined with the catalogue ----------------------- */
    lines: function () {
      return read().map(function (i) {
        var p = window.GAWU.product(i.id);
        return p ? { product: p, qty: i.qty, lineTotal: p.price * i.qty } : null;
      }).filter(Boolean);
    },

    subtotal: function () {
      return this.lines().reduce(function (s, l) { return s + l.lineTotal; }, 0);
    },

    add: function (id, qty) {
      qty = qty || 1;
      var items = read();
      var found = items.find(function (i) { return i.id === id; });
      if (found) { found.qty += qty; } else { items.push({ id: id, qty: qty }); }
      write(items);
    },

    setQty: function (id, qty) {
      var items = read();
      var found = items.find(function (i) { return i.id === id; });
      if (!found) return;
      found.qty = Math.max(1, qty);
      write(items);
    },

    remove: function (id) {
      write(read().filter(function (i) { return i.id !== id; }));
    },

    clear: function () { write([]); },

    onChange: function (fn) { listeners.push(fn); },

    /* Recently viewed (used on the product page) --------------------- */
    pushViewed: function (id) {
      try {
        var list = JSON.parse(localStorage.getItem(VIEWED_KEY)) || [];
        list = list.filter(function (x) { return x !== id; });
        list.unshift(id);
        list = list.slice(0, 8);
        localStorage.setItem(VIEWED_KEY, JSON.stringify(list));
      } catch (e) {}
    },
    viewed: function (excludeId) {
      try {
        var list = JSON.parse(localStorage.getItem(VIEWED_KEY)) || [];
        return list.filter(function (x) { return x !== excludeId; });
      } catch (e) { return []; }
    },
  };

  window.Cart = Cart;
})();
