import { createWrapper, FetchPolicy } from '@api';
import { coreApiFetch as apiFetch } from '@api';

// --------------------
//  MODELS DEFINITION
// --------------------

export interface Answer {
	id: string;
	text: string;
	children?: string[];
	carbonImpact?: number[];
}

export interface Question {
	id: string;
	text: string;
	evolution: string;
	responses: Answer[];
	carbonImpact?: number[];
}

export interface QuizzData {
	id: string;
	rootId: string;
	questions: Record<string, Question>;
}

export interface QuizzHistoryItem {
	date: string;
	emission: number;
	category: string;
}

// --------------------
//    API DEFINITION
// --------------------

const getQuizzDataApi = (category: string) =>
	apiFetch<QuizzData>(`/quizz/data?category=${category}`, {
		method: 'GET',
		auth: true,
	});

export const submitQuizzResult = (category: string, emission: number) =>
	apiFetch('/quizz/result', {
		method: 'POST',
		body: JSON.stringify({ category, emission }),
		auth: true,
	});

const getQuizzHistoryApi = (category?: string) =>
	apiFetch<QuizzHistoryItem[]>(
		`/quizz/history${category ? `?category=${category}` : ''}`,
		{ method: 'GET', auth: true },
	);

// --------------------
//  WRAPPER DEFINITION
// --------------------

export const quizzDataWrapper = createWrapper<QuizzData, string>({
	apiCall: getQuizzDataApi,
	cacheKey: (category) => `quizz_data_${category}`,
	policy: { policy: FetchPolicy.cache_first, cacheTtlMs: 24 * 60 * 60 * 1000 },
});

export const quizzHistoryWrapper = createWrapper<
	QuizzHistoryItem[],
	string | undefined
>({
	apiCall: getQuizzHistoryApi,
	cacheKey: (category) => `quizz_history_${category ?? 'all'}`,
	policy: { policy: FetchPolicy.api_first, apiTimeoutMs: 3000 },
});
