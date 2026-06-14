/* ============================================================
   Concord Trade Toolkit — tiny canvas chart engine (no deps)
   window.CBChart.line(canvas, opts) / .bars(canvas, opts) / .radar(...)
   ============================================================ */
(function () {
  'use strict';
  var NAVY = '#16335a', SILVER = '#8f99a5', LINE = '#e3e8ef', INK = '#1b2735', MUTED = '#56657a';

  function setup(canvas, pad) {
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || 600, cssH = canvas.clientHeight || 300;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    return { ctx: ctx, w: cssW, h: cssH, pad: pad };
  }
  function niceMax(v) {
    if (v <= 0) return 10;
    var mag = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / mag;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * mag;
  }

  function line(canvas, o) {
    var pad = { l: 46, r: 16, t: 18, b: 30 };
    var s = setup(canvas, pad), ctx = s.ctx, w = s.w, h = s.h;
    var series = o.series; // [{data:[], color, fill, dashed, band:[{lo,hi}]}]
    var labels = o.labels || [];
    var all = [];
    series.forEach(function (sr) {
      sr.data.forEach(function (v) { if (v != null) all.push(v); });
      if (sr.band) sr.band.forEach(function (b) { if (b) all.push(b.hi); });
    });
    var maxV = niceMax(Math.max.apply(null, all.concat([1])) * 1.08);
    var minV = 0;
    var n = labels.length;
    var px = function (i) { return pad.l + (w - pad.l - pad.r) * (n <= 1 ? 0.5 : i / (n - 1)); };
    var py = function (v) { return pad.t + (h - pad.t - pad.b) * (1 - (v - minV) / (maxV - minV)); };

    // grid + y labels
    ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = MUTED; ctx.textBaseline = 'middle';
    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var val = minV + (maxV - minV) * t / ticks;
      var y = py(val);
      ctx.strokeStyle = LINE; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(fmtK(val), pad.l - 8, y);
    }
    // forecast divider
    if (o.splitAt != null && o.splitAt < n) {
      var sx = px(o.splitAt);
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = SILVER; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, pad.t); ctx.lineTo(sx, h - pad.b); ctx.stroke(); ctx.restore();
    }
    // x labels (sparse)
    ctx.fillStyle = MUTED; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    var stepX = Math.ceil(n / 7);
    for (var i = 0; i < n; i += stepX) {
      ctx.fillText(labels[i], px(i), h - pad.b + 7);
    }

    // bands first
    series.forEach(function (sr) {
      if (!sr.band) return;
      ctx.beginPath();
      var started = false;
      for (var i = 0; i < sr.band.length; i++) {
        var b = sr.band[i]; if (!b) continue;
        var X = px(sr.offset ? sr.offset + i : i);
        if (!started) { ctx.moveTo(X, py(b.hi)); started = true; } else ctx.lineTo(X, py(b.hi));
      }
      for (var j = sr.band.length - 1; j >= 0; j--) {
        var b2 = sr.band[j]; if (!b2) continue;
        var X2 = px(sr.offset ? sr.offset + j : j);
        ctx.lineTo(X2, py(b2.lo));
      }
      ctx.closePath();
      ctx.fillStyle = hexA(sr.color || NAVY, 0.10); ctx.fill();
    });

    // lines + fills
    series.forEach(function (sr) {
      var col = sr.color || NAVY;
      if (sr.fill) {
        ctx.beginPath();
        var firstX = null, lastX = null;
        sr.data.forEach(function (v, i) {
          if (v == null) return;
          var X = px(sr.offset ? sr.offset + i : i), Y = py(v);
          if (firstX == null) { ctx.moveTo(X, Y); firstX = X; } else ctx.lineTo(X, Y);
          lastX = X;
        });
        ctx.lineTo(lastX, py(0)); ctx.lineTo(firstX, py(0)); ctx.closePath();
        var g = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
        g.addColorStop(0, hexA(col, 0.22)); g.addColorStop(1, hexA(col, 0));
        ctx.fillStyle = g; ctx.fill();
      }
      ctx.beginPath();
      var moved = false;
      sr.data.forEach(function (v, i) {
        if (v == null) { moved = false; return; }
        var X = px(sr.offset ? sr.offset + i : i), Y = py(v);
        if (!moved) { ctx.moveTo(X, Y); moved = true; } else ctx.lineTo(X, Y);
      });
      ctx.strokeStyle = col; ctx.lineWidth = sr.width || 2.2;
      if (sr.dashed) ctx.setLineDash([5, 4]); else ctx.setLineDash([]);
      ctx.lineJoin = 'round'; ctx.stroke(); ctx.setLineDash([]);
      // last point dot
      if (sr.dot) {
        var li = sr.data.length - 1;
        var lv = sr.data[li];
        if (lv != null) {
          var X3 = px(sr.offset ? sr.offset + li : li), Y3 = py(lv);
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X3, Y3, 3.2, 0, Math.PI * 2); ctx.fill();
        }
      }
    });
  }

  function bars(canvas, o) {
    var pad = { l: 38, r: 12, t: 16, b: 26 };
    var s = setup(canvas, pad), ctx = s.ctx, w = s.w, h = s.h;
    var data = o.data, labels = o.labels;
    var maxV = niceMax(Math.max.apply(null, data.concat([1])) * 1.1);
    var n = data.length;
    var bw = (w - pad.l - pad.r) / n;
    ctx.font = '11px Inter, sans-serif';
    var py = function (v) { return pad.t + (h - pad.t - pad.b) * (1 - v / maxV); };
    // gridlines
    ctx.strokeStyle = LINE; ctx.fillStyle = MUTED; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
    for (var t = 0; t <= 3; t++) {
      var val = maxV * t / 3, y = py(val);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillText(fmtK(val), pad.l - 6, y);
    }
    data.forEach(function (v, i) {
      var x = pad.l + bw * i + bw * 0.18, bwi = bw * 0.64;
      var y = py(v), bh = (h - pad.b) - y;
      var hi = o.highlight && o.highlight.indexOf(i) >= 0;
      ctx.fillStyle = hi ? NAVY : hexA(SILVER, 0.55);
      roundRect(ctx, x, y, bwi, Math.max(1, bh), 3); ctx.fill();
      ctx.fillStyle = MUTED; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(labels[i], x + bwi / 2, h - pad.b + 6);
    });
  }

  function radar(canvas, o) {
    var s = setup(canvas, {}), ctx = s.ctx, w = s.w, h = s.h;
    var cx = w / 2, cy = h / 2 + 4, R = Math.min(w, h) / 2 - 34;
    var axes = o.axes; // [{label, value 0..100}]
    var n = axes.length;
    var ang = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / n; };
    // rings
    ctx.strokeStyle = LINE; ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
    for (var ring = 1; ring <= 4; ring++) {
      var rr = R * ring / 4;
      ctx.beginPath();
      for (var i = 0; i <= n; i++) { var a = ang(i % n); var X = cx + rr * Math.cos(a), Y = cy + rr * Math.sin(a); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
      ctx.stroke();
    }
    // spokes + labels
    axes.forEach(function (ax, i) {
      var a = ang(i);
      var X = cx + R * Math.cos(a), Y = cy + R * Math.sin(a);
      ctx.strokeStyle = LINE; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(X, Y); ctx.stroke();
      ctx.fillStyle = MUTED; ctx.textAlign = Math.cos(a) > 0.3 ? 'left' : Math.cos(a) < -0.3 ? 'right' : 'center';
      ctx.textBaseline = Math.sin(a) > 0.3 ? 'top' : Math.sin(a) < -0.3 ? 'bottom' : 'middle';
      ctx.fillText(ax.label, cx + (R + 12) * Math.cos(a), cy + (R + 12) * Math.sin(a));
    });
    // polygon
    ctx.beginPath();
    axes.forEach(function (ax, i) {
      var a = ang(i), rr = R * Math.max(0, Math.min(100, ax.value)) / 100;
      var X = cx + rr * Math.cos(a), Y = cy + rr * Math.sin(a);
      i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    });
    ctx.closePath();
    ctx.fillStyle = hexA(NAVY, 0.16); ctx.fill();
    ctx.strokeStyle = NAVY; ctx.lineWidth = 2; ctx.stroke();
    axes.forEach(function (ax, i) {
      var a = ang(i), rr = R * Math.max(0, Math.min(100, ax.value)) / 100;
      ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(cx + rr * Math.cos(a), cy + rr * Math.sin(a), 2.6, 0, Math.PI * 2); ctx.fill();
    });
  }

  // helpers
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function hexA(hex, a) {
    var c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(function (x) { return x + x; }).join('');
    var r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  function fmtK(v) {
    if (v >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'k';
    return String(Math.round(v));
  }

  window.CBChart = { line: line, bars: bars, radar: radar };
})();
