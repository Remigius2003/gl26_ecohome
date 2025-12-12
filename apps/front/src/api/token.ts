import { authApiFetch as apiFetch } from "api";

// -------------------
//  MODELS DEFINITION
// -------------------

export interface RefreshToken {
  token_id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  is_active: boolean;
  created_at: Date;
}

export interface JWTToken {
  token: string;
  expires_at: Date;
}

// -------------------
//   API DEFINITION
// -------------------

export const verifyToken = (accessToken: string) =>
  apiFetch<Record<string, never>>("/verify", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const refreshToken = (user_id: number, refresh_token: string) =>
  apiFetch<RefreshToken>("/token", {
    method: "POST",
    body: JSON.stringify({ user_id, refresh_token }),
  });

export const generateJWT = (user_id: number, refresh_token: string) =>
  apiFetch<JWTToken>("/jwt", {
    method: "POST",
    body: JSON.stringify({ user_id, refresh_token }),
  });
