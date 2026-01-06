import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Quizz() {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const navigate = useNavigate();

    const handleValidate = () => {
        if (selectedAnswer !== null) {
            navigate("/Reponse");
        }
    };

    return (
        <div class="quizz-container">
            <img src="public/Quizz_game.png"/>
            <h1> Question ? </h1>
            
            <div class="answers-list">
                <button 
                    class={selectedAnswer === 1 ? "answer selected" : "answer"}
                    onclick={() => setSelectedAnswer(1)}> Réponse 1 </button>
                <button 
                    class={selectedAnswer === 2 ? "answer selected" : "answer"}
                    onclick={() => setSelectedAnswer(2)}> Réponse 2 </button>
                <button 
                    class={selectedAnswer === 3 ? "answer selected" : "answer"}
                    onclick={() => setSelectedAnswer(3)}> Réponse 3 </button>
                <button 
                    class={selectedAnswer === 4 ? "answer selected" : "answer"}
                    onclick={() => setSelectedAnswer(4)}> Réponse 4 </button>
            </div>


            <button 
                onclick={handleValidate}
                disabled={selectedAnswer === null}> Valider </button>
        </div>
    );
}