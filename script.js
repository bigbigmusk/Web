/* ============================================================
   Concord Trade — interactions
   ============================================================ */
(function () {
  'use strict';

  /* --- Year in footer --- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Header shadow on scroll --- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
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

  /* --- Reveal on scroll --- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
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

  /* --- RFQ form: compose a structured email via mailto --- */
  var form = document.getElementById('rfqForm');
  var note = document.getElementById('formNote');

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation on required fields
      var required = ['name', 'email', 'product'];
      var ok = true;
      required.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el || !el.value.trim()) { el && el.classList.add('invalid'); ok = false; }
        else { el.classList.remove('invalid'); }
      });
      var emailEl = document.getElementById('email');
      if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
        emailEl.classList.add('invalid'); ok = false;
      }

      if (!ok) {
        note.textContent = 'Please complete the required fields (name, a valid email, and product).';
        note.className = 'form-note err';
        return;
      }

      var lines = [
        'New RFQ from Concord Trade website', '',
        'Name: ' + val('name'),
        'Company: ' + (val('company') || '-'),
        'Email: ' + val('email'),
        'Target market: ' + (val('market') || '-'),
        '',
        'Product / category: ' + val('product'),
        'Target quantity: ' + (val('quantity') || '-'),
        'Target price: ' + (val('price') || '-'),
        'Packaging needs: ' + (val('packaging') || '-'),
        'Certification requirements: ' + (val('certification') || '-'),
        '',
        'Additional details:',
        (val('message') || '-')
      ];

      var subject = 'RFQ — ' + val('product') + (val('company') ? ' (' + val('company') + ')' : '');
      var mailto = 'mailto:info@concord-trade.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(lines.join('\n'));

      window.location.href = mailto;

      note.textContent = 'Opening your email app to send this RFQ to info@concord-trade.com. If nothing opens, email us directly.';
      note.className = 'form-note ok';
    });

    // Clear invalid state while typing
    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
    });
  }
})();
