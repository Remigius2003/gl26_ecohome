import { useNavigate } from "@solidjs/router";
import "./auth.css";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div class="root-container">
      <h1>Bienvenue sur EcoHome</h1>
      <h2>Réduisez votre emprunte carbonne grâce à EcoHome</h2>
      <img src="login/maison-accueil.png" alt="Illustration" />
      <button onClick={() => navigate("/login")}>Se connecter</button>
      <button onClick={() => navigate("/register")}>Créer un compte</button>
    </div>
  );
}
/*note :  quand j'aurais tester je changerais probablement des trucs pour rajouter de l'interligne entre h1 et h2*/
