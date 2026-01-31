import { useNavigate } from "@solidjs/router";
import "./Customisation.css";

export default function Customisation() {
    const navigate = useNavigate();
    return (
        //mettre un contenant pour voir l'objet
        //et deux scroll pane horizontaux pour défiler les différents objets
        <div class="customisation-container">
            <button class="btn-back" onClick={() => navigate("/Home")}>
                <img src="public/Red-Left-Arrow.png" alt="Retour" />
            </button>
            <img src="public/Avatar.png" alt="Character" class="character-image" />
            <div class="items-zone">
                <div class="scroll-pane">
                    <div class="item">Item 1</div>
                    <div class="item">Item 2</div>
                    <div class="item">Item 3</div>
                    <div class="item">Item 4</div>
                    <div class="item">Item 5</div>
                    <div class="item">Item 6</div>
                    <div class="item">Item 7</div>
                    <div class="item">Item 8</div>
                    <div class="item">Item 9</div>
                    <div class="item">Item 10</div>
                    <div class="item">Item 11</div>
                    <div class="item">Item 12</div>
                    <div class="item">Item 13</div>
                    <div class="item">Item 14</div>
                    <div class="item">Item 15</div>
                </div>
            </div>

            <div class="categories-zone">
                <div class="scroll-pane">
                    <div class="category">Catégorie 1</div>
                    <div class="category">Catégorie 2</div>
                    <div class="category">Catégorie 3</div>
                    <div class="category">Catégorie 4</div>
                </div>
            </div>

        </div>
    );
}