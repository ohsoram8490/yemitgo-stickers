import { list } from '@vercel/blob';
export default async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: 'stickers/', limit: 1000 });
    const items = blobs
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .map(b => ({ url: b.url, name: decodeURIComponent(b.pathname.replace(/^stickers\/[^-]*-/, '').replace(/\.[^.]+$/, '')) }));
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
}
