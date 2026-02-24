import {
    setGlobalNavigate,
    setGlobalSceneSwitch,
    setGlobalShowMusic,
} from "../../App";
import { FaSolidGear } from "solid-icons/fa";
import SceneCanvas from "@components/SceneCanvas";
import { useNavigate } from "@solidjs/router";
import { createSignal, Show, onMount, onCleanup } from "solid-js";
import { switchScene } from "@scene";
import type { SceneType } from "@scene";
import Settings from "./Settings";
import Chat from "./Chat";
import Music from "./Music";
import {
    friendsListWrapper,
    friendRequestsWrapper,
    sentFriendRequestsWrapper,
    RTClient,
} from "@api";
import "./app.css";

export default function Home() {
    const navigate = useNavigate();
    setGlobalNavigate(navigate);
    setGlobalSceneSwitch(switchScene);

    const scene: SceneType = "home";
    const [showSettings, setShowSettings] = createSignal(false);
    const [showMusic, setShowMusic] = createSignal(false);

    onMount(() => {
        // Make setShowMusic available globall y for piano interaction (inside onMount to avoid recursion)
        setGlobalShowMusic(setShowMusic);

        RTClient.connect();

        const invalidateFriendCaches = () => {
            friendsListWrapper.invalidate(undefined);
            friendRequestsWrapper.invalidate(undefined);
            sentFriendRequestsWrapper.invalidate(undefined);
        };

        const unsubs = [
            RTClient.subscribe("friend_request", invalidateFriendCaches),
            RTClient.subscribe(
                "friend_request_cancelled",
                invalidateFriendCaches,
            ),
            RTClient.subscribe(
                "friend_request_accepted",
                invalidateFriendCaches,
            ),
            RTClient.subscribe(
                "friend_request_rejected",
                invalidateFriendCaches,
            ),
        ];

        onCleanup(() => unsubs.forEach((fn) => fn()));
    });

    return (
        <>
            <SceneCanvas scene={scene} />

            <div class="game-overlay">
                <div
                    class="hud-top"
                    style={{ "justify-content": "flex-end", width: "100%" }}
                >
                    <div
                        class="settings-btn"
                        onClick={() => setShowSettings(true)}
                    >
                        <FaSolidGear />
                    </div>
                </div>
            </div>

            <Chat />

            <Show when={showSettings()}>
                <Settings onClose={() => setShowSettings(false)} />
            </Show>

            <Show when={showMusic()}>
                <Music onClose={() => setShowMusic(false)} />
            </Show>
        </>
    );
}
