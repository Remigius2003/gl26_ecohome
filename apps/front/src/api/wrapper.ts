import * as Cache from "@api";

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
  policy: FetchPolicyOptions;
  blockKey?: (params: P) => string;
  cacheKey: (params: P) => string;
  updateTtlOnSet?: boolean;
  cacheTtlMs?: number;
}

export interface Wrapper<T, P> {
  get(params: P): Promise<T>;
  getCache(params: P): T | null;
  setCache(params: P, value: T, ttl?: number, updateTtl?: boolean): void;
  invalidate(params: P): void;
}

// -------------------
// WRAPPER DEFINITION
// -------------------

export function createWrapper<T, P>(
  config: WrapperConfig<T, P>
): Wrapper<T, P> {
  const { apiCall, cacheKey, blockKey, policy, cacheTtlMs, updateTtlOnSet } =
    config;

  const resolveBlock = (params: P) => (blockKey ? blockKey(params) : undefined);

  function getCache(params: P): T | null {
    return Cache.getItem<T>(cacheKey(params), resolveBlock(params));
  }

  function setCache(
    params: P,
    value: T,
    ttl = cacheTtlMs,
    updateTtl = updateTtlOnSet
  ): void {
    Cache.setItem(
      cacheKey(params),
      value,
      ttl,
      updateTtl,
      resolveBlock(params)
    );
  }

  function invalidate(params: P): void {
    Cache.removeItem(cacheKey(params), resolveBlock(params));
  }

  async function apiCallWithTimeout(params: P, timeoutMs: number): Promise<T> {
    return Promise.race([
      apiCall(params),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("API Call Timeout")), timeoutMs)
      ),
    ]);
  }

  async function get(params: P): Promise<T> {
    const cached = getCache(params);

    switch (policy.policy) {
      case FetchPolicy.stale_while_revalidate:
        if (cached) {
          apiCall(params)
            .then((data) => setCache(params, data, policy.staleTtlMs, false))
            .catch(() => {});
          return cached;
        }

        const freshData = await apiCall(params);
        setCache(params, freshData, policy.staleTtlMs, true);
        return freshData;

      case FetchPolicy.cache_first:
        if (cached) return cached;

        const freshCache = await apiCall(params);
        setCache(params, freshCache, policy.cacheTtlMs, true);
        return freshCache;

      case FetchPolicy.cache_only:
        if (!cached) throw new Error("Cache miss");
        return cached;

      case FetchPolicy.api_first:
        try {
          const freshAPI = await apiCallWithTimeout(
            params,
            policy.apiTimeoutMs
          );

          setCache(params, freshAPI, cacheTtlMs, true);
          return freshAPI;
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
