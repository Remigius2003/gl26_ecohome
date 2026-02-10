import { createWrapper, FetchPolicy } from '@api';
import { coreApiFetch as apiFetch } from '@api';

// --------------------
//  MODELS DEFINITION
// --------------------

export interface DefiAnswer {
	id: string;
	text: string;
	leafReward: number;
	percentReward: number;
}

export interface DefiQuestion {
	id: string;
	text: string;
	responses: DefiAnswer[];
}

export interface DailyDefi {
	id: string;
	defi: string;
	category: string;
	leafReward: number;
	status: 'PENDING' | 'COMPLETED';
	earned: number;
	overQuestions?: DefiQuestion;
}

export interface CompleteDefiResponse {
	status: string;
	reward: number;
}

// --------------------
//    API DEFINITION
// --------------------

const getDailyDefisApi = () =>
	apiFetch<DailyDefi[]>('/defi/daily', {
		method: 'GET',
		auth: true,
	});

export const completeDefi = (defiId: string, answerId: string) =>
	apiFetch<CompleteDefiResponse>('/defi/complete', {
		method: 'POST',
		body: JSON.stringify({ defiId, answerId }),
		auth: true,
	});

// --------------------
//  WRAPPER DEFINITION
// --------------------

export const dailyDefiWrapper = createWrapper<DailyDefi[], void>({
	apiCall: getDailyDefisApi,
	cacheKey: () => `daily_defis_${new Date().toISOString().split('T')[0]}`,
	policy: {
		policy: FetchPolicy.stale_while_revalidate,
		staleTtlMs: 5 * 60 * 1000,
	},
});
