// lib/serverCache.ts
// In-memory server-side high-performance cache with TTL and tag-based invalidation

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 60, tags: string[] = []): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      tags,
    });
  }

  invalidateTag(tag: string): void {
    for (const [key, entry] of this.store.entries()) {
      if (entry.tags.includes(tag)) {
        this.store.delete(key);
      }
    }
  }

  invalidateAll(): void {
    this.store.clear();
  }
}

const globalForCache = globalThis as unknown as {
  serverCacheInstance: MemoryCache | undefined;
};

export const serverCache =
  globalForCache.serverCacheInstance ?? new MemoryCache();

if (process.env.NODE_ENV !== "production") {
  globalForCache.serverCacheInstance = serverCache;
}

export default serverCache;
