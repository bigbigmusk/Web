/* ============================================================
   Concord Trade — i18n engine (EN / ZH / ES / FR)
   Applies translations from translations.js, persists the
   chosen language, wires the header language switcher, and
   keeps <html lang>, <title> and meta description in sync.
   ============================================================ */
(function () {
  'use strict';

  var DICT = window.TRANSLATIONS || {};
  var SUPPORTED = ['en', 'zh', 'es', 'fr'];
  var STORAGE_KEY = 'ct-lang';
  // html lang attribute values per UI language
  var HTML_LANG = { en: 'en', zh: 'zh-Hans', es: 'es', fr: 'fr' };

  function pick(lang) {
    if (!lang) return null;
    lang = lang.toLowerCase();
    if (SUPPORTED.indexOf(lang) !== -1) return lang;
    var base = lang.split('-')[0];
    return SUPPORTED.indexOf(base) !== -1 ? base : null;
  }

  function detect() {
    // 1) ?lang= query param  2) saved choice  3) browser  4) en
    try {
      var qs = pick(new URLSearchParams(window.location.search).get('lang'));
      if (qs) return qs;
    } catch (e) { /* no-op */ }
    var saved = null;
    try { saved = pick(localStorage.getItem(STORAGE_KEY)); } catch (e) { /* no-op */ }
    if (saved) return saved;
    var navs = navigator.languages || [navigator.language];
    for (var i = 0; i < navs.length; i++) {
      var m = pick(navs[i]);
      if (m) return m;
    }
    return 'en';
  }

  var current = detect();

  function t(key) {
    var pack = DICT[current] || DICT.en || {};
    if (pack[key] != null) return pack[key];
    var en = DICT.en || {};
    return en[key] != null ? en[key] : key;
  }

  function setMeta(name, value, attr) {
    attr = attr || 'name';
    var el = document.head.querySelector('meta[' + attr + '="' + name + '"]');
    if (el) el.setAttribute('content', value);
  }

  function apply(lang) {
    current = SUPPORTED.indexOf(lang) !== -1 ? lang : 'en';

    document.documentElement.setAttribute('lang', HTML_LANG[current] || current);

    // text content
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    // html content (e.g. titles with <br>)
    var htmlNodes = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlNodes.length; j++) {
      htmlNodes[j].innerHTML = t(htmlNodes[j].getAttribute('data-i18n-html'));
    }
    // placeholders
    var phNodes = document.querySelectorAll('[data-i18n-ph]');
    for (var k = 0; k < phNodes.length; k++) {
      phNodes[k].setAttribute('placeholder', t(phNodes[k].getAttribute('data-i18n-ph')));
    }

    // document head
    document.title = t('meta_title');
    setMeta('description', t('meta_desc'));
    setMeta('og:title', t('meta_title'), 'property');
    setMeta('twitter:title', t('meta_title'));

    // switcher active state
    var btns = document.querySelectorAll('#langSwitch [data-lang]');
    for (var b = 0; b < btns.length; b++) {
      var on = btns[b].getAttribute('data-lang') === current;
      btns[b].classList.toggle('active', on);
      btns[b].setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    try { localStorage.setItem(STORAGE_KEY, current); } catch (e) { /* no-op */ }
  }

  function wire() {
    var sw = document.getElementById('langSwitch');
    if (sw) {
      sw.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-lang]');
        if (!btn) return;
        apply(btn.getAttribute('data-lang'));
      });
    }
    apply(current);
  }

  // public API (used by script.js for form messages)
  window.I18N = {
    t: t,
    get lang() { return current; },
    set: apply
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
