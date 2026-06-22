/* ============================================================
   Brand Studio — reference-inspired ORIGINAL brand & VI builder
   Vanilla JS, zero dependencies.
   Generates: palette (w/ CMYK), type pairing, logo lockup,
   brand story, AI image prompt packs, and print-grade artboards.
   ============================================================ */
'use strict';

/* ---------- tiny DOM helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- color math ---------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255 }; }
const rgbToHex = ({ r, g, b }) => '#' + [r, g, b].map(x => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('');
function rgbToHsl({ r, g, b }) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h, s, l = (mx + mn) / 2; if (mx === mn) { h = s = 0; } else { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); switch (mx) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; default: h = (r - g) / d + 4; } h *= 60; } return { h, s: s * 100, l: l * 100 }; }
function hslToRgb({ h, s, l }) { h = (h % 360 + 360) % 360; s /= 100; l /= 100; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2; let r, g, b; if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x]; return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }; }
const hslHex = (h, s, l) => rgbToHex(hslToRgb({ h, s, l }));
function rgbToCmyk({ r, g, b }) { r /= 255; g /= 255; b /= 255; const k = 1 - Math.max(r, g, b); if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 }; const c = (1 - r - k) / (1 - k), m = (1 - g - k) / (1 - k), y = (1 - b - k) / (1 - k); return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) }; }
const cmykStr = hex => { const { c, m, y, k } = rgbToCmyk(hexToRgb(hex)); return `C${c} M${m} Y${y} K${k}`; };
const readable = hex => { const { r, g, b } = hexToRgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#1b2330' : '#ffffff'; };

/* ---------- persona presets ---------- */
const PERSONAS = {
  minimal: { label: '极简·现代', head: 'Poppins', body: 'Inter', satMul: .55, accent: null,
    adj: 'clean minimalist, generous negative space, soft diffused daylight, matte finish, understated elegance',
    voice: ['克制', '精致', '留白', '现代'] },
  luxury: { label: '奢华·高端', head: 'Playfair Display', body: 'Lato', satMul: .72, accent: 42,
    adj: 'luxurious premium, dramatic chiaroscuro lighting, deep rich shadows, glossy reflective surfaces, editorial mood',
    voice: ['高级', '质感', '典雅', '稀缺'] },
  vibrant: { label: '活力·年轻', head: 'Montserrat', body: 'Nunito Sans', satMul: 1.15, accent: null,
    adj: 'vibrant playful, bright high-key lighting, bold saturated colors, energetic pop aesthetic',
    voice: ['活力', '大胆', '年轻', '潮流'] },
  natural: { label: '自然·有机', head: 'Fraunces', body: 'Karla', satMul: .82, accent: 32,
    adj: 'natural organic, warm golden-hour sunlight, linen and wood textures, earthy calm, sustainable',
    voice: ['自然', '温暖', '质朴', '可持续'] },
  tech: { label: '科技·未来', head: 'Space Grotesk', body: 'IBM Plex Sans', satMul: 1.0, accent: 195,
    adj: 'sleek futuristic, cool gradient rim lighting, glass and brushed metal, precise hi-tech, studio seamless',
    voice: ['精密', '未来', '智能', '极速'] },
  classic: { label: '经典·信赖', head: 'Cormorant Garamond', body: 'Source Sans 3', satMul: .75, accent: null,
    adj: 'classic timeless, balanced soft key light, refined heritage feel, trustworthy and composed',
    voice: ['经典', '信赖', '沉稳', '传承'] },
};

