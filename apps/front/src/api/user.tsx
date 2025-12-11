// -------------------
//  MODELS DEFINITION
// -------------------

export interface User {
  id: string;
  username: string;
  email?: string;
  active?: boolean;
  createdAt?: Date;
}

// -------------------
//   API DEFINITION
// -------------------

export async function register(
  username: string,
  password: string,
  email: string
): Promise<User> {
  const req = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  };

  let api = import.meta.env.VITE_AUTH_HOST;
  if (!api.startsWith("https")) api = "https://" + api;

  try {
    const rep = await fetch(`${api}/register`, req);
    console.log("running : " + `${api}/register`);

    if (!rep.ok) {
      const err = rep.statusText;
      console.error("Failed to create an account", err);
      return Promise.reject(
        new Error(`Failed to register: ${err} (status ${rep.status})`)
      );
    }

    const data = await rep.json();
    const user: User = {
      id: data.id,
      username: data.username,
      email: data.email ?? undefined,
      active: data.isActive ?? undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };

    return user;
  } catch (err) {
    console.error("Problem", err);
    return Promise.reject(
      new Error(`Network or server error: ${(err as Error).message}`)
    );
  }
}
