import { useNavigate } from "@solidjs/router";
import { createSignal, For } from "solid-js";
import { Skins } from "../../api/manageSkin";
import { Types, Skin, Frame } from "../../api/SkinParser";
import "./Customisation.css";

export default function Customisation() {
    const navigate = useNavigate();

    const skinsManager = new Skins();
    const [selectedCategory, setSelectedCategory] = createSignal<string | null>(
        skinsManager.types[0]?.name ?? null,
    );
    const [equippedItems, setEquippedItems] = createSignal<
        Record<string, Skin>
    >({ ...skinsManager.equipped });

    const selectSkin = (typeName: string, skin: Skin) => {
        skinsManager.changeSkin(typeName, skin);
        setEquippedItems({ ...skinsManager.equipped });
    };

    return (
        <div class="customisation-container">
            <button class="btn-back" onClick={() => navigate("/Home")}>
                <img src="/Red-Left-Arrow.png" alt="Retour" />
            </button>

            <div class="character-wrapper">
                <img
                    src="/chara/bodyStanding.png"
                    alt="Character"
                    class="character-image"
                />

                <For each={Object.values(equippedItems())}>
                    {(skin: Skin) => {
                        const frame = skin.frames[0];
                        return frame ? (
                            <img
                                src={frame.image}
                                class="character-layer"
                                alt="equipped"
                            />
                        ) : null;
                    }}
                </For>
            </div>

            <div class="items-zone">
                <div class="scroll-pane">
                    <For
                        each={
                            selectedCategory()
                                ? skinsManager.types.find(
                                      (t) => t.name === selectedCategory(),
                                  )?.skins
                                : []
                        }
                    >
                        {(skin: Skin) => {
                            const isActive =
                                equippedItems()[selectedCategory()!]?.icon
                                    .image === skin.icon.image;

                            return (
                                <button
                                    class={`item ${isActive ? "active" : ""}`}
                                    onClick={() =>
                                        selectSkin(selectedCategory()!, skin)
                                    }
                                >
                                    <img src={skin.icon.image} alt="item" />
                                </button>
                            );
                        }}
                    </For>
                </div>
            </div>

            <div class="categories-zone">
                <div class="scroll-pane">
                    <For each={skinsManager.types}>
                        {(type: Types) => (
                            <button
                                class={`category ${
                                    selectedCategory() === type.name
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => setSelectedCategory(type.name)}
                            >
                                <img
                                    src={type.skins[0].icon.image}
                                    alt={type.name}
                                />
                            </button>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
}
