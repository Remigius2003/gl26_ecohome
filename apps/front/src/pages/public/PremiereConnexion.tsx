import "./PremiereConnexion.css";
import { useNavigate } from "@solidjs/router";

export default function PremiereConnexion() {
    const navigate = useNavigate();

    return (
        <>

            <div class="premiere-connexion-container">
                <button class="btn-croix" onClick={() => navigate('/home')}>
                    <img src="public/Red-Cross.png" alt="Fermer" />
                </button>
                <h1>Bienvenue sur notre application !</h1>
                <p>
                    Nous sommes ravis de vous accueillir pour votre première connexion.
                    Vous trouverez ci-dessous un tutoriel rapide pour vous aider à démarrer...
                </p>
                <h2>Menu ou Maison</h2>
                <p>Cette application à un menu immersif. En effet, vous serez dans une maison,
                    où vous devez l'explorer pour trouver les différentes fonctionnalités de l'application.
                    Par exemple, pour accéder à votre profil, vous devez cliquer sur l'objet correct.
                    On vous donne le loisir de le trouver par vous même !
                </p>
                <h2>Les mini jeux</h2>
                <p>Vous pourrez jouer à 4 mini jeux et quizz pour vous aider à prendre en main les gestes écologiques</p>
                <h2>8 milliards d'amis</h2>
                <p>Vous pourrez vous connecter à d'autres utilisateurs de l'application et collaborer ensemble pour atteindre vos objectifs environnementaux !</p>
                <h2>Un bilan carbonne personnalisé</h2>
                <p>Selon les données que vous fournirez à l'application, nous vous fournirons un bilan carbonne
                    personnalisé pour vous aider à suivre vos progrès et à identifier les domaines où vous pouvez encore
                    améliorer votre impact environnemental.</p>
                <h2>Customisation</h2>
                <p>On a tous une personnalité ! C'est pourquoi nous vous laissons le choix de l'exprimer
                    à travers la customisation de votre avatar. Vous pourrez choisir parmi une variété d'options pour personnaliser votre apparence et montrer votre style unique !
                </p>
                <h2>Prêt à commencer ?</h2>
                <button class="précédent" onClick={() => navigate(-1)}>
                    Précédent
                </button>
                <button class="suivant" onClick={() => navigate('/home')}>
                    Suivant
                </button>
            </div>

        </>
    );
}
