import { createAccountApi } from "../../apis/IdentificationApi";

export default function createAccount() {
    createAccountApi("blup", "blup", "blup");
    return <h1>createAccount</h1>;
}
