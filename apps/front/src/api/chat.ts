import { coreApiFetch as apiFetch, User } from "@api";

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
  type: "dm" | "group";
  name: string;
  participants: User[];
  last_message?: string;
}

// -------------------
//   API DEFINITION
// -------------------

export const getConversations = () =>
  apiFetch<Conversation[]>("/users/chat/conversations", {
    method: "GET",
    auth: true,
  });

export const getChatHistory = (conversationId: number) =>
  apiFetch<Message[]>(`/users/chat/history/${conversationId}`, {
    method: "GET",
    auth: true,
  });

export const createConversation = (targetIds: number[], name?: string) =>
  apiFetch<Conversation>("/users/chat/create", {
    method: "POST",
    body: JSON.stringify({ target_ids: targetIds, name }),
    auth: true,
  });
