export default async function handler(req, res) {
  try {
    const u = new URL(req.query.url);
    if (!u.hostname.endsWith('.blob.vercel-storage.com')) return res.status(400).end();
    const r = await fetch(u);
    if (!r.ok) return res.status(502).end();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(Buffer.from(await r.arrayBuffer()));
  } catch (e) { res.status(500).end(); }
}
