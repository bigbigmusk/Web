/* China West Journeys — site interactions (dependency-free) */
(function () {
  "use strict";

  /* ---------- sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("menu-open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    header.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("menu-open");
        toggle.classList.remove("open");
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.setAttribute("aria-expanded", "false");
    q.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.maxHeight = open ? a.scrollHeight + "px" : null;
    });
  });

  /* ---------- tour filtering ---------- */
  var grid = document.querySelector("[data-tour-grid]");
  if (grid) {
    var selDest = document.querySelector("[data-filter='destination']");
    var selDur = document.querySelector("[data-filter='duration']");
    var selStyle = document.querySelector("[data-filter='style']");
    var countEl = document.querySelector("[data-tour-count]");
    var empty = document.querySelector(".no-results");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".tour-card"));

    var apply = function () {
      var d = selDest ? selDest.value : "all";
      var u = selDur ? selDur.value : "all";
      var s = selStyle ? selStyle.value : "all";
      var shown = 0;
      cards.forEach(function (c) {
        var md = (c.getAttribute("data-destination") || "").split(",");
        var matchD = d === "all" || md.indexOf(d) !== -1;
        var matchU = u === "all" || c.getAttribute("data-duration") === u;
        var matchS = s === "all" || c.getAttribute("data-style") === s;
        var ok = matchD && matchU && matchS;
        c.classList.toggle("hidden", !ok);
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown + (shown === 1 ? " journey" : " journeys");
      if (empty) empty.classList.toggle("show", shown === 0);
    };
    [selDest, selDur, selStyle].forEach(function (s) { if (s) s.addEventListener("change", apply); });
    apply();
  }

  /* ---------- forms (static-host friendly) ---------- */
  document.querySelectorAll("form[data-inquiry]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var success = form.querySelector(".form-success");
      var to = form.getAttribute("data-email") || "hello@chinawestjourneys.com";
      var subject = encodeURIComponent(form.getAttribute("data-subject") || "Trip inquiry — China West Journeys");
      var lines = [];
      new FormData(form).forEach(function (v, k) {
        if (v) lines.push(k.replace(/_/g, " ") + ": " + v);
      });
      var body = encodeURIComponent(lines.join("\n"));
      if (success) {
        success.classList.add("show");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
      window.setTimeout(function () {
        window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
      }, 400);
    });
  });

  /* ---------- footer year ---------- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
