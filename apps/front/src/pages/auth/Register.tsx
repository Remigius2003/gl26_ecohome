import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { registerAndLogin } from "@api";
import "./auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const username = data.get("username") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      await registerAndLogin({ username, email, password });
      navigate("/");
    } catch (err) {
      console.error("Erreur lors de l'inscription", err);
      setError("Nom d'utilisateur et/ou email déjà pris");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form class="root-container" onSubmit={handleSubmit}>
      <img src="login/maison-accueil.png" alt="Illustration" />

      <input
        type="text"
        placeholder="Nom d'utilisateur"
        name="username"
        autocomplete="username"
        required
      />

      <input
        type="email"
        placeholder="Email"
        name="email"
        autocomplete="email"
        required
      />

      <input
        type="password"
        placeholder="Mot de passe"
        name="password"
        autocomplete="new-password"
        required
      />

      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        name="confirmPassword"
        autocomplete="new-password"
        required
      />

      <button type="submit" disabled={loading()}>
        {loading() ? "Création..." : "Créer un compte"}
      </button>

      {error() && <p style={{ color: "red" }}>{error()}</p>}
    </form>
  );
}