/* ---------- palette generation ---------- */
function buildPalette(seedHex, persona) {
  const p = PERSONAS[persona];
  let { h, s, l } = rgbToHsl(hexToRgb(seedHex));
  s = clamp(s * p.satMul, 8, 92);
  // keep primary readable as a brand color
  l = clamp(l, 26, 60);
  const accentHue = p.accent != null ? p.accent : h + 180;
  const pal = [
    { role: 'primary', name: '主色', hex: hslHex(h, s, l) },
    { role: 'secondary', name: '辅助色', hex: hslHex(h + 26, clamp(s * .85, 8, 88), clamp(l + 16, 30, 78)) },
    { role: 'accent', name: '点缀色', hex: hslHex(accentHue, clamp(s * 1.05, 30, 95), clamp(l + 6, 38, 62)) },
    { role: 'dark', name: '深底/文字', hex: hslHex(h, clamp(s * .6, 6, 40), 13) },
    { role: 'light', name: '浅底', hex: hslHex(h, clamp(s * .4, 4, 28), 96) },
  ];
  pal.forEach(c => { c.cmyk = cmykStr(c.hex); });
  return pal;
}
const byRole = (pal, r) => (pal.find(c => c.role === r) || pal[0]).hex;

/* ---------- logo lockup (SVG) ---------- */
function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'B';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
function logoSVG(model, variant = 'light') {
  const { brand, palette, fonts } = model;
  const primary = byRole(palette, 'primary');
  const dark = byRole(palette, 'dark');
  const onDark = variant === 'dark';
  const badgeFill = onDark ? '#ffffff' : primary;
  const badgeText = onDark ? primary : '#ffffff';
  const word = onDark ? '#ffffff' : dark;
  const sub = onDark ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.5)';
  const ini = esc(initials(brand.name || 'Brand'));
  const nm = esc((brand.name || 'BRAND').toUpperCase());
  const tg = esc(brand.tagline || '');
  return `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${nm} logo">
    <rect x="6" y="22" width="76" height="76" rx="18" fill="${badgeFill}"/>
    <text x="44" y="73" text-anchor="middle" font-family="${fonts.head},sans-serif" font-weight="700" font-size="34" fill="${badgeText}">${ini}</text>
    <text x="100" y="62" font-family="${fonts.head},sans-serif" font-weight="700" font-size="34" letter-spacing="1" fill="${word}">${nm}</text>
    ${tg ? `<text x="102" y="86" font-family="${fonts.body},sans-serif" font-weight="400" font-size="14" letter-spacing="1.5" fill="${sub}">${tg}</text>` : ''}
  </svg>`;
}

/* ---------- image color extraction ---------- */
function extractSeed(files) {
  return new Promise(resolve => {
    if (!files || !files.length) return resolve(null);
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas'); const S = 64; cv.width = S; cv.height = S;
      const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0, S, S);
      const d = ctx.getImageData(0, 0, S, S).data; const buckets = {};
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3]; if (a < 200) continue;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const { s, l } = rgbToHsl({ r, g, b });
        if (l > 92 || l < 8) continue;               // skip near white/black
        const key = `${r >> 4},${g >> 4},${b >> 4}`;
        const wgt = 1 + s / 40;                       // favor saturated colors
        (buckets[key] = buckets[key] || { n: 0, r: 0, g: 0, b: 0 });
        buckets[key].n += wgt; buckets[key].r += r; buckets[key].g += g; buckets[key].b += b;
      }
      let best = null;
      for (const k in buckets) { const o = buckets[k]; if (!best || o.n > best.n) best = o; }
      if (!best) return resolve(null);
      resolve(rgbToHex({ r: best.r / (best.n), g: best.g / (best.n), b: best.b / (best.n) }));
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(files[0]);
  });
}

/* ---------- brand story / voice ---------- */
function buildStory(model) {
  const { brand, persona, ref } = model;
  const pv = PERSONAS[persona].voice;
  const name = brand.name || '新品牌';
  const aud = brand.audience || '理想用户';
  const cat = brand.category || '生活方式';
  const prod = brand.product || '产品';
  const refLine = ref.name ? `以「${esc(ref.name)}」的气质为风格基准，我们提炼其留白与质感，` : '';
  return {
    story: `${refLine}为${esc(aud)}打造的原创${esc(cat)}品牌。${esc(name)} 相信好的${esc(prod)}应当兼具实用与美感——${esc(brand.tagline || '让日常更有质感')}。从产品到包装、从线上到门店，统一的视觉语言让品牌在货架与屏幕上都被一眼记住。`,
    voice: pv,
    pillars: ['一致 Consistency', '质感 Craft', '可落地 Ready-to-print'],
  };
}

