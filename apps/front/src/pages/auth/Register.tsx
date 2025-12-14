import { RefreshToken, User, login, register } from "api";
import "./Register.css";

/*export default async function Register() {
    const u: User = await register("blup", "blup", "blup@blup");
    console.log(u);

    const t: RefreshToken = await login({ username: "blup", password: "blup" });
    console.log(t);
*/
export default function Register() {
    return (
        <div class="root-container">
            <img src="login/maison-accueil.png.png" alt="Illustration" />
            <input
                type="text"
                placeholder="Nom d'utilisateur"
            />
            <input
                type="email"
                placeholder="Email"
            />
            <input
                type="password"
                placeholder="Mot de passe"
            />
            <input
                type="password"
                placeholder="Confirmer le mot de passe"
            />

            <button>Créer un compte</button>
        </div>
    );
}
