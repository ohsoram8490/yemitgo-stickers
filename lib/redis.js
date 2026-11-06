import { createClient } from 'redis';
let client;
async function conn() {
  if (!process.env.REDIS_URL) throw new Error('NO_REDIS');
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL, socket: { connectTimeout: 5000, reconnectStrategy: false } });
    client.on('error', () => {});
  }
  if (!client.isOpen) await client.connect();
  return client;
}
export async function redis(cmds) {
  try {
    const c = await conn();
    return await Promise.all(cmds.map(cmd => c.sendCommand(cmd.map(String))));
  } catch (e) {
    client = undefined;
    throw e;
  }
}
export const pairs = a => { const o = {}; for (let i = 0; i < (a || []).length; i += 2) o[a[i]] = a[i + 1]; return o; };