/* ---------- AI image prompt packs ---------- */
function buildPrompts(model) {
  const { brand, persona, ref, palette } = model;
  const p = PERSONAS[persona];
  const name = brand.name || 'the brand';
  const prod = brand.product || brand.category || 'product';
  const aud = brand.audience || 'modern customers';
  const cols = [byRole(palette, 'primary'), byRole(palette, 'secondary'), byRole(palette, 'accent')];
  const palStr = cols.join(', ');
  const base = `brand palette ${palStr}, ${p.adj}`;
  const guard = ref.name
    ? `⚠️ ${esc(ref.name)} 仅为风格参考。生成图中不得出现 ${esc(ref.name)} 的商标 / Logo / 标志性图案 / 包装抄袭，输出必须为 ${esc(name)} 的原创视觉。`
    : `⚠️ 输出为 ${esc(name)} 的原创视觉，不得包含任何现有品牌的商标或可识别标识。`;
  const NEG = 'no other brand logos, no watermark, no text artifacts, no extra fingers, no distortion, no low resolution, no clutter';
  const mk = (title, ratio, prompt) => ({ title, ratio, prompt, neg: NEG, guard });
  return [
    mk('商品主图 · 白底', '1:1', `professional e-commerce hero shot of a ${prod} for "${name}", clean seamless white background, ${base}, soft studio softbox lighting, subtle reflection, ultra-detailed product, centered, 8k, --ar 1:1`),
    mk('商品场景 · Lifestyle', '4:5', `lifestyle scene of a ${prod} by "${name}" styled for ${aud}, in a tasteful interior, ${base}, shallow depth of field, natural window light, props matching brand colors ${palStr}, editorial, --ar 4:5`),
    mk('商品细节 · 微距', '1:1', `extreme macro close-up of the material and texture of a ${prod} from "${name}", ${base}, crisp detail, premium finish, dramatic side light, --ar 1:1`),
    mk('AI 模特 · 棚拍正面', '4:5', `fashion studio portrait of a model presenting/holding a ${prod} from "${name}", full upper body, neutral seamless backdrop in brand color ${cols[0]}, ${base}, beauty dish lighting, confident pose, photorealistic, --ar 4:5`),
    mk('AI 模特 · 生活方式', '3:4', `candid lifestyle photo of a model (representing ${aud}) using a ${prod} from "${name}" outdoors / in a cafe, ${base}, golden hour, film grain, authentic, --ar 3:4`),
    mk('包装 / 礼盒 · 3D', '1:1', `3D product render of premium packaging box and bag for "${name}" ${prod}, mockup, brand colors ${palStr}, embossed logo area left blank for overlay, ${base}, studio gradient background, --ar 1:1`),
    mk('线下门店 KV / 海报主视觉', '2:3', `retail key visual poster for "${name}" store, hero ${prod} with a model, bold brand color blocks ${palStr}, ample empty top area for headline, ${base}, high-impact, print campaign, --ar 2:3`),
    mk('社媒 / 官网 Banner · 横版', '16:9', `wide website banner for "${name}", ${prod} arranged with negative space on the right for copy, brand palette ${palStr}, ${base}, clean, --ar 16:9`),
  ];
}

/* ============================================================
   PRINT ARTBOARDS  (everything in millimetres)
   ============================================================ */
const PAD = 8, BLEED = 3, MARK = 5, HAIR = 0.25; // mm
let PAGE_SEQ = 0;
const mm = v => v + 'mm';

