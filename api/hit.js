import { redis } from '../lib/redis.js';
export default async function handler(req, res) {
  const id = req.body && req.body.id;
  if (req.method !== 'POST' || typeof id !== 'string' || !id.startsWith('stickers/') || id.length > 300) return res.status(400).end();
  try { await redis([['HINCRBY', 'hits', id, 1]]); } catch (e) {}
  res.status(200).json({ ok: true });
}
