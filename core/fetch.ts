import { unix } from "@/core/time";

interface Cache {
  body: unknown;
  timestamp: number;
}

const cache = new Map<string, Cache>();

export async function memCachedFetch(url: string, ttl = 30): Promise<unknown> {
  const cached = cache.get(url);
  const now = unix();
  if (cached != null && cached.timestamp + ttl > now) {
    return Promise.resolve(cached.body);
  }
  const response = await fetch(url);
  const body = await response.json() as unknown;
  cache.set(url, { body, timestamp: now });
  return body;
}

export function invalidateCache(url?: string): void {
  if (url == null) {
    cache.clear();
  } else {
    cache.delete(url);
  }
}