function cropMarks(sheet, tw, th) {
  const pageW = tw + 2 * PAD, pageH = th + 2 * PAD;
  const line = (x, y, w, h) => { const d = el('div'); Object.assign(d.style, { position: 'absolute', background: '#000', left: mm(x), top: mm(y), width: mm(w), height: mm(h) }); sheet.appendChild(d); };
  // TL
  line(0, PAD, MARK, HAIR); line(PAD, 0, HAIR, MARK);
  // TR
  line(pageW - MARK, PAD, MARK, HAIR); line(PAD + tw, 0, HAIR, MARK);
  // BL
  line(0, PAD + th, MARK, HAIR); line(PAD, pageH - MARK, HAIR, MARK);
  // BR
  line(pageW - MARK, PAD + th, MARK, HAIR); line(PAD + tw, pageH - MARK, HAIR, MARK);
}

function imgPH(label, wmm, hmm) {
  const px = Math.round(wmm / 25.4 * 300), py = Math.round(hmm / 25.4 * 300);
  const d = el('div', 'img-ph');
  Object.assign(d.style, { width: mm(wmm), height: mm(hmm), fontSize: '3mm' });
  d.innerHTML = `<div>🖼 ${esc(label)}</div><div class="dpi">贴入 AI 生成图<br>建议 ${px}×${py}px @300dpi</div>`;
  return d;
}

/* a sheet = page(trim+bleed+marks). render(trim, bleedBox) fills content. */
function makeSheet({ trimW, trimH, head, body, render }) {
  const name = 'pg' + (PAGE_SEQ++);
  const pageW = trimW + 2 * PAD, pageH = trimH + 2 * PAD;
  const sheet = el('div', 'sheet');
  sheet.dataset.page = name;
  Object.assign(sheet.style, { width: mm(pageW), height: mm(pageH) });
  sheet.style.setProperty('--ab-head', head);
  sheet.style.setProperty('--ab-body', body);

  const bleedBox = el('div');
  Object.assign(bleedBox.style, { position: 'absolute', left: mm(MARK), top: mm(MARK), width: mm(trimW + 2 * BLEED), height: mm(trimH + 2 * BLEED) });
  sheet.appendChild(bleedBox);

  const trim = el('div');
  Object.assign(trim.style, { position: 'absolute', left: mm(PAD), top: mm(PAD), width: mm(trimW), height: mm(trimH), overflow: 'hidden' });
  sheet.appendChild(trim);

  cropMarks(sheet, trimW, trimH);
  render(trim, bleedBox);
  return { sheet, pageW, pageH, name };
}

/* ---- individual artboards ---- */
function abGuidelines(model) {
  const { brand, palette, fonts } = model, f = PERSONAS[model.persona];
  return makeSheet({
    trimW: 210, trimH: 297, head: fonts.head, body: fonts.body, render(t) {
      t.style.background = '#fff'; t.style.color = byRole(palette, 'dark');
      const swat = palette.map(c => `<div style="flex:1"><div style="height:26mm;background:${c.hex}"></div>
        <div style="font-size:2.6mm;padding:1.5mm 0"><b style="display:block;font-family:var(--ab-head)">${esc(c.name)}</b>${c.hex.toUpperCase()}<br>${c.cmyk}</div></div>`).join('');
      t.innerHTML = `
      <div style="padding:14mm 14mm 0">
        <div style="font-size:3mm;letter-spacing:.3mm;color:${byRole(palette,'accent')};font-family:var(--ab-head);font-weight:700">BRAND GUIDELINES · 品牌视觉规范</div>
        <div style="margin:8mm 0 10mm">${logoSVG(model)}</div>
        <div style="height:.4mm;background:${byRole(palette,'light')}"></div>
        <div style="font-family:var(--ab-head);font-size:4mm;font-weight:700;margin:8mm 0 4mm">01 / 色彩 Colour</div>
        <div style="display:flex;gap:3mm">${swat}</div>
        <div style="font-family:var(--ab-head);font-size:4mm;font-weight:700;margin:9mm 0 4mm">02 / 字体 Typography</div>
        <div style="font-family:var(--ab-head);font-size:11mm;line-height:1;font-weight:700">Aa Bb Cc</div>
        <div style="font-size:2.8mm;color:${byRole(palette,'accent')};margin:1mm 0 4mm">标题 Heading — ${esc(fonts.head)}</div>
        <div style="font-family:var(--ab-body);font-size:4mm">Aa Bb Cc 一二三四 0123</div>
        <div style="font-size:2.8mm;color:${byRole(palette,'accent')};margin:1mm 0">正文 Body — ${esc(fonts.body)}</div>
        <div style="font-family:var(--ab-head);font-size:4mm;font-weight:700;margin:9mm 0 3mm">03 / 用法 Usage</div>
        <div style="font-family:var(--ab-body);font-size:2.9mm;line-height:1.7;color:#444">
          · Logo 四周保留≥安全间距，禁止拉伸、改色、加描边。<br>
          · 主色用于关键信息与按钮；点缀色仅作强调，面积≤10%。<br>
          · 印刷统一使用所列 CMYK 值；屏幕使用 HEX。<br>
          · 个性：${f.voice.map(esc).join(' · ')}。
        </div>
      </div>`;
    }
  });
}

