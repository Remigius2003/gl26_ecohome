import { RefreshToken, User, login, register } from "api";

export default async function createAccount() {
  const u: User = await register("blup", "blup", "blup@blup");
  console.log(u);

  const t: RefreshToken = await login({ username: "blup", password: "blup" });
  console.log(t);

  return <h1>createAccount</h1>;
}
