import { login, generateJWT, LoginResponse, JWTToken } from "@api";
import { useNavigate } from "@solidjs/router";
import "./auth.css";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const email = data.get("email") as string;
    const password = data.get("password") as string;

    console.log({ email, password });
    try {
      const rep: LoginResponse = await login({
        email: email,
        password: password,
      });

      const jwt: JWTToken = await generateJWT(rep.user_id, rep.token.token);

      console.log("Token créé :", rep.token);
      console.log("JWT created :", jwt.token);

      navigate("/");
    } catch (err) {
      alert("Email et/ou mot de passe incorrect");
      console.error("Erreur lors de la connexion", err);
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

      <button type="submit">Se connecter</button>
    </form>
  );
}