function abPoster(model) {
  const { brand, palette, fonts } = model;
  return makeSheet({
    trimW: 297, trimH: 420, head: fonts.head, body: fonts.body, render(t, bleed) {
      bleed.style.background = byRole(palette, 'light');
      t.innerHTML = '';
      const wrap = el('div'); Object.assign(wrap.style, { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' });
      const ph = imgPH('门店主视觉 / AI 模特', 297, 300); ph.style.width = '100%';
      const bar = el('div'); Object.assign(bar.style, { flex: 1, background: byRole(palette, 'primary'), color: readable(byRole(palette, 'primary')), padding: '14mm', display: 'flex', flexDirection: 'column', justifyContent: 'center' });
      bar.innerHTML = `<div style="font-family:var(--ab-head);font-weight:700;font-size:16mm;line-height:1">${esc((brand.name || 'BRAND').toUpperCase())}</div>
        <div style="font-family:var(--ab-body);font-size:6mm;margin-top:4mm;opacity:.9">${esc(brand.tagline || '')}</div>
        <div style="font-family:var(--ab-body);font-size:3.4mm;margin-top:6mm;opacity:.75">${esc(brand.product || '')} · 新品上市</div>`;
      wrap.append(ph, bar); t.appendChild(wrap);
    }
  });
}

function abRollup(model) {
  const { brand, palette, fonts } = model;
  return makeSheet({
    trimW: 600, trimH: 1600, head: fonts.head, body: fonts.body, render(t, bleed) {
      bleed.style.background = `linear-gradient(160deg, ${byRole(palette, 'light')}, ${byRole(palette, 'secondary')})`;
      const top = el('div'); Object.assign(top.style, { position: 'absolute', top: '40mm', left: 0, right: 0, textAlign: 'center' });
      top.innerHTML = `<div style="width:160mm;margin:0 auto">${logoSVG(model)}</div>`;
      const ph = imgPH('全身 AI 模特 / 产品大图', 480, 900); Object.assign(ph.style, { position: 'absolute', left: '60mm', top: '170mm' });
      const foot = el('div'); Object.assign(foot.style, { position: 'absolute', bottom: '60mm', left: 0, right: 0, textAlign: 'center', color: byRole(palette, 'dark') });
      foot.innerHTML = `<div style="font-family:var(--ab-head);font-weight:700;font-size:30mm">${esc(brand.tagline || brand.name || '')}</div>
        <div style="font-family:var(--ab-body);font-size:9mm;margin-top:6mm;color:${byRole(palette,'accent')}">${esc(brand.product || '')}</div>`;
      t.append(top, ph, foot);
    }
  });
}

function abTote(model) {
  const { brand, palette, fonts } = model;
  return makeSheet({
    trimW: 250, trimH: 300, head: fonts.head, body: fonts.body, render(t, bleed) {
      bleed.style.background = byRole(palette, 'primary');
      t.style.color = readable(byRole(palette, 'primary'));
      t.innerHTML = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20mm">
        <div style="font-family:var(--ab-head);font-weight:700;font-size:18mm;letter-spacing:1mm">${esc((brand.name || 'BRAND').toUpperCase())}</div>
        <div style="width:34mm;height:.6mm;background:${byRole(palette,'accent')};margin:8mm 0"></div>
        <div style="font-family:var(--ab-body);font-size:5mm;opacity:.85">${esc(brand.tagline || '')}</div>
        <div style="position:absolute;bottom:14mm;font-family:var(--ab-body);font-size:3mm;opacity:.7">手提袋正面 · 250×300mm</div>
      </div>`;
    }
  });
}

function abHangtag(model) {
  const { brand, palette, fonts } = model;
  return makeSheet({
    trimW: 50, trimH: 90, head: fonts.head, body: fonts.body, render(t, bleed) {
      bleed.style.background = byRole(palette, 'light');
      t.innerHTML = `<div style="position:absolute;inset:0;padding:6mm;display:flex;flex-direction:column;align-items:center">
        <div style="width:14mm;height:14mm;border-radius:4mm;background:${byRole(palette,'primary')};color:${readable(byRole(palette,'primary'))};display:flex;align-items:center;justify-content:center;font-family:var(--ab-head);font-weight:700;font-size:7mm">${esc(initials(brand.name||'B'))}</div>
        <div style="font-family:var(--ab-head);font-weight:700;font-size:4.6mm;margin-top:5mm;text-align:center;color:${byRole(palette,'dark')}">${esc((brand.name||'BRAND').toUpperCase())}</div>
        <div style="font-family:var(--ab-body);font-size:2.4mm;margin-top:2mm;text-align:center;color:#666">${esc(brand.tagline||'')}</div>
        <div style="margin-top:auto;font-family:var(--ab-body);font-size:2.2mm;color:#888;text-align:center">${esc(brand.product||'')}<br>¥ ____</div>
        <div style="width:4mm;height:4mm;border:.4mm solid #999;border-radius:50%;position:absolute;top:4mm;right:23mm"></div>
      </div>`;
    }
  });
}

function abCard(model) {
  const { brand, palette, fonts } = model;
  return makeSheet({
    trimW: 90, trimH: 54, head: fonts.head, body: fonts.body, render(t, bleed) {
      bleed.style.background = byRole(palette, 'dark');
      t.style.color = '#fff';
      t.innerHTML = `<div style="position:absolute;inset:0;padding:7mm;display:flex;flex-direction:column;justify-content:space-between">
        <div style="width:46mm">${logoSVG(model, 'dark')}</div>
        <div style="font-family:var(--ab-body);font-size:2.5mm;line-height:1.7;color:rgba(255,255,255,.85)">
          姓名 / 职务<br>+86 ____ · hello@${esc((brand.name||'brand').toLowerCase().replace(/\s+/g,''))}.com<br>${esc(brand.tagline||'')}</div>
        <div style="position:absolute;top:0;right:0;width:6mm;height:100%;background:${byRole(palette,'accent')}"></div>
      </div>`;
    }
  });
}

function abSticker(model) {
  const { brand, palette, fonts } = model;
  return makeSheet({
    trimW: 60, trimH: 40, head: fonts.head, body: fonts.body, render(t, bleed) {
      bleed.style.background = byRole(palette, 'accent');
      t.style.color = readable(byRole(palette, 'accent'));
      t.innerHTML = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-family:var(--ab-head);font-weight:700;font-size:8mm">${esc(initials(brand.name||'B'))}</div>
        <div style="font-family:var(--ab-body);font-size:3mm;letter-spacing:.6mm;margin-top:1mm">${esc((brand.name||'BRAND').toUpperCase())}</div>
      </div>`;
    }
  });
}

const ARTBOARDS = {
  both: [abGuidelines, abPoster, abRollup, abTote, abHangtag, abCard, abSticker],
  retail: [abGuidelines, abPoster, abRollup, abTote, abCard, abSticker],
  ecom: [abGuidelines, abTote, abHangtag, abCard, abSticker],
};

/* ============================================================
   STATE + RENDER
   ============================================================ */
let MODEL = null;

function collect() {
  return {
    ref: { name: $('#refName').value.trim(), notes: $('#refNotes').value.trim() },
    brand: {
      name: $('#bName').value.trim(), tagline: $('#bTagline').value.trim(),
      category: $('#bCategory').value.trim(), audience: $('#bAudience').value.trim(),
      product: $('#bProduct').value.trim(),
    },
    persona: $('#bPersona').value,
    channel: $('#bChannel').value,
    seed: $('#bSeed').value,
  };
}

async function generate() {
  const inp = collect();
  if (!inp.brand.name) { alert('请填写「新品牌名称」'); return; }
  const extracted = await extractSeed($('#refImages').files);
  const seed = extracted || inp.seed;
  const persona = inp.persona;
  const fonts = { head: PERSONAS[persona].head, body: PERSONAS[persona].body };
  const palette = buildPalette(seed, persona);
  MODEL = { ...inp, seed, fonts, palette };
  MODEL.story = buildStory(MODEL);
  MODEL.prompts = buildPrompts(MODEL);

  $('#emptyState').hidden = true;
  $('#result').hidden = false;
  renderVI(); renderPrompts(); renderPrint();
  switchTab('vi');
  $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderVI() {
  const m = MODEL, pane = $('[data-pane="vi"]');
  pane.style.setProperty('--vi-dark', byRole(m.palette, 'dark'));
  const swatches = m.palette.map(c => `<div class="swatch">
      <div class="chip" style="background:${c.hex};color:${readable(c.hex)};display:flex;align-items:flex-end;padding:6px;font-size:11px">${c.hex.toUpperCase()}</div>
      <div class="meta"><b>${esc(c.name)}</b><span>${c.cmyk}</span></div></div>`).join('');
  pane.innerHTML = `<div class="vi-grid">
    <div class="block"><h4>Logo 锁版</h4><div class="logo-stage">
      <div class="logo-card">${logoSVG(m)}</div>
      <div class="logo-card dark">${logoSVG(m, 'dark')}</div></div></div>
    <div class="block"><h4>品牌色板 · 含印刷 CMYK</h4><div class="swatches">${swatches}</div></div>
    <div class="block"><h4>字体搭配</h4>
      <div class="typo-row"><span class="tag">标题</span><span style="font-family:${m.fonts.head};font-weight:700;font-size:30px">${esc(m.brand.name)}</span><span class="muted">${esc(m.fonts.head)}</span></div>
      <div class="typo-row"><span class="tag">正文</span><span style="font-family:${m.fonts.body};font-size:16px">The quick brown fox · 一二三四五 0123</span><span class="muted">${esc(m.fonts.body)}</span></div></div>
    <div class="block story"><h4>品牌故事 & 语气</h4>
      <p>${m.story.story}</p>
      <div class="voice">${m.story.voice.map(v => `<span class="pill">${esc(v)}</span>`).join('')}</div></div>
  </div>`;
}

function renderPrompts() {
  const pane = $('[data-pane="prompts"]');
  pane.innerHTML = `<p class="hint">复制到任意文生图工具（Midjourney / Stable Diffusion / Flux / DALL·E）。已写入品牌色与气质，并附负面提示与合规守则。</p>` +
    MODEL.prompts.map((p, i) => `<div class="prompt-card">
      <div class="ph"><span>${esc(p.title)}</span><span class="ratio">${esc(p.ratio)} <button class="copy" data-i="${i}">复制</button></span></div>
      <div class="pb">
        <pre id="pr${i}">${esc(p.prompt)}</pre>
        <div class="neg"><b>Negative:</b> ${esc(p.neg)}</div>
        <div class="warnline">${p.guard}</div>
      </div></div>`).join('');
  $$('.copy', pane).forEach(b => b.onclick = () => {
    const t = MODEL.prompts[b.dataset.i].prompt;
    navigator.clipboard?.writeText(t); b.textContent = '已复制 ✓'; setTimeout(() => b.textContent = '复制', 1200);
  });
}

function renderPrint() {
  PAGE_SEQ = 0;
  const root = $('#printRoot'); root.innerHTML = '';
  const prev = $('#printPreview'); prev.innerHTML = '';
  const styleId = 'pageRules'; $('#' + styleId)?.remove();
  const rules = [];
  const builders = ARTBOARDS[MODEL.channel] || ARTBOARDS.both;
  builders.forEach(fn => {
    const { sheet, pageW, pageH, name } = fn(MODEL);
    rules.push(`@page ${name}{size:${pageW}mm ${pageH}mm;margin:0}.sheet[data-page="${name}"]{page:${name}}`);
    root.appendChild(sheet);
    // scaled on-screen preview clone
    const maxW = 460, scale = Math.min(1, maxW / (pageW * 3.7795));
    const wrap = el('div'); wrap.className = 'pp-wrap';
    wrap.style.width = (pageW * 3.7795 * scale) + 'px';
    wrap.style.height = (pageH * 3.7795 * scale) + 'px';
    const clone = sheet.cloneNode(true);
    clone.style.transform = `scale(${scale})`; clone.style.transformOrigin = 'top left';
    wrap.appendChild(clone);
    const block = el('div');
    block.innerHTML = `<div class="pp-label">${pageW - 16}×${pageH - 16}mm（+3mm 出血）</div>`;
    block.appendChild(wrap);
    prev.appendChild(block);
  });
  const st = el('style'); st.id = styleId; st.textContent = rules.join('\n'); document.head.appendChild(st);
}

/* ---------- tabs ---------- */
function switchTab(name) {
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  $$('.tabpane').forEach(p => p.hidden = p.dataset.pane !== name);
}

/* ---------- exports ---------- */
function download(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type }); const url = URL.createObjectURL(blob);
  const a = el('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
function exportKit() {
  if (!MODEL) return;
  const { story, prompts, fonts, palette, brand, ref, persona, channel, seed } = MODEL;
  download(`${(brand.name || 'brand')}-brand-kit.json`, JSON.stringify({ brand, ref, persona, channel, seed, fonts, palette, story, prompts }, null, 2), 'application/json');
}
function exportPrompts() {
  if (!MODEL) return;
  const txt = MODEL.prompts.map(p => `### ${p.title}  (${p.ratio})\n${p.prompt}\nNegative: ${p.neg}\n${p.guard.replace(/<[^>]+>/g, '')}\n`).join('\n');
  download(`${(MODEL.brand.name || 'brand')}-prompts.txt`, txt);
}

/* ---------- ref image thumbs ---------- */
function showThumbs() {
  const box = $('#refThumbs'); box.innerHTML = '';
  [...($('#refImages').files || [])].slice(0, 6).forEach(f => {
    const img = el('img'); img.src = URL.createObjectURL(f); box.appendChild(img);
  });
}

/* ---------- wire up ---------- */
$('#btnGenerate').onclick = generate;
$('#refImages').onchange = showThumbs;
$('#btnPrint').onclick = () => { if (!MODEL) { alert('请先生成'); return; } window.print(); };
$('#btnExportKit').onclick = exportKit;
$('#btnExportPrompts').onclick = exportPrompts;
$('#btnReset').onclick = () => location.reload();
$$('.tab').forEach(t => t.onclick = () => switchTab(t.dataset.tab));
