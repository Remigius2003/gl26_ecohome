import { RefreshToken, ApiErrorImpl, authApiFetch as apiFetch } from '@api';

// -------------------
//  MODELS DEFINITION
// -------------------

export interface User {
	id: number;
	username: string;
	email?: string;
	is_active?: boolean;
	created_at?: Date;
}

export type LoginResponse = {
	user_id: number;
	token: RefreshToken;
};

// -------------------
//   API DEFINITION
// -------------------

export const register = (username: string, password: string, email: string) =>
	apiFetch<User>('/register', {
		method: 'POST',
		body: JSON.stringify({ username, password, email }),
	});

export const login = (credentials: {
	username?: string;
	email?: string;
	password: string;
}) => {
	const { username, email, password } = credentials;
	if ((username && email) || (!username && !email)) {
		return Promise.reject(
			new ApiErrorImpl(400, 'Provide exactly one of username or email'),
		);
	}

	return apiFetch<LoginResponse>('/login', {
		method: 'POST',
		body: JSON.stringify({ username, email, password }),
	});
};

export const logout = (refresh_token: string) =>
	apiFetch<void>('/logout', {
		auth: true,
		method: 'POST',
		body: JSON.stringify({ refresh_token }),
	});

export const deleteAccount = (password: string, refresh_token: string) =>
	apiFetch<{ message: string }>('/', {
		auth: true,
		method: 'DELETE',
		body: JSON.stringify({ password, refresh_token }),
	});

export const changePassword = (old_password: string, new_password: string) =>
	apiFetch<{ message: string }>('/password', {
		auth: true,
		method: 'PUT',
		body: JSON.stringify({ old_password, new_password }),
	});

export const changeUsername = (username: string) =>
	apiFetch<{ message: string }>('/username', {
		auth: true,
		method: 'PUT',
		body: JSON.stringify({ username }),
	});

//export const getUserInfo = (user_id: number) =>
//	apiFetch<User>(`/info?id=${user_id}`);
