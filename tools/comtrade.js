/* ============================================================
   Concord Trade Toolkit — LIVE customs data: UN Comtrade
   ------------------------------------------------------------
   Wires window.CBData.sources.customs to the UN Comtrade FREE
   "preview" API (no key required, ~500 rows/call, CORS-enabled):

     https://comtradeapi.un.org/public/v1/preview/C/M/HS
        ?reporterCode=156   (China, M49)
        &partnerCode=0      (World)
        &flowCode=X,M       (export + import)
        &cmdCode=<HS4>
        &period=YYYYMM,YYYYMM,...   (our 36-month timeline)

   primaryValue (USD) → divided by 1e6 → millions, matching the
   tools' scale. One request per unique HS code (~19), pooled.
   Months Comtrade hasn't published yet (recent lag) are patched
   with the bundled model, scaled to the live level, so series
   stay complete. ANY failure → silent fallback to bundled data.

   Optional auth: set CBData.comtradeKey or ?comtradeKey=... to
   use a registered subscription key (higher limits).
   ============================================================ */
(function () {
  'use strict';
  var D = window.CBData;
  if (!D) return;
  var BASE = 'https://comtradeapi.un.org/public/v1/preview/C/M/HS';

  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function avg(a) { return a.length ? a.reduce(function (s, v) { return s + v; }, 0) / a.length : 0; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function periodOf(label) { return label.replace('-', ''); }      // "2023-07" -> "202307"

  function key() {
    var q = new URLSearchParams(location.search).get('comtradeKey');
    return q || D.comtradeKey || null;
  }

  // simple concurrency pool
  async function pool(items, n, worker) {
    var i = 0;
    async function run() { while (i < items.length) { var k = i++; await worker(items[k]); } }
    var runners = [];
    for (var c = 0; c < Math.min(n, items.length); c++) runners.push(run());
    await Promise.all(runners);
  }

  // patch missing (null) months using bundled shape, scaled to live level
  function fill(real, fb) {
    var known = real.filter(function (v) { return v != null; });
    if (!known.length) return fb.slice();
    var ratio = avg(known) / (avg(fb) || 1);
    return real.map(function (v, i) { return v != null ? v : r1(fb[i] * ratio); });
  }

  async function fetchCustoms(bundled, onProgress) {
    var months = D.histMonths.map(function (m) { return periodOf(m.label); });
    var periodStr = months.join(',');
    var hsList = uniq(bundled.map(function (c) { return c.hs; }));
    var byHs = {};        // hs -> { X:{period:val}, M:{period:val} }
    var done = 0;
    var headers = {}; var k = key(); if (k) headers['Ocp-Apim-Subscription-Key'] = k;

    await pool(hsList, 4, async function (hs) {
      try {
        var url = BASE + '?reporterCode=156&partnerCode=0&partner2Code=0&flowCode=X,M'
          + '&cmdCode=' + encodeURIComponent(hs) + '&period=' + encodeURIComponent(periodStr);
        var res = await fetch(url, { headers: headers, mode: 'cors' });
        if (res.ok) {
          var j = await res.json();
          var rec = { X: {}, M: {} };
          (j.data || []).forEach(function (row) {
            var f = row.flowCode; if (f !== 'X' && f !== 'M') return;
            var p = String(row.period);
            rec[f][p] = (rec[f][p] || 0) + (+row.primaryValue || 0);
          });
          byHs[hs] = rec;
        }
      } catch (e) { /* keep this HS on bundled */ }
      done++; if (onProgress) onProgress(done, hsList.length);
    });

    // did we get ANY real export rows? if not, force fallback
    var anyLive = Object.keys(byHs).some(function (hs) { return Object.keys(byHs[hs].X).length > 0; });
    if (!anyLive) throw new Error('no live customs rows (CORS / rate-limit / no data)');

    return bundled.map(function (c) {
      var rec = byHs[c.hs];
      if (!rec || Object.keys(rec.X).length === 0) return c;   // unchanged (bundled)
      var exp = D.histMonths.map(function (m) { var v = rec.X[periodOf(m.label)]; return v != null ? r1(v / 1e6) : null; });
      var imp = D.histMonths.map(function (m) { var v = rec.M[periodOf(m.label)]; return v != null ? r1(v / 1e6) : null; });
      var covered = exp.filter(function (v) { return v != null; }).length;
      return Object.assign({}, c, {
        exportSeries: fill(exp, c.exportSeries),
        importSeries: fill(imp, c.importSeries),
        _live: true, _coverage: covered, _total: exp.length
      });
    });
  }

  D.sources.customs = fetchCustoms;

  // -------- reusable data-source toggle UI --------------------
  // CBData.mountSourceToggle('elementId', function(categories){ ...re-render... })
  D.mountSourceToggle = function (elId, onData) {
    var el = document.getElementById(elId);
    if (!el) return;
    var LS = 'cb_src';
    el.innerHTML =
      '<label style="display:block;font-size:0.82rem;font-weight:600;color:var(--ink);margin-bottom:7px;">数据源</label>' +
      '<div class="src-seg">' +
        '<button type="button" data-v="bundled">内置样本</button>' +
        '<button type="button" data-v="live">实时海关</button>' +
      '</div>' +
      '<div class="src-status" style="font-size:0.76rem;color:var(--muted);margin-top:8px;line-height:1.4;"></div>';
    var btns = el.querySelectorAll('button');
    var status = el.querySelector('.src-status');
    function activate(v) { btns.forEach(function (b) { b.classList.toggle('active', b.dataset.v === v); }); }
    function set(html) { status.innerHTML = html; }

    function toBundled() {
      activate('bundled'); localStorage.setItem(LS, 'bundled');
      set('内置代表性贸易数据集（确定性、可复算）');
      onData(D.bundled);
    }
    function toLive() {
      activate('live');
      set('<span class="spin"></span> 正在拉取 UN&nbsp;Comtrade 海关数据…');
      D.fetchLive(function (d, t) { set('<span class="spin"></span> 海关数据 ' + d + '/' + t + ' HS 编码…'); })
        .then(function (data) {
          var liveCats = data.filter(function (c) { return c._live; });
          if (liveCats.length) {
            localStorage.setItem(LS, 'live');
            set('✓ 实时海关数据 · UN&nbsp;Comtrade（中国出口 · HS · 月度）· ' + liveCats.length + ' 个品类已更新');
            onData(data);
          } else {
            set('⚠ 实时接口暂不可用（CORS / 限流），已回退内置数据');
            activate('bundled'); onData(D.bundled);
          }
        });
    }
    btns.forEach(function (b) { b.addEventListener('click', b.dataset.v === 'live' ? toLive : toBundled); });

    var pref = (new URLSearchParams(location.search).get('live') === 'comtrade') ? 'live' : localStorage.getItem(LS);
    if (pref === 'live') toLive();
    else { activate('bundled'); set('内置代表性贸易数据集（确定性、可复算）'); }
  };
})();
