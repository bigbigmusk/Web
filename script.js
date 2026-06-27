/* ============================================================
   GOGO CHINA TRIPS — interactions
   Dependency-free vanilla JS
   ============================================================ */
(function () {
  'use strict';

  /* --- Year in footer --- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Header shadow on scroll --- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Mobile nav toggle --- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Scroll reveal --- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* --- Hero search → would route to /trips with params (MVP demo) --- */
  var searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(searchForm);
      var params = new URLSearchParams();
      ['city', 'date', 'need'].forEach(function (k) {
        var v = data.get(k);
        if (v) params.set(k, v);
      });
      // In production this navigates to the product list (WEB-LIST) with filters in the URL.
      var trips = document.getElementById('trips');
      if (trips) trips.scrollIntoView({ behavior: 'smooth' });
      if (window.history && history.replaceState) {
        history.replaceState(null, '', params.toString() ? '#trips?' + params.toString() : '#trips');
      }
    });
  }

  /* --- Demo lead/booking forms: friendly inline confirmation --- */
  document.querySelectorAll('.card-form').forEach(function (form) {
    if (form.tagName !== 'FORM') return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = '✓ Request received — we\'ll be in touch';
      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = original;
        form.reset();
      }, 2600);
    });
  });
})();
