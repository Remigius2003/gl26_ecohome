import { coreApiFetch as apiFetch, User } from '@api';

// -------------------
//  MODELS DEFINITION
// -------------------

export interface Message {
	id: number;
	conversation_id: number;
	sender_id: number;
	content: string;
	created_at: string;
	sender?: User;
}

export interface Conversation {
	id: number;
	type: 'dm' | 'group';
	name: string;
	participants: User[];
	last_message?: string;
}

// -------------------
//   API DEFINITION
// -------------------

export const getConversations = () =>
	apiFetch<Conversation[]>('/chat/conversations', {
		method: 'GET',
		auth: true,
	});

export const getChatHistory = (conversationId: number) =>
	apiFetch<Message[]>(`/chat/history/${conversationId}`, {
		method: 'GET',
		auth: true,
	});

export const createConversation = (targetIds: number[], name?: string) =>
	apiFetch<Conversation>('/chat/create', {
		method: 'POST',
		body: JSON.stringify({ target_ids: targetIds, name }),
		auth: true,
	});

export const sendMessage = (conversationId: number, content: string) =>
	apiFetch<Message>(`/chat/message/${conversationId}`, {
		method: 'POST',
		body: JSON.stringify({ content }),
		auth: true,
	});

export const addParticipant = (conversationId: number, targetId: number) =>
	apiFetch(`/chat/${conversationId}/participants`, {
		method: 'POST',
		body: JSON.stringify({ target_id: targetId }),
		auth: true,
	});

export const removeParticipant = (conversationId: number, targetId: number) =>
	apiFetch(`/chat/${conversationId}/participants/${targetId}`, {
		method: 'DELETE',
		auth: true,
	});

export const renameConversation = (conversationId: number, name: string) =>
	apiFetch(`/chat/${conversationId}/name`, {
		method: 'PUT',
		body: JSON.stringify({ name }),
		auth: true,
	});
