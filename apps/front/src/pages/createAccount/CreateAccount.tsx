import { User, register } from "api";

export default async function createAccount() {
  const u: User = await register("blup", "blup", "blup@blup");
  console.log(u);
  return <h1>createAccount</h1>;
}
