import { put, del } from '@vercel/blob';
const ok = req => req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD && !!process.env.ADMIN_PASSWORD;
export default async function handler(req, res) {
  if (!ok(req)) return res.status(401).json({ error: '비밀번호가 올바르지 않아요' });
  try {
    if (req.method === 'DELETE') {
      await del(req.query.url);
      return res.status(200).json({ ok: true });
    }
    if (req.method === "GET") return res.status(200).json({ ok: true });
    if (req.method !== "POST") return res.status(405).end();
    const name = decodeURIComponent(req.headers['x-filename'] || 'sticker.png');
    const id = Date.now().toString(36);
    const blob = await put(`stickers/${id}-${name}`, req.body, {
      access: 'public', addRandomSuffix: false,
      contentType: req.headers['x-content-type'] || 'image/png',
    });
    res.status(200).json({ url: blob.url });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
