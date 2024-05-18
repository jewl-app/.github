import { unix } from "@/core/time";

interface Cache {
  body: unknown;
  timestamp: number;
}

interface CacheStore {
  get: (key: string) => Cache | null | undefined;
  set: (key: string, value: Cache) => void;
  delete: (key: string) => void;
  clear: () => void;
}

export const memoryCache: CacheStore = new Map<string, Cache>();
export const localStorageCache: CacheStore = {
  get: (key: string) => {
    const item = localStorage.getItem(key);
    if (item == null) {
      return null;
    }
    return JSON.parse(item) as Cache;
  },
  set: (key: string, value: Cache) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  delete: (key: string) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  },
};

interface cachedOptions<T> {
  key: string;
  handler: () => Promise<T>;
  ttl?: number;
  cache?: CacheStore;
}

// FIXME: cache key collision

export async function cached<T>(opts: cachedOptions<T>): Promise<T> {
  const cache = opts.cache ?? memoryCache;
  const cachedValue = cache.get(opts.key);
  const now = unix();
  const ttl = opts.ttl ?? 30;
  if (cachedValue != null && cachedValue.timestamp + ttl > now) {
    return Promise.resolve(cachedValue.body as T);
  }
  const body = await opts.handler();
  cache.set(opts.key, { body, timestamp: now });
  return body;
}

export function invalidateCache(key?: string, cache = memoryCache): void {
  if (key == null) {
    cache.clear();
  } else {
    cache.delete(key);
  }
}

export async function cachedFetch(url: string, ttl = 30): Promise<unknown> {
  return cached({
    key: url,
    handler: async () => fetch(url).then(async res => res.json()),
    ttl,
  });
}
