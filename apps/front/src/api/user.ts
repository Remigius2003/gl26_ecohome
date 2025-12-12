import { RefreshToken, ApiErrorImpl, authApiFetch as apiFetch } from "api";

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

// -------------------
//   API DEFINITION
// -------------------

export const register = (username: string, password: string, email: string) =>
  apiFetch<User>("/register", {
    method: "POST",
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
      new ApiErrorImpl(400, "Provide exactly one of username or email")
    );
  }

  return apiFetch<RefreshToken>("/login", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
};

export const logout = (user_id: number, refresh_token: string) =>
  apiFetch<{ message: string }>("/logout", {
    method: "POST",
    body: JSON.stringify({ user_id, refresh_token }),
  });

export const getUserInfo = (user_id: number) =>
  apiFetch<User>(`/info?id=${user_id}`);
