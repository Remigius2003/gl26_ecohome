import { createWrapper, FetchPolicy } from '@api';
import { coreApiFetch as apiFetch } from '@api';
import { Profile } from '@api';

// --------------------
//    API DEFINITION
// --------------------

const getFriendsApi = () =>
	apiFetch<Profile[]>('/friends', { method: 'GET', auth: true });

const getRequestsApi = () =>
	apiFetch<Profile[]>('/friends/requests', {
		method: 'GET',
		auth: true,
	});

export const searchUsersApi = (query: string) =>
	apiFetch<Profile[]>(`/friends/search?q=${encodeURIComponent(query)}`, {
		method: 'GET',
		auth: true,
	});

export const sendFriendRequest = (target_id: number) =>
	apiFetch('/friends/request', {
		method: 'POST',
		body: JSON.stringify({ target_id }),
		auth: true,
	});

export const respondToRequest = (
	target_id: number,
	action: 'accept' | 'reject',
) =>
	apiFetch('/friends/respond', {
		method: 'POST',
		body: JSON.stringify({ target_id, action }),
		auth: true,
	});

// --------------------
//  WRAPPER DEFINITION
// --------------------

export const friendsListWrapper = createWrapper<Profile[], void>({
	apiCall: getFriendsApi,
	cacheKey: () => 'friends_list',
	policy: { policy: FetchPolicy.cache_first, cacheTtlMs: 60 * 1000 },
});

export const friendRequestsWrapper = createWrapper<Profile[], void>({
	apiCall: getRequestsApi,
	cacheKey: () => 'friends_requests',
	policy: { policy: FetchPolicy.api_first, apiTimeoutMs: 2000 },
});
