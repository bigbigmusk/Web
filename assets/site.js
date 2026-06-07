/* Concord Trade — shared scripts */
(function () {
  // current year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // header shadow on scroll
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      window.scrollY > 8 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // mobile nav
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

  // reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // RFQ form -> mailto
  var form = document.getElementById('rfqForm');
  if (form) {
    var note = document.getElementById('formNote');
    var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['name', 'email', 'product'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !el.value.trim()) { el.classList.add('invalid'); ok = false; }
        else if (el) { el.classList.remove('invalid'); }
      });
      var em = document.getElementById('email');
      if (em && em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) { em.classList.add('invalid'); ok = false; }
      if (!ok) {
        if (note) { note.textContent = 'Please complete the required fields (name, a valid email, and product).'; note.className = 'form-note err'; }
        return;
      }
      var lines = [
        'New RFQ from Concord Trade website', '',
        'Name: ' + val('name'),
        'Company: ' + (val('company') || '-'),
        'Email: ' + val('email'),
        'Target market: ' + (val('market') || '-'), '',
        'Product / category: ' + val('product'),
        'Target quantity: ' + (val('quantity') || '-'),
        'Target price: ' + (val('price') || '-'),
        'Packaging needs: ' + (val('packaging') || '-'),
        'Certification requirements: ' + (val('certification') || '-'), '',
        'Additional details:', (val('message') || '-')
      ];
      var subject = 'RFQ — ' + val('product') + (val('company') ? ' (' + val('company') + ')' : '');
      window.location.href = 'mailto:info@concord-trade.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      if (note) { note.textContent = 'Opening your email app to send this RFQ to info@concord-trade.com. If nothing opens, email us directly.'; note.className = 'form-note ok'; }
    });
    form.addEventListener('input', function (e) {
      if (e.target.classList && e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
    });
  }
})();
