import { createSignal } from "solid-js";
import { loginWithCredentials } from "@api";
import { useNavigate } from "@solidjs/router";
import "./auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const email = data.get("email") as string;
    const password = data.get("password") as string;

    try {
      await loginWithCredentials({ email, password });
      navigate("/");
    } catch (err) {
      console.error("Erreur lors de la connexion", err);
      setError("Email et/ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form class="root-container" onSubmit={handleSubmit}>
      <img src="login/maison-accueil.png" alt="Illustration" />

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
        autocomplete="current-password"
        required
      />

      <button type="submit" disabled={loading()}>
        {loading() ? "Connexion..." : "Se connecter"}
      </button>

      {error() && <p style={{ color: "red" }}>{error()}</p>}
    </form>
  );
}
