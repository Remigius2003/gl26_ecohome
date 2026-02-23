import "./Lobby.css";
import { createSignal, For, onMount, onCleanup } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import {
    loadGamesById,
    isSceneImage,
    isStaticImage,
    GamePage,
} from "./Lobby.types";

import { getScore, saveScore } from "../../api/score";

const itemsInit = [
    { id: 0, label: "THIS" },
    { id: 1, label: "DIDN'T" },
    { id: 2, label: "LOAAAD" },
];

export default function Lobby() {
    const params = useParams();
    const navigate = useNavigate();
    const gameId = () => params.gameId || "space";

    const [items, setItems] = createSignal(itemsInit);
    const [current, setCurrent] = createSignal(0);
    const [containerWidth, setContainerWidth] = createSignal(360);
    const [direction, setDirection] = createSignal("right");

    const [games, setGames] = createSignal<GamePage[]>([]);
    const [game, setGame] = createSignal<GamePage | null>(null);
    const [error, setError] = createSignal<string | null>(null);
    const [loading, setLoading] = createSignal(true);
    let containerRef: HTMLDivElement | undefined;

    const bestScore = () => {
        if (!game()) return 0;
        const levelId = String(current() + 1);
        return getScore(gameId(), levelId);
    };
    const formatTime = (ms: number) => {
        if (ms <= 0) return "Aucun";

        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (minutes > 0) {
            return `${minutes} min ${seconds}s`;
        }
        return `${seconds} sec`;
    };
    onMount(() => {
        const update = () => {
            if (containerRef)
                setContainerWidth(containerRef.offsetWidth || 360);
        };
        update();
        window.addEventListener("resize", update);
        onCleanup(() => window.removeEventListener("resize", update));

        (async () => {
            try {
                setLoading(true);
                const g = await loadGamesById(gameId());
                setGames(g.games);
                setItems(g.games.map((gp, idx) => ({ id: idx, label: gp.id })));
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
        if (loading() || error()) return;
        const idx = current() + 1;
        navigate(`/${gameId()}/${encodeURIComponent(String(idx))}`);
    };

    const continueClick = () => {
        // Todo
        return;
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
                            <div class="qa-text">Temps restant:</div>
                            <div class="qa-text">{formatTime(bestScore())}</div>
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
