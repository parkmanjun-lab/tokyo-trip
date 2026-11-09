import { env } from 'cloudflare:workers';
export function getDb(): D1Database { if(!env.DB) throw new Error('D1 storage is unavailable'); return env.DB; }
