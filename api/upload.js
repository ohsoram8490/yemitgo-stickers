import { put, del } from '@vercel/blob';
import { redis } from '../lib/redis.js';
const ok = req => !!process.env.ADMIN_PASSWORD && req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
export default async function handler(req, res) {
  if (!ok(req)) return res.status(401).json({ error: '비밀번호가 올바르지 않아요' });
  try {
    if (req.method === 'GET') return res.status(200).json({ ok: true });
    if (req.method === 'DELETE') {
      const id = decodeURIComponent(new URL(req.query.url).pathname.slice(1));
      await del(req.query.url);
      try { await redis([['HDEL', 'stickers', id], ['HDEL', 'hits', id]]); } catch (e) {}
      return res.status(200).json({ ok: true });
    }
    if (req.method !== 'POST') return res.status(405).end();
    const name = decodeURIComponent(req.headers['x-filename'] || 'sticker.png');
    const blob = await put(`stickers/${Date.now().toString(36)}-${name}`, req.body, { access: 'public', addRandomSuffix: false, contentType: req.headers['x-content-type'] || 'image/png' });
    try { await redis([['HSET', 'stickers', blob.pathname, JSON.stringify({ url: blob.url, t: Date.now() })]]); } catch (e) {}
    res.status(200).json({ url: blob.url });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
