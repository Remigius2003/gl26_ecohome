import { useNavigate } from "react-router-dom";

export default function Réponse() {
    
    const navigate = useNavigate();

    return (
        <div class="quizz-container">
            <h1> La réponse est  </h1> //on pourra mettre la question d'origine ici aussi
            <h1> Réponse X </h1>
            <button onclick={() => navigate(-1)}> Rejouer </button>
            <button onclick={() => navigate("/GameMenu")}> Retour au menu des jeux </button>
        </div>
    );
}