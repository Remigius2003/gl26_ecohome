import { useNavigate } from "@solidjs/router";
import { createSignal, For } from "solid-js";
import { customisationManifest } from "../../customisationManifest";
import "./Customisation.css";

type CategoryKey = keyof typeof customisationManifest;
type ItemPath = string | null;

export default function Customisation() {
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] =
        createSignal<CategoryKey | null>(null);

    const [equippedItems, setEquippedItems] = createSignal<
        Record<CategoryKey, ItemPath>
    >({} as Record<CategoryKey, ItemPath>);

    const selectItem = (item: ItemPath) => {
        const category = selectedCategory();
        if (!category) return;

        setEquippedItems((prev) => ({
            ...prev,
            [category]: item,
        }));
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
                    {(item) =>
                        item && (
                            <img
                                src={item}
                                class="character-layer"
                                alt="equipped"
                            />
                        )
                    }
                </For>
            </div>
            <div class="items-zone">
                <div class="scroll-pane">
                    <For
                        each={
                            selectedCategory()
                                ? customisationManifest[selectedCategory()]
                                      .items
                                : []
                        }
                    >
                        {(item) => (
                            <button
                                class={`item ${
                                    equippedItems()[
                                        selectedCategory() as CategoryKey
                                    ] === item
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => selectItem(item)}
                            >
                                {item ? (
                                    <img src={item} alt="item" />
                                ) : (
                                    <span class="none-item">None</span>
                                )}
                            </button>
                        )}
                    </For>
                </div>
            </div>

            <div class="categories-zone">
                <div class="scroll-pane">
                    <For each={Object.entries(customisationManifest)}>
                        {([key, category]) => (
                            <button
                                class={`category ${selectedCategory() === key ? "active" : ""}`}
                                onClick={() =>
                                    setSelectedCategory(key as CategoryKey)
                                }
                            >
                                <img src={category.icon} alt={key} />
                            </button>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
}
