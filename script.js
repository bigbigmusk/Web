/* ============================================================
   VANTAIRE — interactions
   Dependency-free vanilla JS.
   ============================================================ */
(function () {
  "use strict";

  var header = document.getElementById("header");
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("primaryNav");

  /* ---- Mobile menu ---- */
  function setMenu(open) {
    header.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.setAttribute("aria-hidden", String(!open));
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setMenu(!header.classList.contains("menu-open"));
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ---- Header scrolled state ---- */
  var lastScroll = -1;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if ((y > 8) !== (lastScroll > 8)) {
      header.classList.toggle("scrolled", y > 8);
    }
    lastScroll = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Newsletter ---- */
  var form = document.getElementById("newsForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("email");
      var value = (input.value || "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      note.classList.remove("error");
      if (!valid) {
        note.textContent = "Please enter a valid email address.";
        note.classList.add("error");
        input.focus();
        return;
      }
      note.textContent = "Thank you. You have entered the air — check your inbox to confirm.";
      form.reset();
    });
  }

  /* ---- Footer year ---- */
  var year = document.getElementById("year");
  if (year) { year.textContent = new Date().getFullYear(); }
})();
