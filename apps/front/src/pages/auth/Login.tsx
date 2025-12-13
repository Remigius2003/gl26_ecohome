import "./Login.css";

export default function Login() {
    return (
        <div class="root-container">
            <img src="login/maison-accueil.png" alt="Illustration" />
            <input
                type="text"
                placeholder="Email"
            />
            <input type="password" placeholder="Mot de passe" />

            <button>Se connecter</button>
        </div>
    );
}
