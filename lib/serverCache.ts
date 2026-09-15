// lib/serverCache.ts
// Bounded In-Memory High-Performance Server Cache with Automatic Memory Optimization

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
  accessedAt: number;
}

const MAX_CACHE_ENTRIES = 300; // Strict limit to prevent memory bloating

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    entry.accessedAt = Date.now();
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 60, tags: string[] = []): void {
    // Memory Guard: Prune expired or oldest items if store exceeds MAX_CACHE_ENTRIES
    if (this.store.size >= MAX_CACHE_ENTRIES) {
      this.pruneExpiredOrOldest();
    }

    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      tags,
      accessedAt: Date.now(),
    });
  }

  private pruneExpiredOrOldest(): void {
    const now = Date.now();
    // 1. First remove any expired items
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }

    // 2. If still over capacity, remove the oldest 20% accessed entries
    if (this.store.size >= MAX_CACHE_ENTRIES) {
      const sorted = Array.from(this.store.entries()).sort(
        (a, b) => a[1].accessedAt - b[1].accessedAt
      );
      const toDelete = sorted.slice(0, Math.ceil(MAX_CACHE_ENTRIES * 0.2));
      for (const [k] of toDelete) {
        this.store.delete(k);
      }
    }
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

  getStats(): { size: number; max: number } {
    return { size: this.store.size, max: MAX_CACHE_ENTRIES };
  }
}

const globalForCache = globalThis as unknown as {
  serverCacheInstance: MemoryCache | undefined;
};

export const serverCache =
  globalForCache.serverCacheInstance ?? new MemoryCache();

globalForCache.serverCacheInstance = serverCache;

export default serverCache;
