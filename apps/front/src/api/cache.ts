// -------------------
//  MODELS DEFINITION
// -------------------

type CacheUnit<T> = {
  timestamp: number;
  expiry: number;
  value: T;
};

type BlockUnit<T> = {
  block: string;
  value: T;
};

type BlockData = {
  timestamp: number;
  expiry: number;
};

class Cache {
  static readonly DEFAULT_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days
  static readonly BLOCK_PREFIX = "cache_block:";
  static readonly BDATA_PREFIX = "cache_bdata:";
  static readonly UNIT_PREFIX = "cache_unit:";
}

// -------------------
//    CACHE HELPERS
// -------------------

const now = () => Date.now();
const blockKey = (key: string) => `${Cache.BLOCK_PREFIX}${key}`;
const bdataKey = (key: string, block: string) =>
  `${Cache.BDATA_PREFIX}${block}:${key}`;
const unitKey = (key: string) => `${Cache.UNIT_PREFIX}${key}`;

// -------------------
//   CACHE DEFINITION
// -------------------

export function setItem<T>(
  key: string,
  value: T,
  ttl: number = Cache.DEFAULT_TTL,
  updateTtl?: boolean,
  block?: string
): void {
  var timestamp = now();
  var expiry = timestamp + ttl;

  if (!block) {
    const existing = localStorage.getItem(unitKey(key));
    const shouldUpdateTtl = updateTtl ?? true;

    if (existing && !shouldUpdateTtl) {
      try {
        const parsed = JSON.parse(existing) as CacheUnit<T>;
        timestamp = parsed.timestamp;
        expiry = parsed.expiry;
      } catch {}
    }

    const unit: CacheUnit<T> = {
      value,
      expiry,
      timestamp,
    };

    return localStorage.setItem(unitKey(key), JSON.stringify(unit));
  }

  const blockRaw = localStorage.getItem(blockKey(block));
  const shouldUpdateTtl = updateTtl ?? false;

  if (blockRaw && !shouldUpdateTtl) {
    try {
      const parsed = JSON.parse(blockRaw) as BlockData;
      timestamp = parsed.timestamp;
      expiry = parsed.expiry;
    } catch {}
  }

  const blockData: BlockData = {
    timestamp,
    expiry,
  };

  localStorage.setItem(blockKey(block), JSON.stringify(blockData));

  const unit: BlockUnit<T> = {
    block,
    value,
  };

  return localStorage.setItem(bdataKey(key, block), JSON.stringify(unit));
}

export function getItem<T>(key: string, block?: string): T | null {
  if (!block) {
    const unitStr = localStorage.getItem(unitKey(key));
    if (!unitStr) return null;

    try {
      const unit = JSON.parse(unitStr);
      if (now() > unit.expiry) {
        removeItem(key);
        return null;
      }

      return unit.value as T;
    } catch {
      removeItem(key);
      return null;
    }
  }

  const blockDataStr = localStorage.getItem(blockKey(block));
  if (!blockDataStr) return null;

  try {
    const blockData = JSON.parse(blockDataStr);
    if (now() > blockData.expiry) {
      clear(block);
      return null;
    }
  } catch {
    removeItem(key, block);
    return null;
  }

  const raw = localStorage.getItem(bdataKey(key, block));
  if (!raw) return null;

  try {
    const unit = JSON.parse(raw);
    return unit.value as T;
  } catch {
    removeItem(key);
    return null;
  }
}

export function removeItem(key: string, block?: string): void {
  return localStorage.removeItem(block ? bdataKey(key, block) : unitKey(key));
}

export function clear(block?: string): void {
  if (block) {
    localStorage.removeItem(blockKey(block));

    return Object.keys(localStorage)
      .filter((key) => key.startsWith(bdataKey("", block)))
      .forEach((key) => localStorage.removeItem(key));
  }

  Object.keys(localStorage)
    .filter(
      (key) =>
        key.startsWith(Cache.BLOCK_PREFIX) ||
        key.startsWith(Cache.BDATA_PREFIX) ||
        key.startsWith(Cache.UNIT_PREFIX)
    )
    .forEach((key) => localStorage.removeItem(key));
}

export function clearExpired(): void {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(Cache.UNIT_PREFIX))
    .forEach((key) => {
      try {
        const unit = JSON.parse(localStorage.getItem(key)!);
        if (now() > unit.expiry) localStorage.removeItem(key);
      } catch {
        localStorage.removeItem(key);
      }
    });

  Object.keys(localStorage)
    .filter((key) => key.startsWith(Cache.BLOCK_PREFIX))
    .forEach((key) => {
      try {
        const block = JSON.parse(localStorage.getItem(key)!);
        if (now() > block.expiry) clear(key.slice(Cache.BLOCK_PREFIX.length));
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
