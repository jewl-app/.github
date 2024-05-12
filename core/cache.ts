import { unix } from "@/core/time";

interface Cache {
  body: unknown;
  timestamp: number;
}

const cache = new Map<string, Cache>();

interface MemCacheOptions<T> {
  key: string;
  handler: () => Promise<T>;
  ttl?: number;
}

export async function memCache<T>(opts: MemCacheOptions<T>): Promise<T> {
  // FIXME: cache key collision
  const cached = cache.get(opts.key);
  const now = unix();
  const ttl = opts.ttl ?? 30;
  if (cached != null && cached.timestamp + ttl > now) {
    return Promise.resolve(cached.body as T);
  }
  const body = await opts.handler();
  cache.set(opts.key, { body, timestamp: now });
  return body;
}

export function invalidateCache(key?: string): void {
  if (key == null) {
    cache.clear();
  } else {
    cache.delete(key);
  }
}

export async function memCacheFetch(url: string, ttl = 30): Promise<unknown> {
  return memCache({
    key: url,
    handler: async () => fetch(url).then(async res => res.json()),
    ttl,
  });
}
