import { redis } from '../lib/redis.js';
export default async function handler(req, res) {
  if (!process.env.ADMIN_PASSWORD || req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: '비밀번호가 올바르지 않아요' });
  const order = req.body && req.body.order;
  if (req.method !== 'POST' || !Array.isArray(order)) return res.status(400).end();
  try { await redis([['SET', 'order', JSON.stringify(order)]]); res.status(200).json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message === 'NO_REDIS' ? 'Redis(Upstash)가 아직 연결되지 않았어요' : e.message }); }
}
