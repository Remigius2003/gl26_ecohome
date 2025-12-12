// -------------------
//  API ERROR
// -------------------

export type ApiError = {
  status: number;
  message: string;
  details?: any;
};

export class ApiErrorImpl extends Error implements ApiError {
  status: number;
  details?: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = "ApiError";
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiErrorImpl;

// -------------------
//  API HELPER
// -------------------

export function createApiClient(baseUrl: string) {
  async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
    const normalizedEndpoint = endpoint.replace(/^\/+/, "");
    const url = `${normalizedBaseUrl}/${normalizedEndpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      },
      ...options,
    };

    try {
      const res = await fetch(url, config);

      if (res.ok) {
        return res.json() as Promise<T>;
      }

      let details;
      try {
        details = await res.json();
      } catch {
        details = { error: res.statusText };
      }

      return Promise.reject(
        new ApiErrorImpl(
          res.status,
          `Failed to ${endpoint} (${res.statusText}) : ${details.error}`,
          details
        )
      );
    } catch (err) {
      if (err instanceof TypeError) {
        console.error(`Network error : ${err.message}`);
      }

      return Promise.reject(err);
    }
  }

  return apiFetch;
}

// -------------------
//  API FETCHER
// -------------------

const AUTH_API_URL = (() => {
  let url = import.meta.env.VITE_AUTH_HOST;
  if (!url.startsWith("http")) url = "https://" + url;
  return url;
})();

const GAME_API_URL = (() => {
  let url = import.meta.env.VITE_GAME_HOST;
  if (!url.startsWith("http")) url = "https://" + url;
  return url;
})();

export const authApiFetch = createApiClient(AUTH_API_URL);
export const gameApiFetch = createApiClient(GAME_API_URL);
