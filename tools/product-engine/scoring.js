/* ============================================================
   选品决策引擎 — 多因子评分 + 蓝海雷达
   ============================================================ */
(function () {
  'use strict';
  var D = window.CBData, Chart = window.CBChart;

  // factor definitions: how to extract a raw value + direction
  var FACTORS = [
    { key: 'demand',    name: '需求热度', dir: 1,  get: function (c) { return D.mean(c.searchSeries.slice(-6)) * 0.6 + D.mean(c.exportSeries.slice(-6)) * 0.4 / 6; } },
    { key: 'growth',    name: '增长趋势', dir: 1,  get: function (c) { return c.growth; } },
    { key: 'comp',      name: '竞争优势', dir: -1, get: function (c) { return c.comp; } },   // lower comp = better
    { key: 'margin',    name: '利润空间', dir: 1,  get: function (c) { return c.margin; } },
    { key: 'customs',   name: '海关动能', dir: 1,  get: function (c) { return D.momentum(c.exportSeries); } },
    { key: 'ship',      name: '物流友好', dir: 1,  get: function (c) { return c.ship; } }
  ];

  var PRESETS = {
    balanced:  { demand: 22, growth: 20, comp: 18, margin: 18, customs: 12, ship: 10 },
    blueocean: { demand: 14, growth: 30, comp: 30, margin: 12, customs: 8,  ship: 6  },
    profit:    { demand: 16, growth: 16, comp: 14, margin: 34, customs: 10, ship: 10 },
    volume:    { demand: 24, growth: 14, comp: 10, margin: 12, customs: 30, ship: 10 },
    fast:      { demand: 18, growth: 16, comp: 14, margin: 16, customs: 8,  ship: 28 }
  };

  var cats = D.categories;
  var allCats = uniq(cats.map(function (c) { return c.cat; }));
  var state = {
    weights: Object.assign({}, PRESETS.balanced),
    cats: allCats.slice(),
    sortKey: 'score', sortDir: -1,
    blueOnly: false, selected: null
  };

  // ---- precompute normalized factor scores -----------------
  var normScores = {}; // id -> {key: 0..100}
  (function computeNorm() {
    FACTORS.forEach(function (f) {
      var raw = cats.map(function (c) { return f.get(c); });
      var lo = Math.min.apply(null, raw), hi = Math.max.apply(null, raw);
      var span = (hi - lo) || 1;
      cats.forEach(function (c, i) {
        var v = (raw[i] - lo) / span;            // 0..1 ascending
        if (f.dir < 0) v = 1 - v;                // invert (lower is better)
        (normScores[c.id] = normScores[c.id] || {})[f.key] = v * 100;
      });
    });
  })();

  function blueScore(c) {
    // high growth × low competition, scaled 0..100
    var g = normScores[c.id].growth, comp = normScores[c.id].comp; // comp already inverted (high=low competition)
    return Math.round(Math.sqrt((g / 100) * (comp / 100)) * 100);
  }

  function compositeScore(c) {
    var w = state.weights, sum = 0, tot = 0;
    FACTORS.forEach(function (f) { sum += normScores[c.id][f.key] * w[f.key]; tot += w[f.key]; });
    return tot ? sum / tot : 0;
  }

  function rows() {
    var list = cats.filter(function (c) { return state.cats.indexOf(c.cat) >= 0; });
    var blueVals = cats.map(blueScore).slice().sort(function (a, b) { return b - a; });
    var blueCut = blueVals[Math.floor(blueVals.length * 0.3)] || 0;
    var out = list.map(function (c) {
      var bs = blueScore(c);
      return {
        c: c, score: compositeScore(c), blue: bs, isBlue: bs >= blueCut && bs > 0,
        demand: normScores[c.id].demand, growth: c.growth, comp: c.comp,
        margin: c.margin, customs: D.momentum(c.exportSeries)
      };
    });
    if (state.blueOnly) out = out.filter(function (r) { return r.isBlue; });
    var k = state.sortKey, dir = state.sortDir;
    out.sort(function (a, b) {
      var av = sortVal(a, k), bv = sortVal(b, k);
      if (typeof av === 'string') return dir * av.localeCompare(bv);
      return dir * (av - bv);
    });
    return out;
  }
  function sortVal(r, k) {
    if (k === 'name') return r.c.zh;
    if (k === 'rank') return r.score;
    return r[k];
  }

  function scoreColor(s) {
    if (s >= 72) return '#1a7f4b';
    if (s >= 58) return '#2f6db0';
    if (s >= 44) return '#b8862b';
    return '#9aa3ad';
  }

  // ---- render -----------------------------------------------
  function render() {
    var data = rows();
    document.getElementById('count').textContent = '· 共 ' + data.length + ' 个品类';
    var body = document.getElementById('rankBody');
    body.innerHTML = '';
    data.forEach(function (r, i) {
      var tr = document.createElement('tr');
      tr.className = 'row' + (state.selected === r.c.id ? ' sel' : '');
      tr.innerHTML =
        '<td class="num" style="color:var(--muted);font-weight:700;">' + (i + 1) + '</td>' +
        '<td><span class="rank-name">' + (r.isBlue ? '★ ' : '') + r.c.zh +
            '<small>' + r.c.en + ' · HS ' + r.c.hs + '</small></span></td>' +
        '<td class="num"><span class="score-pill" style="background:' + scoreColor(r.score) + '">' + r.score.toFixed(0) + '</span>' +
            '<div class="bar" style="margin-top:5px;"><span style="width:' + r.score.toFixed(0) + '%"></span></div></td>' +
        '<td class="num">' + r.demand.toFixed(0) + '</td>' +
        '<td class="num delta-up">+' + r.growth + '</td>' +
        '<td class="num">' + r.comp + '</td>' +
        '<td class="num">' + r.margin + '</td>' +
        '<td class="num ' + (r.customs >= 0 ? 'delta-up">+' : 'delta-down">') + r.customs.toFixed(1) + '%</td>' +
        '<td class="num">' + (r.isBlue ? '<span class="tag tag-blue">' + r.blue + '</span>' : '<span style="color:var(--silver);">' + r.blue + '</span>') + '</td>';
      tr.addEventListener('click', function () { select(r.c.id); });
      body.appendChild(tr);
    });
    if (state.selected && data.some(function (r) { return r.c.id === state.selected; })) {
      renderDetail(state.selected);
    } else if (data.length) {
      select(data[0].c.id);
    }
  }

  function select(id) {
    state.selected = id;
    document.querySelectorAll('#rankBody tr').forEach(function (tr) { tr.classList.remove('sel'); });
    render();
  }

  function renderDetail(id) {
    var c = cats.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    document.getElementById('detail').style.display = 'block';
    document.getElementById('dName').textContent = c.zh;
    document.getElementById('dMeta').textContent = c.en + ' · HS ' + c.hs + ' · 主要市场：' + c.regions.join(' / ');

    Chart.radar(document.getElementById('radar'), {
      axes: FACTORS.map(function (f) { return { label: f.name, value: normScores[c.id][f.key] }; })
    });

    var mom = D.momentum(c.exportSeries);
    var m = document.getElementById('dMetrics');
    m.innerHTML = card('综合得分', compositeScore(c).toFixed(0), '') +
      card('蓝海得分', blueScore(c), '/100') +
      card('YoY 增长', '+' + c.growth, '%') +
      card('毛利率', c.margin, '%') +
      card('竞争强度', c.comp, '/100') +
      card('海关动能', (mom >= 0 ? '+' : '') + mom.toFixed(1), '%') +
      card('退货率', c.ret, '%') +
      card('均价', '$' + c.price, '');

    document.getElementById('dRec').innerHTML = recommend(c, mom);
  }
  function card(k, v, u) {
    return '<div class="metric"><div class="k">' + k + '</div><div class="v">' + v + '<small>' + u + '</small></div></div>';
  }

  function recommend(c, mom) {
    var bs = blueScore(c), sc = compositeScore(c);
    var verdict, why = [];
    if (sc >= 68) verdict = '<strong>强烈推荐</strong>：综合表现位居前列。';
    else if (sc >= 54) verdict = '<strong>值得关注</strong>：综合表现良好，建议小批量测款。';
    else verdict = '<strong>谨慎进入</strong>：综合得分偏低，需找到差异化切入点。';

    if (c.growth >= 28) why.push('品类高速增长（+' + c.growth + '%/年）');
    if (c.comp <= 60) why.push('竞争相对温和（' + c.comp + '/100）');
    else why.push('竞争激烈（' + c.comp + '/100），需差异化或私域');
    if (c.margin >= 47) why.push('利润空间充裕（毛利 ' + c.margin + '%）');
    if (mom >= 8) why.push('海关出口近半年加速（+' + mom.toFixed(0) + '%）');
    else if (mom < 0) why.push('海关出口近期回落（' + mom.toFixed(0) + '%），留意周期');
    if (c.ret >= 13) why.push('退货率偏高（' + c.ret + '%），关注尺码/质量');
    if (c.ship <= 50) why.push('体积/重量偏大，物流成本需测算');
    if (bs >= 60) why.push('★ 蓝海特征明显（蓝海得分 ' + bs + '）');

    return verdict + '<br><span style="color:var(--muted);font-size:0.86rem;">' + why.join('；') + '。</span>';
  }

  // ---- controls wiring --------------------------------------
  function buildWeights() {
    var box = document.getElementById('weights');
    box.innerHTML = '';
    FACTORS.forEach(function (f) {
      var row = document.createElement('div');
      row.className = 'weight-row';
      row.innerHTML = '<span class="name">' + f.name + '</span>' +
        '<input type="range" min="0" max="40" step="1" value="' + state.weights[f.key] + '" data-k="' + f.key + '">' +
        '<span class="pct" id="pct-' + f.key + '">' + pct(f.key) + '%</span>';
      box.appendChild(row);
    });
    box.querySelectorAll('input[type=range]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        state.weights[inp.dataset.k] = +inp.value;
        updatePcts(); render();
      });
    });
  }
  function totalW() { return FACTORS.reduce(function (s, f) { return s + state.weights[f.key]; }, 0); }
  function pct(k) { var t = totalW(); return t ? Math.round(state.weights[k] / t * 100) : 0; }
  function updatePcts() { FACTORS.forEach(function (f) { var el = document.getElementById('pct-' + f.key); if (el) el.textContent = pct(f.key) + '%'; }); }

  function buildCatChips() {
    var box = document.getElementById('catChips');
    box.innerHTML = '';
    var allChip = chip('全部', state.cats.length === allCats.length);
    allChip.addEventListener('click', function () {
      state.cats = state.cats.length === allCats.length ? [] : allCats.slice();
      buildCatChips(); render();
    });
    box.appendChild(allChip);
    allCats.forEach(function (cat) {
      var ch = chip(cat, state.cats.indexOf(cat) >= 0);
      ch.addEventListener('click', function () {
        var i = state.cats.indexOf(cat);
        if (i >= 0) state.cats.splice(i, 1); else state.cats.push(cat);
        buildCatChips(); render();
      });
      box.appendChild(ch);
    });
  }
  function chip(label, active) {
    var b = document.createElement('button');
    b.className = 'chip' + (active ? ' active' : ''); b.textContent = label; b.type = 'button';
    return b;
  }

  function applyPreset(name) {
    state.weights = Object.assign({}, PRESETS[name]);
    if (name === 'blueocean') { state.blueOnly = true; document.getElementById('blueOnly').checked = true; }
    buildWeights(); render();
  }

  function wireSort() {
    document.querySelectorAll('#rankTable th').forEach(function (th) {
      th.addEventListener('click', function () {
        var k = th.dataset.k;
        if (k === 'rank') return;
        if (state.sortKey === k) state.sortDir *= -1;
        else { state.sortKey = k; state.sortDir = (k === 'comp' ? 1 : -1); }
        // header arrow
        document.querySelectorAll('#rankTable th').forEach(function (h) { h.textContent = h.textContent.replace(/ [▾▴]$/, ''); });
        th.textContent += state.sortDir < 0 ? ' ▾' : ' ▴';
        render();
      });
    });
  }

  // ---- init -------------------------------------------------
  function init(data) {
    if (data) cats = data;
    document.getElementById('preset').addEventListener('change', function (e) { applyPreset(e.target.value); });
    document.getElementById('blueOnly').addEventListener('change', function (e) { state.blueOnly = e.target.checked; render(); });
    document.getElementById('resetBtn').addEventListener('click', function () {
      document.getElementById('preset').value = 'balanced';
      state.blueOnly = false; document.getElementById('blueOnly').checked = false;
      applyPreset('balanced');
    });
    buildWeights(); buildCatChips(); wireSort(); render();
    document.getElementById('year').textContent = new Date().getFullYear();
    window.addEventListener('resize', debounce(function () { if (state.selected) renderDetail(state.selected); }, 200));
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  // honour live data sources if configured, else bundled
  D.load().then(init);
})();
