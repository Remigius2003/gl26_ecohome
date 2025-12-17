import * as Cache from "./cache";

// -------------------
//  MODELS DEFINITION
// -------------------

export enum FetchPolicy {
  stale_while_revalidate,
  cache_first,
  cache_only,
  api_first,
  api_only,
}

export type FetchPolicyOptions =
  | {
      policy: FetchPolicy.stale_while_revalidate;
      staleTtlMs: number;
    }
  | {
      policy: FetchPolicy.cache_first;
      cacheTtlMs: number;
    }
  | {
      policy: FetchPolicy.api_first;
      apiTimeoutMs: number;
    }
  | { policy: FetchPolicy.cache_only }
  | { policy: FetchPolicy.api_only };

export type ApiCall<T, P = void> = (params: P) => Promise<T>;

export interface WrapperConfig<T, P> {
  apiCall: ApiCall<T, P>;
  cacheKey: (params: P) => string;
  policy: FetchPolicyOptions;
  cacheTtlMs?: number;
}

export interface Wrapper<T, P> {
  get(params: P): Promise<T>;
  getCache(params: P): T | null;
  setCache(params: P, value: T, ttl?: number): void;
  invalidate(params: P): void;
}

// -------------------
// WRAPPER DEFINITION
// -------------------

export function createWrapper<T, P>(
  config: WrapperConfig<T, P>
): Wrapper<T, P> {
  const { apiCall, cacheKey, policy, cacheTtlMs } = config;

  function getCache(params: P): T | null {
    return Cache.getItem<T>(cacheKey(params));
  }

  function setCache(params: P, value: T, ttl = cacheTtlMs) {
    Cache.setItem(cacheKey(params), value, ttl);
  }

  function invalidate(params: P) {
    Cache.removeItem(cacheKey(params));
  }

  async function apiCallWithTimeout(params: P, timeoutMs: number): Promise<T> {
    return Promise.race([
      apiCall(params),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("API timeout")), timeoutMs)
      ),
    ]);
  }

  async function get(params: P): Promise<T> {
    const cached = getCache(params);

    switch (policy.policy) {
      case FetchPolicy.stale_while_revalidate:
        if (cached) {
          apiCall(params)
            .then((data) => setCache(params, data, policy.staleTtlMs))
            .catch(() => {});
          return cached;
        }

        const data = await apiCall(params);
        setCache(params, data, policy.staleTtlMs);
        return data;

      case FetchPolicy.cache_first:
        if (cached) return cached;

        const fresh = await apiCall(params);
        setCache(params, fresh, policy.cacheTtlMs);
        return fresh;

      case FetchPolicy.cache_only:
        if (!cached) throw new Error("Cache miss");
        return cached;

      case FetchPolicy.api_first:
        try {
          const data = await apiCallWithTimeout(params, policy.apiTimeoutMs);
          setCache(params, data);
          return data;
        } catch {
          if (cached) return cached;
          throw new Error("API failed and no cache fallback");
        }

      case FetchPolicy.api_only:
        return apiCall(params);
    }
  }

  return {
    get,
    getCache,
    setCache,
    invalidate,
  };
}
