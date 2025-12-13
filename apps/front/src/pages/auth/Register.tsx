import { RefreshToken, User, login, register } from "api";

export default async function Register() {
    const u: User = await register("blup", "blup", "blup@blup");
    console.log(u);

    const t: RefreshToken = await login({ username: "blup", password: "blup" });
    console.log(t);

    return (
        <div class="create_account-container">
            <img src="login/uneMAISON.png" alt="Illustration" />
            <input
                type="text"
                placeholder="Nom d'utilisateur"
                style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                }}
            />
            <input
                type="email"
                placeholder="Email"
                style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                }}
            />
            <input
                type="password"
                placeholder="Mot de passe"
                style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                }}
            />
            <input
                type="password"
                placeholder="Confirmer le mot de passe"
                style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                }}
            />

            <button>Créer un compte</button>
        </div>
    );
}
