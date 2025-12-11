import { register } from "api";

export default function createAccount() {
  register("blup2", "blup2", "blup2@blup");
  return <h1>createAccount</h1>;
}
