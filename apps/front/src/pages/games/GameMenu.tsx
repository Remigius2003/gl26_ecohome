import { useNavigate } from "react-router-dom";
import { useState } from "react-dom";

export default function GameMenu() {
    const navigate = useNavigate();

    return (
        <div class="game-menu-container">
            <h1>Menu des jeux</h1>
            <button onclick={() => navigate("/Quizz")}> Jouer au Quizz </button>
        </div>
    );
}