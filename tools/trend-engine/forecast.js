/* ============================================================
   趋势预测引擎 — 海关时间序列预测 (trend × seasonality)
   ============================================================ */
(function () {
  'use strict';
  var D = window.CBData, Chart = window.CBChart;
  var MONTH_CN = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var NAVY = '#16335a', SILVER = '#8f99a5';

  var cats = D.categories;
  var state = { id: cats[0].id, metric: 'exportSeries', overlay: true };

  function cur() { return cats.filter(function (c) { return c.id === state.id; })[0]; }
  function unitOf(metric) { return metric === 'exportSeries' ? '百万美元' : '指数'; }
  function nameOf(metric) { return metric === 'exportSeries' ? '海关出口额' : '需求景气指数'; }

  function render() {
    var c = cur();
    var primary = state.metric;
    var secondary = primary === 'exportSeries' ? 'searchSeries' : 'exportSeries';
    var hist = c[primary];
    var fc = D.forecast(hist, D.histMonths, D.fcastMonths);
    var unit = unitOf(primary);

    // ---- titles
    document.getElementById('mainTitle').textContent = c.zh + ' · ' + nameOf(primary) + '趋势与预测';
    document.getElementById('mainSub').textContent = c.en + ' · HS ' + c.hs + ' · 主要市场：' + c.regions.join(' / ') + ' · 单位：' + unit;

    // ---- metrics
    var last = hist[hist.length - 1];
    var fcLast = fc.points[fc.points.length - 1].point;
    var chg = last ? ((fcLast - last) / last) * 100 : 0;
    var mom = D.momentum(hist);
    var seasonal = fc.seasonal;
    var peakMonth = peakOf(seasonal);
    var orderMonth = leadMonth(peakMonth, 2);

    document.getElementById('metrics').innerHTML =
      metric('当前月', fmt(last), unit === '指数' ? '' : 'M') +
      metric('12个月后预测', fmt(fcLast), unit === '指数' ? '' : 'M') +
      metric('预测区间末值', fmt(fc.points[fc.points.length - 1].lo) + '–' + fmt(fc.points[fc.points.length - 1].hi), '') +
      metric('预测变化', (chg >= 0 ? '+' : '') + chg.toFixed(0), '%', chg >= 0) +
      metric('近半年动能', (mom >= 0 ? '+' : '') + mom.toFixed(0), '%', mom >= 0) +
      metric('YoY 增长', '+' + c.growth, '%', true) +
      metric('旺季峰值月', MONTH_CN[peakMonth - 1], '') +
      metric('建议下单月', MONTH_CN[orderMonth - 1], '');

    // ---- main chart
    var labels = c.months.map(shortLabel).concat(fc.points.map(function (p) { return shortLabel(p.label); }));
    var histLen = hist.length;
    var primFull = hist.concat(fc.points.map(function (p) { return p.point; }));
    var primHist = hist.concat(fc.points.map(function () { return null; }));
    // forecast dashed needs to connect: include last hist point
    var primFcast = hist.map(function (v, i) { return i === histLen - 1 ? v : null; }).concat(fc.points.map(function (p) { return p.point; }));
    var band = hist.map(function () { return null; }).concat(fc.points.map(function (p) { return { lo: p.lo, hi: p.hi }; }));

    var series = [
      { data: primHist, color: NAVY, fill: true, dot: false, width: 2.4 },
      { data: primFcast, color: NAVY, dashed: true, width: 2.4, dot: true, band: band }
    ];

    var legendHtml = '<span><i style="background:' + NAVY + '"></i>' + nameOf(primary) + '（历史）</span>' +
      '<span><i style="background:' + NAVY + ';opacity:.6"></i>预测 + 置信区间</span>';

    if (state.overlay) {
      var sec = c[secondary];
      var secFc = D.forecast(sec, D.histMonths, D.fcastMonths);
      var secFull = sec.concat(secFc.points.map(function (p) { return p.point; }));
      // scale secondary to primary axis
      var pMax = Math.max.apply(null, primFull), sMax = Math.max.apply(null, secFull) || 1;
      var k = pMax / sMax;
      var secScaledHist = sec.map(function (v) { return v * k; }).concat(secFc.points.map(function () { return null; }));
      var secScaledFc = sec.map(function (v, i) { return i === histLen - 1 ? v * k : null; }).concat(secFc.points.map(function (p) { return p.point * k; }));
      series.push({ data: secScaledHist, color: SILVER, width: 2 });
      series.push({ data: secScaledFc, color: SILVER, dashed: true, width: 2 });
      legendHtml += '<span><i style="background:' + SILVER + '"></i>' + nameOf(secondary) + '（对照·已对齐）</span>';
    }

    Chart.line(document.getElementById('mainChart'), { labels: labels, series: series, splitAt: histLen - 0.5 });
    document.getElementById('legend').innerHTML = legendHtml;

    // ---- seasonality bars
    var seasonData = [], seasonLabels = [], peakIdx = [];
    for (var m = 1; m <= 12; m++) { seasonData.push(round2(seasonal[m])); seasonLabels.push(MONTH_CN[m - 1]); }
    var maxSeason = Math.max.apply(null, seasonData);
    seasonData.forEach(function (v, i) { if (v >= maxSeason - 0.001) peakIdx.push(i); });
    Chart.bars(document.getElementById('seasonChart'), { data: seasonData, labels: seasonLabels, highlight: peakIdx });

    // ---- recommendations
    var peakLift = ((seasonal[peakMonth] - 1) * 100).toFixed(0);
    var lowMonth = lowOf(seasonal);
    document.getElementById('seasonRec').innerHTML =
      '<strong>旺季：' + MONTH_CN[peakMonth - 1] + '</strong>，需求约高于均值 ' + peakLift + '%；淡季在 ' + MONTH_CN[lowMonth - 1] + '。' +
      '考虑海运 + 生产周期，建议在 <strong>' + MONTH_CN[orderMonth - 1] + '</strong> 前后下单备货，避免旺季断货或错峰。';

    var trendWord = fc.slope > 0 ? '上行' : fc.slope < 0 ? '下行' : '走平';
    document.getElementById('quickRec').innerHTML =
      '<strong>' + c.zh + '</strong>：未来 12 个月整体' + trendWord + '，预测' +
      (chg >= 0 ? '增长 +' : '回落 ') + chg.toFixed(0) + '%。' +
      (c.growth >= 25 ? '高增长赛道，' : '') +
      '旺季 ' + MONTH_CN[peakMonth - 1] + '，提前 2 个月（' + MONTH_CN[orderMonth - 1] + '）布局。';

    document.getElementById('mainSub').textContent =
      c.en + ' · HS ' + c.hs + ' · 单位：' + unit + ' · 实线=历史 虚线=预测 阴影=80%区间';
  }

  // ---- helpers ----------------------------------------------
  function peakOf(s) { var best = 1, bv = -1; for (var m = 1; m <= 12; m++) if (s[m] > bv) { bv = s[m]; best = m; } return best; }
  function lowOf(s) { var best = 1, bv = 1e9; for (var m = 1; m <= 12; m++) if (s[m] < bv) { bv = s[m]; best = m; } return best; }
  function leadMonth(peak, lead) { var m = peak - lead; while (m < 1) m += 12; return m; }
  function metric(k, v, u, up) {
    var color = up === undefined ? '' : 'color:' + (up ? '#1a7f4b' : '#b23a3a') + ';';
    return '<div class="metric"><div class="k">' + k + '</div><div class="v" style="' + color + '">' + v + '<small>' + (u || '') + '</small></div></div>';
  }
  function fmt(v) { if (v >= 1000) return (v / 1000).toFixed(1) + 'k'; return (Math.round(v * 10) / 10).toString(); }
  function round2(v) { return Math.round(v * 100) / 100; }
  function shortLabel(label) { var p = label.split('-'); return p[0].slice(2) + '/' + p[1]; }

  // ---- init -------------------------------------------------
  function buildSelect() {
    var sel = document.getElementById('catSelect');
    // group by category
    var groups = {};
    cats.forEach(function (c) { (groups[c.cat] = groups[c.cat] || []).push(c); });
    Object.keys(groups).forEach(function (g) {
      var og = document.createElement('optgroup'); og.label = g;
      groups[g].forEach(function (c) {
        var o = document.createElement('option'); o.value = c.id; o.textContent = c.zh + '（' + c.en + '）';
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
    sel.value = state.id;
  }

  function init(data) {
    if (data) cats = data;
    buildSelect();
    document.getElementById('catSelect').addEventListener('change', function (e) { state.id = e.target.value; render(); });
    document.getElementById('metricSelect').addEventListener('change', function (e) { state.metric = e.target.value; render(); });
    document.getElementById('overlay').addEventListener('change', function (e) { state.overlay = e.target.checked; render(); });
    document.getElementById('year').textContent = new Date().getFullYear();
    window.addEventListener('resize', debounce(render, 200));
    render();
  }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  D.load().then(init);
})();
