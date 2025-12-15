export interface WrapperConfig {
  baseFetcher: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
  defaultTtl?: number;
  offlineFallback?: boolean;
  autoInvalidate?: boolean;
}
