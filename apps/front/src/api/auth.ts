import { login, register, logout, refreshToken, generateJWT } from "@api";
import type { JWTToken, RefreshToken, JwtDate } from "@api";

export type AuthState = {
    userId: number;
    refreshToken: string;
    refreshExpiresAt: JwtDate;
    jwt: string;
    jwtExpiresAt: JwtDate;
};

const STORAGE_KEY = "ecohome.auth";

const toIso = (value: JwtDate): JwtDate => {
    const d = new Date(value);
    return d.toISOString();
};

const isExpired = (isoDate: string, skewSeconds = 30) => {
    const expires = new Date(isoDate).getTime();
    const now = Date.now() + skewSeconds * 1000;
    return Number.isNaN(expires) ? true : expires <= now;
};

const persistAuth = (state: AuthState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        /* ignore storage errors */
    }
};

export const clearAuth = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ignore storage errors */
    }
};

export const getStoredAuth = (): AuthState | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AuthState) : null;
    } catch {
        return null;
    }
};

const buildAuthState = (
    userId: number,
    refresh: RefreshToken,
    jwt: JWTToken
): AuthState => ({
    userId,
    refreshToken: refresh.token,
    refreshExpiresAt: toIso(refresh.expires_at),
    jwt: jwt.token,
    jwtExpiresAt: toIso(jwt.expires_at),
});

export const loginWithCredentials = async (params: {
    email?: string;
    username?: string;
    password: string;
}) => {
    const { email, username, password } = params;
    const res = await login({ email, username, password });
    const jwt = await generateJWT(res.user_id, res.token.token);

    const state = buildAuthState(res.user_id, res.token, jwt);
    persistAuth(state);
    return state;
};

export const registerAndLogin = async (params: {
    username: string;
    email: string;
    password: string;
}) => {
    const { username, email, password } = params;
    await register(username, password, email);
    return loginWithCredentials({ email, password });
};

export const refreshSessionIfNeeded = async (): Promise<AuthState | null> => {
    const stored = getStoredAuth();
    if (!stored) return null;

    if (isExpired(stored.refreshExpiresAt)) {
        clearAuth();
        return null;
    }

    if (!isExpired(stored.jwtExpiresAt)) {
        return stored;
    }

    const newRefresh = await refreshToken(
        stored.userId,
        stored.refreshToken
    );
    const newJwt = await generateJWT(stored.userId, newRefresh.token);

    const updated = buildAuthState(stored.userId, newRefresh, newJwt);
    persistAuth(updated);
    return updated;
};

export const logoutSession = async () => {
    const stored = getStoredAuth();
    if (stored) {
        try {
            await logout(stored.userId, stored.refreshToken);
        } catch {
            /* ignore logout errors */
        }
    }
    clearAuth();
};
