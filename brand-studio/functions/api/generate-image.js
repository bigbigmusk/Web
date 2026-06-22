/**
 * Cloudflare Pages Function — POST /api/generate-image
 * Proxies image generation to OpenAI gpt-image-1 so the API key stays
 * server-side. Set OPENAI_API_KEY in the Pages project's environment variables.
 *
 * Request  JSON: { prompt: string, orientation?: "square"|"portrait"|"landscape", quality?: "low"|"medium"|"high" }
 * Response JSON: { image: "data:image/png;base64,..." }  |  { error: string }
 */

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...cors } });

export function onRequestOptions() {
  return new Response(null, { headers: cors });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.OPENAI_API_KEY) return json({ error: '服务端未配置 OPENAI_API_KEY（请在 Pages 环境变量中设置）' }, 500);

    let body;
    try { body = await request.json(); } catch { return json({ error: '请求体需为 JSON' }, 400); }

    const prompt = (body.prompt || '').toString().trim();
    if (prompt.length < 5) return json({ error: 'prompt 太短' }, 400);
    if (prompt.length > 3500) return json({ error: 'prompt 太长（上限 3500 字符）' }, 400);

    const sizeMap = { square: '1024x1024', portrait: '1024x1536', landscape: '1536x1024' };
    const size = sizeMap[body.orientation] || '1024x1024';
    const quality = ['low', 'medium', 'high'].includes(body.quality) ? body.quality : 'medium';

    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1', prompt, size, quality, n: 1 }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: data?.error?.message || `OpenAI 错误 (HTTP ${r.status})` }, r.status);

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return json({ error: '未返回图片' }, 502);

    return json({ image: `data:image/png;base64,${b64}` });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}
