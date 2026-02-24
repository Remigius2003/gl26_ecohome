import * as TokenApi from './token';
import * as UserApi from './user';
import * as Cache from './cache';
import { createSignal } from 'solid-js';

// -------------------
//  CONFIGURATION
// -------------------

const SESSION = 'session_v1';
const KEYS = {
	refresh: 'refresh_token',
	access: 'access_token',
	userId: 'user_id',
};

const THRESHOLDS = {
	refresh: 24 * 60 * 60 * 1000,
	user: 5 * 60 * 1000,
	jwt: 60 * 1000,
};

// -------------------
//  SESSION MANAGER
// -------------------

class SessionManager {
	private static instance: SessionManager;
	private refreshPromise: Promise<string> | null = null;

	private _isAuthenticated = createSignal<boolean>(false);
	public isAuthenticated = this._isAuthenticated[0];

	private constructor() {
		this._isAuthenticated[1](!!this.userId);
	}

	static getInstance() {
		return (this.instance ??= new SessionManager());
	}

	private isExpiring(date: Date | string, ms: number) {
		return new Date(date).getTime() - Date.now() < ms;
	}

	private setSession<T>(
		key: string,
		value: T,
		expiresAt: Date | string,
		persist = false,
	) {
		Cache.setItem(key, value, Cache.ttlFromDate(expiresAt), persist, SESSION);
	}

	// -------------------
	//  CORE SESSION
	// -------------------

	get userId(): number | null {
		return Cache.getItem<number>(KEYS.userId, SESSION);
	}

	public get isAuthenticatedSync(): boolean {
		return !!this.userId;
	}

	async getRefreshToken(): Promise<TokenApi.RefreshToken | null> {
		let refresh = Cache.getItem<TokenApi.RefreshToken>(KEYS.refresh, SESSION);
		const userId = this.userId;

		if (!userId || !refresh) return null;
		if (this.isExpiring(refresh.expires_at, THRESHOLDS.refresh)) {
			refresh = await TokenApi.refreshToken(userId, refresh.token);
			this.setSession(KEYS.refresh, refresh, refresh.expires_at, true);
			this.setSession(KEYS.userId, userId, refresh.expires_at);
		}

		return refresh;
	}

	async getAccessToken(): Promise<string> {
		const access = Cache.getItem<TokenApi.JWTToken>(KEYS.access, SESSION);
		if (access && !this.isExpiring(access.expires_at, THRESHOLDS.jwt))
			return access.token;

		return (this.refreshPromise ??= this.refreshAccessToken().finally(
			() => (this.refreshPromise = null),
		));
	}

	private async refreshAccessToken(): Promise<string> {
		const userId = this.userId;

		let refresh = Cache.getItem<TokenApi.RefreshToken>(KEYS.refresh, SESSION);
		if (!userId || !refresh) throw new Error('No active session');

		try {
			if (this.isExpiring(refresh.expires_at, THRESHOLDS.refresh)) {
				refresh = await TokenApi.refreshToken(userId, refresh.token);
				this.setSession(KEYS.refresh, refresh, refresh.expires_at, true);
				this.setSession(KEYS.userId, userId, refresh.expires_at);
			}

			const jwt = await TokenApi.generateJWT(userId, refresh.token);
			this.setSession(KEYS.access, jwt, jwt.expires_at);

			return jwt.token;
		} catch (e) {
			Cache.clear(SESSION);
			throw e;
		}
	}

	async login(credentials: Parameters<typeof UserApi.login>[0]): Promise<void> {
		const { token, user_id } = await UserApi.login(credentials);

		const previousUserId = this.userId;
		if (previousUserId !== null && previousUserId !== user_id) {
			Cache.clear();
		}

		this.setSession(KEYS.refresh, token, token.expires_at, true);
		this.setSession(KEYS.userId, user_id, token.expires_at);

		this._isAuthenticated[1](true);
	}

	async logout(): Promise<void> {
		const refresh = Cache.getItem<TokenApi.RefreshToken>(KEYS.refresh, SESSION);
		if (this.userId && refresh)
			UserApi.logout(refresh.token).catch(console.warn);

		this._isAuthenticated[1](false);
		Cache.clear();
	}
}

export const Session = SessionManager.getInstance();
