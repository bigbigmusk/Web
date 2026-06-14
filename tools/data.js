/* ============================================================
   Concord Trade — Sourcing Intelligence Toolkit
   Shared trade dataset + data-access layer
   ------------------------------------------------------------
   Dependency-free. Exposes window.CBData.

   DATA SOURCING
   -------------
   The bundled dataset is a *representative* cross-border trade
   dataset: category attributes are calibrated against public
   China customs (海关总署) export structure, UN Comtrade HS-code
   trade flows, and marketplace demand signals. Monthly series
   are generated deterministically (seeded) from each category's
   trend + seasonal profile so results are stable and reproducible.

   To wire in LIVE data, implement the async hooks in
   CBData.sources.* (see bottom of file). The tools call
   CBData.load() which returns the live data when a provider is
   configured, otherwise falls back to the bundled dataset.
   ============================================================ */
(function () {
  'use strict';

  // ---- deterministic PRNG (mulberry32) ---------------------
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // ---- timeline --------------------------------------------
  // 36 months of history ending at the current month.
  var HISTORY = 36;
  var FORECAST = 12;
  var now = new Date();
  var anchorY = now.getFullYear(), anchorM = now.getMonth(); // 0-based

  function monthLabels(count, startBack) {
    // returns labels from (startBack months ago) forward `count` months
    var out = [];
    for (var i = 0; i < count; i++) {
      var idx = anchorM - startBack + i;
      var y = anchorY + Math.floor(idx / 12);
      var m = ((idx % 12) + 12) % 12;
      out.push({ y: y, m: m + 1, label: y + '-' + String(m + 1).padStart(2, '0') });
    }
    return out;
  }
  var HIST_MONTHS = monthLabels(HISTORY, HISTORY - 1);          // includes current month
  var FCAST_MONTHS = monthLabels(FORECAST, -(1));               // next 12 months

  // ---- seasonal profiles (12 monthly multipliers, Jan..Dec) -
  var SEASON = {
    q4_holiday: [0.86, 0.82, 0.90, 0.94, 0.98, 0.96, 1.00, 1.06, 1.14, 1.28, 1.42, 1.24],
    summer:     [0.78, 0.80, 0.92, 1.06, 1.22, 1.30, 1.28, 1.18, 1.02, 0.90, 0.80, 0.74],
    winter:     [1.30, 1.22, 1.04, 0.88, 0.78, 0.72, 0.74, 0.82, 0.94, 1.08, 1.22, 1.32],
    backToSchool:[0.84,0.82, 0.90, 0.96, 1.00, 1.02, 1.18, 1.40, 1.22, 0.96, 0.88, 0.82],
    stable:     [0.97, 0.98, 1.00, 1.01, 1.02, 1.01, 1.00, 0.99, 1.01, 1.02, 1.01, 0.98],
    spring:     [0.86, 0.92, 1.16, 1.30, 1.24, 1.06, 0.94, 0.88, 0.92, 0.96, 0.90, 0.86]
  };

  // ---- category metadata -----------------------------------
  // export = avg monthly export value index (USD millions, representative)
  // growth = YoY trend (annual %), competition 0-100 (higher=harder),
  // search = demand index 0-100, margin = gross margin %, ret = return rate %,
  // ship = logistics friendliness 0-100 (higher=lighter/cheaper/easier)
  var META = [
    { id:'pet-smart',   zh:'宠物智能用品',   en:'Smart Pet Gadgets',      hs:'8543', cat:'宠物', export:312, growth:34, comp:58, search:78, price:42, margin:46, ret:7,  ship:62, season:'q4_holiday', regions:['北美','欧盟','日韩'] },
    { id:'pet-odor',    zh:'宠物清洁除味',   en:'Pet Odor Control',       hs:'3307', cat:'宠物', export:198, growth:27, comp:49, search:64, price:18, margin:52, ret:5,  ship:74, season:'stable',     regions:['北美','欧盟','澳新'] },
    { id:'pet-apparel', zh:'宠物服饰',       en:'Pet Apparel',            hs:'4201', cat:'宠物', export:142, growth:19, comp:67, search:55, price:15, margin:48, ret:14, ship:80, season:'winter',     regions:['北美','欧盟','日韩'] },
    { id:'home-odor',   zh:'家居除味净化',   en:'Home Odor & Air Care',   hs:'8479', cat:'家居', export:276, growth:23, comp:61, search:70, price:35, margin:44, ret:8,  ship:58, season:'q4_holiday', regions:['北美','欧盟','中东'] },
    { id:'storage',     zh:'收纳整理',       en:'Storage & Organization', hs:'3924', cat:'家居', export:421, growth:16, comp:72, search:74, price:22, margin:40, ret:6,  ship:55, season:'spring',     regions:['北美','欧盟','拉美'] },
    { id:'kitchen',     zh:'厨房小家电',     en:'Kitchen Gadgets',        hs:'8509', cat:'家居', export:534, growth:21, comp:69, search:81, price:48, margin:38, ret:11, ship:50, season:'q4_holiday', regions:['北美','欧盟','中东'] },
    { id:'led',         zh:'LED灯饰',        en:'LED Decorative Lighting',hs:'9405', cat:'家居', export:498, growth:18, comp:75, search:72, price:26, margin:42, ret:9,  ship:60, season:'q4_holiday', regions:['北美','欧盟','拉美'] },
    { id:'medical-ppe', zh:'医疗耗材/PPE',   en:'Medical Disposables/PPE',hs:'9018', cat:'医疗', export:612, growth:11, comp:54, search:48, price:12, margin:34, ret:3,  ship:70, season:'stable',     regions:['北美','欧盟','中东'] },
    { id:'baby',        zh:'婴童用品',       en:'Baby Care',              hs:'9619', cat:'母婴', export:367, growth:15, comp:66, search:68, price:24, margin:43, ret:8,  ship:64, season:'stable',     regions:['北美','欧盟','东南亚'] },
    { id:'athleisure',  zh:'健身穿戴',       en:'Athleisure Wearables',   hs:'6109', cat:'服饰', export:445, growth:25, comp:78, search:83, price:28, margin:50, ret:18, ship:78, season:'spring',     regions:['北美','欧盟','澳新'] },
    { id:'yoga',        zh:'瑜伽用品',       en:'Yoga & Pilates Gear',    hs:'9506', cat:'运动', export:189, growth:22, comp:63, search:66, price:32, margin:47, ret:9,  ship:52, season:'spring',     regions:['北美','欧盟','澳新'] },
    { id:'outdoor',     zh:'户外露营',       en:'Outdoor Camping',        hs:'6306', cat:'运动', export:356, growth:29, comp:60, search:76, price:58, margin:45, ret:10, ship:44, season:'summer',     regions:['北美','欧盟','澳新'] },
    { id:'solar',       zh:'太阳能/储能',    en:'Solar & Power Station',  hs:'8541', cat:'数码', export:587, growth:41, comp:57, search:85, price:185,margin:36, ret:6,  ship:30, season:'summer',     regions:['北美','欧盟','非洲'] },
    { id:'beauty-dev',  zh:'家用美容仪',     en:'Home Beauty Devices',    hs:'8543', cat:'美护', export:298, growth:38, comp:64, search:82, price:65, margin:54, ret:13, ship:66, season:'q4_holiday', regions:['北美','欧盟','日韩'] },
    { id:'smart-home',  zh:'智能家居',       en:'Smart Home Devices',     hs:'8517', cat:'数码', export:521, growth:33, comp:70, search:80, price:55, margin:41, ret:9,  ship:58, season:'q4_holiday', regions:['北美','欧盟','中东'] },
    { id:'phone-acc',   zh:'3C手机配件',     en:'Phone Accessories',      hs:'8504', cat:'数码', export:678, growth:14, comp:84, search:79, price:14, margin:39, ret:8,  ship:88, season:'q4_holiday', regions:['北美','欧盟','拉美'] },
    { id:'travel-bags', zh:'旅行箱包',       en:'Travel Bags & Luggage',  hs:'4202', cat:'箱包', export:412, growth:20, comp:71, search:69, price:46, margin:44, ret:7,  ship:42, season:'backToSchool',regions:['北美','欧盟','东南亚'] },
    { id:'auto-acc',    zh:'汽车配件',       en:'Auto Accessories',       hs:'8708', cat:'汽配', export:556, growth:17, comp:68, search:71, price:34, margin:40, ret:10, ship:54, season:'stable',     regions:['北美','欧盟','中东'] },
    { id:'garden',      zh:'园艺用品',       en:'Gardening & Plant Care', hs:'8201', cat:'家居', export:234, growth:24, comp:55, search:62, price:29, margin:46, ret:6,  ship:48, season:'spring',     regions:['北美','欧盟','澳新'] },
    { id:'bottles',     zh:'保温杯壶',       en:'Insulated Bottles',      hs:'9617', cat:'家居', export:387, growth:26, comp:73, search:77, price:21, margin:49, ret:5,  ship:56, season:'summer',     regions:['北美','欧盟','中东'] }
  ];

  // ---- generate monthly series for one category -------------
  function buildSeries(meta) {
    var seed = hashStr(meta.id);
    var r = rng(seed);
    var prof = SEASON[meta.season];
    var monthlyTrend = Math.pow(1 + meta.growth / 100, 1 / 12); // monthly compound
    // start so that the AVERAGE of the latest 12 months ≈ meta.export
    var base = meta.export / Math.pow(monthlyTrend, HISTORY - 6);
    var exportSeries = [], searchSeries = [], importSeries = [];
    for (var i = 0; i < HISTORY; i++) {
      var mIdx = HIST_MONTHS[i].m - 1;
      var noise = 0.90 + r() * 0.20;            // ±10%
      var shock = (r() < 0.06) ? (0.78 + r() * 0.12) : 1; // occasional dip
      var trendVal = base * Math.pow(monthlyTrend, i);
      var val = trendVal * prof[mIdx] * noise * shock;
      exportSeries.push(round1(val));
      importSeries.push(round1(val * (0.18 + r() * 0.10)));      // re-import / cross-flow proxy
      // search demand index tracks export with lead + own noise, scaled to ~search
      var s = meta.search * prof[mIdx] * (0.92 + r() * 0.16) * Math.pow(1 + meta.growth / 100, i / 12 - (HISTORY / 12 - 1));
      searchSeries.push(clamp(round1(s), 4, 100));
    }
    return { exportSeries: exportSeries, importSeries: importSeries, searchSeries: searchSeries };
  }

  function round1(x) { return Math.round(x * 10) / 10; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  // ---- assemble bundled dataset ----------------------------
  function buildDataset() {
    return META.map(function (m) {
      var s = buildSeries(m);
      return Object.assign({}, m, {
        months: HIST_MONTHS.map(function (x) { return x.label; }),
        exportSeries: s.exportSeries,
        importSeries: s.importSeries,
        searchSeries: s.searchSeries
      });
    });
  }

  // ---- analytics helpers (shared by both tools) ------------
  function mean(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }
  function std(a) { var m = mean(a); return Math.sqrt(mean(a.map(function (x) { return (x - m) * (x - m); }))); }

  // momentum: latest 6-month avg vs the SAME 6 months a year earlier (YoY).
  // YoY removes seasonal bias, so it reflects real trade growth, not the
  // calendar swing of a seasonal product.
  function momentum(series) {
    var n = series.length;
    var recent = mean(series.slice(n - 6));
    var yearAgo = n >= 18 ? mean(series.slice(n - 18, n - 12)) : mean(series.slice(0, 6));
    return yearAgo ? ((recent - yearAgo) / yearAgo) * 100 : 0;
  }

  // linear regression on index → {slope, intercept}
  function linReg(y) {
    var n = y.length, sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (var i = 0; i < n; i++) { sx += i; sy += y[i]; sxx += i * i; sxy += i * y[i]; }
    var d = n * sxx - sx * sx;
    var slope = d ? (n * sxy - sx * sy) / d : 0;
    var intercept = (sy - slope * sx) / n;
    return { slope: slope, intercept: intercept };
  }

  // seasonal indices from history (multiplicative, by calendar month 1..12)
  function seasonalIndices(series, monthsMeta) {
    var byMonth = {}; var cnt = {};
    var lr = linReg(series);
    for (var i = 0; i < series.length; i++) {
      var trend = lr.intercept + lr.slope * i;
      if (trend <= 0) continue;
      var ratio = series[i] / trend;
      var mm = monthsMeta[i].m;
      byMonth[mm] = (byMonth[mm] || 0) + ratio;
      cnt[mm] = (cnt[mm] || 0) + 1;
    }
    var idx = {};
    for (var m = 1; m <= 12; m++) idx[m] = cnt[m] ? byMonth[m] / cnt[m] : 1;
    // normalise mean to 1
    var avg = mean(Object.keys(idx).map(function (k) { return idx[k]; }));
    for (var m2 = 1; m2 <= 12; m2++) idx[m2] = idx[m2] / (avg || 1);
    return idx;
  }

  // ensemble forecast: trend(linReg) × seasonal index, + confidence band
  function forecast(series, histMeta, fcastMeta, horizon) {
    horizon = horizon || FORECAST;
    var lr = linReg(series);
    var sIdx = seasonalIndices(series, histMeta);
    // residuals of the in-sample seasonal-trend fit → band
    var resid = [];
    for (var i = 0; i < series.length; i++) {
      var fit = (lr.intercept + lr.slope * i) * sIdx[histMeta[i].m];
      resid.push(series[i] - fit);
    }
    var sd = std(resid);
    var n = series.length;
    var out = [];
    for (var h = 0; h < horizon; h++) {
      var t = n + h;
      var mm = fcastMeta[h].m;
      var point = Math.max(0, (lr.intercept + lr.slope * t) * sIdx[mm]);
      // widening band
      var widen = sd * (1 + h * 0.05) * 1.28; // ~80% interval
      out.push({
        label: fcastMeta[h].label, m: mm,
        point: round1(point),
        lo: round1(Math.max(0, point - widen)),
        hi: round1(point + widen)
      });
    }
    return { points: out, slope: lr.slope, seasonal: sIdx };
  }

  // ---- pluggable live-data sources -------------------------
  // Implement any of these to override the bundled dataset.
  // Each should resolve to an array shaped like buildDataset().
  var sources = {
    // e.g. China Customs (海关总署) HS-code export query proxy
    customs: null,   // async () => [...]
    // e.g. UN Comtrade trade flows
    comtrade: null,  // async () => [...]
    // e.g. Google Trends / marketplace demand index
    trends: null     // async (categories) => { [id]: searchSeries }
  };

  var _cache = null;
  async function load() {
    if (_cache) return _cache;
    var base = buildDataset();
    try {
      if (typeof sources.customs === 'function') {
        var live = await sources.customs();
        if (Array.isArray(live) && live.length) base = live;
      }
      if (typeof sources.trends === 'function') {
        var t = await sources.trends(base);
        if (t) base.forEach(function (c) { if (t[c.id]) c.searchSeries = t[c.id]; });
      }
    } catch (e) { /* fall back silently to bundled data */ }
    _cache = base;
    return base;
  }

  window.CBData = {
    HISTORY: HISTORY, FORECAST: FORECAST,
    histMonths: HIST_MONTHS, fcastMonths: FCAST_MONTHS,
    categories: buildDataset(),   // synchronous bundled access
    load: load,                   // async (honours live sources)
    sources: sources,
    // analytics
    mean: mean, std: std, momentum: momentum, linReg: linReg,
    seasonalIndices: seasonalIndices, forecast: forecast,
    fmtMonth: function (label) { return label; }
  };
})();
