const requests = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 60, windowMs = 60_000) { const now = Date.now(); const entry = requests.get(key); if (!entry || entry.reset < now) { requests.set(key, { count: 1, reset: now + windowMs }); return true; } entry.count++; return entry.count <= limit; }
