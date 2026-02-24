import { useNavigate } from "@solidjs/router";
import { createSignal, onMount, Show, For } from "solid-js";
import { Skins } from "../../api/manageSkin";
import { Types, Skin } from "../../api/SkinParser";
import "./Customisation.css";

export default function Customisation() {
    const navigate = useNavigate();
    const skinsManager = new Skins();

    const [loading, setLoading] = createSignal(true);
    const [selectedCategory, setSelectedCategory] = createSignal<string | null>(
        null,
    );
    const [equippedItems, setEquippedItems] = createSignal<
        Record<string, Skin>
    >({});

    onMount(async () => {
        try {
            await skinsManager.init();
            setEquippedItems({ ...skinsManager.equipped });
            if (skinsManager.types.length > 0) {
                setSelectedCategory(skinsManager.types[0].name);
            }
        } catch (err) {
            console.error("Failed to load skins:", err);
        } finally {
            setLoading(false); // Hide loader
        }
    });

    const selectSkin = (typeName: string, skin: Skin) => {
        skinsManager.changeSkin(typeName, skin);
        setEquippedItems({ ...skinsManager.equipped });
    };

    return (
        <div class="customisation-container">
            <button class="btn-back" onClick={() => navigate("/Home")}>
                <img src="/Red-Left-Arrow.png" alt="Retour" />
            </button>

            <Show
                when={!loading()}
                fallback={<div class="loading">Loading assets...</div>}
            >
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
                                    style={{
                                        top: `${frame.offsetY}px`,
                                        left: `${frame.offsetX}px`,
                                    }}
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
                                            selectSkin(
                                                selectedCategory()!,
                                                skin,
                                            )
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
                                    onClick={() =>
                                        setSelectedCategory(type.name)
                                    }
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
            </Show>
        </div>
    );
}
