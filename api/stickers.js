import { list } from '@vercel/blob';
import { redis, pairs } from '../lib/redis.js';
export default async function handler(req, res) {
  try {
    let st = {}, order = [], hits = {}, ok = true;
    try {
      const [s, o, h] = await redis([['HGETALL', 'stickers'], ['GET', 'order'], ['HGETALL', 'hits']]);
      st = pairs(s); order = o ? JSON.parse(o) : []; hits = pairs(h);
    } catch (e) { ok = false; }
    if (!Object.keys(st).length) {
      const { blobs } = await list({ prefix: 'stickers/', limit: 1000 });
      blobs.forEach(b => { st[b.pathname] = JSON.stringify({ url: b.url, t: new Date(b.uploadedAt).getTime() }); });
      if (ok && blobs.length) { try { await redis([['HSET', 'stickers', ...Object.entries(st).flat()]]); } catch (e) {} }
    }
    const rank = new Map(order.map((id, i) => [id, i]));
    const items = Object.entries(st).map(([id, v]) => ({ id, ...JSON.parse(v), hits: +hits[id] || 0 }));
    items.sort((a, b) => (rank.has(a.id) ? rank.get(a.id) : -1e9 + 0) - (rank.has(b.id) ? rank.get(b.id) : -1e9 + 0) || b.t - a.t);
    res.setHeader('Cache-Control', req.query.t ? 'no-store' : 'public, s-maxage=30, stale-while-revalidate=300');
    res.status(200).json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
}
