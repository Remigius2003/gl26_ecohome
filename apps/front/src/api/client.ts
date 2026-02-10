// -------------------
//  API ERROR
// -------------------

import { Session } from './session';

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
		this.name = 'ApiError';
	}
}

export const isApiError = (error: unknown): error is ApiError =>
	error instanceof ApiErrorImpl;

export type ApiRequestOptions = RequestInit & {
	auth?: boolean;
};

// -------------------
//  API HELPER
// -------------------

export function createApiClient(
	baseUrl: string,
	getAccessToken?: () => Promise<string | null>,
) {
	async function apiFetch<T>(
		endpoint: string,
		options: ApiRequestOptions = {},
	): Promise<T> {
		const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
		const normalizedEndpoint = endpoint.replace(/^\/+/, '');
		const url = `${normalizedBaseUrl}/${normalizedEndpoint}`;

		const { auth, headers, body: rawBody, ...rest } = options;
		const token = auth && (await getAccessToken?.());

		const isFormData = rawBody instanceof FormData;
		const isBlob = rawBody instanceof Blob;
		const isString = typeof rawBody === 'string';

		let body: BodyInit | undefined;
		if (!rawBody) {
			body = undefined;
		} else if (isFormData || isBlob || isString) {
			body = rawBody as BodyInit;
		} else {
			body = JSON.stringify(rawBody);
		}

		const finalHeaders: Record<string, string> = {
			...(headers as Record<string, string>),
			...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
		};

		if (
			body &&
			!isFormData &&
			!isBlob &&
			!isString &&
			!finalHeaders['Content-Type']
		) {
			finalHeaders['Content-Type'] = 'application/json';
		}

		const config: RequestInit = {
			...rest,
			body,
			headers: finalHeaders,
		};

		try {
			const res = await fetch(url, config);

			if (res.ok) {
				if (res.status === 204) return undefined as T;
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
					details,
				),
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

const withHttpsFallback = (envValue?: string, fallback = '') => {
	let url = envValue?.trim() || fallback;

	if (!url) {
		console.warn('API URL manquante, fallback utilisé :', fallback);
		return fallback;
	}

	if (!/^https?:\/\//i.test(url)) {
		url = `https://${url}`;
	}

	return url;
};

const AUTH_API_URL = withHttpsFallback(
	import.meta.env.VITE_AUTH_HOST,
	'https://localhost/auths',
);

const CORE_API_URL = withHttpsFallback(
	import.meta.env.VITE_CORE_HOST,
	'https://localhost/users',
);

const getJWT = () => Session.getAccessToken();
export const authApiFetch = createApiClient(AUTH_API_URL, getJWT);
export const coreApiFetch = createApiClient(CORE_API_URL, getJWT);
