import { createWrapper, FetchPolicy } from '@api';
import { coreApiFetch as apiFetch } from '@api';

// --------------------
//  MODELS DEFINITION
// --------------------

export interface Profile {
	user_id: number;
	username: string;
	bio: string;
	avatar_url: string;
	is_graph_public: boolean;
}

// --------------------
//    API DEFINITION
// --------------------

const getProfileApi = (id?: number) =>
	apiFetch<Profile>(`/profile${id ? `?id=${id}` : ''}`, {
		method: 'GET',
		auth: true,
	});

export const updateProfile = (data: Partial<Profile>) =>
	apiFetch<Profile>('/profile', {
		method: 'PUT',
		body: JSON.stringify(data),
		auth: true,
	});

export const uploadAvatar = (file: File) => {
	const formData = new FormData();
	formData.append('avatar', file);

	return apiFetch<{ message: string; url: string }>('/avatar', {
		method: 'POST',
		body: formData,
		auth: true,
	});
};

// --------------------
//  WRAPPER DEFINITION
// --------------------

export const profileWrapper = createWrapper<Profile, number | undefined>({
	apiCall: getProfileApi,
	cacheKey: (id) => `profile_${id ?? 'me'}`,
	policy: {
		policy: FetchPolicy.stale_while_revalidate,
		staleTtlMs: 150 * 1000,
	},
	cacheTtlMs: 30 * 60 * 1000,
});
