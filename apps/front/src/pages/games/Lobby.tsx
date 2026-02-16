import "./Lobby.css";
import { createSignal, For, onMount, onCleanup } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import {
    loadGamesById,
    isSceneImage,
    isStaticImage,
    GamePage,
} from "./Lobby.types";

const itemsInit = [
    { id: 0, label: "THIS" },
    { id: 1, label: "DIDN'T" },
    { id: 2, label: "LOAAAD" },
]; // fallback

export default function Lobby() {
    const params = useParams();
    const navigate = useNavigate();
    const gameId = () => params.gameId || "space";

    const [items, setItems] = createSignal(itemsInit);
    const [current, setCurrent] = createSignal(1);
    const [containerWidth, setContainerWidth] = createSignal(360);
    const [direction, setDirection] = createSignal("right");

    const [games, setGames] = createSignal<GamePage[]>([]);
    const [game, setGame] = createSignal<GamePage | null>(null);
    const [error, setError] = createSignal<string | null>(null);
    const [loading, setLoading] = createSignal(true);
    let containerRef: HTMLDivElement | undefined;

    onMount(() => {
        const update = () => {
            if (containerRef)
                setContainerWidth(containerRef.offsetWidth || 360);
        };
        update();
        window.addEventListener("resize", update);
        onCleanup(() => window.removeEventListener("resize", update));

        // load the game JSON for this route
        (async () => {
            try {
                setLoading(true);
                const g = await loadGamesById(gameId());
                setGames(g.games);
                setItems(
                    g.games.map((gp, idx) => ({ id: idx, label: gp.name })),
                );
                const idx = Math.max(
                    0,
                    Math.min(current(), g.games.length - 1),
                );
                setCurrent(idx);
                setGame(g.games[idx] ?? null);
            } catch (err: any) {
                console.error(err);
                setError(err?.message ?? "Unknown error");
                setGames([]);
                setItems(itemsInit);
                setGame(null);
            } finally {
                setLoading(false);
            }
        })();
    });

    const handleClick = (index: number) => {
        if (index === current()) return;
        setDirection(index > current() ? "right" : "left");
        setCurrent(index);
        const g = games()[index];
        if (g) setGame(g);
        // else keep previous / show fallback
    };

    const translateFor = (index: number) => {
        const center = current();
        const diff = index - center;
        let spacing = containerWidth() / 3;
        spacing = Math.min(spacing, 200);
        if (diff === 0) return 0;
        if (diff === -1) return -spacing;
        if (diff === 1) return spacing;
        return diff < 0 ? -containerWidth() : containerWidth();
    };

    const quickActionClick = () => {
        console.log("Quick action clicked!");
        alert("Quick action clicked!");
    };

    const playClick = () => {
        navigate(`/trilogique`);
        return;
        if (loading() || error()) return; // don't navigate if loading or error
        const g = game();
        if (!g) {
            // fallback: navigate to a generic place using the current index
            const idx = current();
            navigate(`/game/${encodeURIComponent(String(idx))}`);
            return;
        }

        // If the image is a scene, navigate to a scene route; otherwise use game id
        if (isSceneImage(g.image) && g.image.sceneId) {
            const sceneId = encodeURIComponent(String(g.image.sceneId));
            navigate(`/scene/${sceneId}`);
        } else if ((g as any).id !== undefined) {
            // prefer a real game id if available
            const id = encodeURIComponent(String((g as any).id));
            navigate(`/game/${id}`);
        } else {
            // fallback to index if no id property on game
            navigate(`/game/${encodeURIComponent(String(current()))}`);
        }
    };

    const continueClick = () => {
        navigate(`/trilogique`);
        return;
        const g = game();
        if (!g) return;
        if (isSceneImage(g.image) && g.image.sceneId) {
            navigate(
                `/scene/${encodeURIComponent(String(g.image.sceneId))}?resume=1`,
            );
        } else if ((g as any).id !== undefined) {
            navigate(
                `/game/${encodeURIComponent(String((g as any).id))}?resume=1`,
            );
        } else {
            navigate(`/game/${encodeURIComponent(String(current()))}?resume=1`);
        }
    };

    return (
        <div
            class="container"
            ref={(el) => (containerRef = el as HTMLDivElement)}
        >
            <div class="top-line" />

            <div class="top-row">
                <For each={items()}>
                    {(item, i) => {
                        const idx = i();
                        return (
                            <div
                                class={`rect-wrapper ${direction()}`}
                                style={{
                                    transform: `translateX(calc(-50% + ${translateFor(idx)}px))`,

                                    "z-index": idx === current() ? 10 : 1,
                                }}
                                onClick={() => handleClick(idx)}
                            >
                                <div
                                    class={`label ${idx === current() ? "active" : ""}`}
                                >
                                    {item.label}
                                </div>
                                <div
                                    class={`rect ${idx === current() ? "center" : ""}`}
                                />
                            </div>
                        );
                    }}
                </For>
            </div>

            <div class="middle">
                <div class="card">
                    <div class="card-title">
                        {/* show loaded game name or fallback */}
                        {loading()
                            ? "Loading..."
                            : error()
                              ? "Error"
                              : (game()?.name ?? "Unknown Game")}
                    </div>

                    <div class="image-placeholder">
                        {loading() ? (
                            <span>Loading image…</span>
                        ) : error() ? (
                            <span>{error()}</span>
                        ) : game() ? (
                            // render static link or scene id
                            isStaticImage(game()!.image) ? (
                                <img
                                    src={game()!.image.link}
                                    alt={game()!.name}
                                    style={{
                                        "max-width": "100%",
                                        height: "auto",
                                    }}
                                />
                            ) : isSceneImage(game()!.image) ? (
                                <div class="scene-badge">
                                    Scene: {game()!.image.sceneId}
                                </div>
                            ) : (
                                <span>Unknown image type</span>
                            )
                        ) : (
                            <span>No data</span>
                        )}
                    </div>

                    <div class="description">
                        {loading()
                            ? "Loading description…"
                            : error()
                              ? ""
                              : game()?.description}
                    </div>
                </div>

                <div class="quick-action" aria-hidden={false}>
                    <div class="buttons">
                        <div class="quick-action">
                            <button
                                class="qa-image"
                                onClick={quickActionClick}
                                type="button"
                            >
                                <img src="/game/Stats.png" alt="preview" />
                            </button>
                            <div class="qa-text">Best Score : idk</div>
                        </div>

                        <button class="btn" onClick={playClick} type="button">
                            Jouer
                        </button>
                        <button
                            class="btn"
                            onClick={continueClick}
                            type="button"
                        >
                            Continuer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
