class Cache {
  static readonly DEFAULT_TTL = 14 * 24 * 3600 * 1000; // 14 jours (en ms)
  static readonly CACHE_PREFIX = "cache_";
}

export function setItem<T>(
  key: string,
  value: T,
  ttl: number = Cache.DEFAULT_TTL
): void {
  const item = {
    value,
    expiry: Date.now() + ttl,
    timestamp: Date.now(),
  };

  localStorage.setItem(`${Cache.CACHE_PREFIX}${key}`, JSON.stringify(item));
}

export function getItem<T>(key: string): T | null {
  const itemStr = localStorage.getItem(`${Cache.CACHE_PREFIX}${key}`);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      removeItem(key);
      return null;
    }

    return item.value as T;
  } catch {
    removeItem(key);
    return null;
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(`${Cache.CACHE_PREFIX}${key}`);
}

export function clear(): void {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(Cache.CACHE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}

export function clearExpired(): void {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(Cache.CACHE_PREFIX))
    .forEach((key) => {
      try {
        const item = JSON.parse(localStorage.getItem(key)!);
        if (Date.now() > item.expiry) localStorage.removeItem(key);
      } catch {
        localStorage.removeItem(key);
      }
    });
}

export function generateKey(
  endpoint: string,
  params?: Record<string, any>
): string {
  const baseKey = endpoint.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!params) return baseKey;

  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (obj, key) => {
        obj[key] = params[key];
        return obj;
      },
      {} as Record<string, any>
    );

  return `${baseKey}?${new URLSearchParams(sortedParams).toString()}`;
}
